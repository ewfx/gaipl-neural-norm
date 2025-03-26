const GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
require("dotenv").config();
const { Logging } = require("@google-cloud/logging");

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { genai, types } = require('@google-cloud/vertexai');
const { VertexAI } = require("@google-cloud/vertexai");
const fs = require('fs');
const { log } = require("util");
// const logging1 = new Logging({383753837684});

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

const vertex_ai = new VertexAI({ project: '383753837684', location: 'us-east1' });
const model = 'projects/383753837684/locations/us-east1/endpoints/5109839552600604672';

const siText1Content = fs.readFileSync('./prompt.txt', 'utf8');

const siText1 = {
    text: siText1Content
};

const logging = new Logging({
    projectId: "383753837684",
});


app.get("/get-incident-details/:incident_number", async (req, res) => {
    try {
        const incidentNumber = req.params.incident_number;
        console.log("Incident number:", incidentNumber);
        const SERVICE_NOW_URL = `https://${process.env.SERVICENOW_INSTANCE}.service-now.com/api/1661930/addincidents/get_incident_info?incident_number=${incidentNumber}`;

        const response = await axios.get(SERVICE_NOW_URL, {
            auth: {
                username: process.env.SERVICENOW_USERNAME,
                password: process.env.SERVICENOW_PASSWORD,
            },
            headers: {
                "Accept": "application/json",
            },
        });

        res.json(response.data.result);
    } catch (error) {
        console.error("Error fetching incident details:", error.message);
        res.status(500).json({ error: "Failed to fetch incident details" });
    }
});

app.get("/get-all-related-data/:ci_name", async (req, res) => {
    try {
        const ciname = req.params.ci_name;
        console.log("CI name:", ciname);
        const SERVICE_NOW_URL = `https://${process.env.SERVICENOW_INSTANCE}.service-now.com/api/1661930/addincidents/all_related?ci_name=${ciname}`;
        const response = await axios.get(SERVICE_NOW_URL, {
            auth: {
                username: process.env.SERVICENOW_USERNAME,
                password: process.env.SERVICENOW_PASSWORD,
            },
            headers: {
                "Accept": "application/json",
            },
        });

        res.json(response.data.result);
    } catch (error) {
        console.error("Error fetching related incidents:", error.message);
        res.status(500).json({ error: "Failed to fetch related incidents" });
    }
});

app.post("/generate-summary", async (req, res) => {
    try {
        const { description } = req.body;
        const generativeModel = vertex_ai.preview.getGenerativeModel({
            model: model,
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.2,
                topP: 0.8,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'OFF',
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'OFF',
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'OFF',
                },
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'OFF',
                }
            ],
            systemInstruction: {
                parts: [siText1]
            },
        });


        const chat = generativeModel.startChat({});
        const message = `Act like an expert Systech/Sys admin with decades of experience. Utilize the data I have provided as context to answer an issue I have. 
        Utilize the existing context first and then utilize your knowledge to help me find a resolution. 
        Give me an answer in the following JSON format {
        "text": "",
        "solutions": [
            {
            "title": "",
            "likelihood": "",
            "confidence": "",
            "reasoning": ""
            }
        ],
        "script": "",
        "logPath": "",
        "restartCommand": ""
        } 
        An explantion of these json fields is as follows: Provide an explanation of the possible solutions. Rank them based on the likelihood of success. 
        Give me the confidence score of each solution as well. At the end, provide a script to resolve the problem. I need to be able to parse this json so do not include any characters that cannot be parsed. 
        Here is the issue: Incident description: ${description}`;

        const streamResult = await chat.sendMessageStream(message);
        const output = JSON.stringify((await streamResult.response).candidates[0].content) || "No response generated.";

        res.json({ result: output });

    } catch (error) {
        console.error("Error generating summary:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate content" });
    }
});



app.get("/logs", async (req, res) => {
    try {
        console.log("get logs");
        const token = process.env.GOOGLE_BEARER_TOKEN;
        if (!token) {
            return res.status(500).json({ error: "Bearer token is missing. Check your .env file." });
        }

        const url = "https://logging.googleapis.com/v2/entries:list";

        const requestBody = {
            resourceNames: ["projects/383753837684"],
            filter: 'resource.type="aiplatform.googleapis.com/Endpoint" AND resource.labels.endpoint_id="2408805676085149696" AND resource.labels.location="us-east1"',
            orderBy: "timestamp desc",
            pageSize: 5
        };

        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        const response = await axios.post(url, requestBody, { headers });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching logs:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { genai, types } = require('@google-cloud/vertexai');
const { VertexAI } = require("@google-cloud/vertexai");



const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

const project = '383753837684';
const location = 'us-central1';
const textModel = 'gemini-2_0-flash-001';
const modelendpt = "projects/383753837684/locations/us-central1/endpoints/6790061545121382400"

const vertexAI = new VertexAI({ project: project, location: location });
const model = vertexAI.getGenerativeModel({ model: modelendpt });


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
        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: `Using the data you were tuned on, act as a systems operation support engineer and give ranked possible resolution steps/information for the incident with the following details:
        
        Incident Description: Failed to contact node ABC-APP-24 with BBC. Probably the node is down or there's a network problem. (OpC40-1911)
        Short Description: Failed to contact node
        Category: Hardware
        Configuration Item (CI): ABC-APP-24
        Impact: 2 - Medium
        Opened At: 22-03-2025 07:42`
                    }
                ]
            }
        ];

        var request = {
            model: {
                name: 'projects/383753837684/locations/us-central1/endpoints/6790061545121382400',
                version: 'default'
            },
            inputs: {
                'text': 'Hello'
            }
        };


        const generateContentConfig = {
            temperature: 1,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseModalities: ["TEXT"], // Ensuring only text responses
        };

        // Generate response from model
         const response = await model.generateContent({
             contents,
             generationConfig: generateContentConfig,
         });
         console.log("Sending request to Vertex AI:", JSON.stringify({ contents, generateContentConfig }, null, 2));
 
         // Extract text response
         console.log("Response: ", response);
         const output = response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
 
         res.json({ result: output });

    } catch (error) {
        console.error("Error generating summary:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate content" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

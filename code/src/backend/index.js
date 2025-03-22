require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

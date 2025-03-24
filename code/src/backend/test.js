const axios = require("axios");

async function testGenerateSummary() {
    try {
        const response = await axios.post("http://localhost:5000/generate-summary", {
        });

        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testGenerateSummary();
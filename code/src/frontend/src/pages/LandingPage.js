import React, { useState, useEffect } from "react";
import axios from "axios";

function LandingPage() {
    const [summary, setSummary] = useState("");
    const [inputValue, setInputValue] = useState(localStorage.getItem("incidentNumber") || "");
    const [showSummary, setShowSummary] = useState(false);
    const [relatedRecords, setRelatedRecords] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [ciInformation, setCiInformation] = useState([]);
    const [upstreamInfo, setupstreamInfo] = useState([]);
    const [downstreamInfo, setdownstreamInfo] = useState([]);
    const [ciNum, setciNum] = useState("");
    const [ip, setip] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const savedIncident = localStorage.getItem("incidentNumber");
        if (savedIncident) {
            fetchIncidentDetails(savedIncident);
        }
    }, []);

    const fetchIncidentDetails = async (incidentNumber) => {
        setLoading(true);
        setError(null);
        setShowSummary(false);

        try {
            const response = await axios.get(`http://localhost:5000/get-incident-details/${incidentNumber}`);
            console.log("hereeee");
            console.log(response);

            setSummary(`Summary for ticket: ${incidentNumber} - ${response.data.short_description}`);

            setciNum(response.data.cmdb_ci.name);
            setip(response.data.cmdb_ci.ip_address);
            try {
                const response = await axios.get(`http://localhost:5000/get-all-related-data/${ciNum}`);
                console.log("all data: ", response)
                setCiInformation(response.data.related_cis);
                console.log(ciInformation);
                const downstream = ciInformation.filter((record) => record.direction == 'Downstream').map(obj => ({ name: obj.name, relationship_type: obj.relationship_type, type: obj.type }));
                setdownstreamInfo(downstream);
                const upstream = ciInformation.filter((record) => record.direction == 'Upstream').map(obj => ({ name: obj.name, relationship_type: obj.relationship_type, type: obj.type }));;
                setupstreamInfo(upstream);
                setRelatedRecords(response.data.related_Records)
            }
            catch (err) {
                console.error("Error fetching all details:", err);
                setError("Failed to fetch all details. Please try again.");
            }
            setShowSummary(true);
        } catch (err) {
            console.error("Error fetching incident details:", err);
            setError("Failed to fetch incident details. Please try again.");
        }

        setLoading(false);
    };

    const handleSubmit = () => {
        if (!inputValue.trim()) {
            setError("Please enter a valid incident number.");
            return;
        }

        localStorage.setItem("incidentNumber", inputValue);
        fetchIncidentDetails(inputValue);
    };

    return (
        <div style={styles.container}>
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <input
                    type="text"
                    placeholder="ServiceNow Ticket"
                    style={styles.input}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button style={styles.button} onClick={handleSubmit}>Submit</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {showSummary && (
                <div style={styles.gridContainer}>
                    <div style={styles.summaryBox}>
                        <h2>Summary</h2>
                        <p>{summary}</p>
                    </div>

                    <div style={styles.box}>
                        <h2>Related Incidents</h2>
                        {/* <ul>
                            {relatedIncidents.length > 0 ? (
                                relatedIncidents.map((incident) => (
                                    <li key={incident.id}>
                                        <a href={incident.url} style={styles.link}>{incident.text}</a>
                                    </li>
                                ))
                            ) : (
                                <p>No related incidents found.</p>
                            )}
                        </ul> */}
                    </div>

                    <div style={styles.box}>
                        <h2>CI Information</h2>
                        <p>CI Number: {ciNum}</p>
                        <p>IP Address: {ip}</p>
                        <ol>
                            <li>Downstream</li>
                            {
                                <ul>
                                    {downstreamInfo.length > 0 ? (
                                        downstreamInfo.map((dp) => (
                                            <li key={dp.name}>
                                                <p>Name: {dp.name}, Relationship: {dp.relationship_type}, Type: {dp.type}</p>
                                            </li>
                                        ))
                                    ) : (
                                        <p>No CI Information found.</p>
                                    )}
                                </ul>}
                            <li>Upstream</li>
                            {
                                <ul>
                                    {upstreamInfo.length > 0 ? (
                                        upstreamInfo.map((dp) => (
                                            <li key={dp.name}>
                                                <p>Name: {dp.name}, Relationship: {dp.relationship_type}, Type:{dp.type}</p>
                                            </li>
                                        ))
                                    ) : (
                                        <p>No CI Information found.</p>
                                    )}
                                </ul>}
                        </ol>

                    </div>

                    <div style={styles.box}>
                        <h2>Recommended playbooks</h2>
                        {/* <ul>
                            {ciInformation.length > 0 ? (
                                ciInformation.map((ci, index) => (
                                    <li key={index}>
                                        <strong>{ci.key}:</strong> {ci.value}
                                    </li>
                                ))
                            ) : (
                                <p>No CI information available.</p>
                            )}
                        </ul> */}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        width: "95%",
        margin: "auto",
        textAlign: "center",
        backgroundColor: "#EAD196",
        paddingBottom: "30px",
    },
    input: {
        padding: "10px",
        fontSize: "16px",
        border: "1px solid #8B0000",
        borderRadius: "3px",
        width: "250px",
        outline: "none",
    },
    button: {
        padding: "10px 15px",
        marginLeft: "10px",
        fontSize: "16px",
        backgroundColor: "#8B0000",
        color: "white",
        border: "none",
        borderRadius: "3px",
        cursor: "pointer",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
    },
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginTop: "20px",
    },
    summaryBox: {
        padding: "20px",
        border: "1px solid #8B0000",
        borderRadius: "3px",
        backgroundColor: "#EEEEEE",
        color: "black",
        textAlign: "left",
        minHeight: "200px",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
    },
    box: {
        padding: "20px",
        border: "1px solid #8B0000",
        borderRadius: "3px",
        backgroundColor: "#EEEEEE",
        color: "black",
        textAlign: "left",
        minHeight: "200px",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
    },
    link: {
        color: "#8B0000",
        textDecoration: "none",
        fontWeight: "bold",
    },
};

export default LandingPage;

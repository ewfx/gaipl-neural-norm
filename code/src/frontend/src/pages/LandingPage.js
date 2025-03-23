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
    const [incidentsInfo, setIncidentsInfo] = useState([]);
    const [ciNum, setciNum] = useState("");
    const [ip, setip] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedPanel, setExpandedPanel] = useState(null);
    const [expandPanel, setExpandPanel] = useState(null);


    const togglePanel = (panel) => {
        setExpandedPanel(expandedPanel === panel ? null : panel);
    };

    const expandPanelCI = (panel) => {
        setExpandPanel(expandPanel == panel ? null : panel)
    }

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

            setSummary(`Summary for ticket: ${incidentNumber} - ${response.data.short_description}`);

            setciNum(response.data.cmdb_ci.name);
            setip(response.data.cmdb_ci.ip_address);
            try {
                const response = await axios.get(`http://localhost:5000/get-all-related-data/${ciNum}`);
                console.log("all data: ", response)

                setCiInformation(response.data.related_cis);
                const downstream = ciInformation.filter((record) => record.direction == 'Downstream').map(obj => ({ name: obj.name, relationship_type: obj.relationship_type, type: obj.type }));
                setdownstreamInfo(downstream);
                const upstream = ciInformation.filter((record) => record.direction == 'Upstream').map(obj => ({ name: obj.name, relationship_type: obj.relationship_type, type: obj.type }));;
                setupstreamInfo(upstream);

                setRelatedRecords(response.data.related_records)
                setIncidentsInfo(relatedRecords.incidents);
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
                        <h2 style={{ textAlign: "center" }}>Summary</h2>
                        <p>{summary}</p>
                    </div>

                    <div style={styles.box}>
                        <h2 style={{ textAlign: "center" }}>Related Issues</h2>
                        <div style={styles.panel}>
                            <div style={styles.panelHeader} onClick={() => togglePanel("incidents")}>
                                <span>Related Incidents</span>
                                <span>{expandedPanel === "incidents" ? "▼" : "▶"}</span>
                            </div>
                            {expandedPanel === "incidents" && (
                                <div style={styles.panelContent}>
                                    {incidentsInfo && incidentsInfo.length > 0 ? (
                                        incidentsInfo.map((incident) => (
                                            <div key={incident.number} style={styles.subPanel}>
                                                <p><strong>Number:</strong> {incident.number}</p>
                                                <p><strong>Opened at:</strong> {incident.opened_at}</p>
                                                <p><strong>Priority:</strong> {incident.priority}</p>
                                                <p><strong>Short description:</strong> {incident.short_description}</p>
                                                <p><strong>State:</strong> {incident.state}</p>
                                                <p><strong>CI Name:</strong> {incident.ci.name}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No related incidents found.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={styles.panel}>
                            <div style={styles.panelHeader} onClick={() => togglePanel("changeRequests")}>
                                <span>Related Change Requests</span>
                                <span>{expandedPanel === "changeRequests" ? "▼" : "▶"}</span>
                            </div>
                            {expandedPanel === "changeRequests" && (
                                <div style={styles.panelContent}>
                                    {relatedRecords.change_requests && relatedRecords.change_requests.length > 0 ? (
                                        relatedRecords.change_requests.map((change) => (
                                            <div key={change.number} style={styles.subPanel}>
                                                <p><strong>Number:</strong> {change.number}</p>
                                                <p><strong>Opened at:</strong> {change.opened_at}</p>
                                                <p><strong>Priority:</strong> {change.priority}</p>
                                                <p><strong>Description:</strong> {change.description}</p>
                                                <p><strong>State:</strong> {change.state}</p>
                                                <p><strong>CI Name:</strong> {change.ci.name}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No related change requests found.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={styles.panel}>
                            <div style={styles.panelHeader} onClick={() => togglePanel("problemTickets")}>
                                <span>Related Problem Tickets</span>
                                <span>{expandedPanel === "problemTickets" ? "▼" : "▶"}</span>
                            </div>
                            {expandedPanel === "problemTickets" && (
                                <div style={styles.panelContent}>
                                    {relatedRecords.problem_tickets && relatedRecords.problem_tickets.length > 0 ? (
                                        relatedRecords.problem_tickets.map((problem) => (
                                            <div key={problem.number} style={styles.subPanel}>
                                                <p><strong>Number:</strong> {problem.number}</p>
                                                <p><strong>Opened at:</strong> {problem.opened_at}</p>
                                                <p><strong>Priority:</strong> {problem.priority}</p>
                                                <p><strong>Description:</strong> {problem.short_description}</p>
                                                <p><strong>State:</strong> {problem.state}</p>
                                                <p><strong>CI Name:</strong> {problem.ci.name}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No related problem tickets found.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.box}>
                        <h2 style={{ textAlign: "center" }}>CI Information</h2>
                        <p><strong>CI Number: </strong>{ciNum !== null && ciNum !== undefined ? ciNum : "N/A"}</p>
                        <p><strong>IP Address: </strong>{ip !== null && ip !== undefined ? ip : "N/A"}</p>

                        <div style={styles.panel}>
                            <div style={styles.panelHeader} onClick={() => expandPanelCI("downstream")}>
                                <span>Downstream</span>
                                <span>{expandPanel === "downstream" ? "▼" : "▶"}</span>
                            </div>
                            {expandPanel === "downstream" && (
                                <div style={styles.panelContent}>
                                    {downstreamInfo.length > 0 ? (
                                        downstreamInfo.map((dp) => (
                                            <div style={styles.panelContent}>
                                                <p><strong>Name: </strong>{dp.name} </p>
                                                <p><strong>Relationship: </strong>{dp.relationship_type}</p>
                                                <p><strong>Type: </strong>{dp.type}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No CI Information found.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={styles.panel}>
                            <div style={styles.panelHeader} onClick={() => expandPanelCI("upstream")}>
                                <span>Upstream</span>
                                <span>{expandPanel === "upstream" ? "▼" : "▶"}</span>
                            </div>
                            {expandPanel === "upstream" && (
                                <div style={styles.panelContent}>
                                    {upstreamInfo.length > 0 ? (
                                        upstreamInfo.map((dp) => (
                                            <div style={styles.panelContent}>
                                                <p><strong>Name: </strong>{dp.name} </p>
                                                <p><strong>Relationship: </strong>{dp.relationship_type}</p>
                                                <p><strong>Type: </strong>{dp.type}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No CI Information found.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.box}>
                        <h2 style={{ textAlign: "center" }}>Recommended playbooks</h2>

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
        backgroundColor: "#ECDCBF",
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
        backgroundColor: "#A31D1D",
        color: "white",
        border: "none",
        borderRadius: "3px",
        cursor: "pointer",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
    },
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)", /* Two equal columns */
        alignItems: "stretch", /* Ensures all boxes stay the same height */
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
    details: {
        border: "1px solid #8B0000",
        borderRadius: "5px",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "#f8f8f8",
        cursor: "pointer",
    },
    summary: {
        fontWeight: "bold",
        cursor: "pointer",
    },
    panel: {
        border: "1px solid #8B0000",
        borderRadius: "5px",
        marginBottom: "10px",
        backgroundColor: "#f8f8f8",
    },
    panelHeader: {
        padding: "10px",
        fontWeight: "bold",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: "#ECDCBF",
        borderRadius: "5px 5px 0 0",
    },
    panelContent: {
        padding: "10px",
        backgroundColor: "#fff",
        borderRadius: "0 0 5px 5px",
    },
    subPanel: {
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "5px",
        borderRadius: "3px",
        backgroundColor: "#fdfdfd",
    },
};

export default LandingPage;

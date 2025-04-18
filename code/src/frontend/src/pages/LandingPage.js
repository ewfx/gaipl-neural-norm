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
    const [logs, setLogs] = useState([]);


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
            // First API call: Get Incident Details
            const incidentResponse = await axios.get(`http://localhost:5000/get-incident-details/${incidentNumber}`);
            const incidentData = incidentResponse.data;

            // Update state for incident details
            setSummary(`Summary for ticket: ${incidentNumber} - ${incidentData.short_description}`);
            setciNum(incidentData.cmdb_ci.name);
            setip(incidentData.cmdb_ci.ip_address);

            // Ensure ciNum is properly updated before making the second API call
            if (!incidentData.cmdb_ci.name) {
                throw new Error("CI Name is missing, cannot fetch related data.");
            }

            // Second API call: Get related data
            const relatedDataResponse = await axios.get(`http://localhost:5000/get-all-related-data/${incidentData.cmdb_ci.name}`);
            const relatedData = relatedDataResponse.data;

            // Update state for related CIs
            setCiInformation(relatedData.related_cis);

            // Process upstream & downstream relationships
            const downstream = relatedData.related_cis
                .filter((record) => record.direction === 'Downstream')
                .map(obj => ({ name: obj.name, relationship_type: obj.relationship_type, type: obj.type }));
            setdownstreamInfo(downstream);

            const upstream = relatedData.related_cis
                .filter((record) => record.direction === 'Upstream')
                .map(obj => ({ name: obj.name, relationship_type: obj.relationship_type, type: obj.type }));
            setupstreamInfo(upstream);

            // Update related records
            setRelatedRecords(relatedData.related_records);
            setIncidentsInfo(relatedData.related_records?.incidents || []);

            // Third API call: Generate Summary
            try {
                const summaryResponse = await axios.post('http://localhost:5000/generate-summary', {
                    description: incidentData.short_description,
                });

                const outerParsed = JSON.parse(summaryResponse.data.result);
                let jsonText = outerParsed.parts[0].text.trim();

                if (jsonText.startsWith("```json")) {
                    jsonText = jsonText.slice(7);
                }
                jsonText = jsonText.slice(0, -4).trim();

                const parsedData = JSON.parse(jsonText);

                setSummary(parsedData);
            } catch (summaryErr) {
                console.error("Error generating summary:", summaryErr);
                setError("Failed to generate summary.");
            }

            setShowSummary(true);
        } catch (err) {
            console.error("Error: ", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getLogs = async () => {
        try {
            const logsdata = await axios.get(`http://localhost:5000/logs`);
            const data = logsdata.data;
            setLogs(data.entries);
        }
        catch (err) {
            console.error("Error fetching logs:", err);
            setError(err.message || "Something went wrong. Please try again.");
        }
    }

    const handleSubmit = () => {
        if (!inputValue.trim()) {
            setError("Please enter a valid incident number.");
            return;
        }
        getLogs();
        localStorage.setItem("incidentNumber", inputValue);
        fetchIncidentDetails(inputValue);
    };

    const runPlaybook = async () => {
        //Makes API call to Ansible
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

                    <div style={styles.box}>
                        <h2 style={{ textAlign: "center" }}>CI Information</h2>
                        <p><strong>CI Name: </strong>{ciNum !== null && ciNum !== undefined ? ciNum : "N/A"}</p>
                        <p><strong>IP Address: </strong>{ip !== null && ip !== undefined ? ip : "N/A"}</p>

                        <div style={styles.panel}>
                            <div style={styles.panelHeader} onClick={() => expandPanelCI("downstream")}>
                                <span>Downstream Apps</span>
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
                                <span>Upstream Apps</span>
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

                    <div style={styles.fullBox}>
                        <h2 style={{ textAlign: "center" }}>Logs</h2>
                        <div style={styles.logscontainer}>
                            {logs.length === 0 ? (
                                <p>No logs available.</p>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} style={styles.logEntry}>
                                        <p style={styles.text}>
                                            <strong style={styles.strong}>Timestamp:</strong> {log.timestamp}
                                        </p>
                                        <p style={styles.text}>
                                            <strong style={styles.strong}>LogName:</strong> {log.logName}
                                        </p>
                                        <p style={styles.text}>
                                            <strong style={styles.strong}>Endpoint:</strong> {log.jsonPayload?.endpoint}
                                        </p>
                                        <p style={styles.text}>
                                            <strong style={styles.strong}>Deployed Model ID:</strong> {log.jsonPayload?.deployedModelId}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div style={styles.summaryBox}>
                        <h2 style={{ textAlign: "center" }}>Summary of Resolution</h2>
                        <p>{summary.text}</p>

                        <h3>Possible Solutions & Analysis</h3>
                        {summary.solutions.map((solution, index) => (
                            <div key={index} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
                                <h4>{solution.title}</h4>
                                <p><strong>Likelihood of Success:</strong> {solution.likelihood}</p>
                                <p><strong>Confidence Score:</strong> {solution.confidence}</p>
                                <p><strong>Reasoning:</strong> {solution.reasoning}</p>
                            </div>
                        ))}
                    </div>

                    <div style={styles.box}>
                        <h2 style={{ textAlign: "center" }}>Action Items</h2>
                        <h3>Resolution Script</h3>
                        <pre style={{
                            background: "#f4f4f4",
                            padding: "10px",
                            borderRadius: "5px",
                            overflowX: "auto",
                            whiteSpace: "pre-wrap", 
                            wordBreak: "break-word", 
                        }}>
                            {summary.script}
                        </pre>

                        <h4>Log Path:</h4>
                        <p>{summary.logPath}</p>

                        <h4>Restart Command:</h4>
                        <pre style={{
                            background: "#f4f4f4",
                            padding: "5px",
                            borderRadius: "5px",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}>
                            {summary.restartCommand}
                        </pre>

                        <h4>Ansible Playbook:</h4>
                        <button style={styles.button} onClick={runPlaybook}>Run Playbook</button>
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
        gridTemplateColumns: "repeat(2, 1fr)",
        alignItems: "stretch",
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
    fullBox: {
        gridColumn: "1 / -1",
        padding: "20px",
        border: "1px solid #8B0000",
        borderRadius: "3px",
        backgroundColor: "#EEEEEE",
        color: "black",
        textAlign: "left",
        minHeight: "200px",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
    },
    logscontainer: {
        backgroundColor: "#7a2822",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        height: "24rem",
        overflow: "auto",
    },
    logEntry: {
        borderBottom: "1px solid black",
        paddingBottom: "8px",
        marginBottom: "8px",
    },
    text: {
        fontSize: "14px",
    },
    strong: {
        fontWeight: "bold",
    },

};

export default LandingPage;

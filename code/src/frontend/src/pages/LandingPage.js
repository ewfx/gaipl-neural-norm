import React, { useState, useEffect } from "react";

function LandingPage() {
    const [summary, setSummary] = useState("");
    const [inputValue, setInputValue] = useState(localStorage.getItem("incidentNumber") || "");
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        const savedIncident = localStorage.getItem("incidentNumber");
        if (savedIncident) {
            setSummary(`Summary for ticket: ${savedIncident}`);
            setShowSummary(true);
        }
    }, []);

    const handleSubmit = () => {
        localStorage.setItem("incidentNumber", inputValue);
        setSummary(`Summary for ticket: ${inputValue}`);
        setShowSummary(true);
    };

    return (
        <div style={styles.container}>
            <nav style={styles.navbar}>
                <h1 style={styles.navTitle}>Integrated Platform Support Dashboard</h1>
            </nav>
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

            <div style={styles.gridContainer}>
                {showSummary && (
                    <div style={styles.summaryBox}>
                        <h2>Summary</h2>
                        <p>{summary}</p>
                    </div>
                )}

                {showSummary && (
                    <div style={styles.box}>
                        <h2>Related Incidents</h2>
                        <ul>
                            {relatedIncidents.map((incident) => (
                                <li key={incident.id}>
                                    <a href={incident.url} style={styles.link}>{incident.text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {showSummary && (
                    <div style={styles.box}>
                        <h2>Dependencies</h2>
                        <ul>
                            {dependencies.map((dp) => (
                                <li key={dp.id}>
                                    <a href={dp.url} style={styles.link}>{dp.text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {showSummary && (
                    <div style={styles.box}>
                        <h2>CI Information</h2>
                        <ul>
                            {ciInformation.map((ci) => (
                                <li key={ci.key}>
                                    <strong>{ci.key}:</strong> {ci.value}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

const relatedIncidents = [
    { id: 1, url: "#", text: "Incident 1" },
    { id: 2, url: "#", text: "Incident 2" },
    { id: 3, url: "#", text: "Incident 3" },
    { id: 4, url: "#", text: "Incident 4" },
    { id: 5, url: "#", text: "Incident 5" },
];

const dependencies = [
    { id: 1, url: "#", text: "Dependency 1" },
    { id: 2, url: "#", text: "Dependency 2" },
    { id: 3, url: "#", text: "Dependency 3" },
    { id: 4, url: "#", text: "Dependency 4" },
    { id: 5, url: "#", text: "Dependency 5" },
];

const ciInformation = [
    { key: "CI Name", value: "Server_123" },
    { key: "CI Type", value: "Application Server" },
    { key: "Status", value: "Active" },
    { key: "Owner", value: "John Doe" },
    { key: "Environment", value: "Production" },
];

const styles = {
    container: {
        width: "95%",
        margin: "auto",
        textAlign: "center",
        backgroundColor: "#EAD196",
        paddingBottom: "30px",
    },
    navbar: {
        backgroundColor: "#BF3131", 
        padding: "15px 0",
        color: "white",
        textAlign: "center",
        borderBottom: "1px solid #8B0000",
        marginTop: "20px",
    },
    navTitle: {
        margin: 0,
        fontSize: "24px",
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
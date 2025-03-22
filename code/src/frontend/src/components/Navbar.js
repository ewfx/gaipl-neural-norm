import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav style={styles.navbar}>
            <div style={styles.leftSection}>
                <img src="/logo_charriot.jpg" alt="Logo" style={styles.logo} />
            </div>
            <div style={styles.links}>
                <Link to="/" style={styles.link}>Home</Link>
                <Link to="/chatbot" style={styles.link}>ChatBot</Link>
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        backgroundColor: "#7D0A0A",
    },
    leftSection: {
        display: "flex",
        alignItems: "center",
    },
    logo: {
        height: "40px",
    },
    links: {
        display: "flex",
        alignItems: "center",
    },
    link: {
        margin: "0 15px",
        textDecoration: "none",
        color: "#ffffff", // White text for contrast
        fontSize: "18px",
        fontWeight: "bold",
    },
};

export default Navbar;

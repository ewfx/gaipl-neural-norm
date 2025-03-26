import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav style={styles.navbar}>
            <div style={styles.leftSection}>
                <img src="/logo_charriot.jpg" alt="Logo" style={styles.logo} />
            </div>
            <nav style={styles.navbar}>
                <h1 style={styles.navTitle}>UNITI</h1>
            </nav>
            <div style={styles.links}>
                <Link to="/" style={styles.link}>Home</Link>
                <Link to="/chatbot" style={styles.link}>ChatBot</Link>
            </div>
        </nav>
    );
}

const styles = {
    navTitle: {
        margin: 0,
        fontSize: "24px",
    },
    navbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        backgroundColor: "#D84040", 
        color: "white",
        textAlign: "center",
    },
    leftSection: {
        display: "flex",
        alignItems: "center",
        marginLeft: "15px",
    },
    logo: {
        height: "50px",
    },
    links: {
        display: "flex",
        alignItems: "center",
    },
    link: {
        margin: "0 15px",
        textDecoration: "none",
        color: "#ffffff",
        fontSize: "18px",
        fontWeight: "bold",
    },
};

export default Navbar;

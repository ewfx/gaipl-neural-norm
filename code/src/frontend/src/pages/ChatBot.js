import React, { useState } from "react";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY; // Ensure this is set in your .env file
const genAI = new GoogleGenerativeAI(API_KEY);

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;
    
        const userMessage = { role: "user", content: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");
    
        try {
            const model = genAI.getGenerativeModel({ model:"gemini-2.0-flash" }, {apiVersion: 'v1beta',});
    
            const response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: input }] }],
            });
    
            const botMessage = {
                role: "assistant",
                content: response.response.candidates[0].content.parts[0].text,
            };
    
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("Error fetching response:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: "assistant", content: "Error: Unable to get response. Please try again." },
            ]);
        }
    };

    return (
        <div style={styles.chatContainer}>
            <h2>Chatbot</h2>
            <div style={styles.chatBox}>
                {messages.map((msg, index) => (
                    <div key={index} style={msg.role === "user" ? styles.userMessage : styles.botMessage}>
                        {msg.content}
                    </div>
                ))}
            </div>
            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    style={styles.input}
                />
                <button onClick={sendMessage} style={styles.button}>Send</button>
            </div>
        </div>
    );
}

const styles = {
    chatContainer: {
        width: "65%",
        margin: "auto",
        textAlign: "center",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        backgroundColor: "#f2f0f0",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        marginTop: "50px",
        marginBottom: "50px",
    },
    chatBox: {
        height: "300px",
        overflowY: "auto",
        border: "1px solid #ddd",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "#ffffff",
        borderRadius: "5px",
        display: "flex",
        flexDirection: "column",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#e3f2fd",
        padding: "10px",
        borderRadius: "10px",
        margin: "5px",
        color: "#333",
        maxWidth: "75%",
        textAlign: "right",
        wordWrap: "break-word",
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
    },
    botMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#f1f8e9",
        padding: "10px",
        borderRadius: "10px",
        margin: "5px",
        color: "#333",
        maxWidth: "75%",
        textAlign: "left",
        wordWrap: "break-word",
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
    },
    inputContainer: {
        display: "flex",
        justifyContent: "center",
    },
    input: {
        width: "80%",
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        backgroundColor: "#ffffff",
    },
    button: {
        padding: "10px 15px",
        marginLeft: "10px",
        border: "none",
        backgroundColor: "#A31D1D",
        color: "white",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default Chatbot;
Architecture Breakdown

1️⃣ Data Sources (APIs): Uniti collects data from multiple observability and ITSM tools:

    ServiceNow (Incident & Change Management)

    Grafana (Monitoring Metrics)

    Confluence (Documentation & KB)

    AppDynamics (Application Performance Monitoring)

    Splunk (Logs & Security Events)

2️⃣ Uniti Backend (Node.js/Python + Flask)

    Fetches real-time data via REST APIs/Webhooks

    Aggregates & normalizes data for Vertex AI

3️⃣ Google Vertex AI

    Uses an LLM to analyze incidents, logs, and telemetry data

    Generates triage suggestions and automated resolution steps

4️⃣ AI Chatbot (Google Gemini 2.0)

    Support engineers can ask questions related to incidents & solutions

    Provides additional insights & resolution recommendations

5️⃣ Remediation Engine

    Executes AI-generated scripts for automated resolution

    Uses Ansible to trigger playbooks for system fixes

6️⃣ Uniti Frontend (React-based Web UI)

    Displays correlated incidents & AI-powered resolutions

    Provides an interactive AI chatbot for engineers

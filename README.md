# HealthMate 🩺

[**🇨🇳 中文说明 (Chinese Version) -> README_zh.md**](./README_zh.md)

---

## HealthMate - Proactive Family Health AI Assistant

> An AI-powered proactive family health management tool. From solving the pain point of "helping children understand parents' medical reports" to evolving into a comprehensive platform including OCR-assisted lab report analysis, prescription medication management, medical visit diaries (with voice-to-text), offline-native PWA experience, and a proactive early-warning system.

### Core Technologies & Workflow Explanation

How exactly does HealthMate transform a photo of a messy medical report into clear, personalized health advice? It relies on three core technologies working together seamlessly: **OCR**, a **Three-Tier RAG Engine**, and an **Agent (ReAct Orchestrator)**. 

Here is the step-by-step workflow:

#### Step 1: The Eyes (OCR - Optical Character Recognition)
When a user uploads a photo of a lab report, the system first needs to "read" the image. We use local, privacy-safe OCR technology (using pre-trained engine weights) to scan the image and extract unstructured text, outputting raw strings of test item names and numerical values.

#### Step 2: The Memory (Three-Tier RAG Retrieval)
RAG (Retrieval-Augmented Generation) is like giving the AI an open-book exam. Instead of hallucinating, it strictly looks up facts. We designed a **Three-Tier RAG structure**:
- **L1 (Global Knowledge):** The "Medical Reference Book". It queries local databases (`lab_norms.json`, `medical_kb.json`) to see if an indicator like "ALT" is out of bounds for the user's age/gender.
- **L2 (Family Timeline):** The "Family Medical Folder". The system retrieves the user's historical lab reports from the database. It compares today's "ALT" with the value from 3 months ago to see if it's improving or worsening.
- **L3 (Personal Notes):** The "Diary". It searches the user's personal notes (e.g., "Dad felt dizzy last week") to provide unique contextual clues.

#### Step 3: The Brain (Agent & ReAct Framework)
Now the system has the text and the memories. How does it think? We implemented an **Agent Orchestrator** based on the **ReAct (Reason + Act)** pattern. 
Instead of instantly throwing a prompt to an LLM, the Agent loops through a thought process:
1. **Thought:** "I extracted the text. I need to check the reference norms for ALT."
2. **Act (Tool Call):** Calls the `query_lab_norms` tool.
3. **Observe:** The tool returns "ALT normal range is 0-40, user is at 55."
4. **Thought:** "It's high. Let me check if they had high ALT before."
5. **Act:** Calls the `query_lab_history` tool.
6. **Observe:** "ALT was 70 three months ago."
7. **Final Decision:** "Although ALT is high, it is improving. I will assess this as a moderate issue."

Through this dynamic function calling and reasoning loop (running up to 8 iterations), the AI produces highly accurate, personalized outputs. This "thought process" is streamed back to the frontend in real-time using SSE (Server-Sent Events), showing the user exactly how the AI arrived at its conclusions.

### Key Features (PWA Production Ready)

1. **Offline PWA Native Experience**: Works offline (e.g., in hospital basements) so you can always check your family's medical history.
2. **Proactive AI Watchdog**: Automatically monitors anomaly trends and medication run-out dates.
3. **Multi-Agent RAG Engine**: Simulated 3-Tier Multi-Modal RAG architecture (General Knowledge -> Family Timeline -> Personal Notes).
4. **Privacy First**: Fully local capabilities with Ollama support + End-to-End Encryption principles built-in.

### V5 Ultimate Release Highlights (Production PWA)

**Architecture Evolution & Commercialization**:
1. **Ultimate PWA Native Experience**:
   - Introduced `vite-plugin-pwa` to achieve multi-device (iOS/Android/Desktop) offline frameworks. Historical medical records can be viewed even in no-network environments.
   - Implemented a smart on-demand installation prompt component (`PWAPrompt`) for a seamless native app experience.
2. **Pro Lifetime License & Data Security**:
   - Offers a dual commercial loop: a free, purely local, unlimited version, and a ¥199 Pro cloud-based lifetime version.
   - Provides End-to-End Encryption (E2EE) guidelines, accompanied by complete legal documents: "Privacy Policy", "User Agreement", and "Medical Disclaimer" for compliant public release.
3. **Delivery-Level Infrastructure**:
   - Built-in production-grade `docker-compose.yml` guide and GitHub Action `main.yml` CI/CD automated deployment flow.

### Agent Framework Architecture

Due to the environment constraints running in Node.js, this system uses **TypeScript + Custom ReAct Pattern** to implement the required Agent Orchestrator (see `src/server/agent/orchestrator.ts`).
- **ReAct Engine**: Built on a self-executing while loop, implementing (Reason -> Act -> Observe).
- **Streaming Output (SSE)**: The backend provides an SSE endpoint, and the frontend intercepts `step_start`, `tool_call`, `tool_result`, `thinking`, and `final` events in real-time to render an immersive thought process.
- **Dynamic Tool Injection**: Utilizes the AI SDK Core's Function Calling system to invoke 8 custom-built tools.

### Tencent Cloud SMS Tutorial (Mocked)

This project supports lightweight mobile + verification code login. In production, Tencent Cloud SMS can be integrated:
1. Register a Tencent Cloud account and enable the "SMS" service.
2. Create a signature (e.g., HealthMate) and a template.
3. Install the Tencent Cloud SDK `tencentcloud-sdk-nodejs` and replace the logging logic in `src/server/api/auth.ts`.
*(In the current development environment, all verification codes are mocked as `123456` for easy testing)*

### JWT Configuration

1. Create a `.env` file in the root directory.
2. Fill in the field: `JWT_SECRET=your_super_secret_key_here`.
3. If not configured, it defaults to `healthmate_dev_secret_key` with a 7-day expiration.

### V1 → V2 Data Migration Workflow

If you have accumulated reports in V1 (the local version without login), when you log in for the first time and enter the **Family History Interpretation** page (`/history`), a migration banner will automatically appear. Click **Sync Now** to transition your old IndexedDB data to the centralized server database seamlessly.

### Detailed Description of 8 Core Tools

1. `ocr_parse_lab_report`: Extracts and parses lab report text from user images via OCR.
2. `query_lab_norms`: Retrieves structured info (units, thresholds) from local `data/lab_norms.json`.
3. `search_medical_kb`: Matches documents from `data/medical_kb.json` based on suspected symptoms.
4. `analyze_indicator`: Diagnoses logical implications of an indicator's value vs reference threshold.
5. `detect_critical_symptoms`: Scans for warning signs (e.g., massive bleeding, loss of consciousness).
6. `assess_severity`: Evaluates and outputs moderate/severe report summaries.
7. `generate_doctor_questions`: Generates customized questions for adult children to ask doctors.
8. `generate_wechat_message_for_doctor`: Drafts a concise WeChat message summarizing patient stats for medical consultation.

### V4 Upgrade Guide (Proactive Agent + Smart Alerts)

1. **Weekly Report Trigger**: Backend scheduled by `node-cron` in `src/server/agent/proactive.ts`. Default at `0 8 * * 1`.
2. **Proactive Scanning**: Runs daily at `0 3 * * *` to detect continuous anomalies. Notifications are pushed to the in-app message box (`/notifications`).
3. **Multimedia Processing**: Voice dictation uses Web Speech API. Long image exports use `html2canvas` for clear sharing.

### Quick Start
```bash
npm install
npm run dev
```

### Provider & Local Configuration

**Google Gemini** is used by default. Via the Settings Page, you can switch models:
1. **Ollama Local Mode**: Connect to `http://127.0.0.1:11434/v1` after running Ollama locally.
2. **Third-Party Cloud Providers**: Supports DeepSeek, Tongyi Qianwen (DashScope), and Claude (Anthropic). Configure your API keys in the settings page.

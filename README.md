# HealthMate 🩺

[**🇨🇳 中文说明 (Chinese Version) -> README_zh.md**](./README_zh.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

![Homepage Screenshot](./docs/screenshot.png)

## 🌟 HealthMate - Proactive Family Health AI Assistant

> An AI-powered proactive family health management tool. From solving the pain point of "helping children understand parents' medical reports" to evolving into a comprehensive platform including OCR-assisted lab report analysis, prescription medication management, medical visit diaries (with voice-to-text), offline-native PWA experience, comprehensive i18n, and a proactive early-warning system.

### 🚀 Latest V6 International Release Highlights

1. **🌐 Full Internationalization (i18n)**: Seamlessly switch between English and Chinese, covering all UI elements, medical insights, error handling, and the AI alert system.
2. **⚖️ Production-Grade Compliance**: Added Legal Disclaimer and Privacy Policy components. Greatly strengthens the system's compliance for global release and mitigates AI medical advice liability.
3. **⚙️ Global Flexible Settings**: A newly designed platform-level Settings Page, allowing dynamic UI language switching and the ability to change the underlying LLM provider (e.g., Gemini, Claude, Ollama) on the fly.
4. **🎨 UI/UX Experience Upgrade**: Further optimized the borderless, minimalist design and tactile feedback, offering a smoother and more immersive feel tailored to elderly users and differing languages.

### 🧠 Core Technologies & Workflow Explanation (Agent, RAG, OCR)

How exactly does HealthMate transform a photo of a messy medical report into clear, personalized health advice? It relies on three core technologies working together seamlessly: **OCR**, a **Three-Tier RAG Engine**, and an **Agent (ReAct Orchestrator)**. 

Here is the step-by-step workflow:

#### 👁️ Step 1: The Eyes (OCR - Optical Character Recognition)
When a user uploads a photo of a lab report, the system first needs to "read" the image. We use local, privacy-safe OCR technology to scan the image and extract unstructured text, outputting raw strings of test item names and numerical values.

#### 📚 Step 2: The Memory (Three-Tier RAG Retrieval)
RAG (Retrieval-Augmented Generation) is like giving the AI an open-book exam. Instead of hallucinating, it strictly looks up facts. We designed a **Three-Tier RAG structure**:
- **L1 (Global Knowledge):** The "Medical Reference Book". It queries local databases (`lab_norms.json`, `medical_kb.json`) to see if an indicator like "ALT" is out of bounds for the user's age/gender.
- **L2 (Family Timeline):** The "Family Medical Folder". The system retrieves the user's historical lab reports from the database. It compares today's "ALT" with the value from 3 months ago to see if it's improving or worsening.
- **L3 (Personal Notes):** The "Diary". It searches the user's personal notes (e.g., "Dad felt dizzy last week") to provide unique contextual clues.

#### 🤖 Step 3: The Brain (Agent & ReAct Framework)
Now the system has the text and the memories. How does it think? We implemented an **Agent Orchestrator** based on the **ReAct (Reason + Act)** pattern. 
Instead of instantly throwing a prompt to an LLM, the Agent loops through a thought process:
1. **🤔 Thought:** "I extracted the text. I need to check the reference norms for ALT."
2. **🛠️ Act (Tool Call):** Calls the `query_lab_norms` tool.
3. **👀 Observe:** The tool returns "ALT normal range is 0-40, user is at 55."
4. **🤔 Thought:** "It's high. Let me check if they had high ALT before."
5. **🛠️ Act:** Calls the `query_lab_history` tool.
6. **👀 Observe:** "ALT was 70 three months ago."
7. **✅ Final Decision:** "Although ALT is high, it is improving. I will assess this as a moderate issue."

Through this dynamic function calling and reasoning loop (running up to 8 iterations), the AI produces highly accurate, personalized outputs. This "thought process" is streamed back to the frontend in real-time using SSE (Server-Sent Events), showing the user exactly how the AI arrived at its conclusions.

### ✨ Key Features (PWA Production Ready)

1. **📱 Offline PWA Native Experience**: Works offline (e.g., in hospital basements) so you can always check your family's medical history.
2. **🔔 Proactive AI Watchdog**: Automatically monitors anomaly trends and medication run-out dates.
3. **💬 Multi-Agent RAG Engine**: Simulated 3-Tier Multi-Modal RAG architecture (General Knowledge -> Family Timeline -> Personal Notes).
4. **🛡️ Privacy First**: Fully local capabilities with Ollama support + End-to-End Encryption principles built-in.

### 📁 Project Structure

```text
HealthMate/
├── data/                  # Local databases & medical KB (SQLite & JSON)
│   ├── drug_interactions_kb.json
│   ├── lab_norms.json
│   ├── medical_kb.json
│   └── healthmate.db
├── docs/                  # Docs, screenshots, legal templates
│   ├── screenshot.png     # <== Put your homepage screenshot here
│   └── ...
├── src/
│   ├── components/        # React UI components (LegalModal, Headers, etc.)
│   ├── context/           # Global State Management (Auth, Theme)
│   ├── lib/               # Utilities (i18n instance, database clients)
│   ├── locales/           # i18n Translation Files (en/zh)
│   ├── pages/             # Core Pages (Home, History, SettingsPage, etc.)
│   └── server/            # Node.js + Express Backend Services
│       ├── agent/         # RAG & ReAct AI Orchestrator
│       ├── api/           # Backend API routes
│       └── tools/         # 8 Core Agent Plugin Tools
├── vite.config.ts         # Vite & PWA Build Configuration
├── server.ts              # Node Server entry point
└── package.json           # Scripts and Dependencies
```

### 🧩 Agent Framework Architecture

Due to the environment constraints running in Node.js, this system uses **TypeScript + Custom ReAct Pattern** to implement the required Agent Orchestrator (see `src/server/agent/orchestrator.ts`).
- **ReAct Engine**: Built on a self-executing while loop, implementing (Reason -> Act -> Observe).
- **Streaming Output (SSE)**: The backend provides an SSE endpoint, and the frontend intercepts `step_start`, `tool_call`, `tool_result`, `thinking`, and `final` events in real-time to render an immersive thought process.
- **Dynamic Tool Injection**: Utilizes the AI SDK Core's Function Calling system to invoke 8 custom-built tools.

### 🧰 Detailed Description of 8 Core Tools

1. `ocr_parse_lab_report`: Extracts and parses lab report text from user images via OCR.
2. `query_lab_norms`: Retrieves structured info (units, thresholds) from local `data/lab_norms.json`.
3. `search_medical_kb`: Matches documents from `data/medical_kb.json` based on suspected symptoms.
4. `analyze_indicator`: Diagnoses logical implications of an indicator's value vs reference threshold.
5. `detect_critical_symptoms`: Scans for warning signs (e.g., massive bleeding, loss of consciousness).
6. `assess_severity`: Evaluates and outputs moderate/severe report summaries.
7. `generate_doctor_questions`: Generates customized questions for adult children to ask doctors.
8. `generate_wechat_message_for_doctor`: Drafts a concise WeChat message summarizing patient stats for medical consultation.

### 🔧 Quick Start
```bash
npm install
npm run dev
```

### ☁️ Provider & Local Configuration

**Google Gemini** is used by default. Via the Settings Page, you can switch models:
1. **Ollama Local Mode**: Connect to `http://127.0.0.1:11434/v1` after running Ollama locally.
2. **Third-Party Cloud Providers**: Supports DeepSeek, Tongyi Qianwen (DashScope), and Claude (Anthropic). Configure your API keys in the settings page.

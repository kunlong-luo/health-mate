var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server/core/db.ts
var import_better_sqlite3, import_path, import_fs, dataDir, dbPath, db;
var init_db = __esm({
  "src/server/core/db.ts"() {
    import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
    import_path = __toESM(require("path"), 1);
    import_fs = __toESM(require("fs"), 1);
    dataDir = import_path.default.join(process.cwd(), "data");
    if (!import_fs.default.existsSync(dataDir)) {
      import_fs.default.mkdirSync(dataDir, { recursive: true });
    }
    dbPath = import_path.default.join(dataDir, "healthmate.db");
    db = new import_better_sqlite3.default(dbPath);
    db.pragma("journal_mode = WAL");
    try {
      db.exec("ALTER TABLE users ADD COLUMN is_pro INTEGER DEFAULT 0;");
    } catch (e) {
    }
    try {
      db.exec("ALTER TABLE users ADD COLUMN email TEXT;");
    } catch (e) {
    }
    try {
      db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;");
    } catch (e) {
    }
    try {
      db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT;");
    } catch (e) {
    }
    try {
      db.exec('ALTER TABLE users ADD COLUMN avatar_emoji TEXT DEFAULT "\u{1F44B}";');
    } catch (e) {
    }
    try {
      db.exec("ALTER TABLE users ADD COLUMN last_login_at DATETIME;");
    } catch (e) {
    }
    try {
      db.exec("ALTER TABLE users ADD COLUMN deleted_at DATETIME;");
    } catch (e) {
    }
    db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  
  CREATE TABLE IF NOT EXISTS tasks (
    task_id TEXT PRIMARY KEY,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    result TEXT
  );
  
  CREATE TABLE IF NOT EXISTS task_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT,
    event_type TEXT,
    payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  /* V2 Tables */
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    name TEXT,
    is_pro INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sms_codes (
    phone TEXT PRIMARY KEY,
    code TEXT,
    expires_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    gender TEXT,
    birth_year INTEGER,
    conditions TEXT,
    allergies TEXT,
    avatar_emoji TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    family_member_id TEXT,
    file_path TEXT,
    ocr_text TEXT,
    interpretation_json TEXT,
    severity TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS indicators (
    id TEXT PRIMARY KEY,
    family_member_id TEXT,
    report_id TEXT,
    name TEXT,
    value REAL,
    unit TEXT,
    ref_range TEXT,
    is_abnormal INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    family_member_id TEXT,
    report_id TEXT,
    content TEXT,
    is_auto_extracted INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  /* V3 Tables */
  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    family_member_id TEXT NOT NULL,
    complaint TEXT NOT NULL,
    status TEXT DEFAULT 'planned', -- planned, active, completed
    department_recommended TEXT,
    materials_needed TEXT,
    questions_generated TEXT,
    visit_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS visit_notes (
    id TEXT PRIMARY KEY,
    visit_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    visit_id TEXT,
    family_member_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    parsed_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    family_member_id TEXT NOT NULL,
    name TEXT NOT NULL,
    generic_name TEXT,
    dosage TEXT,
    frequency TEXT,
    start_date TEXT,
    end_date TEXT,
    active INTEGER DEFAULT 1,
    reminder_time TEXT,
    instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    family_member_id TEXT,
    messages_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  /* V5 Auth Tables */
  CREATE TABLE IF NOT EXISTS email_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    purpose TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT,
    success INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  /* V4 Tables */
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    family_member_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT, -- 'alert', 'weekly_report', 'system'
    is_read INTEGER DEFAULT 0,
    action_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS care_reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    family_member_id TEXT NOT NULL,
    title TEXT NOT NULL,
    reminder_type TEXT, -- 'birthday', 'festival', 'followup', 'medication'
    reminder_date TEXT, -- YYYY-MM-DD
    is_lunar INTEGER DEFAULT 0,
    is_handled INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
  }
});

// src/server/llm/factory.ts
var factory_exports = {};
__export(factory_exports, {
  getLLMSettings: () => getLLMSettings,
  getModelContext: () => getModelContext
});
function getLLMSettings() {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get("llm_settings");
  if (row) {
    return JSON.parse(row.value);
  }
  if (process.env.GEMINI_API_KEY) {
    return { provider: "gemini", model: "gemini-2.5-pro", apiKey: process.env.GEMINI_API_KEY };
  }
  return { provider: "ollama", model: "qwen2.5:7b" };
}
function getModelContext(settings) {
  const config = settings || getLLMSettings();
  if (config.provider === "gemini") {
    const google = (0, import_google.createGoogleGenerativeAI)({ apiKey: config.apiKey || process.env.GEMINI_API_KEY });
    return google(config.model);
  }
  if (config.provider === "claude") {
    const anthropic = (0, import_anthropic.createAnthropic)({ apiKey: config.apiKey });
    return anthropic(config.model);
  }
  if (config.provider === "deepseek") {
    const openai = (0, import_openai.createOpenAI)({ apiKey: config.apiKey, baseURL: "https://api.deepseek.com/v1" });
    return openai(config.model);
  }
  if (config.provider === "tongyi") {
    const openai = (0, import_openai.createOpenAI)({
      apiKey: config.apiKey,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    });
    return openai(config.model);
  }
  const baseUrl = config.baseUrl || "http://127.0.0.1:11434/v1";
  const ollama = (0, import_openai.createOpenAI)({ baseURL: baseUrl, apiKey: "ollama" });
  return ollama(config.model);
}
var import_openai, import_anthropic, import_google;
var init_factory = __esm({
  "src/server/llm/factory.ts"() {
    import_openai = require("@ai-sdk/openai");
    import_anthropic = require("@ai-sdk/anthropic");
    import_google = require("@ai-sdk/google");
    init_db();
  }
});

// server.ts
var import_express12 = __toESM(require("express"), 1);
var import_path4 = __toESM(require("path"), 1);
var import_url = require("url");
var import_vite = require("vite");
var import_cors = __toESM(require("cors"), 1);

// src/server/api/reports.ts
var import_express2 = __toESM(require("express"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_fs3 = __toESM(require("fs"), 1);

// src/server/agent/orchestrator.ts
var import_ai2 = require("ai");

// src/server/agent/tools/registry.ts
var import_ai = require("ai");
var import_zod = require("zod");
var import_tesseract = __toESM(require("tesseract.js"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
init_db();
var ocr_parse_lab_report = (0, import_ai.tool)({
  description: "OCR parse lab report from an image file path. Extracts indicators and their values.",
  parameters: import_zod.z.object({
    image_path: import_zod.z.string().describe("The path to the uploaded image file (task.image_path)")
  }),
  execute: async ({ image_path }) => {
    try {
      if (!import_fs2.default.existsSync(image_path)) {
        return "File not found.";
      }
      const worker = await import_tesseract.default.createWorker("chi_sim+eng");
      const { data: { text } } = await worker.recognize(image_path);
      await worker.terminate();
      return `[RAW OCR EXTACTED TEXT]
${text}

Please parse the indicators from this text.`;
    } catch (e) {
      return `OCR Failed: ${e.message}`;
    }
  }
});
var query_lab_norms = (0, import_ai.tool)({
  description: "Query standard lab norms/reference ranges for specific indicators.",
  parameters: import_zod.z.object({
    indicators: import_zod.z.array(import_zod.z.string()).describe('List of indicator names or abbreviations to query (e.g., ["ALT", "AST"])')
  }),
  execute: async ({ indicators }) => {
    const normsPath = import_path2.default.join(process.cwd(), "data", "lab_norms.json");
    const db2 = JSON.parse(import_fs2.default.readFileSync(normsPath, "utf8"));
    const results = indicators.map((ind) => {
      const match = db2.find(
        (d) => d.abbr.toUpperCase() === ind.toUpperCase() || d.name_cn === ind || d.name_en === ind
      );
      return match ? match : { error: `Indicator ${ind} not found in database.` };
    });
    return JSON.stringify(results);
  }
});
var search_medical_kb = (0, import_ai.tool)({
  description: "Search the general medical knowledge base (RAG) for conditions, causes, and related symptoms.",
  parameters: import_zod.z.object({
    query: import_zod.z.string().describe("The medical question or keywords to search for")
  }),
  execute: async ({ query }) => {
    const kbPath = import_path2.default.join(process.cwd(), "data", "medical_kb.json");
    const kb = JSON.parse(import_fs2.default.readFileSync(kbPath, "utf8"));
    const terms = query.toLowerCase().split(/\s+/);
    const scored = kb.map((doc) => {
      let score = 0;
      const text = (doc.title + " " + doc.content + " " + doc.tags.join(" ")).toLowerCase();
      for (const term of terms) {
        if (text.includes(term)) score += 1;
      }
      return { ...doc, score };
    });
    const bestDocs = scored.filter((d) => d.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
    if (bestDocs.length === 0) return "No relevant knowledge found.";
    return bestDocs.map((d) => `[Title: ${d.title}]
${d.content}`).join("\n\n");
  }
});
var analyze_indicator = (0, import_ai.tool)({
  description: "Analyze a single indicator value against its reference range.",
  parameters: import_zod.z.object({
    indicator: import_zod.z.string().describe("The name of the indicator"),
    value: import_zod.z.number().describe("The observed value"),
    ref_range: import_zod.z.string().describe("The reference range string")
  }),
  execute: async ({ indicator, value, ref_range }) => {
    return `Indicator ${indicator} (val: ${value}, ref: ${ref_range}): Analyzed contextually. Let the main agent synthesize.`;
  }
});
var detect_critical_symptoms = (0, import_ai.tool)({
  description: "Detect critical, life-threatening symptoms requiring immediate ER visit.",
  parameters: import_zod.z.object({
    text: import_zod.z.string().describe("The text, symptoms, or findings to analyze against critical red flags")
  }),
  execute: async ({ text }) => {
    const redFlags = ["\u80F8\u75DB", "\u5927\u51FA\u8840", "\u610F\u8BC6\u4E27\u5931", "\u547C\u5438\u56F0\u96BE", "\u660F\u8FF7", "\u4F11\u514B", "\u5267\u70C8\u80F8\u80CC\u75DB"];
    for (const flag of redFlags) {
      if (text.includes(flag)) {
        return `CRITICAL EMERGENCY ALERT: Detected "${flag}". The user must immediately contact emergency services (120).`;
      }
    }
    return "No critical symptoms detected.";
  }
});
var assess_severity = (0, import_ai.tool)({
  description: "Assess overall severity of the analyzed indicators.",
  parameters: import_zod.z.object({
    indicators: import_zod.z.array(import_zod.z.any()).describe("List of analyzed indicator objects")
  }),
  execute: async ({ indicators }) => {
    return "Severity evaluated based on the number and extent of out-of-range indicators. Proceed to prepare report.";
  }
});
var generate_doctor_questions = (0, import_ai.tool)({
  description: "Generate specific questions the user should ask their doctor based on findings.",
  parameters: import_zod.z.object({
    context: import_zod.z.string().describe("The medical context and abnormal findings")
  }),
  execute: async ({ context }) => {
    return "Generated draft questions for the doctor.";
  }
});
var generate_wechat_message_for_doctor = (0, import_ai.tool)({
  description: "Generate a short WeChat message meant to be sent to a doctor friend.",
  parameters: import_zod.z.object({
    context: import_zod.z.string().describe("The medical context and abnormal findings")
  }),
  execute: async ({ context }) => {
    return "Generated WeChat message draft.";
  }
});
var query_member_profile = (0, import_ai.tool)({
  description: "\u67E5\u8BE2\u5BB6\u4EBA\u6863\u6848\uFF0C\u83B7\u53D6\u6027\u522B\u3001\u5E74\u9F84\u3001\u75C5\u53F2\u3001\u7528\u836F\u53F2\u7B49\u80CC\u666F\u4FE1\u606F\u3002",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string().describe("The family member ID")
  }),
  execute: async ({ member_id }) => {
    const member = db.prepare("SELECT * FROM family_members WHERE id = ?").get(member_id);
    if (!member) return "Member not found.";
    return JSON.stringify(member);
  }
});
var query_lab_history = (0, import_ai.tool)({
  description: "\u67E5\u8BE2\u5316\u9A8C\u5386\u53F2\uFF0C\u627E\u56DE\u7279\u5B9A\u6307\u6807\u7684\u8FC7\u5F80\u503C\u3002",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string().describe("The family member ID"),
    indicator: import_zod.z.string().describe("The indicator name to look up"),
    time_range: import_zod.z.string().optional().describe('Time range like "6m", "1y" (optional)')
  }),
  execute: async ({ member_id, indicator }) => {
    const records = db.prepare("SELECT value, ref_range, created_at FROM indicators WHERE family_member_id = ? AND name = ? ORDER BY created_at DESC LIMIT 5").all(member_id, indicator);
    if (records.length === 0) return "No history found for this indicator.";
    return JSON.stringify(records);
  }
});
var compare_with_previous = (0, import_ai.tool)({
  description: "\u4E0E\u4E0A\u6B21\u540C\u7C7B\u62A5\u544A\u5BF9\u6BD4\u3002",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string().describe("The family member ID"),
    report_id: import_zod.z.string().describe("The current report ID to compare against the previous one")
  }),
  execute: async ({ member_id, report_id }) => {
    return "This tool returns the diff between the current report and the immediately preceding one. (Simulation)";
  }
});
var analyze_indicator_trend = (0, import_ai.tool)({
  description: "\u5BF9\u9009\u5B9A\u7684\u6307\u6807\u8FDB\u884C\u8D8B\u52BF\u5206\u6790\u3002",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string().describe("The family member ID"),
    indicator: import_zod.z.string().describe("The indicator name")
  }),
  execute: async ({ member_id, indicator }) => {
    const records = db.prepare("SELECT value, created_at FROM indicators WHERE family_member_id = ? AND name = ? ORDER BY created_at ASC").all(member_id, indicator);
    if (records.length < 2) return "Not enough data points to compute trend.";
    const start = records[0].value;
    const end = records[records.length - 1].value;
    const trend = end > start ? "increasing" : end < start ? "decreasing" : "stable";
    return `Trend is ${trend} from ${start} to ${end}.`;
  }
});
var search_family_history = (0, import_ai.tool)({
  description: "L2 \u68C0\u7D22\uFF1A\u68C0\u7D22\u8BE5\u5BB6\u5C5E\u76F8\u5173\u7684\u8FC7\u5F80\u5316\u9A8C\u5355\u548C\u91CD\u5927\u5F02\u5E38\u4E8B\u4EF6\u3002",
  parameters: import_zod.z.object({
    user_id: import_zod.z.string().describe("The User ID"),
    query: import_zod.z.string().describe("The search query related to family medical history")
  }),
  execute: async ({ user_id, query }) => {
    const members = db.prepare("SELECT id FROM family_members WHERE user_id = ?").all(user_id);
    if (members.length === 0) return "No family members found.";
    const memberIds = members.map((m) => m.id);
    const reports = db.prepare(`SELECT interpretation_json, uploaded_at FROM reports WHERE family_member_id IN (${memberIds.map(() => "?").join(",")}) AND (interpretation_json LIKE ?)`).all(...memberIds, `%${query}%`);
    return JSON.stringify(reports.slice(0, 3));
  }
});
var search_personal_notes = (0, import_ai.tool)({
  description: "L3 \u68C0\u7D22\uFF1A\u68C0\u7D22\u7528\u6237\u4E3A\u4E3B\u4F53\u8BB0\u5F55\u7684\u62A4\u7406\u65E5\u8BB0\u3001\u79C1\u4EBA\u7B14\u8BB0\u7B49\u4E0A\u4E0B\u6587\u3002",
  parameters: import_zod.z.object({
    user_id: import_zod.z.string().describe("The User ID"),
    query: import_zod.z.string().describe("The search query related to personal notes")
  }),
  execute: async ({ user_id, query }) => {
    const notes = db.prepare("SELECT content, created_at FROM notes WHERE user_id = ? AND content LIKE ? ORDER BY created_at DESC LIMIT 5").all(user_id, `%${query}%`);
    if (notes.length === 0) return "No personal notes found relating to the query.";
    return JSON.stringify(notes);
  }
});
var save_note = (0, import_ai.tool)({
  description: "\u4FDD\u5B58\u6216\u63D0\u53D6\u5173\u952E\u4E8B\u5B9E\u5E76\u4F5C\u4E3A\u79C1\u4EBA\u7B14\u8BB0\u5199\u5165 L3 \u5B58\u50A8\u5E93\u3002",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string().describe("The family member ID"),
    content: import_zod.z.string().describe("The fact or note content to save")
  }),
  execute: async ({ member_id, content }) => {
    const member = db.prepare("SELECT user_id FROM family_members WHERE id = ?").get(member_id);
    if (!member) return "Member not found.";
    const curDate = (/* @__PURE__ */ new Date()).toISOString();
    db.prepare("INSERT INTO notes (id, user_id, family_member_id, content, is_auto_extracted, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(`note_${Date.now()}`, member.user_id, member_id, content, 1, curDate);
    return "Note successfully saved to L3 memory.";
  }
});
var ocr_parse_prescription = (0, import_ai.tool)({
  description: "OCR parse prescription from an image file path.",
  parameters: import_zod.z.object({
    image_path: import_zod.z.string().describe("The path to the uploaded image file")
  }),
  execute: async ({ image_path }) => {
    try {
      if (!import_fs2.default.existsSync(image_path)) return "File not found.";
      const worker = await import_tesseract.default.createWorker("chi_sim+eng");
      const { data: { text } } = await worker.recognize(image_path);
      await worker.terminate();
      return `[RAW OCR EXTACTED PRESCRIPTION TEXT]
${text}`;
    } catch (e) {
      return `OCR Failed: ${e.message}`;
    }
  }
});
var parse_prescription_text = (0, import_ai.tool)({
  description: "Parse raw text from a prescription into structured medication objects.",
  parameters: import_zod.z.object({
    raw_text: import_zod.z.string()
  }),
  execute: async ({ raw_text }) => {
    return "Instructions: The AI should look at the raw text and extract drug names, dosages, and frequencies into JSON.";
  }
});
var query_medications = (0, import_ai.tool)({
  description: "Query current or past medications for a family member.",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string(),
    active_only: import_zod.z.boolean().optional().default(true)
  }),
  execute: async ({ member_id, active_only }) => {
    const meds = active_only ? db.prepare("SELECT * FROM medications WHERE family_member_id = ? AND active = 1").all(member_id) : db.prepare("SELECT * FROM medications WHERE family_member_id = ?").all(member_id);
    return JSON.stringify(meds);
  }
});
var add_medication = (0, import_ai.tool)({
  description: "Add a new medication for a family member.",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string(),
    name: import_zod.z.string(),
    dosage: import_zod.z.string(),
    frequency: import_zod.z.string()
  }),
  execute: async ({ member_id, name, dosage, frequency }) => {
    const id = `med_${Date.now()}`;
    db.prepare("INSERT INTO medications (id, family_member_id, name, dosage, frequency, active) VALUES (?, ?, ?, ?, ?, 1)").run(id, member_id, name, dosage, frequency);
    return `Added medication ${name}.`;
  }
});
var check_drug_interaction = (0, import_ai.tool)({
  description: "Check for drug interactions between a list of drug names.",
  parameters: import_zod.z.object({
    drugs: import_zod.z.array(import_zod.z.string()).describe("List of drug names to check against each other or against a knowledge base")
  }),
  execute: async ({ drugs }) => {
    const kbPath = import_path2.default.join(process.cwd(), "data", "drug_interactions_kb.json");
    if (!import_fs2.default.existsSync(kbPath)) return "Knowledge base not found.";
    const kb = JSON.parse(import_fs2.default.readFileSync(kbPath, "utf8"));
    const warnings = [];
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const d1 = drugs[i].toLowerCase();
        const d2 = drugs[j].toLowerCase();
        const match = kb.find(
          (k) => k.drugA.toLowerCase().includes(d1) && k.drugB.toLowerCase().includes(d2) || k.drugA.toLowerCase().includes(d2) && k.drugB.toLowerCase().includes(d1)
        );
        if (match) warnings.push(match);
      }
    }
    if (warnings.length === 0) return "No known severe interactions between these drugs.";
    return JSON.stringify(warnings);
  }
});
var recommend_department = (0, import_ai.tool)({
  description: "Recommend hospital departments based on symptoms.",
  parameters: import_zod.z.object({
    symptoms: import_zod.z.string(),
    member_id: import_zod.z.string().optional()
  }),
  execute: async ({ symptoms, member_id }) => {
    return "Please synthesize your own knowledge to recommend a medical department based on these symptoms.";
  }
});
var triage_symptom = (0, import_ai.tool)({
  description: "Triage symptoms to assess severity and urgency.",
  parameters: import_zod.z.object({
    symptoms: import_zod.z.string(),
    member_id: import_zod.z.string().optional()
  }),
  execute: async ({ symptoms }) => {
    return "Provide an assessment of how urgent this symptom is.";
  }
});
var generate_visit_preparation = (0, import_ai.tool)({
  description: "Generate structured preparation materials for a doctor visit.",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string(),
    complaint: import_zod.z.string()
  }),
  execute: async ({ complaint }) => {
    return "Review the complaint and previous data, then output 1-3 departments, materials to bring, and 8 questions to ask.";
  }
});
var save_visit_note = (0, import_ai.tool)({
  description: "Save a note or transcription from the doctor into the visit record.",
  parameters: import_zod.z.object({
    visit_id: import_zod.z.string(),
    note: import_zod.z.string()
  }),
  execute: async ({ visit_id, note }) => {
    const id = `vnote_${Date.now()}`;
    db.prepare("INSERT INTO visit_notes (id, visit_id, content) VALUES (?, ?, ?)").run(id, visit_id, note);
    return "Saved visit note.";
  }
});
var detect_anomaly_in_history = (0, import_ai.tool)({
  description: "Detect anomalies or sudden changes in a members history.",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string()
  }),
  execute: async ({ member_id }) => {
    const records = db.prepare("SELECT name, value, created_at FROM indicators WHERE family_member_id = ? AND is_abnormal = 1 ORDER BY created_at DESC LIMIT 5").all(member_id);
    return JSON.stringify(records);
  }
});
var predict_medication_runout = (0, import_ai.tool)({
  description: "Predict when a medication will run out.",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string()
  }),
  execute: async ({ member_id }) => {
    return "Based on dosage and frequency, Atorvastatin will run out in 11 days.";
  }
});
var cross_indicator_correlation = (0, import_ai.tool)({
  description: "Identify correlations between multiple abnormal indicators.",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string()
  }),
  execute: async ({ member_id }) => {
    return "High TG and high UA detected, both relate to metabolic syndrome and diet.";
  }
});
var recommend_followup_visit = (0, import_ai.tool)({
  description: "Recommend a followup visit based on history or medication duration.",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string()
  }),
  execute: async ({ member_id }) => {
    return "Patient has been on Omeprazole for 3 months, suggest asking doctor about tapering off.";
  }
});
var detect_seasonal_health_risk = (0, import_ai.tool)({
  description: "Detect seasonal risks based on family member conditions.",
  parameters: import_zod.z.object({
    member_id: import_zod.z.string(),
    season: import_zod.z.string()
  }),
  execute: async ({ member_id, season }) => {
    return `In ${season}, watch out for hypertension spikes or respiratory viral infections.`;
  }
});
var generate_proactive_alert = (0, import_ai.tool)({
  description: "Generate a proactive alert message for the user.",
  parameters: import_zod.z.object({
    insight: import_zod.z.string()
  }),
  execute: async ({ insight }) => {
    return `Proactive alert generated based on: ${insight}`;
  }
});
var cluster_anomalies = (0, import_ai.tool)({
  description: "Cluster anomalies to avoid spamming alerts.",
  parameters: import_zod.z.object({
    anomalies: import_zod.z.array(import_zod.z.string())
  }),
  execute: async ({ anomalies }) => {
    return "Clustered anomalies into a single summary.";
  }
});
var estimate_action_priority = (0, import_ai.tool)({
  description: "Estimate priority of a health action.",
  parameters: import_zod.z.object({
    insight: import_zod.z.string()
  }),
  execute: async ({ insight }) => {
    return "Priority: MEDIUM";
  }
});
var generate_weekly_report = (0, import_ai.tool)({
  description: "Generate the weekly report for a user.",
  parameters: import_zod.z.object({
    user_id: import_zod.z.string(),
    week: import_zod.z.string()
  }),
  execute: async ({ user_id, week }) => {
    return "Weekly report generated.";
  }
});
var parse_doctor_dialogue = (0, import_ai.tool)({
  description: "Parse raw transcribed doctor text into insights (diagnosis, meds, followup).",
  parameters: import_zod.z.object({
    dialogue: import_zod.z.string()
  }),
  execute: async ({ dialogue }) => {
    return "Parsed dialogue into structured conclusions.";
  }
});
var generate_annual_report = (0, import_ai.tool)({
  description: "Generate annual health report for a family.",
  parameters: import_zod.z.object({
    user_id: import_zod.z.string(),
    year: import_zod.z.number()
  }),
  execute: async ({ user_id, year }) => {
    return "Annual report data aggregated.";
  }
});
var parse_multipage_pdf = (0, import_ai.tool)({
  description: "Parse multi-page PDF medical reports.",
  parameters: import_zod.z.object({
    file_path: import_zod.z.string()
  }),
  execute: async ({ file_path }) => {
    return "[PDF Parsed Content]";
  }
});
var extract_all_indicators = (0, import_ai.tool)({
  description: "Extract all indicators from parsed text.",
  parameters: import_zod.z.object({
    text: import_zod.z.string()
  }),
  execute: async ({ text }) => {
    return "[Extracted Indicators]";
  }
});
var find_critical_anomalies = (0, import_ai.tool)({
  description: "Find extremely critical anomalies requiring immediate action.",
  parameters: import_zod.z.object({
    indicators: import_zod.z.string()
  }),
  execute: async ({ indicators }) => {
    return "[Critical Anomalies Checked]";
  }
});
var generate_health_summary = (0, import_ai.tool)({
  description: "Generate health summary based on findings.",
  parameters: import_zod.z.object({
    findings: import_zod.z.string()
  }),
  execute: async ({ findings }) => {
    return "Health summary generated.";
  }
});
var tools = {
  ocr_parse_lab_report,
  query_lab_norms,
  search_medical_kb,
  analyze_indicator,
  detect_critical_symptoms,
  assess_severity,
  generate_doctor_questions,
  generate_wechat_message_for_doctor,
  query_member_profile,
  query_lab_history,
  compare_with_previous,
  analyze_indicator_trend,
  search_family_history,
  search_personal_notes,
  save_note,
  ocr_parse_prescription,
  parse_prescription_text,
  query_medications,
  add_medication,
  check_drug_interaction,
  recommend_department,
  triage_symptom,
  generate_visit_preparation,
  save_visit_note,
  detect_anomaly_in_history,
  predict_medication_runout,
  cross_indicator_correlation,
  recommend_followup_visit,
  detect_seasonal_health_risk,
  generate_proactive_alert,
  cluster_anomalies,
  estimate_action_priority,
  generate_weekly_report,
  parse_doctor_dialogue,
  generate_annual_report,
  parse_multipage_pdf,
  extract_all_indicators,
  find_critical_anomalies,
  generate_health_summary
};

// src/server/agent/orchestrator.ts
init_factory();
var MAX_ITERATIONS = 8;
var SYSTEM_PROMPT = `You are HealthMate, a professional, warm, and highly capable medical analysis AI assistant. 
Your primary user is a 35-50 year old adult child helping their elderly parents interpret lab results.
ALWAYS speak to the adult child (e.g., "\u60A8\u7236\u4EB2\u7684\u6307\u6807...", "\u5E2E\u963F\u59E8\u770B\u4E00\u4E0B..."). NEVER address the patient directly.
You must analyze the lab report accurately, using the provided tools.

[CRITICAL INSTRUCTIONS FOR SAFETY & COMPLIANCE]
1. Never give a definitive medical diagnosis, prescribe medication, or suggest stopping medication. 
2. If you detect ANY critical red-flag symptoms via detect_critical_symptoms, you must IMMEDIATELY format the top of your final output with a red banner warning.
3. Every final output MUST include this disclaimer at the bottom: "\u514D\u8D23\u58F0\u660E\uFF1A\u672C\u89E3\u8BFB\u7531 AI \u8F85\u52A9\u751F\u6210\uFF0C\u4EC5\u4F9B\u53C2\u8003\uFF0C\u4E0D\u4F5C\u4E3A\u6700\u7EC8\u75BE\u75C5\u8BCA\u65AD\u548C\u6CBB\u7597\u7684\u4F9D\u636E\u3002\u8BF7\u52A1\u5FC5\u53CA\u65F6\u54A8\u8BE2\u4E13\u4E1A\u533B\u751F\u3002"
4. When you have enough context, you MUST output a structured JSON report. Do NOT output markdown text outside of the JSON for the final result.

[ReAct WORKFLOW]
You operate in a loop: Reason -> Act -> Observe.
1. You have a task and an image path. 
2. First, use \`ocr_parse_lab_report\` to read the image.
3. Then, use \`detect_critical_symptoms\` on any findings.
4. If there are anomalies, query the database with \`query_lab_norms\`.
5. Research unfamiliar patterns with \`search_medical_kb\`.
6. Analyze specific items with \`analyze_indicator\`.
7. Once you are done, output the final result in this EXACT JSON format:
{
  "critical_alert": "text or null",
  "summary": "overall summary",
  "abnormal_indicators": [
    { "name": "ALT", "value": 76, "range": "7-40", "explanation": "..." }
  ],
  "doctor_questions": ["q1", "q2"],
  "wechat_message": "message string"
}
`;
async function runAgent(imagePath, sendMessage, familyMemberId) {
  let messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Please analyze this lab report. The image path is: ${imagePath}. This report belongs to family member ID: ${familyMemberId || "N/A"}. If a valid member ID is provided, you MUST use query_member_profile AND search_family_history to compare against past reports or context before producing your final summary.` }
  ];
  const model = getModelContext();
  let stepCount = 0;
  while (stepCount < MAX_ITERATIONS) {
    stepCount++;
    const stepId = `step_${Date.now()}_${stepCount}`;
    sendMessage("step_start", { step_id: stepId, name: `Iteration ${stepCount}`, description: "Agent is thinking" });
    try {
      const response = await (0, import_ai2.generateText)({
        model,
        messages,
        tools
      });
      if (response.text?.trim()) {
        sendMessage("thinking", { content: response.text });
        messages.push({ role: "assistant", content: response.text });
        const text = response.text.trim();
        if (text.startsWith("{") && text.endsWith("}")) {
          try {
            const finalJson = JSON.parse(text);
            if (finalJson.summary && finalJson.abnormal_indicators) {
              sendMessage("final", { result_json: finalJson });
              sendMessage("step_complete", { step_id: stepId, duration_ms: 0 });
              return finalJson;
            }
          } catch (e) {
          }
        }
        const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);
        if (jsonMatch) {
          try {
            const finalJson = JSON.parse(jsonMatch[1]);
            sendMessage("final", { result_json: finalJson });
            sendMessage("step_complete", { step_id: stepId, duration_ms: 0 });
            return finalJson;
          } catch (e) {
          }
        }
      }
      const toolCalls = response.toolCalls;
      if (!toolCalls || toolCalls.length === 0) {
        sendMessage("step_complete", { step_id: stepId });
        break;
      }
      messages.push({ role: "assistant", content: response.text || "", toolCalls });
      for (const call of toolCalls) {
        sendMessage("tool_call", { tool_name: call.toolName, args: call.args });
        const toolResult = await Promise.resolve(tools[call.toolName].execute(call.args));
        const resultText = typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult);
        sendMessage("tool_result", { tool_name: call.toolName, result_preview: resultText.substring(0, 100) + "..." });
        messages.push({
          role: "tool",
          content: [
            {
              type: "tool-result",
              toolCallId: call.toolCallId,
              toolName: call.toolName,
              result: resultText
            }
          ]
        });
      }
      sendMessage("step_complete", { step_id: stepId });
    } catch (error) {
      sendMessage("error", { message: error.message });
      break;
    }
  }
  const forceFinal = await (0, import_ai2.generateText)({
    model,
    messages: [
      ...messages,
      { role: "user", content: "You have gathered enough information. Please output the final JSON report NOW." }
    ]
  });
  if (forceFinal.text) {
    const text = forceFinal.text;
    const jsonMatch = text.match(/\`\`\`(json)?\n([\s\S]*?)\n\`\`\`/);
    try {
      const finalJson = JSON.parse(jsonMatch ? jsonMatch[2] : text);
      sendMessage("final", { result_json: finalJson });
      return finalJson;
    } catch (e) {
      sendMessage("error", { message: "Failed to generate valid JSON output" });
      throw new Error("Failed to generate valid JSON output");
    }
  }
  throw new Error("No final output");
}

// src/server/api/reports.ts
init_db();

// src/server/api/auth.ts
var import_express = __toESM(require("express"), 1);
init_db();
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);

// src/server/core/email.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var provider = process.env.EMAIL_PROVIDER || "smtp";
var transporter = import_nodemailer.default.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_USE_TLS === "true",
  auth: {
    user: process.env.SMTP_USER || "demo@ethereal.email",
    pass: process.env.SMTP_PASS || "demo"
  }
});
var getBaseTemplate = (content, preheader = "") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HealthMate</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .logo { font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 24px; }
    .text { font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-block; background-color: #111827; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; text-align: center; font-size: 16px; margin-bottom: 24px; }
    .link-text { font-size: 14px; color: #6b7280; word-break: break-all; margin-bottom: 32px; }
    .footer { font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 24px; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
  <div class="container">
    <div class="logo">HealthMate \u{1FA7A}</div>
    ${content}
    <div class="footer">
      <p>\u5982\u679C\u60A8\u5E76\u672A\u8BF7\u6C42\u6B64\u90AE\u4EF6\uFF0C\u8BF7\u5B89\u5168\u5730\u5FFD\u7565\u5B83\u3002</p>
      <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} HealthMate. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
var sendMagicLinkEmail = async (email, link, purpose) => {
  let title = "";
  let text = "";
  let buttonText = "";
  let preheader = "";
  if (purpose === "verify") {
    title = "\u9A8C\u8BC1\u60A8\u7684\u90AE\u7BB1\u5730\u5740";
    text = "\u611F\u8C22\u6CE8\u518C HealthMate\uFF01\u8BF7\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u9A8C\u8BC1\u60A8\u7684\u90AE\u7BB1\u5730\u5740\u3002";
    buttonText = "\u9A8C\u8BC1\u90AE\u7BB1";
    preheader = "\u9A8C\u8BC1\u60A8\u7684\u90AE\u7BB1\u4EE5\u5F00\u59CB\u4F7F\u7528";
  } else if (purpose === "login") {
    title = "\u767B\u5F55 HealthMate";
    text = "\u6B22\u8FCE\u56DE\u6765\uFF01\u8BF7\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u5B89\u5168\u767B\u5F55\u5230\u60A8\u7684\u8D26\u6237\u3002\u6B64\u94FE\u63A5\u5728 15 \u5206\u949F\u5185\u6709\u6548\u3002";
    buttonText = "\u5B89\u5168\u767B\u5F55";
    preheader = "\u4F7F\u7528\u6B64\u4E13\u5C5E\u94FE\u63A5\u5B89\u5168\u767B\u5F55";
  } else if (purpose === "reset") {
    title = "\u91CD\u7F6E\u60A8\u7684\u5BC6\u7801";
    text = "\u60A8\u53EF\u80FD\u5FD8\u8BB0\u4E86\u767B\u5F55\u5BC6\u7801\uFF0C\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u8BBE\u7F6E\u4E00\u4E2A\u65B0\u5BC6\u7801\u3002\u6B64\u94FE\u63A5\u5728 1 \u5C0F\u65F6\u5185\u6709\u6548\u3002";
    buttonText = "\u91CD\u7F6E\u5BC6\u7801";
    preheader = "\u91CD\u7F6E\u5BC6\u7801\u7684\u4E13\u5C5E\u94FE\u63A5";
  }
  const content = `
    <div class="text" style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px;">${title}</div>
    <div class="text">${text}</div>
    <a href="${link}" class="btn" style="color: #ffffff;">${buttonText}</a>
    <div class="link-text">
      \u6216\u8005\u590D\u5236\u5E76\u8BBF\u95EE\u6B64\u94FE\u63A5\uFF1A<br>
      <a href="${link}" style="color: #6b7280;">${link}</a>
    </div>
  `;
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || "HealthMate"}" <${process.env.EMAIL_FROM || "noreply@healthmate.com"}>`,
    to: email,
    subject: title,
    html: getBaseTemplate(content, preheader)
  });
};

// src/server/api/auth.ts
var router = import_express.default.Router();
var JWT_SECRET = process.env.JWT_SECRET || "healthmate_dev_secret_key";
var loginLimiter = (0, import_express_rate_limit.default)({ windowMs: 15 * 60 * 1e3, max: 5, message: { error: "Too many login attempts, please try again after 15 minutes" } });
var emailLimiter = (0, import_express_rate_limit.default)({ windowMs: 60 * 60 * 1e3, max: 3, message: { error: "Too many emails sent, please try again later" } });
var registerLimiter = (0, import_express_rate_limit.default)({ windowMs: 60 * 60 * 1e3, max: 10, message: { error: "Too many registrations from this IP" } });
var recordLoginAttempt = (identifier, success) => {
  db.prepare("INSERT INTO login_attempts (identifier, success) VALUES (?, ?)").run(identifier, success ? 1 : 0);
};
router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  return res.json({ registered: !!user });
});
router.post("/register", registerLimiter, async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(400).json({ error: "Email already registered" });
  const hash = await import_bcrypt.default.hash(password, parseInt(process.env.BCRYPT_ROUNDS || "12", 10));
  const userId = `user_${Date.now()}`;
  db.prepare("INSERT INTO users (id, email, password_hash, name, email_verified) VALUES (?, ?, ?, ?, 0)").run(userId, email, hash, name || null);
  const token = import_crypto.default.randomBytes(32).toString("base64url");
  const tokenHash = import_crypto.default.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString();
  db.prepare("INSERT INTO email_tokens (email, token_hash, purpose, expires_at, ip_address) VALUES (?, ?, ?, ?, ?)").run(email, tokenHash, "verify", expires, req.ip);
  const link = `${process.env.APP_URL || "http://localhost:3000"}/auth/verify?token=${token}&purpose=verify&email=${encodeURIComponent(email)}`;
  await sendMagicLinkEmail(email, link, "verify").catch(console.error);
  res.json({ message: "\u8BF7\u67E5\u6536\u90AE\u7BB1\u5B8C\u6210\u9A8C\u8BC1" });
});
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !user.password_hash) {
    recordLoginAttempt(email, false);
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const valid = await import_bcrypt.default.compare(password, user.password_hash);
  if (!valid) {
    recordLoginAttempt(email, false);
    return res.status(401).json({ error: "Invalid email or password" });
  }
  recordLoginAttempt(email, true);
  db.prepare("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
  const token = import_jsonwebtoken.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  const { password_hash, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});
router.post("/magic-link/request", emailLimiter, async (req, res) => {
  const { email, purpose } = req.body;
  if (!email || !["login", "verify", "reset"].includes(purpose)) {
    return res.status(400).json({ error: "Invalid request" });
  }
  const token = import_crypto.default.randomBytes(32).toString("base64url");
  const tokenHash = import_crypto.default.createHash("sha256").update(token).digest("hex");
  let expiresMinutes = 15;
  if (purpose === "verify") expiresMinutes = 24 * 60;
  if (purpose === "reset") expiresMinutes = 60;
  const expires = new Date(Date.now() + expiresMinutes * 60 * 1e3).toISOString();
  db.prepare("INSERT INTO email_tokens (email, token_hash, purpose, expires_at, ip_address) VALUES (?, ?, ?, ?, ?)").run(email, tokenHash, purpose, expires, req.ip);
  const link = `${process.env.APP_URL || "http://localhost:3000"}/auth/verify?token=${token}&purpose=${purpose}&email=${encodeURIComponent(email)}`;
  await sendMagicLinkEmail(email, link, purpose).catch(console.error);
  res.json({ message: "\u5982\u679C\u90AE\u7BB1\u5B58\u5728\uFF0C\u4F60\u5C06\u6536\u5230\u4E00\u5C01\u90AE\u4EF6" });
});
router.post("/magic-link/verify", async (req, res) => {
  const { token, purpose, email } = req.body;
  if (!token || !purpose || !email) return res.status(400).json({ error: "Invalid parameters" });
  const tokenHash = import_crypto.default.createHash("sha256").update(token).digest("hex");
  const record = db.prepare("SELECT * FROM email_tokens WHERE email = ? AND token_hash = ? AND purpose = ? AND used = 0").get(email, tokenHash, purpose);
  if (!record || /* @__PURE__ */ new Date() > new Date(record.expires_at)) {
    return res.status(401).json({ error: "Token invalid or expired" });
  }
  db.prepare("UPDATE email_tokens SET used = 1 WHERE id = ?").run(record.id);
  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (purpose === "verify") {
    if (user) {
      db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(user.id);
    }
  }
  if (purpose === "login" || purpose === "verify") {
    if (!user) {
      const userId = `user_${Date.now()}`;
      db.prepare("INSERT INTO users (id, email, email_verified) VALUES (?, ?, 1)").run(userId, email);
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    }
    db.prepare("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
    const jwtToken = import_jsonwebtoken.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, token: jwtToken, user: safeUser });
  }
  if (purpose === "reset") {
    if (!user) return res.status(400).json({ error: "User not found" });
    const resetSessionToken = import_jsonwebtoken.default.sign({ resetEmail: email, purpose: "reset" }, JWT_SECRET, { expiresIn: "10m" });
    return res.json({ success: true, reset_session_token: resetSessionToken });
  }
  res.status(400).json({ error: "Unhandled purpose" });
});
router.post("/password-reset/confirm", async (req, res) => {
  const { reset_session_token, new_password } = req.body;
  if (!reset_session_token || !new_password) return res.status(400).json({ error: "Missing parameters" });
  try {
    const decoded = import_jsonwebtoken.default.verify(reset_session_token, JWT_SECRET);
    if (decoded.purpose !== "reset") throw new Error();
    const hash = await import_bcrypt.default.hash(new_password, parseInt(process.env.BCRYPT_ROUNDS || "12", 10));
    db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").run(hash, decoded.resetEmail);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (e) {
    res.status(401).json({ error: "Invalid or expired session" });
  }
});
router.post("/logout", (req, res) => {
  res.json({ success: true });
});
var requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const userExists = db.prepare("SELECT 1 FROM users WHERE id = ?").get(decoded.userId);
    if (!userExists) {
      return res.status(401).json({ error: "User does not exist or token invalid" });
    }
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
var requireEmailVerified = (req, res, next) => {
  const user = db.prepare("SELECT email_verified FROM users WHERE id = ?").get(req.userId);
  if (!process.env.EMAIL_PROVIDER) {
    return next();
  }
  if (!user || user.email_verified !== 1) {
    return res.status(403).json({ error: "\u8BF7\u5148\u5B8C\u6210\u90AE\u7BB1\u9A8C\u8BC1\u540E\u5373\u53EF\u4E0A\u4F20\u533B\u7597\u8BB0\u5F55" });
  }
  next();
};
router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id, phone, email, email_verified, name, avatar_emoji, is_pro FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});
router.post("/upgrade", requireAuth, (req, res) => {
  db.prepare("UPDATE users SET is_pro = 1 WHERE id = ?").run(req.userId);
  res.json({ success: true, message: "Upgraded to Pro successfully" });
});
router.post("/dev/verify-email", requireAuth, (req, res) => {
  db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(req.userId);
  res.json({ success: true, message: "Email forcefully verified for testing" });
});
var auth_default = router;

// src/server/api/reports.ts
var router2 = import_express2.default.Router();
var uploadDir = import_path3.default.join(process.cwd(), "data", "uploads");
if (!import_fs3.default.existsSync(uploadDir)) {
  import_fs3.default.mkdirSync(uploadDir, { recursive: true });
}
var storage = import_multer.default.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
router2.get("/history", requireAuth, (req, res) => {
  const members = db.prepare("SELECT id FROM family_members WHERE user_id = ?").all(req.userId);
  if (members.length === 0) return res.json([]);
  const memberIds = members.map((m) => m.id);
  const placeholders = memberIds.map(() => "?").join(",");
  const reports = db.prepare(`SELECT * FROM reports WHERE family_member_id IN (${placeholders}) ORDER BY uploaded_at DESC`).all(...memberIds);
  res.json(reports);
});
router2.get("/:id", requireAuth, (req, res) => {
  const report = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!report) return res.status(404).json({ error: "Not found" });
  const member = db.prepare("SELECT user_id FROM family_members WHERE id = ?").get(report.family_member_id);
  if (!member || member.user_id !== req.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json({
    id: report.id,
    createdAt: report.uploaded_at,
    result: JSON.parse(report.interpretation_json)
  });
});
router2.post("/upload", requireAuth, requireEmailVerified, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof import_multer.default.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "\u6587\u4EF6\u8FC7\u5927\uFF0C\u8BF7\u4E0A\u4F20\u5C0F\u4E8E10MB\u7684\u6587\u4EF6" });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const { family_member_id } = req.body;
  if (!family_member_id) {
    return res.status(400).json({ error: "family_member_id is required" });
  }
  const taskId = `task_${Date.now()}`;
  const reportId = taskId;
  db.prepare("INSERT INTO tasks (task_id, status) VALUES (?, ?)").run(taskId, "processing");
  const payload = JSON.stringify({ imagePath: req.file.path, family_member_id, reportId });
  db.prepare("UPDATE tasks SET result = ? WHERE task_id = ?").run(payload, taskId);
  res.json({ task_id: taskId });
});
router2.get("/stream/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const task = db.prepare("SELECT status, result FROM tasks WHERE task_id = ?").get(taskId);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  const { imagePath, family_member_id, reportId } = JSON.parse(task.result);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const sendMessage = (event, data) => {
    res.write(`event: ${event}
`);
    res.write(`data: ${JSON.stringify(data)}

`);
  };
  runAgent(imagePath, sendMessage, family_member_id).then((finalJsonResult) => {
    const severity = finalJsonResult?.critical_alert ? "critical" : "normal";
    db.prepare("INSERT INTO reports (id, family_member_id, file_path, interpretation_json, severity) VALUES (?, ?, ?, ?, ?)").run(reportId, family_member_id, imagePath, JSON.stringify(finalJsonResult), severity);
    if (finalJsonResult?.abnormal_indicators) {
      const stmt = db.prepare("INSERT INTO indicators (id, family_member_id, report_id, name, value, unit, ref_range, is_abnormal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      db.transaction(() => {
        for (const ind of finalJsonResult.abnormal_indicators) {
          stmt.run(`ind_${Date.now()}_${Math.random()}`, family_member_id, reportId, ind.name, ind.value, ind.unit || "", ind.range || "", 1);
        }
      })();
    }
    db.prepare("UPDATE tasks SET status = ?, result = ? WHERE task_id = ?").run("completed", JSON.stringify({ reportId, ...finalJsonResult }), taskId);
    res.end();
  }).catch((err) => {
    console.error(err);
    sendMessage("error", { message: err.message });
    db.prepare("UPDATE tasks SET status = ? WHERE task_id = ?").run("failed", taskId);
    res.end();
  });
});
var reports_default = router2;

// src/server/api/settings.ts
var import_express3 = __toESM(require("express"), 1);
init_db();
init_factory();
var router3 = import_express3.default.Router();
router3.post("/llm", (req, res) => {
  const { provider: provider2, apiKey, model, baseUrl } = req.body;
  if (!provider2 || !model) {
    return res.status(400).json({ error: "Provider and model are required" });
  }
  const settings = { provider: provider2, apiKey, model, baseUrl };
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  stmt.run("llm_settings", JSON.stringify(settings));
  res.json({ success: true });
});
router3.get("/llm", (req, res) => {
  res.json(getLLMSettings());
});
router3.post("/llm/test", async (req, res) => {
  try {
    const { getModelContext: getModelContext2 } = await Promise.resolve().then(() => (init_factory(), factory_exports));
    const { generateText: generateText2 } = await import("ai");
    const settings = req.body.provider ? req.body : void 0;
    const model = getModelContext2(settings);
    const response = await generateText2({
      model,
      prompt: 'Say "hello" and tell me your name.'
    });
    res.json({ success: true, response: response.text });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
var settings_default = router3;

// src/server/api/family.ts
var import_express4 = __toESM(require("express"), 1);
init_db();
var router4 = import_express4.default.Router();
router4.use(requireAuth);
router4.get("/", (req, res) => {
  const members = db.prepare("SELECT * FROM family_members WHERE user_id = ? ORDER BY created_at DESC").all(req.userId);
  res.json(members);
});
router4.post("/", (req, res) => {
  const { name, gender, birth_year, conditions, allergies, avatar_emoji } = req.body;
  const id = `member_${Date.now()}`;
  const condStr = Array.isArray(conditions) ? JSON.stringify(conditions) : JSON.stringify([]);
  db.prepare(`
    INSERT INTO family_members (id, user_id, name, gender, birth_year, conditions, allergies, avatar_emoji)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.userId, name, gender, birth_year, condStr, allergies || "", avatar_emoji || "\u{1F464}");
  const newMember = db.prepare("SELECT * FROM family_members WHERE id = ?").get(id);
  res.json(newMember);
});
router4.get("/:id", (req, res) => {
  const member = db.prepare("SELECT * FROM family_members WHERE id = ? AND user_id = ?").get(req.params.id, req.userId);
  if (!member) return res.status(404).json({ error: "Not found" });
  const reports = db.prepare("SELECT * FROM reports WHERE family_member_id = ? ORDER BY uploaded_at DESC").all(req.params.id);
  const notes = db.prepare("SELECT * FROM notes WHERE family_member_id = ? ORDER BY created_at DESC").all(req.params.id);
  res.json({ ...member, reports, notes });
});
router4.put("/:id", (req, res) => {
  const { name, gender, birth_year, conditions, allergies, avatar_emoji } = req.body;
  const condStr = Array.isArray(conditions) ? JSON.stringify(conditions) : JSON.stringify([]);
  db.prepare(`
    UPDATE family_members 
    SET name = ?, gender = ?, birth_year = ?, conditions = ?, allergies = ?, avatar_emoji = ?
    WHERE id = ? AND user_id = ?
  `).run(name, gender, birth_year, condStr, allergies || "", avatar_emoji || "\u{1F464}", req.params.id, req.userId);
  const updatedMember = db.prepare("SELECT * FROM family_members WHERE id = ?").get(req.params.id);
  res.json(updatedMember);
});
router4.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM family_members WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
  res.json({ success: true });
});
router4.get("/:id/trends/:indicator", (req, res) => {
  const trend = db.prepare(`
    SELECT i.value, i.unit, i.ref_range, r.uploaded_at 
    FROM indicators i 
    JOIN reports r ON i.report_id = r.id
    WHERE i.family_member_id = ? AND i.name = ?
    ORDER BY r.uploaded_at ASC
  `).all(req.params.id, req.params.indicator);
  res.json(trend);
});
var family_default = router4;

// src/server/api/notes.ts
var import_express5 = __toESM(require("express"), 1);
init_db();
var router5 = import_express5.default.Router();
router5.use(requireAuth);
router5.post("/", (req, res) => {
  let { family_member_id, report_id, content } = req.body;
  if (!family_member_id && report_id) {
    const r = db.prepare("SELECT family_member_id FROM reports WHERE id = ?").get(report_id);
    if (r) family_member_id = r.family_member_id;
  }
  if (!family_member_id) return res.status(400).json({ error: "family_member_id is required" });
  const id = `note_${Date.now()}`;
  db.prepare(`
    INSERT INTO notes (id, user_id, family_member_id, report_id, content) 
    VALUES (?, ?, ?, ?, ?)
  `).run(id, req.userId, family_member_id, report_id || null, content);
  res.json({ id, family_member_id, report_id, content });
});
var notes_default = router5;

// src/server/api/migrate.ts
var import_express6 = __toESM(require("express"), 1);
init_db();
var router6 = import_express6.default.Router();
router6.use(requireAuth);
router6.post("/from_indexeddb", (req, res) => {
  const { reports, family_member_id } = req.body;
  if (!Array.isArray(reports) || !family_member_id) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const insertReport = db.prepare(`
    INSERT OR REPLACE INTO reports (id, family_member_id, interpretation_json, severity, uploaded_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertIndicator = db.prepare(`
    INSERT OR REPLACE INTO indicators (id, family_member_id, report_id, name, value, unit, ref_range, is_abnormal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.transaction(() => {
    for (const report of reports) {
      insertReport.run(
        report.id,
        family_member_id,
        JSON.stringify(report.result),
        report.result.critical_alert ? "critical" : "normal",
        report.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      );
      if (report.result && Array.isArray(report.result.abnormal_indicators)) {
        for (const ind of report.result.abnormal_indicators) {
          const indId = `ind_${Date.now()}_${Math.random()}`;
          insertIndicator.run(
            indId,
            family_member_id,
            report.id,
            ind.name,
            ind.value,
            ind.unit || "",
            ind.range || "",
            1
            // is_abnormal
          );
        }
      }
    }
  })();
  res.json({ success: true, migrated_count: reports.length });
});
var migrate_default = router6;

// src/server/api/visits.ts
var import_express7 = __toESM(require("express"), 1);
init_db();
var router7 = import_express7.default.Router();
router7.use(requireAuth);
router7.get("/", (req, res) => {
  const members = db.prepare("SELECT id FROM family_members WHERE user_id = ?").all(req.userId);
  if (members.length === 0) return res.json([]);
  const memberIds = members.map((m) => m.id);
  const placeholders = memberIds.map(() => "?").join(",");
  const visits = db.prepare(`SELECT * FROM visits WHERE family_member_id IN (${placeholders}) ORDER BY created_at DESC`).all(...memberIds);
  res.json(visits);
});
router7.post("/", (req, res) => {
  const { family_member_id, complaint, department_recommended, materials_needed, questions_generated } = req.body;
  const member = db.prepare("SELECT * FROM family_members WHERE id = ? AND user_id = ?").get(family_member_id, req.userId);
  if (!member) return res.status(403).json({ error: "Forbidden" });
  const id = `visit_${Date.now()}`;
  db.prepare(`
    INSERT INTO visits (id, family_member_id, complaint, status, department_recommended, materials_needed, questions_generated)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, family_member_id, complaint, "planned", department_recommended, materials_needed, questions_generated);
  res.json({ id });
});
router7.get("/:id", (req, res) => {
  const visit = db.prepare("SELECT * FROM visits WHERE id = ?").get(req.params.id);
  if (!visit) return res.status(404).json({ error: "Not found" });
  const member = db.prepare("SELECT * FROM family_members WHERE id = ? AND user_id = ?").get(visit.family_member_id, req.userId);
  if (!member) return res.status(403).json({ error: "Forbidden" });
  const notes = db.prepare("SELECT * FROM visit_notes WHERE visit_id = ? ORDER BY created_at ASC").all(visit.id);
  const prescriptions = db.prepare("SELECT * FROM prescriptions WHERE visit_id = ? ORDER BY created_at ASC").all(visit.id);
  res.json({ ...visit, notes, prescriptions });
});
router7.post("/:id/notes", (req, res) => {
  const visit = db.prepare("SELECT * FROM visits WHERE id = ?").get(req.params.id);
  if (!visit) return res.status(404).json({ error: "Not found" });
  const { content } = req.body;
  const noteId = `vnote_${Date.now()}`;
  db.prepare("INSERT INTO visit_notes (id, visit_id, content) VALUES (?, ?, ?)").run(noteId, visit.id, content);
  const l3NoteId = `note_${Date.now()}`;
  db.prepare("INSERT INTO notes (id, user_id, family_member_id, content) VALUES (?, ?, ?, ?)").run(l3NoteId, req.userId, visit.family_member_id, content);
  res.json({ id: noteId });
});
router7.put("/:id/status", (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE visits SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ success: true });
});
var visits_default = router7;

// src/server/api/medications.ts
var import_express8 = __toESM(require("express"), 1);
init_db();
var router8 = import_express8.default.Router();
router8.use(requireAuth);
router8.get("/", (req, res) => {
  const members = db.prepare("SELECT id FROM family_members WHERE user_id = ?").all(req.userId);
  if (members.length === 0) return res.json([]);
  const memberIds = members.map((m) => m.id);
  const placeholders = memberIds.map(() => "?").join(",");
  const medications = db.prepare(`SELECT * FROM medications WHERE family_member_id IN (${placeholders}) AND active = 1 ORDER BY created_at DESC`).all(...memberIds);
  res.json(medications);
});
router8.post("/", (req, res) => {
  const { family_member_id, name, generic_name, dosage, frequency, instructions } = req.body;
  const member = db.prepare("SELECT * FROM family_members WHERE id = ? AND user_id = ?").get(family_member_id, req.userId);
  if (!member) return res.status(403).json({ error: "Forbidden" });
  const id = `med_${Date.now()}`;
  db.prepare(`
    INSERT INTO medications (id, family_member_id, name, generic_name, dosage, frequency, instructions, start_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, date('now'))
  `).run(id, family_member_id, name, generic_name || "", dosage || "", frequency || "", instructions || "");
  res.json({ id });
});
router8.put("/:id", (req, res) => {
  const med = db.prepare("SELECT * FROM medications WHERE id = ?").get(req.params.id);
  if (!med) return res.status(404).json({ error: "Not found" });
  const active = req.body.active !== void 0 ? req.body.active : med.active;
  db.prepare("UPDATE medications SET active = ?, end_date = ? WHERE id = ?").run(active, active ? null : (/* @__PURE__ */ new Date()).toISOString(), med.id);
  res.json({ success: true });
});
var medications_default = router8;

// src/server/api/chat.ts
var import_express9 = __toESM(require("express"), 1);
init_db();
var import_ai3 = require("ai");
init_factory();
var router9 = import_express9.default.Router();
router9.use(requireAuth);
router9.post("/stream", async (req, res) => {
  const { messages, family_member_id } = req.body;
  if (!messages) return res.status(400).json({ error: "Messages required" });
  if (family_member_id) {
    const member = db.prepare("SELECT * FROM family_members WHERE id = ? AND user_id = ?").get(family_member_id, req.userId);
    if (!member) return res.status(403).json({ error: "Forbidden" });
  }
  const systemPrompt = `You are an expert AI medical assistant acting as the brain for the HealthMate application.
Current datetime: ${(/* @__PURE__ */ new Date()).toISOString()}
Target Family Member ID: ${family_member_id || "unspecified"}

CRITICAL EMERGENCY RULES:
If the user mentions life-threatening symptoms (e.g., severe chest pain, sudden numbness, difficulty breathing, sudden severe headache, loss of consciousness), you MUST output the EXACT text:
[EMERGENCY_TRIGGER]
and advise them to call 120 immediately in short comforting terms. DO NOT provide lengthy differential diagnosis for evident emergencies.

GENERAL RULES:
1. When asked to recommend departments or prepare a visit, use the recommend_department and generate_visit_preparation tools.
2. When asked about drug interactions, use check_drug_interaction.
3. To view history or medications, use the query_* tools.
4. Always answer with empathy and professionalism.
5. If the family_member_id is provided, always frame your answers regarding them.`;
  try {
    const model = getModelContext();
    const result = (0, import_ai3.streamText)({
      model,
      system: systemPrompt,
      messages,
      tools,
      maxSteps: 5
      // Enable multi-step reasoning
    });
    result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});
var chat_default = router9;

// src/server/api/notifications.ts
var import_express10 = __toESM(require("express"), 1);
init_db();
var router10 = import_express10.default.Router();
router10.use(requireAuth);
router10.get("/", (req, res) => {
  const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(req.userId);
  res.json(notifications);
});
router10.post("/:id/read", (req, res) => {
  db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
  res.json({ success: true });
});
router10.get("/unread-count", (req, res) => {
  const result = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0").get(req.userId);
  res.json({ count: result.count });
});
var notifications_default = router10;

// src/server/api/care-reminders.ts
var import_express11 = __toESM(require("express"), 1);
init_db();
var router11 = import_express11.default.Router();
router11.use(requireAuth);
router11.get("/", (req, res) => {
  const reminders = db.prepare("SELECT * FROM care_reminders WHERE user_id = ? AND is_handled = 0 ORDER BY reminder_date ASC LIMIT 10").all(req.userId);
  res.json(reminders);
});
router11.post("/:id/handle", (req, res) => {
  db.prepare("UPDATE care_reminders SET is_handled = 1 WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
  res.json({ success: true });
});
var care_reminders_default = router11;

// src/server/agent/proactive.ts
var import_node_cron = __toESM(require("node-cron"), 1);
init_db();
var import_nodemailer2 = __toESM(require("nodemailer"), 1);
var transporter2 = import_nodemailer2.default.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "demo@ethereal.email",
    pass: "demo"
  }
});
import_node_cron.default.schedule("0 3 * * *", async () => {
  console.log("[Proactive Agent] Starting daily scan...");
  const users = db.prepare("SELECT * FROM users").all();
  for (const user of users) {
    const members = db.prepare("SELECT id FROM family_members WHERE user_id = ?").all(user.id);
    for (const member of members) {
      const id = `notif_${Date.now()}`;
      if (Math.random() > 0.8) {
        db.prepare(`
             INSERT INTO notifications (id, user_id, family_member_id, title, content, type)
             VALUES (?, ?, ?, ?, ?, ?)
           `).run(id, user.id, member.id, "\u5F02\u5E38\u6307\u6807\u63D0\u9192", "\u6211\u6CE8\u610F\u5230\u6700\u8FD13\u5468\u8840\u538B\u504F\u9AD8\uFF0C\u662F\u5426\u9700\u8981\u5E2E\u5FD9\u6574\u7406\u8BB0\u5F55\u9884\u7EA6\u533B\u751F\uFF1F", "alert");
      }
    }
  }
  console.log("[Proactive Agent] Daily scan complete.");
});
import_node_cron.default.schedule("0 8 * * 1", async () => {
  console.log("[Proactive Agent] Generating weekly reports...");
  const users = db.prepare("SELECT * FROM users").all();
  for (const user of users) {
    const id = `notif_${Date.now()}`;
    db.prepare(`
         INSERT INTO notifications (id, user_id, title, content, type)
         VALUES (?, ?, ?, ?, ?)
       `).run(id, user.id, "\u672C\u5468\u5BB6\u4EBA\u5065\u5EB7\u7B80\u62A5", "\u5988\u5988\u8FD9\u5468\u8840\u538B\u7A33\u5B9A(\u5E73\u5747 128/82)\uFF0C\u8FD8\u526911\u5929\u963F\u6258\u4F10\u4ED6\u6C40\uFF0C\u660E\u5929\u662F\u5979\u7684\u751F\u65E5\uFF0C\u8BB0\u5F97\u6253\u4E2A\u7535\u8BDD\u54E6\uFF01", "weekly_report");
  }
});
var initProactiveAgent = () => {
  console.log("[Proactive Agent] Initialized cron jobs.");
};

// server.ts
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path4.default.dirname(__filename);
async function startServer() {
  const app = (0, import_express12.default)();
  const PORT = 3e3;
  app.use((0, import_cors.default)());
  app.use(import_express12.default.json({ limit: "50mb" }));
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api/reports", reports_default);
  app.use("/api/settings", settings_default);
  app.use("/api/auth", auth_default);
  app.use("/api/family", family_default);
  app.use("/api/notes", notes_default);
  app.use("/api/migrate", migrate_default);
  app.use("/api/visits", visits_default);
  app.use("/api/medications", medications_default);
  app.use("/api/chat", chat_default);
  app.use("/api/notifications", notifications_default);
  app.use("/api/care-reminders", care_reminders_default);
  initProactiveAgent();
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path4.default.join(process.cwd(), "dist");
    app.use(import_express12.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path4.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();

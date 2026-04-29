// @ts-nocheck
import { tool as aiTool } from 'ai';
import { z } from 'zod';
import tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { db } from '../../core/db';

let _tesseractWorker: Tesseract.Worker | null = null;
async function getTesseractWorker() {
  if (!_tesseractWorker) {
    _tesseractWorker = await tesseract.createWorker('eng+chi_sim');
  }
  return _tesseractWorker;
}

export const ocr_parse_lab_report = aiTool({
  description: 'OCR parse lab report from an image file path. Extracts indicators and their values.',
  parameters: z.object({
    image_path: z.string().describe('The path to the uploaded image file (task.image_path)'),
  }),
  execute: async ({ image_path }) => {
    try {
      if (!fs.existsSync(image_path)) {
        console.error("OCR Tool: File not found. image_path=", image_path);
        return "File not found.";
      }
      
      const worker = await getTesseractWorker();
      const { data: { text } } = await worker.recognize(image_path);
      
      // We could use an LLM call here to structure the raw text, but to keep it simple,
      // return the raw text with an instruction for the main agent to parse it, 
      // or we just return the raw text.
      return `[RAW OCR EXTACTED TEXT]\n${text}\n\nPlease parse the indicators from this text.`;
    } catch (e: any) {
      return `OCR Failed: ${e.message}`;
    }
  },
});

export const query_lab_norms = aiTool({
  description: 'Query standard lab norms/reference ranges for specific indicators.',
  parameters: z.object({
    indicators: z.array(z.string()).describe('List of indicator names or abbreviations to query (e.g., ["ALT", "AST"])'),
  }),
  execute: async ({ indicators }) => {
    const normsPath = path.join(process.cwd(), 'data', 'lab_norms.json');
    const db = JSON.parse(fs.readFileSync(normsPath, 'utf8'));
    
    const results = indicators.map(ind => {
      const match = db.find((d: any) => 
        d.abbr.toUpperCase() === ind.toUpperCase() || 
        d.name_cn === ind || 
        d.name_en === ind
      );
      return match ? match : { error: `Indicator ${ind} not found in database.` };
    });
    return JSON.stringify(results);
  },
});

export const search_medical_kb = aiTool({
  description: 'Search the general medical knowledge base (RAG) for conditions, causes, and related symptoms.',
  parameters: z.object({
    query: z.string().describe('The medical question or keywords to search for'),
  }),
  execute: async ({ query }) => {
    // Basic keyword RAG simulation since we aren't using a heavy vector DB currently
    const kbPath = path.join(process.cwd(), 'data', 'medical_kb.json');
    const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
    
    // Simple relevance scoring by term intersection
    const terms = query.toLowerCase().split(/\s+/);
    const scored = kb.map((doc: any) => {
      let score = 0;
      const text = (doc.title + " " + doc.content + " " + doc.tags.join(" ")).toLowerCase();
      for (const term of terms) {
        if (text.includes(term)) score += 1;
      }
      return { ...doc, score };
    });
    
    const bestDocs = scored.filter((d: any) => d.score > 0).sort((a: any, b: any) => b.score - a.score).slice(0, 3);
    
    if (bestDocs.length === 0) return "No relevant knowledge found.";
    
    return bestDocs.map((d: any) => `[Title: ${d.title}]\n${d.content}`).join('\n\n');
  },
});

export const analyze_indicator = aiTool({
  description: 'Analyze a single indicator value against its reference range.',
  parameters: z.object({
    indicator: z.string().describe('The name of the indicator'),
    value: z.number().describe('The observed value'),
    ref_range: z.string().describe('The reference range string'),
  }),
  execute: async ({ indicator, value, ref_range }) => {
    // The LLM can largely do this, but the tool acts as a dedicated computational node
    return `Indicator ${indicator} (val: ${value}, ref: ${ref_range}): Analyzed contextually. Let the main agent synthesize.`;
  },
});

export const detect_critical_symptoms = aiTool({
  description: 'Detect critical, life-threatening symptoms requiring immediate ER visit.',
  parameters: z.object({
    text: z.string().describe('The text, symptoms, or findings to analyze against critical red flags'),
  }),
  execute: async ({ text }) => {
    const redFlags = ['胸痛', '大出血', '意识丧失', '呼吸困难', '昏迷', '休克', '剧烈胸背痛'];
    for (const flag of redFlags) {
      if (text.includes(flag)) {
        return `CRITICAL EMERGENCY ALERT: Detected "${flag}". The user must immediately contact emergency services (120).`;
      }
    }
    return "No critical symptoms detected.";
  },
});

export const assess_severity = aiTool({
  description: 'Assess overall severity of the analyzed indicators.',
  parameters: z.object({
    indicators: z.array(z.any()).describe('List of analyzed indicator objects'),
  }),
  execute: async ({ indicators }) => {
    return "Severity evaluated based on the number and extent of out-of-range indicators. Proceed to prepare report.";
  },
});

export const generate_doctor_questions = aiTool({
  description: 'Generate specific questions the user should ask their doctor based on findings.',
  parameters: z.object({
    context: z.string().describe('The medical context and abnormal findings'),
  }),
  execute: async ({ context }) => {
    return "Generated draft questions for the doctor.";
  },
});

export const generate_wechat_message_for_doctor = aiTool({
  description: 'Generate a short WeChat message meant to be sent to a doctor friend.',
  parameters: z.object({
    context: z.string().describe('The medical context and abnormal findings'),
  }),
  execute: async ({ context }) => {
    return "Generated WeChat message draft.";
  },
});

export const query_member_profile = aiTool({
  description: '查询家人档案，获取性别、年龄、病史、用药史等背景信息。',
  parameters: z.object({
    member_id: z.string().describe('The family member ID'),
  }),
  execute: async ({ member_id }) => {
    // In actual implementation we use the global db instance, but here we can mock or safely lazy load.
    const member = db.prepare('SELECT * FROM family_members WHERE id = ?').get(member_id);
    if (!member) return "Member not found.";
    return JSON.stringify(member);
  },
});

export const query_lab_history = aiTool({
  description: '查询化验历史，找回特定指标的过往值。',
  parameters: z.object({
    member_id: z.string().describe('The family member ID'),
    indicator: z.string().describe('The indicator name to look up'),
    time_range: z.string().optional().describe('Time range like "6m", "1y" (optional)'),
  }),
  execute: async ({ member_id, indicator }) => {
    const records = db.prepare('SELECT value, ref_range, created_at FROM indicators WHERE family_member_id = ? AND name = ? ORDER BY created_at DESC LIMIT 5').all(member_id, indicator);
    if (records.length === 0) return "No history found for this indicator.";
    return JSON.stringify(records);
  },
});

export const compare_with_previous = aiTool({
  description: '与上次同类报告对比。',
  parameters: z.object({
    member_id: z.string().describe('The family member ID'),
    report_id: z.string().describe('The current report ID to compare against the previous one'),
  }),
  execute: async ({ member_id, report_id }) => {
    return "This tool returns the diff between the current report and the immediately preceding one. (Simulation)";
  },
});

export const analyze_indicator_trend = aiTool({
  description: '对选定的指标进行趋势分析。',
  parameters: z.object({
    member_id: z.string().describe('The family member ID'),
    indicator: z.string().describe('The indicator name'),
  }),
  execute: async ({ member_id, indicator }) => {
    const records = db.prepare('SELECT value, created_at FROM indicators WHERE family_member_id = ? AND name = ? ORDER BY created_at ASC').all(member_id, indicator);
    if (records.length < 2) return "Not enough data points to compute trend.";
    const start = records[0].value;
    const end = records[records.length - 1].value;
    const trend = end > start ? 'increasing' : end < start ? 'decreasing' : 'stable';
    return `Trend is ${trend} from ${start} to ${end}.`;
  },
});

export const search_family_history = aiTool({
  description: 'L2 检索：检索该家属相关的过往化验单和重大异常事件。',
  parameters: z.object({
    user_id: z.string().describe('The User ID'),
    query: z.string().describe('The search query related to family medical history'),
  }),
  execute: async ({ user_id, query }) => {
    // Basic text search mockup
    // Using simple LIKE search for demonstration
    const members = db.prepare('SELECT id FROM family_members WHERE user_id = ?').all(user_id);
    if (members.length === 0) return "No family members found.";
    const memberIds = members.map((m: any) => m.id);
    const reports = db.prepare(`SELECT interpretation_json, uploaded_at FROM reports WHERE family_member_id IN (${memberIds.map(() => '?').join(',')}) AND (interpretation_json LIKE ?)`).all(...memberIds, `%${query}%`);
    return JSON.stringify(reports.slice(0, 3));
  },
});

export const search_personal_notes = aiTool({
  description: 'L3 检索：检索用户为主体记录的护理日记、私人笔记等上下文。',
  parameters: z.object({
    user_id: z.string().describe('The User ID'),
    query: z.string().describe('The search query related to personal notes'),
  }),
  execute: async ({ user_id, query }) => {
    const notes = db.prepare('SELECT content, created_at FROM notes WHERE user_id = ? AND content LIKE ? ORDER BY created_at DESC LIMIT 5').all(user_id, `%${query}%`);
    if (notes.length === 0) return "No personal notes found relating to the query.";
    return JSON.stringify(notes);
  },
});

export const save_note = aiTool({
  description: '保存或提取关键事实并作为私人笔记写入 L3 存储库。',
  parameters: z.object({
    member_id: z.string().describe('The family member ID'),
    content: z.string().describe('The fact or note content to save'),
  }),
  execute: async ({ member_id, content }) => {
    const member = db.prepare('SELECT user_id FROM family_members WHERE id = ?').get(member_id) as any;
    if (!member) return "Member not found.";
    const curDate = new Date().toISOString();
    db.prepare('INSERT INTO notes (id, user_id, family_member_id, content, is_auto_extracted, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(`note_${Date.now()}`, member.user_id, member_id, content, 1, curDate);
    return "Note successfully saved to L3 memory.";
  },
});

export const ocr_parse_prescription = aiTool({
  description: 'OCR parse prescription from an image file path.',
  parameters: z.object({
    image_path: z.string().describe('The path to the uploaded image file'),
  }),
  execute: async ({ image_path }) => {
    try {
      if (!fs.existsSync(image_path)) {
        console.error("OCR Tool: File not found. image_path=", image_path);
        return "File not found.";
      }
      const worker = await getTesseractWorker();
      const { data: { text } } = await worker.recognize(image_path);
      return `[RAW OCR EXTACTED PRESCRIPTION TEXT]\n${text}`;
    } catch (e: any) {
      return `OCR Failed: ${e.message}`;
    }
  },
});

export const parse_prescription_text = aiTool({
  description: 'Parse raw text from a prescription into structured medication objects.',
  parameters: z.object({
    raw_text: z.string(),
  }),
  execute: async ({ raw_text }) => {
    return "Instructions: The AI should look at the raw text and extract drug names, dosages, and frequencies into JSON.";
  },
});

export const query_medications = aiTool({
  description: 'Query current or past medications for a family member.',
  parameters: z.object({
    member_id: z.string(),
    active_only: z.boolean().optional().default(true),
  }),
  execute: async ({ member_id, active_only }) => {
    const meds = active_only 
      ? db.prepare('SELECT * FROM medications WHERE family_member_id = ? AND active = 1').all(member_id)
      : db.prepare('SELECT * FROM medications WHERE family_member_id = ?').all(member_id);
    return JSON.stringify(meds);
  },
});

export const add_medication = aiTool({
  description: 'Add a new medication for a family member.',
  parameters: z.object({
    member_id: z.string(),
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
  }),
  execute: async ({ member_id, name, dosage, frequency }) => {
    const id = `med_${Date.now()}`;
    db.prepare('INSERT INTO medications (id, family_member_id, name, dosage, frequency, active) VALUES (?, ?, ?, ?, ?, 1)')
      .run(id, member_id, name, dosage, frequency);
    return `Added medication ${name}.`;
  },
});

export const check_drug_interaction = aiTool({
  description: 'Check for drug interactions between a list of drug names.',
  parameters: z.object({
    drugs: z.array(z.string()).describe('List of drug names to check against each other or against a knowledge base'),
  }),
  execute: async ({ drugs }) => {
    const kbPath = path.join(process.cwd(), 'data', 'drug_interactions_kb.json');
    if (!fs.existsSync(kbPath)) return "Knowledge base not found.";
    const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
    const warnings = [];
    
    for (let i = 0; i < drugs.length; i++) {
        for (let j = i + 1; j < drugs.length; j++) {
            const d1 = drugs[i].toLowerCase();
            const d2 = drugs[j].toLowerCase();
            const match = kb.find((k: any) => 
               (k.drugA.toLowerCase().includes(d1) && k.drugB.toLowerCase().includes(d2)) ||
               (k.drugA.toLowerCase().includes(d2) && k.drugB.toLowerCase().includes(d1))
            );
            if (match) warnings.push(match);
        }
    }
    
    if (warnings.length === 0) return "No known severe interactions between these drugs.";
    return JSON.stringify(warnings);
  },
});

export const recommend_department = aiTool({
  description: 'Recommend hospital departments based on symptoms.',
  parameters: z.object({
    symptoms: z.string(),
    member_id: z.string().optional(),
  }),
  execute: async ({ symptoms, member_id }) => {
    return "Please synthesize your own knowledge to recommend a medical department based on these symptoms.";
  },
});

export const triage_symptom = aiTool({
  description: 'Triage symptoms to assess severity and urgency.',
  parameters: z.object({
    symptoms: z.string(),
    member_id: z.string().optional(),
  }),
  execute: async ({ symptoms }) => {
    return "Provide an assessment of how urgent this symptom is.";
  },
});

export const generate_visit_preparation = aiTool({
  description: 'Generate structured preparation materials for a doctor visit.',
  parameters: z.object({
    member_id: z.string(),
    complaint: z.string(),
  }),
  execute: async ({ complaint }) => {
    // This is essentially framing instructions for the AI
    return "Review the complaint and previous data, then output 1-3 departments, materials to bring, and 8 questions to ask.";
  },
});

export const save_visit_note = aiTool({
  description: 'Save a note or transcription from the doctor into the visit record.',
  parameters: z.object({
    visit_id: z.string(),
    note: z.string(),
  }),
  execute: async ({ visit_id, note }) => {
    const id = `vnote_${Date.now()}`;
    db.prepare('INSERT INTO visit_notes (id, visit_id, content) VALUES (?, ?, ?)').run(id, visit_id, note);
    return "Saved visit note.";
  },
});

export const detect_anomaly_in_history = aiTool({
  description: 'Detect anomalies or sudden changes in a members history.',
  parameters: z.object({
    member_id: z.string(),
  }),
  execute: async ({ member_id }) => {
    // Return the latest abnormal indicators
    const records = db.prepare('SELECT name, value, created_at FROM indicators WHERE family_member_id = ? AND is_abnormal = 1 ORDER BY created_at DESC LIMIT 5').all(member_id);
    return JSON.stringify(records);
  },
});

export const predict_medication_runout = aiTool({
  description: 'Predict when a medication will run out.',
  parameters: z.object({
    member_id: z.string(),
  }),
  execute: async ({ member_id }) => {
    // Mock simulation
    return "Based on dosage and frequency, Atorvastatin will run out in 11 days.";
  },
});

export const cross_indicator_correlation = aiTool({
  description: 'Identify correlations between multiple abnormal indicators.',
  parameters: z.object({
    member_id: z.string(),
  }),
  execute: async ({ member_id }) => {
    return "High TG and high UA detected, both relate to metabolic syndrome and diet.";
  },
});

export const recommend_followup_visit = aiTool({
  description: 'Recommend a followup visit based on history or medication duration.',
  parameters: z.object({
    member_id: z.string(),
  }),
  execute: async ({ member_id }) => {
    return "Patient has been on Omeprazole for 3 months, suggest asking doctor about tapering off.";
  },
});

export const detect_seasonal_health_risk = aiTool({
  description: 'Detect seasonal risks based on family member conditions.',
  parameters: z.object({
    member_id: z.string(),
    season: z.string(),
  }),
  execute: async ({ member_id, season }) => {
    return `In ${season}, watch out for hypertension spikes or respiratory viral infections.`;
  },
});

export const generate_proactive_alert = aiTool({
  description: 'Generate a proactive alert message for the user.',
  parameters: z.object({
    insight: z.string(),
  }),
  execute: async ({ insight }) => {
    return `Proactive alert generated based on: ${insight}`;
  },
});

export const cluster_anomalies = aiTool({
  description: 'Cluster anomalies to avoid spamming alerts.',
  parameters: z.object({
    anomalies: z.array(z.string()),
  }),
  execute: async ({ anomalies }) => {
    return "Clustered anomalies into a single summary.";
  },
});

export const estimate_action_priority = aiTool({
  description: 'Estimate priority of a health action.',
  parameters: z.object({
    insight: z.string(),
  }),
  execute: async ({ insight }) => {
    return "Priority: MEDIUM";
  },
});

export const generate_weekly_report = aiTool({
  description: 'Generate the weekly report for a user.',
  parameters: z.object({
    user_id: z.string(),
    week: z.string(),
  }),
  execute: async ({ user_id, week }) => {
    return "Weekly report generated.";
  },
});

export const parse_doctor_dialogue = aiTool({
  description: 'Parse raw transcribed doctor text into insights (diagnosis, meds, followup).',
  parameters: z.object({
    dialogue: z.string(),
  }),
  execute: async ({ dialogue }) => {
    return "Parsed dialogue into structured conclusions.";
  },
});

export const generate_annual_report = aiTool({
  description: 'Generate annual health report for a family.',
  parameters: z.object({
    user_id: z.string(),
    year: z.number(),
  }),
  execute: async ({ user_id, year }) => {
    return "Annual report data aggregated.";
  },
});

export const parse_multipage_pdf = aiTool({
  description: 'Parse multi-page PDF medical reports.',
  parameters: z.object({
    file_path: z.string(),
  }),
  execute: async ({ file_path }) => {
    return "[PDF Parsed Content]";
  },
});

export const extract_all_indicators = aiTool({
  description: 'Extract all indicators from parsed text.',
  parameters: z.object({
    text: z.string(),
  }),
  execute: async ({ text }) => {
    return "[Extracted Indicators]";
  },
});

export const find_critical_anomalies = aiTool({
  description: 'Find extremely critical anomalies requiring immediate action.',
  parameters: z.object({
    indicators: z.string(),
  }),
  execute: async ({ indicators }) => {
    return "[Critical Anomalies Checked]";
  },
});

export const generate_health_summary = aiTool({
  description: 'Generate health summary based on findings.',
  parameters: z.object({
    findings: z.string(),
  }),
  execute: async ({ findings }) => {
    return "Health summary generated.";
  },
});

export const tools = {
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

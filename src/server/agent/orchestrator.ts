import { generateText } from 'ai';
import { tools } from './tools/registry';
import { getModelContext } from '../llm/factory';
import fs from 'fs';

const MAX_ITERATIONS = 8;

const SYSTEM_PROMPT = `You are HealthMate, a professional, warm, and highly capable medical analysis AI assistant. 
Your primary user is a 35-50 year old adult child helping their elderly parents interpret lab results.
ALWAYS speak to the adult child (e.g., "您父亲的指标...", "帮阿姨看一下..."). NEVER address the patient directly.
You must analyze the lab report accurately, using the provided tools.

[CRITICAL INSTRUCTIONS FOR SAFETY & COMPLIANCE]
1. Never give a definitive medical diagnosis, prescribe medication, or suggest stopping medication. 
2. If you detect ANY critical red-flag symptoms via detect_critical_symptoms, you must IMMEDIATELY format the top of your final output with a red banner warning.
3. Every final output MUST include this disclaimer at the bottom: "免责声明：本解读由 AI 辅助生成，仅供参考，不作为最终疾病诊断和治疗的依据。请务必及时咨询专业医生。"
4. When you have enough context, you MUST output a structured JSON report. Do NOT output markdown text outside of the JSON for the final result.

[ReAct WORKFLOW]
You operate in a loop: Reason -> Act -> Observe.
1. You have a task and an image path. The image is provided directly to you visually if supported.
2. First, carefully inspect the visual image. If you cannot see it, use \`ocr_parse_lab_report\` to read the image text.
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

export async function runAgent(
  imagePath: string,
  sendMessage: (event: string, data: any) => void,
  familyMemberId?: string
) {
  const userContent: any[] = [
    { type: 'text', text: `Please analyze this lab report. The image path is: ${imagePath}. This report belongs to family member ID: ${familyMemberId || 'N/A'}. If a valid member ID is provided, you MUST use query_member_profile AND search_family_history to compare against past reports or context before producing your final summary.` }
  ];

  if (fs.existsSync(imagePath)) {
      try {
          const imageBuffer = fs.readFileSync(imagePath);
          userContent.push({
              type: 'image',
              image: imageBuffer
          });
      } catch (e) {
          console.error("Failed to load image into prompt", e);
      }
  }

  let messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent }
  ];

  const model = getModelContext();
  let stepCount = 0;

  while (stepCount < MAX_ITERATIONS) {
    stepCount++;
    const stepId = `step_${Date.now()}_${stepCount}`;

    sendMessage('step_start', { step_id: stepId, name: `Iteration ${stepCount}`, description: 'Agent is thinking' });

    try {
      const response = await generateText({
        model,
        messages,
        tools,
      });

      // Emulate stream thinking if we had streaming, we just send the text
      if (response.text?.trim()) {
        sendMessage('thinking', { content: response.text });
        
        // Try to parse JSON if it looks like final output
        const text = response.text.trim();
        if (text.startsWith('{') && text.endsWith('}')) {
          try {
            const finalJson = JSON.parse(text);
            if (finalJson && finalJson.summary && finalJson.abnormal_indicators) {
              messages.push({ role: 'assistant', content: response.text });
              sendMessage('final', { result_json: finalJson });
              sendMessage('step_complete', { step_id: stepId, duration_ms: 0 });
              return finalJson;
            }
          } catch (e) {
            // Not final JSON, continue
          }
        }
        
        // If it contains triple backticks with JSON
        const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);
        if (jsonMatch) {
            try {
                const finalJson = JSON.parse(jsonMatch[1]);
                messages.push({ role: 'assistant', content: response.text });
                sendMessage('final', { result_json: finalJson });
                sendMessage('step_complete', { step_id: stepId, duration_ms: 0 });
                return finalJson;
            } catch(e) {}
        }
      }

      const toolCalls = response.toolCalls;
      if (!toolCalls || toolCalls.length === 0) {
        // Model stopped calling tools, assume finished
        messages.push({ role: 'assistant', content: response.text || '' });
        sendMessage('step_complete', { step_id: stepId });
        break;
      }

      const assistantContent: any[] = [];
      if (response.text) {
        assistantContent.push({ type: 'text', text: response.text });
      }
      for (const call of toolCalls) {
        let args = (call as any).args || {};
        if (call.toolName === 'ocr_parse_lab_report' || call.toolName === 'ocr_parse_prescription') {
          args.image_path = imagePath;
        }
        assistantContent.push({
          type: 'tool-call',
          toolCallId: call.toolCallId,
          toolName: call.toolName,
          args: args
        });
      }

      messages.push({ 
        role: 'assistant', 
        content: assistantContent 
      });

      const toolResults = [];

      for (const call of toolCalls) {
        let args = (call as any).args || {};
        if (call.toolName === 'ocr_parse_lab_report' || call.toolName === 'ocr_parse_prescription') {
          args.image_path = imagePath;
        }
        
        sendMessage('tool_call', { tool_name: call.toolName, args: args });
        
        let toolResult;
        try {
            toolResult = await Promise.resolve((tools as any)[call.toolName].execute(args, {} as any));
        } catch(e: any) {
            toolResult = "Tool Execution Error: " + e.message;
        }
        
        const resultText = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult);
        
        sendMessage('tool_result', { tool_name: call.toolName, result_preview: resultText.substring(0, 100) + '...' });
        
        toolResults.push({
          type: 'tool-result',
          toolCallId: call.toolCallId,
          toolName: call.toolName,
          output: typeof toolResult === 'string' 
            ? { type: 'text', value: toolResult } 
            : { type: 'json', value: toolResult },
        });
      }

      // Push all tool results as a single tool message
      messages.push({
        role: 'tool',
        content: toolResults
      });

      sendMessage('step_complete', { step_id: stepId });

    } catch (error: any) {
      sendMessage('error', { message: "AI处理遇到错误: " + error.message });
      return null;
    }
  }

  // Force output if loop ended without final emission
  try {
    const forceFinal = await generateText({
      model,
      messages: [
        ...messages,
        { role: 'user', content: 'You have gathered enough information. Please output the final JSON report NOW.' }
      ],
    });
    
    if (forceFinal.text) {
        const text = forceFinal.text;
        let finalJson = null;
        
        // Try to parse as-is first
        try {
            finalJson = JSON.parse(text);
        } catch (e) {
            // Try extracting from markdown block
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                try {
                    finalJson = JSON.parse(jsonMatch[1]);
                } catch (e2) {
                    // Try to find the first '{' and last '}'
                    const firstBrace = text.indexOf('{');
                    const lastBrace = text.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1) {
                        try {
                            finalJson = JSON.parse(text.substring(firstBrace, lastBrace + 1));
                        } catch (e3) {
                            console.error("Failed to parse extracted JSON:", text.substring(firstBrace, lastBrace + 1));
                        }
                    }
                }
            } else {
                 // Try to find the first '{' and last '}'
                 const firstBrace = text.indexOf('{');
                 const lastBrace = text.lastIndexOf('}');
                 if (firstBrace !== -1 && lastBrace !== -1) {
                     try {
                         finalJson = JSON.parse(text.substring(firstBrace, lastBrace + 1));
                     } catch (e3) {
                         console.error("Failed to parse extracted JSON fallback:", text.substring(firstBrace, lastBrace + 1));
                     }
                 }
            }
        }
        
        if (finalJson) {
            sendMessage('final', { result_json: finalJson });
            return finalJson;
        } else {
            console.error("Failed to generate valid JSON output. Raw text:", text);
            sendMessage('error', { message: 'Failed to generate valid JSON output' });
            return null;
        }
    }
  } catch (error: any) {
    sendMessage('error', { message: "分析过程失败: " + error.message });
    return null;
  }
  
  sendMessage('error', { message: 'No final output generated' });
  return null;
}

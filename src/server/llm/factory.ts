import { generateText, streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { db } from '../core/db';

export interface LLMSettings {
  provider: 'ollama' | 'deepseek' | 'tongyi' | 'claude' | 'gemini';
  apiKey?: string;
  model: string;
  baseUrl?: string;
}

export function getLLMSettings(): LLMSettings {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('llm_settings') as { value: string } | undefined;
  if (row) {
    return JSON.parse(row.value);
  }
  // Default fallback (uses environment variable for Gemini if present, else ollama)
  if (process.env.GEMINI_API_KEY) {
    return { provider: 'gemini', model: 'gemini-2.5-flash', apiKey: process.env.GEMINI_API_KEY };
  }
  return { provider: 'ollama', model: 'qwen2.5:7b' };
}

export function getModelContext(settings?: LLMSettings) {
  const config = settings || getLLMSettings();
  
  if (config.provider === 'gemini') {
    const google = createGoogleGenerativeAI({ apiKey: config.apiKey || process.env.GEMINI_API_KEY });
    return google(config.model);
  }
  
  if (config.provider === 'claude') {
    const anthropic = createAnthropic({ apiKey: config.apiKey });
    return anthropic(config.model);
  }
  
  if (config.provider === 'deepseek') {
    // Deepseek uses OpenAI compatible endpoint
    const openai = createOpenAI({ apiKey: config.apiKey, baseURL: 'https://api.deepseek.com/v1' });
    return openai(config.model);
  }
  
  if (config.provider === 'tongyi') {
    // Tongyi config roughly compatible with OpenAI via dashscope
    const openai = createOpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    });
    return openai(config.model);
  }

  // Default to ollama mapped through openai compatible local endpoint (default 11434)
  const baseUrl = config.baseUrl || 'http://127.0.0.1:11434/v1';
  const ollama = createOpenAI({ baseURL: baseUrl, apiKey: 'ollama' });
  return ollama(config.model);
}

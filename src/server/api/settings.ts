import express from 'express';
import { db } from '../core/db';
import { getLLMSettings } from '../llm/factory';

const router = express.Router();

router.post('/llm', (req, res) => {
  const { provider, apiKey, model, baseUrl } = req.body;
  if (!provider || !model) {
    return res.status(400).json({ error: 'Provider and model are required' });
  }

  const settings = { provider, apiKey, model, baseUrl };
  // In a real app we would encrypt apiKey using crypto module here before saving
  
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  stmt.run('llm_settings', JSON.stringify(settings));

  res.json({ success: true });
});

router.get('/llm', (req, res) => {
    res.json(getLLMSettings());
});

router.post('/llm/test', async (req, res) => {
  try {
    const { getModelContext } = await import('../llm/factory');
    const { generateText } = await import('ai');
    
    // Test the configuration from body if provided, else use current
    const settings = req.body.provider ? req.body : undefined;
    const model = getModelContext(settings);

    const response = await generateText({
      model,
      prompt: 'Say "hello" and tell me your name.',
    });

    res.json({ success: true, response: response.text });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

export default router;

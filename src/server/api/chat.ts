import express from 'express';
import { db } from '../core/db';
import { requireAuth } from './auth';
import { streamText } from 'ai';
import { getModelContext } from '../llm/factory';
import { tools } from '../agent/tools/registry';

const router = express.Router();
router.use(requireAuth);

router.post('/stream', async (req: any, res) => {
  const { messages, family_member_id } = req.body;
  if (!messages) return res.status(400).json({ error: 'Messages required' });

  // Basic check
  if (family_member_id) {
    const member = db.prepare('SELECT * FROM family_members WHERE id = ? AND user_id = ?').get(family_member_id, req.userId);
    if (!member) return res.status(403).json({ error: 'Forbidden' });
  }

  // Inject system prompt with ID
  const systemPrompt = `You are an expert AI medical assistant acting as the brain for the HealthMate application.
Current datetime: ${new Date().toISOString()}
Target Family Member ID: ${family_member_id || 'unspecified'}

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
    const result = streamText({
      model: model as any,
      system: systemPrompt,
      messages,
      tools: tools as any,
      maxSteps: 5, // Enable multi-step reasoning
    } as any);

    (result as any).pipeTextStreamToResponse(res);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

export default router;

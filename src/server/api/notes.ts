import express from 'express';
import { db } from '../core/db';
import { requireAuth } from './auth';

const router = express.Router();
router.use(requireAuth);

router.post('/', (req: any, res) => {
  let { family_member_id, report_id, content } = req.body;
  if (!family_member_id && report_id) {
    const r = db.prepare('SELECT family_member_id FROM reports WHERE id = ?').get(report_id) as any;
    if (r) family_member_id = r.family_member_id;
  }
  if (!family_member_id) return res.status(400).json({ error: 'family_member_id is required' });

  const id = `note_${Date.now()}`;
  db.prepare(`
    INSERT INTO notes (id, user_id, family_member_id, report_id, content) 
    VALUES (?, ?, ?, ?, ?)
  `).run(id, req.userId, family_member_id, report_id || null, content);
  
  res.json({ id, family_member_id, report_id, content });
});

export default router;

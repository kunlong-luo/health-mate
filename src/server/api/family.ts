import express from 'express';
import { db } from '../core/db';
import { requireAuth } from './auth';

const router = express.Router();
router.use(requireAuth);

router.get('/', (req: any, res) => {
  const members = db.prepare('SELECT * FROM family_members WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(members);
});

router.post('/', (req: any, res) => {
  const { name, gender, birth_year, conditions, allergies, avatar_emoji } = req.body;
  const id = `member_${Date.now()}`;
  const condStr = Array.isArray(conditions) ? JSON.stringify(conditions) : JSON.stringify([]);
  
  db.prepare(`
    INSERT INTO family_members (id, user_id, name, gender, birth_year, conditions, allergies, avatar_emoji)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.userId, name, gender, birth_year, condStr, allergies || '', avatar_emoji || '👤');
  
  const newMember = db.prepare('SELECT * FROM family_members WHERE id = ?').get(id);
  res.json(newMember);
});

router.get('/:id', (req: any, res) => {
  const member = db.prepare('SELECT * FROM family_members WHERE id = ? AND user_id = ?').get(req.params.id, req.userId) as any;
  if (!member) return res.status(404).json({ error: 'Not found' });
  
  const reports = db.prepare('SELECT * FROM reports WHERE family_member_id = ? ORDER BY uploaded_at DESC').all(req.params.id);
  const notes = db.prepare('SELECT * FROM notes WHERE family_member_id = ? ORDER BY created_at DESC').all(req.params.id);
  
  res.json({ ...member, reports, notes });
});

router.put('/:id', (req: any, res) => {
  const { name, gender, birth_year, conditions, allergies, avatar_emoji } = req.body;
  const condStr = Array.isArray(conditions) ? JSON.stringify(conditions) : JSON.stringify([]);

  db.prepare(`
    UPDATE family_members 
    SET name = ?, gender = ?, birth_year = ?, conditions = ?, allergies = ?, avatar_emoji = ?
    WHERE id = ? AND user_id = ?
  `).run(name, gender, birth_year, condStr, allergies || '', avatar_emoji || '👤', req.params.id, req.userId);
  
  const updatedMember = db.prepare('SELECT * FROM family_members WHERE id = ?').get(req.params.id);
  res.json(updatedMember);
});

router.delete('/:id', (req: any, res) => {
  db.prepare('DELETE FROM indicators WHERE family_member_id = ?').run(req.params.id);
  db.prepare('DELETE FROM reports WHERE family_member_id = ?').run(req.params.id);
  db.prepare('DELETE FROM notes WHERE family_member_id = ?').run(req.params.id);
  db.prepare('DELETE FROM medications WHERE family_member_id = ?').run(req.params.id);
  db.prepare('DELETE FROM visits WHERE family_member_id = ?').run(req.params.id);
  db.prepare('DELETE FROM family_members WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

router.get('/:id/trends/:indicator', (req: any, res) => {
  // Return trend data for an indicator for a specific family member
  const trend = db.prepare(`
    SELECT i.value, i.unit, i.ref_range, r.uploaded_at 
    FROM indicators i 
    JOIN reports r ON i.report_id = r.id
    WHERE i.family_member_id = ? AND i.name = ?
    ORDER BY r.uploaded_at ASC
  `).all(req.params.id, req.params.indicator);
  
  res.json(trend);
});

export default router;

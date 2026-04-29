import express from 'express';
import { db } from '../core/db';
import { requireAuth } from './auth';

const router = express.Router();
router.use(requireAuth);

router.get('/', (req: any, res) => {
  const members = db.prepare('SELECT id FROM family_members WHERE user_id = ?').all(req.userId);
  if (members.length === 0) return res.json([]);
  
  const memberIds = members.map((m: any) => m.id);
  const placeholders = memberIds.map(() => '?').join(',');
  const visits = db.prepare(`SELECT * FROM visits WHERE family_member_id IN (${placeholders}) ORDER BY created_at DESC`).all(...memberIds);
  res.json(visits);
});

router.post('/', (req: any, res) => {
  const { family_member_id, complaint, department_recommended, materials_needed, questions_generated } = req.body;
  
  // Verify ownership
  const member = db.prepare('SELECT * FROM family_members WHERE id = ? AND user_id = ?').get(family_member_id, req.userId);
  if (!member) return res.status(403).json({ error: 'Forbidden' });

  const id = `visit_${Date.now()}`;
  db.prepare(`
    INSERT INTO visits (id, family_member_id, complaint, status, department_recommended, materials_needed, questions_generated)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, family_member_id, complaint, 'planned', department_recommended, materials_needed, questions_generated);
  
  res.json({ id });
});

router.get('/:id', (req: any, res) => {
  const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(req.params.id) as any;
  if (!visit) return res.status(404).json({ error: 'Not found' });
  
  const member = db.prepare('SELECT * FROM family_members WHERE id = ? AND user_id = ?').get(visit.family_member_id, req.userId);
  if (!member) return res.status(403).json({ error: 'Forbidden' });

  const notes = db.prepare('SELECT * FROM visit_notes WHERE visit_id = ? ORDER BY created_at ASC').all(visit.id);
  const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE visit_id = ? ORDER BY created_at ASC').all(visit.id);

  res.json({ ...visit, notes, prescriptions });
});

router.post('/:id/notes', (req: any, res) => {
  const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(req.params.id) as any;
  if (!visit) return res.status(404).json({ error: 'Not found' });

  const { content } = req.body;
  const noteId = `vnote_${Date.now()}`;
  db.prepare('INSERT INTO visit_notes (id, visit_id, content) VALUES (?, ?, ?)').run(noteId, visit.id, content);
  
  // Also push to L3 memory (notes)
  const l3NoteId = `note_${Date.now()}`;
  db.prepare('INSERT INTO notes (id, user_id, family_member_id, content) VALUES (?, ?, ?, ?)').run(l3NoteId, req.userId, visit.family_member_id, content);

  res.json({ id: noteId });
});

router.put('/:id/status', (req: any, res) => {
    const { status } = req.body;
    db.prepare('UPDATE visits SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
});

export default router;

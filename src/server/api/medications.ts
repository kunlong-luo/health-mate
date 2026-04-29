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
  const medications = db.prepare(`SELECT * FROM medications WHERE family_member_id IN (${placeholders}) AND active = 1 ORDER BY created_at DESC`).all(...memberIds);
  res.json(medications);
});

router.post('/', (req: any, res) => {
  const { family_member_id, name, generic_name, dosage, frequency, instructions } = req.body;
  const member = db.prepare('SELECT * FROM family_members WHERE id = ? AND user_id = ?').get(family_member_id, req.userId);
  if (!member) return res.status(403).json({ error: 'Forbidden' });

  const id = `med_${Date.now()}`;
  db.prepare(`
    INSERT INTO medications (id, family_member_id, name, generic_name, dosage, frequency, instructions, start_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, date('now'))
  `).run(id, family_member_id, name, generic_name || '', dosage || '', frequency || '', instructions || '');
  res.json({ id });
});

router.put('/:id', (req: any, res) => {
  const med = db.prepare('SELECT * FROM medications WHERE id = ?').get(req.params.id) as any;
  if (!med) return res.status(404).json({ error: 'Not found' });
  const active = req.body.active !== undefined ? req.body.active : med.active;
  
  db.prepare('UPDATE medications SET active = ?, end_date = ? WHERE id = ?')
    .run(active, active ? null : new Date().toISOString(), med.id);
  
  res.json({ success: true });
});

export default router;

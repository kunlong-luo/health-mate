import express from 'express';
import { db } from '../core/db';
import { requireAuth } from './auth';

const router = express.Router();
router.use(requireAuth);

router.get('/', (req: any, res) => {
  // Select active reminders
  const reminders = db.prepare('SELECT * FROM care_reminders WHERE user_id = ? AND is_handled = 0 ORDER BY reminder_date ASC LIMIT 10').all(req.userId);
  res.json(reminders);
});

router.post('/:id/handle', (req: any, res) => {
  db.prepare('UPDATE care_reminders SET is_handled = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

export default router;

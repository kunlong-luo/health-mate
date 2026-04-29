import express from 'express';
import { db } from '../core/db';
import { requireAuth } from './auth';

const router = express.Router();
router.use(requireAuth);

router.get('/', (req: any, res) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.userId);
  res.json(notifications);
});

router.post('/:id/read', (req: any, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

router.get('/unread-count', (req: any, res) => {
  const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.userId) as any;
  res.json({ count: result.count });
});

export default router;

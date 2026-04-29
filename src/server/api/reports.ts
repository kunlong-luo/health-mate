import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { runAgent } from '../agent/orchestrator';
import { db } from '../core/db';
import { requireAuth, requireEmailVerified } from './auth';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/history', requireAuth, (req: any, res) => {
  const members = db.prepare('SELECT id FROM family_members WHERE user_id = ?').all(req.userId);
  if (members.length === 0) return res.json([]);
  
  const memberIds = members.map((m: any) => m.id);
  const placeholders = memberIds.map(() => '?').join(',');
  const reports = db.prepare(`SELECT * FROM reports WHERE family_member_id IN (${placeholders}) ORDER BY uploaded_at DESC`).all(...memberIds);
  res.json(reports);
});

router.get('/:id', requireAuth, (req: any, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id) as any;
  if (!report) return res.status(404).json({ error: 'Not found' });
  
  // Basic check that this report belongs to a member of the current user
  const member = db.prepare('SELECT user_id FROM family_members WHERE id = ?').get(report.family_member_id) as any;
  if (!member || member.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({
    id: report.id,
    createdAt: report.uploaded_at,
    result: JSON.parse(report.interpretation_json)
  });
});

router.post('/upload', requireAuth, requireEmailVerified, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: '文件过大，请上传小于10MB的文件' });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { family_member_id } = req.body;
  if (!family_member_id) {
    return res.status(400).json({ error: 'family_member_id is required' });
  }

  const taskId = `task_${Date.now()}`;
  const reportId = taskId;
  
  db.prepare('INSERT INTO tasks (task_id, status) VALUES (?, ?)').run(taskId, 'processing');
  
  const payload = JSON.stringify({ imagePath: req.file.path, family_member_id, reportId });
  db.prepare('UPDATE tasks SET result = ? WHERE task_id = ?').run(payload, taskId);

  res.json({ task_id: taskId });
});

router.get('/stream/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  
  const task = db.prepare('SELECT status, result FROM tasks WHERE task_id = ?').get(taskId) as any;
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { imagePath, family_member_id, reportId } = JSON.parse(task.result);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendMessage = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  runAgent(imagePath, sendMessage, family_member_id)
    .then((finalJsonResult: any) => {
        // Save the report
        const severity = finalJsonResult?.critical_alert ? 'critical' : 'normal';
        db.prepare('INSERT INTO reports (id, family_member_id, file_path, interpretation_json, severity) VALUES (?, ?, ?, ?, ?)')
          .run(reportId, family_member_id, imagePath, JSON.stringify(finalJsonResult), severity);
        
        // Save indicators
        if (finalJsonResult?.abnormal_indicators) {
           const stmt = db.prepare('INSERT INTO indicators (id, family_member_id, report_id, name, value, unit, ref_range, is_abnormal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
           db.transaction(() => {
              for (const ind of finalJsonResult.abnormal_indicators) {
                  stmt.run(`ind_${Date.now()}_${Math.random()}`, family_member_id, reportId, ind.name, ind.value, ind.unit || '', ind.range || '', 1);
              }
           })();
        }

        db.prepare('UPDATE tasks SET status = ?, result = ? WHERE task_id = ?').run('completed', JSON.stringify({ reportId, ...finalJsonResult }), taskId);
        res.end();
    })
    .catch((err) => {
        console.error(err);
        sendMessage('error', { message: err.message });
        db.prepare('UPDATE tasks SET status = ? WHERE task_id = ?').run('failed', taskId);
        res.end();
    });
});

export default router;

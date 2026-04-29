import express from 'express';
import { db } from '../core/db';
import { requireAuth } from './auth';

const router = express.Router();
router.use(requireAuth);

router.post('/from_indexeddb', (req: any, res) => {
  const { reports, family_member_id } = req.body;
  if (!Array.isArray(reports) || !family_member_id) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const insertReport = db.prepare(`
    INSERT OR REPLACE INTO reports (id, family_member_id, interpretation_json, severity, uploaded_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertIndicator = db.prepare(`
    INSERT OR REPLACE INTO indicators (id, family_member_id, report_id, name, value, unit, ref_range, is_abnormal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const report of reports) {
      // report format from IndexedDB matches local schema loosely
      insertReport.run(
        report.id, 
        family_member_id, 
        JSON.stringify(report.result), 
        report.result.critical_alert ? 'critical' : 'normal',
        report.createdAt || new Date().toISOString()
      );

      if (report.result && Array.isArray(report.result.abnormal_indicators)) {
        for (const ind of report.result.abnormal_indicators) {
          const indId = `ind_${Date.now()}_${Math.random()}`;
          insertIndicator.run(
            indId,
            family_member_id,
            report.id,
            ind.name,
            ind.value,
            ind.unit || '',
            ind.range || '',
            1 // is_abnormal
          );
        }
      }
    }
  })();

  res.json({ success: true, migrated_count: reports.length });
});

export default router;

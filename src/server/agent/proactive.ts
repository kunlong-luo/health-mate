import cron from 'node-cron';
import { db } from '../core/db';
import nodemailer from 'nodemailer';

// Simplified SMTP for V4 demonstration
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'demo@ethereal.email',
      pass: 'demo'
  }
});

// Run every day at 03:00 AM
cron.schedule('0 3 * * *', async () => {
    console.log('[Proactive Agent] Starting daily scan...');
    // Simulated scanning logic
    const users = db.prepare('SELECT * FROM users').all();
    for (const user of users as any[]) {
      const members = db.prepare('SELECT id FROM family_members WHERE user_id = ?').all(user.id);
      for (const member of members as any[]) {
        // Here the agent would evaluate anomalies and generate alerts
        // This is a simplified stand-in for the full LLM flow
        const id = `notif_${Date.now()}`;
        // we'll randomly mock an alert to demonstrate the proactive nature
        if (Math.random() > 0.8) {
           db.prepare(`
             INSERT INTO notifications (id, user_id, family_member_id, title, content, type)
             VALUES (?, ?, ?, ?, ?, ?)
           `).run(id, user.id, member.id, '异常指标提醒', '我注意到最近3周血压偏高，是否需要帮忙整理记录预约医生？', 'alert');
        }
      }
    }
    console.log('[Proactive Agent] Daily scan complete.');
});

// Run every Monday at 08:00 AM for Weekly Reports
cron.schedule('0 8 * * 1', async () => {
    console.log('[Proactive Agent] Generating weekly reports...');
    const users = db.prepare('SELECT * FROM users').all();
    for (const user of users as any[]) {
       const id = `notif_${Date.now()}`;
       db.prepare(`
         INSERT INTO notifications (id, user_id, title, content, type)
         VALUES (?, ?, ?, ?, ?)
       `).run(id, user.id, '本周家人健康简报', '妈妈这周血压稳定(平均 128/82)，还剩11天阿托伐他汀，明天是她的生日，记得打个电话哦！', 'weekly_report');
       
       // Send mail conceptually
       // await transporter.sendMail({
       //  from: '"HealthMate" <no-reply@healthmate.com>',
       //  to: user.email, // if email was captured
       //  subject: '本周家人健康简报',
       //  html: '<b>周报内容...</b>'
       // });
    }
});

export const initProactiveAgent = () => {
    console.log('[Proactive Agent] Initialized cron jobs.');
};

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'healthmate.db');
const db = new Database(dbPath);

console.log('开始检测旧版手机号用户...');

const users = db.prepare('SELECT id, phone, email FROM users WHERE email IS NULL AND phone IS NOT NULL').all();

console.log(`发现 ${users.length} 个未绑定邮箱的手机号用户。`);

if (users.length > 0) {
  console.log('正在为老用户生成临时邮箱以防止数据丢失 (格式: phone@healthmate.internal)...');
  
  const updateStmt = db.prepare('UPDATE users SET email = ?, email_verified = 0 WHERE id = ?');
  
  db.transaction(() => {
    for (const user of users) {
      const fallbackEmail = `${user.phone}@healthmate.internal`;
      updateStmt.run(fallbackEmail, user.id);
      console.log(`✅ ${user.phone} -> ${fallbackEmail}`);
    }
  })();
  
  console.log('迁移完毕！请建议老用户在设置中修改为其真实邮箱。');
} else {
  console.log('无需迁移。');
}

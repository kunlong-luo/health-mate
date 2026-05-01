import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'healthmate.db');
export const db = new Database(dbPath);

// Initialize DB schema
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  
  CREATE TABLE IF NOT EXISTS tasks (
    task_id TEXT PRIMARY KEY,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    result TEXT
  );
  
  CREATE TABLE IF NOT EXISTS task_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT,
    event_type TEXT,
    payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  /* V2 Tables */
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    name TEXT,
    email TEXT UNIQUE,
    email_verified INTEGER DEFAULT 0,
    password_hash TEXT,
    avatar_emoji TEXT DEFAULT "👋",
    is_pro INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    deleted_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS sms_codes (
    phone TEXT PRIMARY KEY,
    code TEXT,
    expires_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    gender TEXT,
    birth_year INTEGER,
    conditions TEXT,
    allergies TEXT,
    avatar_emoji TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    family_member_id TEXT,
    file_path TEXT,
    ocr_text TEXT,
    interpretation_json TEXT,
    severity TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS indicators (
    id TEXT PRIMARY KEY,
    family_member_id TEXT,
    report_id TEXT,
    name TEXT,
    value REAL,
    unit TEXT,
    ref_range TEXT,
    is_abnormal INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    family_member_id TEXT,
    report_id TEXT,
    content TEXT,
    is_auto_extracted INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  /* V3 Tables */
  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    family_member_id TEXT NOT NULL,
    complaint TEXT NOT NULL,
    status TEXT DEFAULT 'planned', -- planned, active, completed
    department_recommended TEXT,
    materials_needed TEXT,
    questions_generated TEXT,
    visit_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS visit_notes (
    id TEXT PRIMARY KEY,
    visit_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    visit_id TEXT,
    family_member_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    parsed_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    family_member_id TEXT NOT NULL,
    name TEXT NOT NULL,
    generic_name TEXT,
    dosage TEXT,
    frequency TEXT,
    start_date TEXT,
    end_date TEXT,
    active INTEGER DEFAULT 1,
    reminder_time TEXT,
    instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    family_member_id TEXT,
    messages_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  /* V5 Auth Tables */
  CREATE TABLE IF NOT EXISTS email_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    purpose TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT,
    success INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  /* V4 Tables */
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    family_member_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT, -- 'alert', 'weekly_report', 'system'
    is_read INTEGER DEFAULT 0,
    action_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS care_reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    family_member_id TEXT NOT NULL,
    title TEXT NOT NULL,
    reminder_type TEXT, -- 'birthday', 'festival', 'followup', 'medication'
    reminder_date TEXT, -- YYYY-MM-DD
    is_lunar INTEGER DEFAULT 0,
    is_handled INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Safe migrations for older schema versions
try { db.exec('ALTER TABLE users ADD COLUMN email TEXT;'); } catch (e) {}
try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT;'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN avatar_emoji TEXT DEFAULT "👋";'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN last_login_at DATETIME;'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN deleted_at DATETIME;'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN is_pro INTEGER DEFAULT 0;'); } catch (e) {}

// Performance indices
try { db.exec('CREATE INDEX IF NOT EXISTS idx_reports_family ON reports(family_member_id);'); } catch (e) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_indicators_family ON indicators(family_member_id);'); } catch (e) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_indicators_report ON indicators(report_id);'); } catch (e) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_medications_family ON medications(family_member_id);'); } catch (e) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);'); } catch (e) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_notes_family ON notes(family_member_id);'); } catch (e) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);'); } catch (e) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_visits_family ON visits(family_member_id);'); } catch (e) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);'); } catch (e) {}



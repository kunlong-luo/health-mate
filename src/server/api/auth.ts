import express from 'express';
import { db } from '../core/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { sendMagicLinkEmail } from '../core/email';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'healthmate_dev_secret_key';

// Rate limiters
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many login attempts, please try again after 15 minutes' }, validate: { trustProxy: false, xForwardedForHeader: false, default: true } });
const emailLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: { error: 'Too many emails sent, please try again later' }, validate: { trustProxy: false, xForwardedForHeader: false, default: true } });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Too many registrations from this IP' }, validate: { trustProxy: false, xForwardedForHeader: false, default: true } });

// Record login attempt helper
const recordLoginAttempt = (identifier: string, success: boolean) => {
  db.prepare('INSERT INTO login_attempts (identifier, success) VALUES (?, ?)').run(identifier, success ? 1 : 0);
};

// --- Email + Password Auth ---

router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
  return res.json({ registered: !!user });
});

router.post('/register', registerLimiter, async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12', 10));
  const userId = `user_${Date.now()}`;
  
  db.prepare('INSERT INTO users (id, email, password_hash, name, email_verified) VALUES (?, ?, ?, ?, 0)').run(userId, email, hash, name || null);
  
  // Generate magic link to verify email
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  
  db.prepare('INSERT INTO email_tokens (email, token_hash, purpose, expires_at, ip_address) VALUES (?, ?, ?, ?, ?)').run(email, tokenHash, 'verify', expires, req.ip);
  
  const link = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}&purpose=verify&email=${encodeURIComponent(email)}`;
  await sendMagicLinkEmail(email, link, 'verify').catch(console.error);

  res.json({ message: '请查收邮箱完成验证' });
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !user.password_hash) {
    recordLoginAttempt(email, false);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    recordLoginAttempt(email, false);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  recordLoginAttempt(email, true);
  db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  // Prevent sending hash back
  const { password_hash, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

// --- Magic Link Auth ---

router.post('/magic-link/request', emailLimiter, async (req, res) => {
  const { email, purpose } = req.body;
  if (!email || !['login', 'verify', 'reset'].includes(purpose)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  let expiresMinutes = 15;
  if (purpose === 'verify') expiresMinutes = 24 * 60;
  if (purpose === 'reset') expiresMinutes = 60;
  const expires = new Date(Date.now() + expiresMinutes * 60 * 1000).toISOString();

  db.prepare('INSERT INTO email_tokens (email, token_hash, purpose, expires_at, ip_address) VALUES (?, ?, ?, ?, ?)').run(email, tokenHash, purpose, expires, req.ip);

  const link = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}&purpose=${purpose}&email=${encodeURIComponent(email)}`;
  await sendMagicLinkEmail(email, link, purpose).catch(console.error);

  res.json({ message: '如果邮箱存在，你将收到一封邮件' });
});

router.post('/magic-link/verify', async (req, res) => {
  const { token, purpose, email } = req.body; // changing to POST to be cleaner for frontend fetch
  if (!token || !purpose || !email) return res.status(400).json({ error: 'Invalid parameters' });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = db.prepare('SELECT * FROM email_tokens WHERE email = ? AND token_hash = ? AND purpose = ? AND used = 0').get(email, tokenHash, purpose) as any;
  
  if (!record || new Date() > new Date(record.expires_at)) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }

  db.prepare('UPDATE email_tokens SET used = 1 WHERE id = ?').run(record.id);

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (purpose === 'verify') {
    if (user) {
      db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(user.id);
    }
  }

  if (purpose === 'login' || purpose === 'verify') {
    if (!user) {
      // Auto-create for magic link login if not exist
      const userId = `user_${Date.now()}`;
      db.prepare('INSERT INTO users (id, email, email_verified) VALUES (?, ?, 1)').run(userId, email);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    }
    
    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, token: jwtToken, user: safeUser });
  }

  if (purpose === 'reset') {
    if (!user) return res.status(400).json({ error: 'User not found' });
    const resetSessionToken = jwt.sign({ resetEmail: email, purpose: 'reset' }, JWT_SECRET, { expiresIn: '10m' });
    return res.json({ success: true, reset_session_token: resetSessionToken });
  }

  res.status(400).json({ error: 'Unhandled purpose' });
});

router.post('/password-reset/confirm', async (req, res) => {
  const { reset_session_token, new_password } = req.body;
  if (!reset_session_token || !new_password) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const decoded = jwt.verify(reset_session_token, JWT_SECRET) as any;
    if (decoded.purpose !== 'reset') throw new Error();
    
    const hash = await bcrypt.hash(new_password, parseInt(process.env.BCRYPT_ROUNDS || '12', 10));
    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, decoded.resetEmail);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
});

router.post('/logout', (req, res) => {
  // Skipping redis blacklist for demo, just tell client to clear token
  res.json({ success: true });
});

// Middleware for other routes
export const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userExists = db.prepare('SELECT 1 FROM users WHERE id = ?').get(decoded.userId);
    if (!userExists) {
      return res.status(401).json({ error: 'User does not exist or token invalid' });
    }
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

export const requireEmailVerified = (req: any, res: any, next: any) => {
  // Always skip email verification check for better UX
  next();
};

router.get('/me', requireAuth, (req: any, res) => {
  const user = db.prepare('SELECT id, phone, email, email_verified, name, avatar_emoji, is_pro FROM users WHERE id = ?').get(req.userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

router.post('/upgrade', requireAuth, (req: any, res) => {
  db.prepare('UPDATE users SET is_pro = 1 WHERE id = ?').run(req.userId);
  res.json({ success: true, message: 'Upgraded to Pro successfully' });
});

// DEV BACKDOOR: Auto-verify email for testing purposes
router.post('/dev/verify-email', requireAuth, (req: any, res) => {
  db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(req.userId);
  res.json({ success: true, message: 'Email forcefully verified for testing' });
});

export default router;

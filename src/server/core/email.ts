import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const provider = process.env.EMAIL_PROVIDER || 'smtp';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_USE_TLS === 'true',
  auth: {
    user: process.env.SMTP_USER || 'demo@ethereal.email',
    pass: process.env.SMTP_PASS || 'demo'
  }
});

const getBaseTemplate = (content: string, preheader: string = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HealthMate</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .logo { font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 24px; }
    .text { font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-block; background-color: #111827; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; text-align: center; font-size: 16px; margin-bottom: 24px; }
    .link-text { font-size: 14px; color: #6b7280; word-break: break-all; margin-bottom: 32px; }
    .footer { font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 24px; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
  <div class="container">
    <div class="logo">HealthMate 🩺</div>
    ${content}
    <div class="footer">
      <p>如果您并未请求此邮件，请安全地忽略它。</p>
      <p>© ${new Date().getFullYear()} HealthMate. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendMagicLinkEmail = async (email: string, link: string, purpose: string) => {
  let title = '';
  let text = '';
  let buttonText = '';
  let preheader = '';

  if (purpose === 'verify') {
    title = '验证您的邮箱地址';
    text = '感谢注册 HealthMate！请点击下方按钮验证您的邮箱地址。';
    buttonText = '验证邮箱';
    preheader = '验证您的邮箱以开始使用';
  } else if (purpose === 'login') {
    title = '登录 HealthMate';
    text = '欢迎回来！请点击下方按钮安全登录到您的账户。此链接在 15 分钟内有效。';
    buttonText = '安全登录';
    preheader = '使用此专属链接安全登录';
  } else if (purpose === 'reset') {
    title = '重置您的密码';
    text = '您可能忘记了登录密码，点击下方按钮设置一个新密码。此链接在 1 小时内有效。';
    buttonText = '重置密码';
    preheader = '重置密码的专属链接';
  }

  const content = `
    <div class="text" style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px;">${title}</div>
    <div class="text">${text}</div>
    <a href="${link}" class="btn" style="color: #ffffff;">${buttonText}</a>
    <div class="link-text">
      或者复制并访问此链接：<br>
      <a href="${link}" style="color: #6b7280;">${link}</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'HealthMate'}" <${process.env.EMAIL_FROM || 'noreply@healthmate.com'}>`,
    to: email,
    subject: title,
    html: getBaseTemplate(content, preheader)
  });
};

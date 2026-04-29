# 邮件服务商配置教程

在 HealthMate 生产环境中，您需要配置 SMTP 邮件服务以发送登录、重置密码和邮箱验证邮件。系统支持所有标准 SMTP 提供商。请参考以下常见服务商的配置指南：

## 1. 163 邮箱（个人/免费）

网易免费邮箱是国内最易获取的 SMTP 提供商之一。

**开通步骤：**
1. 登录 163 网页版邮箱 (mail.163.com)。
2. 点击顶部导航栏的 **设置** -> **POP3/SMTP/IMAP**。
3. 勾选并开启 **SMTP服务**。
4. 系统可能会要求您进行手机号验证。验证后，您将获得一个 **授权码**。请勿泄露此授权码。

**环境变量配置 (`.env`):**
\`\`\`env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=您的163邮箱@163.com
SMTP_PASS=上面的授权码(非邮箱登录密码)
SMTP_USE_TLS=true
EMAIL_FROM=您的163邮箱@163.com
EMAIL_FROM_NAME=HealthMate
\`\`\`

---

## 2. QQ 企业邮箱（免费版/专业版）

腾讯企业邮支持更好的发信到达率。

**开通步骤：**
1. 登录腾讯企业邮箱管理员后台。
2. 前往**我的企业** -> **安全与管理** -> 开启客户端 SMTP 服务。
3. 登录用于发信的专属邮箱账号，进入**设置** -> **客户端设置**。
4. 生成**客户端专用密码**。

**环境变量配置 (`.env`):**
\`\`\`env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=noreply@您的域名.com
SMTP_PASS=客户端专用密码
SMTP_USE_TLS=true
EMAIL_FROM=noreply@您的域名.com
EMAIL_FROM_NAME=HealthMate
\`\`\`

---

## 3. SendGrid (海外/API 触发推荐)

如果您希望主要服务海外用户或拥有更好的送达率监控，SendGrid 是最好的提供商。

**开通步骤：**
1. 注册 SendGrid 账号 (sendgrid.com)。
2. 在左侧导航前往 **Settings** -> **Sender Authentication**，添加您的独立域名并完成 DNS 解析 (CNAME 记录)。
3. 前往 **Settings** -> **API Keys**，创建一个新的 API Key（权限至少包含 Mail Send）。

**环境变量配置 (`.env`):**
*注意：SendGrid 虽然提供 API，但也可以直接走 SMTP 通道。*
\`\`\`env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=465
SMTP_USER=apikey   # 固定填 'apikey'
SMTP_PASS=您的SendGrid_API_Key
SMTP_USE_TLS=true
EMAIL_FROM=验证过的发件域名邮箱
EMAIL_FROM_NAME=HealthMate
\`\`\`

---

> **温馨提示**: 为了防止被判定为垃圾邮件，强烈建议您配置发信域名的 SPF、DKIM 和 DMARC 记录。

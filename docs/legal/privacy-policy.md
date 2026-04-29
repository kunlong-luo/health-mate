# 隐私政策 (Privacy Policy)

**生效日期 / Effective Date**: 2026-04-29
**版本 / Version**: 1.0

欢迎使用 HealthMate。保护隐私与数据安全是我们的立身之本。本《隐私政策》详细阐明了我们如何收集、使用、存储及保护您的信息。

Welcome to HealthMate. Protecting your privacy and data security is our foundation. This *Privacy Policy* details how we collect, use, store, and protect your information.

---

## 1. 我们收集哪些信息 / What Information We Collect

### 1.1 账户信息 (Account Information)
- 邮箱地址 (Email address)
- 密码加密散列 (Password hash)
- 您的昵称/姓名 (Nickname/Name)
- 手机号码（可选提供）(Phone number, optional)

### 1.2 医疗与健康数据 (Medical & Health Data)
- 您主动上传的化验单图片、OCR 提取文字及 AI 解读结果。
- 您为本人或家人建立的健康档案。
- 就诊记录、用药记录、备忘录与私人笔记。
*(此部分敏感信息采用加强型加密与权限隔离)*

### 1.3 使用数据 (Usage Data)
- 您的操作日志及请求时间。
- 崩溃与错误日志。
- 设备标识与系统信息、IP 地址等（用于安全侦测）。

### 1.4 我们 **不** 收集支付信息 (Payment Info NOT Collected)
所有的支付数据（如信用卡号、微信/支付宝账号等）均由第三方合规支付平台直接处理与获取，我们的服务器概不接触或留存完整的支付卡信息。

*(Bilingual definitions equivalent to the Chinese headers, transparent and compliant)*

---

## 2. 我们如何使用信息 / How We Use Information

- **提供核心服务 (Providing Core Services)**：为您建立档案、处理 OCR 以及提供医疗辅助梳理体验属于必要使用情形。
- **改进服务 (Improving Services)**：我们可能通过对数据进行完全的脱敏化与匿名化处理，计算总体指标来优化使用体验。
- **客服支持 (Customer Support)**：协助您排查账户或技术问题。
- **法律合规 (Legal Compliance)**：如发生欺诈防范、风险排查或必须满足法律诉讼时的合规义务。

---

## 3. 信息共享情况（绝不出售） / Information Sharing (Never Sold)

我们郑重承诺，**默认情况下不将您的任何信息共享给第三方机构，且坚决不出售您的数据**。以下为合理合法的数据流动环节：

3.1 **LLM（大语言模型）服务供应商**
由于涉及云端解析化验单，在您主动发起 AI 解析时，相关的 OCR 文本将被发送给底层 LLM 服务提供商（如 DeepSeek / 通义千问 / Anthropic Claude）。以上请求受严格的数据保密协议约束，并限制用于训练模型。
您可以查阅供应商的隐私政策（具体链接参见其官网）。
3.2 **基础设施服务商**
您的数据驻留在国内云服务器（如阿里云/腾讯云），相关邮件投递采用安全 SMTP 服务商。
3.3 **法律要求**
仅在合法传唤、逮捕令、法庭命令或防范紧急人身伤害需要时，我们会向相关执法机构披露数据。

We solemnly promise that **by default we do not share any of your information with third-party organizations, and firmly do not sell your data**. Authorized data flow includes cloud LLM providers, infrastructure vendors, and strict legal compliance scenarios.

---

## 4. 数据存储与安全 / Data Storage and Security

4.1 **存储位置**：所有用户的主体数据均存储在中国大陆境内的服务器中。
4.2 **加密技术**：所有传输链路皆启用 `TLS 1.2/1.3`。数据库敏感落库字段（API Key 等）使用强加密标准（如 `AES-256`）。用户密码仅采用单向散列技术存储（如 `bcrypt/Argon2`）。
4.3 **最小原则与控制**：建立严格的后台访问白名单权限，秉持最小权限原则；我们承诺不对 Pro 用户强制搜集无关隐私。
4.4 **安全响应**：若发生安全事件致使数据泄露，我们将在发现的 72 小时内以邮件等路径向您及监管方通告。

4.1 **Storage Location**: All main data is stored on servers located within mainland China.
4.2 **Encryption**: Transmission links use TLS. Sensitive database fields use strong encryption (e.g., AES-256). Passwords use one-way hashing (e.g., bcrypt).

---

## 5. 数据保留期 / Data Retention Period

5.1 只要您的账户保持有效，我们将保留您的信息以便提供服务。
5.2 当您主动删除或注销后，我们通常具备最多 **30 天的宽限期/冷备周转期**，超过 30 天后，我们将在生产库和所有备份节点上**永久抹除**该用户的痕迹。
5.3 涉及因财税或合规留存的底单据除外（按照法律保留期限）。

Information is kept as long as the account is active. Upon account deletion, after a maximum 30-day grace period, all identifiable footprint will be securely and permanently wiped from databases and backups.

---

## 6. 您的权利 (PIPL 用户权利) / Your Rights (PIPL)

根据《中华人民共和国个人信息保护法》，您拥有以下绝对权利并可以通过应用内功能直接行使：
- **知情权与决定权**：您有权知晓我们收集了哪些数据，并自由同意或拒绝。
- **查询权**：前往「设置-账户信息」及「我的档案」查看所有数据。
- **复制与导出权**：我们提供您打包导出本地所有的医疗记录的数据格式能力。
- **更正权**：前往相应的功能页编辑修改不准确的数据。
- **删除权（被遗忘权）**：可以在「设置-高级」页面点击注销或删除档案文件。
- **撤回同意权**：前往「系统设置」剥夺我们的部分授权。
- **投诉权**：如不满意处理，有权向网信办等监管机构进行申诉。

You possess robust rights including rights to be informed, access, export, modify, delete (right to be forgotten), withdraw consent, and lodge complaints. All executable directly in account settings.

---

## 7. Cookie 及同类技术 / Cookies and Tracking

7.1 我们仅使用必要的 Session Cookies 维护您的登录会话与基础状态。
7.2 **不使用**任何第三方行为追踪或商业营销 Cookie 来刻画您的网络画像。

We solely use necessary Session Cookies to maintain logins. **No** third-party tracking or behavioral profiling cookies are implemented.

---

## 8. 未成年人保护 / Minors Protection

8.1 本应用不主动面向 13 岁以下的儿童提供服务。
8.2 如果 18 岁以下的未成年人使用我们的服务，必须事先取得监护人的书面或等效同意。
8.3 严禁在未经监护权的情况下单独收集未成年人的直接医疗数据。若我们偶然获悉，将主动快速予以删除。

This application is not proactively oriented for children under 13. Minors under 18 must use it under guardian consent. We do not solo-collect minors' medical data without guardian involvement.

---

## 9. 涉及跨境传输的情况 / Cross-Border Data Transfer

9.1 默认情况下，中国大陆用户的全部信息流转均在**境内**闭环完成。
9.2 如果您在使用 LLM 服务中，自行在系统设置里主动选配或指定了海外模型渠道（例如：Anthropic Claude / OpenAI），则代表您**明示同意并知晓**：相关 OCR 解析后的文本数据将被传输至境外服务器进行推理处理（此类模型商也承诺不作持久化落库训练，但受限于出境原则）。

By default, all Chinese user data flow completes domestically. If you explicitly choose overseas models (e.g., Claude) in settings, you acknowledge and agree that specific parsed texts will be transferred to overseas servers for processing.

---

## 10. 政策变更与联系我们 / Changes and Contact

10.1 我们不时可能调整本政策，发生如控制权变更、数据共享路径变化等重大变更时，将至少提前 30 天向您进行告知。不接受变更的用户有权在此期间终止服务。
10.2 若您有隐私相关疑问（例如要求行使删除权而遇到操作阻碍），请联系：
- 专属隐私合规邮箱 (Privacy Email): privacy@healthmate.com
- 我们专门设立了数据保护责任人进行受理。

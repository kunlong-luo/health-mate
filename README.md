# HealthMate 🩺

[English](#english) | [中文](#中文)

---

<a name="english"></a>
## HealthMate - Proactive Family Health AI Assistant

> An AI-powered proactive family health management tool. From solving the pain point of "helping children understand parents' medical reports" to evolving into a comprehensive platform including OCR-assisted lab report analysis, prescription medication management, medical visit diaries (with voice-to-text), offline-native PWA experience, and a proactive early-warning system.

### Key Features (PWA Production Ready)

1. **Offline PWA Native Experience**: Works offline (e.g., in hospital basements) so you can always check your family's medical history.
2. **Proactive AI Watchdog**: Automatically monitors anomaly trends and medication run-out dates.
3. **Multi-Agent RAG Engine**: Simulated 3-Tier Multi-Modal RAG architecture (General Knowledge -> Family Timeline -> Personal Notes).
4. **Privacy First**: Fully local capabilities with Ollama support + End-to-End Encryption principles built-in.

### Quick Start
```bash
npm install
npm run dev
```

---

<a name="中文"></a>
## 中文说明

> 一款基于大语言模型构建的**主动式家庭健康管理工具**。从“帮子女看懂一份检查报告”的单点痛点切入，演进为涵盖化验单OCR辅助、处方药管理、就诊日记（伴随录音听写）、离线原生 PWA 体验与主动式自动预警系统。

## V5 极致发布版更新亮点 (生产环境 PWA 化)

**架构演进与商业化 (生产准备就绪)**：
1. **极致 PWA 原生体验**：
   - 引入 `vite-plugin-pwa` 实现多设备（iOS/Android/Desktop）离线框架。在无网环境（如医院负一层）也可查看历史病历。
   - 实现智能按需安装引导组件 (`PWAPrompt`)，无缝获取原生应用体验。
2. **Pro 终身买断机制与数据安全**：
   - 提供免费纯本地无限制版，与 ¥199 Pro 云端高阶买断版的双向商业闭环。
   - 提供端到端加密（E2EE）指导原则，附带完整的合法文书：《隐私政策》《用户协议》《医疗免责声明》以便正规合法上线。
3. **交付级基建沉淀**：
   - 内置生产级 `docker-compose.yml` 指南与 GitHub Action `main.yml` CI/CD 自动化部署流。

---

## Agent 框架架构说明

由于环境限制在 Node.js 中运行，本系统采用 **TypeScript + 自研 ReAct 模式** 实现了所需的 Agent 编排器（详见 \`src/server/agent/orchestrator.ts\`）。
- **ReAct 引擎**: 基于自执行 while 循环构建，实现（Reason -> Act -> Observe），通过多轮迭代(最多 8 轮)完成逻辑抽象。
- **流式输出 (SSE)**: 后端提供 SSE 端点，前端实时截获 \`step_start\`, \`tool_call\`, \`tool_result\`, \`thinking\` 以及 \`final\` 事件进行沉浸式思考过程的渲染。
- **动态工具注入**: 利用 AI SDK Core 的 Function Calling 系统调用 8 个专门定制的工具。

## 三层 RAG 设计文档

本系统模拟了三层 RAG 检索引擎：
- **L1 (通用医学知识 - 已实装)**: 针对 \`data/medical_kb.json\` 和 \`data/lab_norms.json\` 进行快速匹配。
- **L2 (家庭档案 - V2实装)**: 用户专属多成员医疗历史时间线串联（\`search_family_history\`、\`query_lab_history\`）。
- **L3 (笔记记忆 - V2实装)**: 提取用户的照护日记或额外特征（\`search_personal_notes\`、\`save_note\`）。

## 腾讯云短信申请教程 (模拟配置)
本项目支持轻量手机+验证码登录。在生产环境中，可集成腾讯云 SMS：
1. 注册腾讯云账号并开通“短信”服务。
2. 创建签名（如：HealthMate）和模板（如：您的登录验证码是 {1}，5分钟内有效）。
3. 安装腾讯云 SDK \`tencentcloud-sdk-nodejs\` 并替换 \`src/server/api/auth.ts\` 中的打印日志逻辑。
*(当前开发环境默认将所有验证码 mock 为 \`123456\` 便于测试)*

## JWT 配置说明
由于环境未提供全功能的 python-jose，V2 中端切换至 Node.js 的 \`jsonwebtoken\` 加密鉴权。
1. 若要配置生产密钥，请在根目录新建 \`.env\` 文件。
2. 填写字段: \`JWT_SECRET=your_super_secret_key_here\`。
3. 未配置则默认 \`healthmate_dev_secret_key\`，过期时间7天。可通过请求带 \`Authorization: Bearer <token>\` 访问安全接口。

## V1 → V2 数据迁移流程演示
若您曾在 V1 (无登录本地版) 积攒了多份报告，系统在您首次登录进入**全家历史解读**页 (`/history`) 时，将自动出现一条迁移横幅。
点击**立即同步**，并选择“这是属于哪位家人的档案”，旧的 IndexedDB 报告及化验指标将批量转化推送到服务端进行中心化聚合和趋势绘图。无缝切换到 V2！

## 三层 RAG 检索示例日志
在 Agent 思考中，您可以实时观察到类似以下的调用顺序模拟了三层 RAG 多模态融合引擎：
1. `ocr_parse_lab_report` -> 读取报告图片
2. `query_member_profile` -> 获取用户 L2 长期基础设定 (e.g. 55岁男，有高血压病史)
3. `query_lab_history` / `search_family_history` -> 对比 3个月前的 ALT 值 (L2)
4. `search_personal_notes` -> “搜索关键词：胸闷/用药反馈” (L3 唤醒)
5. `analyze_indicator` -> 进行 L1 的单一指标横向排查
6. 最终完成 JSON 的输出决策。

## 8 个核心工具的详细说明

1. \`ocr_parse_lab_report\`: 接收用户图片文件路径，利用 tesseract.js 对化验单影像进行 OCR 文本抽取解析。
2. \`query_lab_norms\`: 基于抽取的指标 (如 ALT, AST)，直接检索本地 \`data/lab_norms.json\` 获取预制的指标、单位、阈值等结构化信息。
3. \`search_medical_kb\`: 针对患者疑似病症或深层医学原理提问，自 \`data/medical_kb.json\` 执行关键词打分匹配找回相关文档。
4. \`analyze_indicator\`: 让环境模型针对单一数据的数值与参考阈值进行逻辑诊断。
5. \`detect_critical_symptoms\`: 在 Agent 首先执行此工具，扫描危险标志（大出血、意识丧失），任何警告将直接输出到急救横幅提示中。
6. \`assess_severity\`: 综合多条异常化验指标，评估得出中度/重度提示报告。
7. \`generate_doctor_questions\`: 面向 35-50 岁子女人群生成针对父母报告可以直接拿去实体医院请教医生的提问列表。
8. \`generate_wechat_message_for_doctor\`: 沉淀为一小段适合微信发送的、凝练了患者异常数据的请教口吻文案。

## V4 升级指南（主动 Agent + 智能预警）

### 周报触发与测试方法
1. 后端由 `node-cron` 调度，任务定义位于 `src/server/agent/proactive.ts`。
2. 默认周报触发时间为 `0 8 * * 1`（每周一上午8点）。
3. **测试技巧**：在开发环境下，可以临时将 cron 表达式改写为 `* * * * *`（每分钟执行一次）或编写一个专用 HTTP endpoint 来手动触发 `generate_weekly_report` 工具和邮件发送逻辑。

### 主动 Agent 调试方法
1. 主动扫描同样基于定时任务 `0 3 * * *`（每天凌晨3点）。
2. 在 `proactive.ts` 中可以查看模拟打分的逻辑（或接入大模型 `system prompt` 判断指标是否连续异常）。
3. 当命中异常后，Agent 会将 `notification` 写入表，通过客户端顶部小红点（左侧导航消息图标）以及独立的消息盒子（`/notifications`）触达用户。不主动通过短信/Push打扰父母，符合“应用主动找子女”定位。

### 多媒体处理性能调优
1. **语音输入**：就诊伴侣模块下，使用了 Web Speech API 进行流式听写，转写在本地和浏览器环境实时发生。
2. **长图导出**：年度健康报告使用 `html2canvas` 导出时，设置了 `scale: 2` 参数，保证分享长图至朋友圈时的清晰度。
3. **工具矩阵拓展**：Agent 工具集从原本的 25 个扩展至 35+ 个，完整覆盖 `predict_medication_runout`, `detect_anomaly_in_history`, `analyze_indicator_trend` 等主动型防患预警原子能力。

## 5 分钟快速启动

本系统为 V1 预览应用，并遵循 Cloud Run 运行规范。通过 Express 中间件挂载了 Vite 前端。
1. 启动命令（开发环境支持自动全栈重启）: \`npm run dev\`
2. 系统自动绑定全栈静态中间件。 

## Provider 与本地配置教程

默认已使用 **Google Gemini (AI Studio内置)** 作为云端模式驱动（免费调用）。通过 SettingsPage 设置页可以切换到其他模型驱动。因环境限制部分 Node 本机编译模块，大模型端点全部采取标准兼容 REST API：
1. **Ollama 本地模式**: 确保您本机或者运行载体开放了 API \`http://127.0.0.1:11434/v1\`，选中为 \`qwen2.5:7b\` 等您本机的模型。（您需要自行部署 Ollama 和对应模型）。
2. **三方云端提供商注册链**:
    - **DeepSeek**: [注册并获取 API Key](https://platform.deepseek.com/)
    - **通义千问**: [注册 DashScope 并获取 API Key](https://dashscope.aliyun.com/)
    - **Claude**: [注册 Anthropic 开发者获取 API Key](https://console.anthropic.com/)

在应用配置页面（左侧 "设置" 导航）可填写您的密钥及端点。密钥只加密保存在后端的 \`data/healthmate.db\` 内。

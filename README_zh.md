# HealthMate 🩺

[**🇬🇧 English Version -> README.md**](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

<img width="2560" height="1600" alt="screenshot" src="https://github.com/user-attachments/assets/1b28e3dc-e171-4a30-befb-02f18ac31d67" />

## 🌟 中文说明 (HealthMate)

> 一款基于大语言模型构建的**主动式家庭健康管理工具**。从“帮子女看懂一份检查报告”的单点痛点切入，演进为涵盖化验单OCR辅助、处方药管理、就诊日记（伴随录音听写）、离线原生 PWA 体验、国际化多语言与主动式自动预警系统。

### 🚀 最新 V6 国际化发布版更新亮点 (V6 International Release)

1. **🌐 全面国际化 (i18n)**：支持中英双语 (English / 中文) 自由切换，覆盖全部 UI、医疗提示、错误反馈及预警系统。
2. **⚖️ 生产级合规与免责协议**：新增《免责声明与隐私政策》组件，强化医疗建议免责提示，保障系统出海与上线的合规性。
3. **⚙️ 全局灵活设置**：全新设计的平台级设置页面，支持动态切换系统语言以及随时调整底层驱动模型大语言模型 (如 Gemini, Claude, Ollama)。
4. **🎨 UI/UX 体验再升级**：进一步优化了无边框极简风格与触觉反馈，为家庭长辈和不同语言的用户提供更平滑的沉浸感。

### 🧠 核心技术与原理解析 (Agent, RAG, OCR)

HealthMate 是如何把一张模糊、杂乱的化验单单转化为清晰、个性化的健康建议的？这背后离不开三大核心技术的无缝协作：**OCR（光学字符识别）**、**三层 RAG（检索增强生成）引擎** 以及 **Agent（智能体与 ReAct 编排器）**。

下面为您通俗清晰地讲解完整的工作流程：

#### 👁️ 第一步：系统的“眼睛” (OCR 图像提取)
当用户拍摄或上传一张化验单照片时，系统首先要“看懂”图片。我们利用本地化、隐私安全的 OCR 技术（加载经过训练的中英文识别包），扫描图片并提取出非结构化的纯文本。这一步把图片变成了 AI 可以认识的“项目名称”和“数值”。

#### 📚 第二步：系统的“记忆” (三层 RAG 检索体系)
RAG（Retrieval-Augmented Generation）就像是给 AI 提供开卷考试的资料，防止它胡说八道（产生幻觉）。我们设计了独特的**三层 RAG 架构**：
- **L1 (通用医学字典)**：当 OCR 提取到“谷丙转氨酶(ALT)”时，系统通过 RAG 快速去本地医学知识库（`lab_norms.json`）中检索，看这个数值在患者目前的年龄和性别下是否超标。
- **L2 (家庭时间线档案)**：相当于“家庭病历本”。系统会主动去数据库里查患者**过去**的历史化验单。AI 会对比：“今天的 ALT 是 55，那三个月前是多少？”
- **L3 (个人备忘录)**：相当于“照护日记”。系统会从用户的日常就诊日记、备忘中检索线索（如：“上周帮爸爸记录了头晕”），为诊断提供极具个性化的上下文。

#### 🤖 第三步：系统的“大脑” (Agent 与 ReAct 框架)
有了文字和记忆，AI 是如何思考的？我们在后端实现了一个基于 **ReAct (Reason推理 + Act行动)** 模式的 **Agent 编排器**。
AI 不会只凭一句话直接盲目作答，而是进入一个像人类思考一样的循环：
1. **🤔 思考 (Thought)**：“我拿到了化验单文字，我需要先查一下正常的 ALT 参考值。”
2. **🛠️ 行动 (Act / 工具调用)**：调用 `query_lab_norms` 工具获取正常阈值。
3. **👀 观察 (Observe)**：工具返回“正常 0-40，目前 55，偏高。”
4. **🤔 思考 (Thought)**：“偏高。那我需要查一下他以前有没有偏高。”
5. **🛠️ 行动 (Act)**：调用 `query_lab_history` 工具获取历史数据。
6. **👀 观察 (Observe)**：“发现三个月前是 70。”
7. **✅ 最终决策 (Final)**：“虽然 ALT 偏高，但在好转，评价为中度异常，并给出日常保养建议。”

通过这种动态的方法调用（Function Calling）和推理循环（最多可达8轮深思），AI 做出了高度准确、极具针对性的判断。同时，这个“思考过程”会通过 SSE 服务端推流技术，实时、动感地打字展示在前端界面上，让用户不仅得到结果，更看懂 AI 诊断的整个思路。

### ✨ 核心特性 (生产准备就绪)

1. **📱 极致 PWA 原生体验**: 支持离线访问，在无网环境（如医院负一层）也可查看历史病历。
2. **🔔 主动式 AI 预警**: 自动监控异常趋势与处方药余量，提前提醒。
3. **💬 多模态 RAG 引擎**: 实装三层 RAG 架构（通用知识 -> 家庭时间线 -> 个人笔记）。
4. **🛡️ 隐私优先**: 完全支持本地运行（Ollama）并附加端到端加密（E2EE）指导原则。

### 📁 项目结构 (Project Structure)

```text
HealthMate/
├── data/                  # 本地数据库与医疗知识库 (SQLite & JSON)
│   ├── drug_interactions_kb.json
│   ├── lab_norms.json
│   ├── medical_kb.json
│   └── healthmate.db
├── docs/                  # 开发文档、截图与法律声明模板
│   ├── screenshot.png     # <== 首页截图存放处
│   └── ...
├── src/
│   ├── components/        # React 组件 (包括合规弹窗 LegalModal 等)
│   ├── context/           # 全局状态管理 (权限与 Auth 等)
│   ├── lib/               # 核心工具类 (i18n语言包等)
│   ├── locales/           # i18n 国际化语言包翻译 (en/zh)
│   ├── pages/             # 核心路由页面 (主页、诊断历史、设置页 SettingsPage 等)
│   └── server/            # Node.js + Express 后端服务 (Agent 大脑所在地)
│       ├── agent/         # RAG 与 ReAct AI 智能体编排器
│       ├── api/           # 前后端交互 API 路由
│       └── tools/         # 8核心 Agent 插件工具集
├── vite.config.ts         # Vite 前端构建与 PWA 配置
├── server.ts              # Node 服务主入口
└── package.json           # 项目依赖与 Scripts
```

### 🧩 Agent 框架架构说明

由于环境限制在 Node.js 中运行，本系统采用 **TypeScript + 自研 ReAct 模式** 实现了所需的 Agent 编排器（详见 `src/server/agent/orchestrator.ts`）。
- **流程引擎**: 基于自执行 while 循环构建，实现（Reason -> Act -> Observe），通过多轮迭代完成逻辑抽象。
- **流式输出 (SSE)**: 后端提供 SSE 端点，前端实时截获事件进行沉浸式思考过程的渲染。
- **动态工具注入**: 利用 AI SDK Core 的 Function Calling 系统调用 8 个定制化的工具。

### 🧰 8 个核心工具的详细说明

1. `ocr_parse_lab_report`: 利用 OCR 对化验单影像进行文本抽取解析。
2. `query_lab_norms`: 检索本地化验指标、单位、阈值等结构化信息。
3. `search_medical_kb`: 针对患者病症执行关键词打分找回相关文档。
4. `analyze_indicator`: 针对单一数值与阈值进行逻辑诊断。
5. `detect_critical_symptoms`: 扫描危险标志，任何警告直接输出到急救横幅提示。
6. `assess_severity`: 综合异常指标，评估得出中度/重度提示报告。
7. `generate_doctor_questions`: 生成可向实体医院医生请教的提问列表。
8. `generate_wechat_message_for_doctor`: 生成适合微信发送的凝练请教口吻文案。

### 🔧 快速启动

```bash
npm install
npm run dev
```

### ☁️ Provider 与本地配置教程

默认已使用 **Google Gemini** 作为云端模式驱动（免费调用）。
1. **Ollama 本地化**: 在设置页修改大模型端点至本地推理服务接口。
2. **三方云端支持**: 支持 DeepSeek、通义千问 和 Claude，通过平台自行申请 API Key 并在应用设置页填入。密钥只加密保存在你的本地浏览器中。

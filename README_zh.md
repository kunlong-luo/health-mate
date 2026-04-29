# HealthMate 🩺

[**🇬🇧 English Version -> README.md**](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## 中文说明 (HealthMate)

> 一款基于大语言模型构建的**主动式家庭健康管理工具**。从“帮子女看懂一份检查报告”的单点痛点切入，演进为涵盖化验单OCR辅助、处方药管理、就诊日记（伴随录音听写）、离线原生 PWA 体验与主动式自动预警系统。

### 核心技术与原理解析 (Agent, RAG, OCR)

HealthMate 是如何把一张模糊、杂乱的化验单单转化为清晰、个性化的健康建议的？这背后离不开三大核心技术的无缝协作：**OCR（光学字符识别）**、**三层 RAG（检索增强生成）引擎** 以及 **Agent（智能体与 ReAct 编排器）**。

下面为您通俗清晰地讲解完整的工作流程：

#### 第一步：系统的“眼睛” (OCR 图像提取)
当用户拍摄或上传一张化验单照片时，系统首先要“看懂”图片。我们利用本地化、隐私安全的 OCR 技术（加载经过训练的中英文识别包），扫描图片并提取出非结构化的纯文本。这一步把图片变成了 AI 可以认识的“项目名称”和“数值”。

#### 第二步：系统的“记忆” (三层 RAG 检索体系)
RAG（Retrieval-Augmented Generation）就像是给 AI 提供开卷考试的资料，防止它胡说八道（产生幻觉）。我们设计了独特的**三层 RAG 架构**：
- **L1 (通用医学字典)**：当 OCR 提取到“谷丙转氨酶(ALT)”时，系统通过 RAG 快速去本地医学知识库（`lab_norms.json`）中检索，看这个数值在患者目前的年龄和性别下是否超标。
- **L2 (家庭时间线档案)**：相当于“家庭病历本”。系统会主动去数据库里查患者**过去**的历史化验单。AI 会对比：“今天的 ALT 是 55，那三个月前是多少？”
- **L3 (个人备忘录)**：相当于“照护日记”。系统会从用户的日常就诊日记、备忘中检索线索（如：“上周帮爸爸记录了头晕”），为诊断提供极具个性化的上下文。

#### 第三步：系统的“大脑” (Agent 与 ReAct 框架)
有了文字和记忆，AI 是如何思考的？我们在后端实现了一个基于 **ReAct (Reason推理 + Act行动)** 模式的 **Agent 编排器**。
AI 不会只凭一句话直接盲目作答，而是进入一个像人类思考一样的循环：
1. **思考 (Thought)**：“我拿到了化验单文字，我需要先查一下正常的 ALT 参考值。”
2. **行动 (Act / 工具调用)**：调用 `query_lab_norms` 工具获取正常阈值。
3. **观察 (Observe)**：工具返回“正常 0-40，目前 55，偏高。”
4. **思考 (Thought)**：“偏高。那我需要查一下他以前有没有偏高。”
5. **行动 (Act)**：调用 `query_lab_history` 工具获取历史数据。
6. **观察 (Observe)**：“发现三个月前是 70。”
7. **最终决策 (Final)**：“虽然 ALT 偏高，但在好转，评价为中度异常，并给出日常保养建议。”

通过这种动态的方法调用（Function Calling）和推理循环（最多可达8轮深思），AI 做出了高度准确、极具针对性的判断。同时，这个“思考过程”会通过 SSE 服务端推流技术，实时、动感地打字展示在前端界面上，让用户不仅得到结果，更看懂 AI 诊断的整个思路。

### 核心特性 (生产准备就绪)

1. **极致 PWA 原生体验**: 支持离线访问，在无网环境（如医院负一层）也可查看历史病历。
2. **主动式 AI 预警**: 自动监控异常趋势与处方药余量，提前提醒。
3. **多模态 RAG 引擎**: 实装三层 RAG 架构（通用知识 -> 家庭时间线 -> 个人笔记）。
4. **隐私优先**: 完全支持本地运行（Ollama）并附加上述端到端加密（E2EE）指导原则。

### V5 极致发布版更新亮点 (生产环境 PWA 化)

**架构演进与商业化 (生产准备就绪)**：
1. **极致 PWA 原生体验**：
   - 引入 `vite-plugin-pwa` 实现多设备（iOS/Android/Desktop）离线框架。
   - 实现智能按需安装引导组件 (`PWAPrompt`)，无缝获取原生应用体验。
2. **Pro 终身买断机制与数据安全**：
   - 提供免费纯本地无限制版，与 ¥199 Pro 云端高阶买断版的双向商业闭环。
   - 提供端到端加密（E2EE）指导原则，附带完整的合法文书以支持正规上线。
3. **交付级基建沉淀**：
   - 内置生产级 `docker-compose.yml` 指南与 GitHub Action `main.yml` CI/CD 自动化部署流。

### Agent 框架架构说明

由于环境限制在 Node.js 中运行，本系统采用 **TypeScript + 自研 ReAct 模式** 实现了所需的 Agent 编排器（详见 `src/server/agent/orchestrator.ts`）。
- **ReAct 引擎**: 基于自执行 while 循环构建，实现（Reason -> Act -> Observe），通过多轮迭代完成逻辑抽象。
- **流式输出 (SSE)**: 后端提供 SSE 端点，前端实时截获事件进行沉浸式思考过程的渲染。
- **动态工具注入**: 利用 AI SDK Core 的 Function Calling 系统调用 8 个专门定制的工具。

### 腾讯云短信申请教程 (模拟配置)

本项目支持轻量手机+验证码登录。在生产环境中，可集成腾讯云 SMS：
1. 注册腾讯云账号并开通“短信”服务。
2. 创建签名和模板。
3. 安装腾讯云 SDK 并替换 `src/server/api/auth.ts` 中的逻辑。
*(当前开发环境默认将所有验证码 mock 为 `123456` 便于测试)*

### JWT 配置说明

1. 若要配置生产密钥，请在根目录新建 `.env` 文件。
2. 填写字段: `JWT_SECRET=your_super_secret_key_here`。
3. 未配置则默认 `healthmate_dev_secret_key`。

### V1 → V2 数据迁移流程演示

若您曾在 V1 (无登录本地版) 积攒了多份报告，系统在您首次登录进入**全家历史解读**页 (`/history`) 时，将自动出现迁移横幅。点击**立即同步**，旧数据即可推送至服务端并无缝切换至 V2。

### 8 个核心工具的详细说明

1. `ocr_parse_lab_report`: 利用 OCR 对化验单影像进行文本抽取解析。
2. `query_lab_norms`: 检索本地化验指标、单位、阈值等结构化信息。
3. `search_medical_kb`: 针对患者病症执行关键词打分找回相关文档。
4. `analyze_indicator`: 针对单一数值与阈值进行逻辑诊断。
5. `detect_critical_symptoms`: 扫描危险标志，任何警告直接输出到急救横幅提示。
6. `assess_severity`: 综合异常指标，评估得出中度/重度提示报告。
7. `generate_doctor_questions`: 生成可向实体医院医生请教的提问列表。
8. `generate_wechat_message_for_doctor`: 生成适合微信发送的凝练请教口吻文案。

### V4 升级指南（主动 Agent + 智能预警）

1. **周报触发**: 后端由 `node-cron` 调度，任务位于 `src/server/agent/proactive.ts`。默认时间每周一上午8点。
2. **主动扫描调试**: 同样基于定时任务，命中异常后写入表，通过客户端红点和独立消息盒子触达用户，不主动强打扰父母。
3. **多媒体性能调优**: 语音听写使用 Web Speech API，长图导出加入高清优化。

### 快速启动
```bash
npm install
npm run dev
```

### Provider 与本地配置教程

默认已使用 **Google Gemini** 作为云端模式驱动（免费调用）。
1. **Ollama 本地模式**: 修改大模型端点至本地推理服务接口。
2. **三方云端提供商**: 支持 DeepSeek、通义千问 和 Claude，通过平台自行申请 API Key 并在应用设置页填入。密钥只加密保存在本地轻量数据库中。

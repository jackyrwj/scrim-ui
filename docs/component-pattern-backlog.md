# Component & Pattern backlog

记录 Scrim UI 下一阶段要补齐的 AI-native components 与 patterns。

这份清单只定义产品范围与推荐执行顺序，不代表已经开始实现。执行时应逐项完成组件、展示页、注册信息、可访问性状态和验证，不要一次性并行铺开全部目录。

## 当前基线

- Components：55 个已发布（51 Free + 4 Pro）
- Patterns：5 个（AI Chat、Research Assistant、Coding Agent、Voice Assistant、Model & Memory Preferences）
- 已覆盖：输入、消息、推理、工具调用、引用、Agent、评测、文件与上下文、记忆、模型设置、语音、安全与拒绝
- 当前主要问题不是组件数量不足，而是部分高频流程尚未闭环，且完整 patterns 偏少

## 产品边界

- 继续坚持 AI-native depth，不补 Button、Modal、Tabs、Toast、Skeleton 等通用 UI primitives。
- Loading、empty、error、disabled、mobile、keyboard 和 reduced-motion 应作为相关组件的状态或 variant，而不是独立目录项。
- Free component 解决一个下午内可以独立完成、但会被大量 AI 产品重复实现的界面问题。
- Pro component 只用于那些看似简单、实际包含复杂状态模型或大量边界条件的问题。
- Pattern 是完整的一屏或主要工作区，用现有 components 组合，不能只是放大的单组件 demo。
- Pattern 与 Pro template 可以表现同一业务场景，但必须保持清晰分工：Pattern 是单文件 UI 参考，Template 是带真实数据流和工程架构的可运行产品起点。

## 推荐执行顺序

1. Conversation Sidebar / History component
2. Response Versions / Message Branch component
3. Artifact / Output Preview component
4. Artifact Workspace pattern
5. Context Picker component
6. Document Q&A / RAG Workspace pattern
7. Structured Extraction & Review pattern
8. Generated Media Result component
9. Image Generation Studio pattern
10. Agent Run Timeline / Activity Log component
11. Multi-agent Operations Console pattern
12. Customer Support Copilot pattern
13. Generative UI Dashboard pattern

前三个 components 与 Artifact Workspace 构成第一批完整闭环，建议一起规划、逐项交付。之后优先补已有 Pro templates 能够复用设计判断的 patterns。

---

## Components

### 1. Conversation Sidebar / History

**优先级：P0**

AI Chat pattern 已经包含 conversation sidebar，但目前没有对应的 component slug，是现有目录中最明确的缺口。

建议范围：

- 新建会话
- 当前会话与普通会话状态
- 搜索会话
- 重命名、删除、置顶
- 按日期或项目分组
- 长标题截断
- 空列表与无搜索结果
- 会话加载和分页状态
- 移动端收起方式

建议 variants：`default`、`searching`、`empty`、`loading`、`mobile`

完成标准：

- 新增独立 showcase、controls、demos 与 page config
- 注册到 Components 和合适的分类；优先评估是否新建 Conversation 分类，避免硬塞进 Messages
- AI Chat pattern 中的 `Conversation sidebar` 改为真实 component 引用
- 键盘可以遍历会话和打开操作菜单
- 删除操作有明确确认或可撤销路径

### 2. Response Versions / Message Branch

**优先级：P0**

补齐 Message Actions 中 regenerate 之后的状态闭环。组件负责显示同一轮回答的多个版本与分支关系，不负责实际生成。

建议范围：

- `1 / 3` 版本导航
- 上一版、下一版
- 当前分支标记
- 从某个版本继续对话
- 生成新版本时的 pending 状态
- 某一版本失败或被中止
- 可选的版本比较入口

建议 variants：`single`、`multiple`、`generating`、`branched`、`failed`

完成标准：

- 不用数组索引作为稳定版本身份，调用方传入版本 id
- 新版本到达时不让当前阅读位置意外跳动
- 导航按钮具备完整 accessible name
- 在 AI Chat pattern 中展示一次 regenerate 后的版本切换

### 3. Artifact / Output Preview

**优先级：P0**

用于代码、文档、网页、图表和其他生成结果的独立预览面板。它是 Artifact Workspace pattern 的核心组件。

建议范围：

- 标题、类型和生成状态
- Preview / Code 等视图切换
- 复制、下载、全屏、关闭
- 版本切换
- streaming、ready、error、stale 状态
- 运行或渲染失败的 fallback
- 可选的“在新窗口打开”入口

建议 variants：`streaming`、`preview`、`code`、`error`、`versioned`

范围限制：

- 不在组件内部执行任意模型生成代码
- 不接受未经允许的任意组件名或任意 HTML 作为可信输入
- 预览执行环境和 sandbox 属于宿主应用或 Pro template 的责任

完成标准：

- 明确可信内容与不可信内容的边界
- 面板缩放或窄屏时操作不会消失
- streaming 内容不造成明显布局跳动
- 与 Edit Diff View、Code Execution 和 Generative UI 的职责不重叠

### 4. Context Picker

**优先级：P1**

处理用户如何在本轮输入中加入 `@文件`、网页、知识库、应用或其他上下文，连接现有 Prompt Input、Context Files 和 Tool Toggle。

建议范围：

- 键入 `@` 或点击入口打开
- 分类、搜索和最近使用
- 文件、网页、知识库、应用等不同来源
- 已选、无权限、不可用、正在连接状态
- 多选与移除
- token 或上下文成本提示

建议 variants：`open`、`searching`、`selected`、`permission-required`、`empty`

完成标准：

- 完整支持键盘搜索、选择与关闭
- 不把“可使用的工具”和“已加入本轮的上下文”混成同一种状态
- 选中后可在 Prompt Input 或 Context Files 中看到对应结果

### 5. Generated Media Result

**优先级：P1**

补齐当前偏文本、Agent 和 RAG 的组件体系，覆盖图片、音频和视频生成结果。

建议范围：

- queued、generating、ready、failed、cancelled
- 生成进度或阶段说明
- 单结果与多个 variants
- 下载、重新生成、选择变体
- prompt 与关键参数摘要
- 内容安全拦截状态
- 图片、音频、视频的合理 fallback

建议 variants：`queued`、`generating`、`image`、`audio`、`video`、`failed`

完成标准：

- 进度不伪造精确百分比；没有真实进度时使用阶段状态
- 媒体具备 alt、caption 或 transcript 接口
- 失败和安全拦截不会显示为同一种错误
- 大文件与窄屏布局可用

### 6. Agent Run Timeline / Activity Log

**优先级：P1**

将 Agent Status、Agent Plan、Tool Call、Approval Request 等组织成长期运行记录，解决 20–100 个事件下的可读性，而不是再增加一个小状态卡。

建议范围：

- 按时间展示模型、工具、审批、交接、错误事件
- running、waiting、completed、failed、cancelled
- 折叠成功步骤，突出阻塞和失败
- 跳转到当前活动步骤
- retry 或 rerun 的关联关系
- token、耗时和成本摘要接口

建议 variants：`running`、`waiting`、`failed`、`completed`、`long-run`

完成标准：

- 事件由稳定 id 标识，retry 不覆盖原事件
- 长列表不会因新事件持续跳动
- 自动跟随仅在用户位于底部时启用
- 审批和不可逆操作保持明显的视觉层级

---

## Patterns

### 1. Artifact Workspace

**优先级：P0**

左侧或中间为对话，右侧为生成结果预览与编辑，是 Artifact Preview component 的主要落地场景。

组成建议：

- Conversation Sidebar
- Streaming Message / Markdown Message
- Prompt Input
- Artifact Preview
- Response Versions
- 可选的 Edit Diff View、Code Execution、Generative UI

必须展示：

- 从回答中打开 artifact
- artifact streaming 到 settled 的变化
- 版本切换
- 窄屏下 chat 与 artifact 的切换方式
- artifact 出错但对话仍可继续的状态

### 2. Document Q&A / RAG Workspace

**优先级：P0**

聚焦“对自己的文件提问”，区别于偏开放网页搜索的 Research Assistant。

组成建议：

- File Upload
- Context Files
- Source List
- Citation UI / Citation Popover
- Context Usage
- Prompt Input
- Streaming Markdown

必须展示：

- 文件上传和解析
- 未找到足够相关内容
- 回答中的 citation 与文档来源对应
- context 接近上限
- 移除文件后对当前会话的影响提示

与 Pro RAG template 的边界：Pattern 只提供单文件界面与模拟状态，不复制 ingestion、chunking、embedding、retrieval 和 streaming citation 的工程实现。

### 3. Structured Extraction & Review

**优先级：P1**

上传文档后字段逐步填充，用户检查低置信度字段、修正并导出。

组成建议：

- File Upload
- Agent Status 或 Reasoning Steps
- Confidence Answer 的视觉语义参考
- Inline Correction
- Eval Results 或定制字段结果表

必须展示：

- partial fields
- validation error
- low-confidence field
- 人工修正及原值保留
- ready to export

与 Pro structured-extraction template 的边界：Pattern 不实现 schema 驱动生成和 partial object 数据流，只展示正确的界面组织与状态。

### 4. Image Generation Studio

**优先级：P1**

围绕 prompt、参数、生成队列和结果变体组织完整的一屏。

组成建议：

- Prompt Input 或专用生成 composer
- Generated Media Result
- Model Selector
- 可选的 Context Picker、File Upload、Cost Meter

必须展示：

- queued → generating → ready
- 多个结果 variants
- regenerate / reuse prompt
- safety blocked
- 下载与选择结果

### 5. Multi-agent Operations Console

**优先级：P2**

用于查看多个 Agent 的运行、交接、阻塞和审批，区别于只关注单次 coding run 的 Coding Agent pattern。

组成建议：

- Agent Run Timeline
- Agent Status
- Agent Handoff
- Agent Plan
- Approval Request / Approval Gate
- Cost Meter

必须展示：

- 多 Agent 并行状态
- handoff 的上下文摘要
- waiting for approval
- failed child run
- 汇总成本与单 run 成本

### 6. Customer Support Copilot

**优先级：P2**

展示 AI 建议与人工客服决策并存的工作区，不做完全自动化聊天机器人。

组成建议：

- Conversation Sidebar
- Context Picker
- Source List / Citation UI
- Confidence Answer
- Inline Correction
- Approval Request
- Response Rating

必须展示：

- 客户对话与内部 AI 建议分层
- 引用知识库依据
- 低置信度升级人工
- 建议回复的编辑与发送确认

### 7. Generative UI Dashboard

**优先级：P2**

展示模型通过受控 registry 返回图表、表格、筛选器或操作卡片，而不是返回任意 UI。

组成建议：

- Generative UI
- Tool Call
- Artifact Preview
- Prompt Input
- Error & Retry

必须展示：

- allowed component
- unsupported component fallback
- streaming props
- 用户在生成结果上的交互反馈到会话
- widget error 不导致整个页面崩溃

---

## 每个条目的统一交付清单

实现某个 component 时：

- 组件源码
- controls、demos、page config
- registry entry、分类、搜索标题、tags 和 variants
- 默认、loading、empty、error、disabled 等适用状态
- light / dark、mobile、长内容和窄容器
- keyboard、focus、ARIA、reduced-motion
- 相关 pattern 的引用更新
- lint、typecheck、build 和必要的交互验证
- README 中数量或清单若存在硬编码，必须同步或改为从 registry 推导

实现某个 pattern 时：

- 单文件 React + Tailwind pattern 源码
- page config 与 registry entry
- 清晰列出使用了哪些已有 components
- 模拟完整核心流程，而不是只显示静态 happy path
- 至少包含一个 loading/working 状态和一个失败、空或边界状态
- desktop 与 mobile 的信息架构都成立
- 不复制 Pro template 的真实后端实现
- lint、typecheck、build 和交互验证

## 暂不做

- 通用 Button、Input、Modal、Tabs、Toast、Tooltip、Dropdown、Skeleton
- 与 AI 产品界面无直接关系的设计工具或页面模板
- 仅为了增加目录数量而拆出的微型组件
- 没有真实状态模型、只是更大 card 的 Pro component
- 与现有组件只有命名差异、没有交互或数据职责差异的重复项

## 执行备注

- 每开始一项，先检查邻近 components、patterns 和 Pro templates，复用既有状态语言与视觉 token。
- 每完成一个 component，立即接入至少一个 pattern，避免组件长期成为孤立 demo。
- 若执行中发现条目与现有实现职责重叠，优先扩展现有组件的 variant，而不是新建重复目录。
- 第一批建议以 Conversation Sidebar、Response Versions、Artifact Preview、Artifact Workspace 为一个里程碑。

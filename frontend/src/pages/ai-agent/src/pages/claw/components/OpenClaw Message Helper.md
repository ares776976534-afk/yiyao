# OpenClaw Web Chat 开发手册

> 面向开发者的完整技术文档，帮助理解现有实现并继续开发类似页面。

---

## 一、项目概览

### 1.1 架构

```
┌─────────────────────────────┐
│    Web Chat (纯前端 SPA)     │
│    单文件: index.html        │
│    无构建工具、无后端         │
└──────────┬──────────────────┘
           │ WebSocket (ws:// 或 wss://)
           ▼
┌─────────────────────────────┐
│   OpenClaw Gateway          │
│   默认端口: 18789            │
│   协议版本: v3              │
└─────────────────────────────┘
```

- **纯前端 SPA**：所有 HTML / CSS / JS 写在一个 `index.html` 文件中
- **无构建工具**：直接部署静态文件，浏览器打开即用
- **无后端**：浏览器直连用户自己的 Gateway，认证信息仅存 localStorage
- **通信协议**：OpenClaw Gateway WebSocket Protocol v3

### 1.2 技术栈

| 技术 | 用途 |
|------|------|
| Vanilla JS（ES6+） | 核心逻辑，无框架依赖 |
| [marked.js](https://cdn.jsdelivr.net/npm/marked@15) | Markdown → HTML 渲染 |
| [highlight.js](https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11) | 代码语法高亮 |
| CSS Variables | 主题系统（深色/浅色） |
| localStorage | 配置持久化 |

### 1.3 文件结构

```
web-chat/
├── index.html              # 主文件（全部代码）
├── index.html.bak          # 历史备份
├── index.html.current.bak  # 当前版本备份
├── README.md               # 项目说明
├── DESIGN.md               # 设计方案文档
└── DEV-GUIDE.md            # 本文档
```

---

## 二、WebSocket 协议详解

### 2.1 帧格式

所有通信通过 JSON 帧进行，共三种类型：

#### 请求帧（Request）— 客户端 → 服务端

```json
{
  "type": "req",
  "id": "1",              // 唯一请求 ID（字符串）
  "method": "chat.send",  // RPC 方法名
  "params": { ... }       // 方法参数
}
```

#### 响应帧（Response）— 服务端 → 客户端

```json
{
  "type": "res",
  "id": "1",              // 对应请求的 ID
  "ok": true,             // 是否成功
  "payload": { ... },     // 成功时的返回数据
  "error": {              // 失败时的错误信息
    "code": "NOT_FOUND",
    "message": "session not found"
  }
}
```

#### 事件帧（Event）— 服务端 → 客户端（主动推送）

```json
{
  "type": "event",
  "event": "chat",        // 事件名称
  "payload": { ... },     // 事件数据
  "seq": 42               // 序列号（可选）
}
```

### 2.2 连接流程

```
 浏览器                              Gateway
   │                                    │
   │──── new WebSocket(url) ──────────► │
   │                                    │
   │◄──── event: connect.challenge ─────│  ← Gateway 发起挑战
   │       { nonce: "..." }             │
   │                                    │
   │──── req: connect ─────────────────►│  ← 客户端发送认证
   │     {                              │
   │       minProtocol: 3,              │
   │       maxProtocol: 3,              │
   │       client: { id, version, ... },│
   │       caps: ["tool-events"],       │
   │       auth: { token: "xxx" }       │
   │     }                              │
   │                                    │
   │◄──── res: { ok: true } ───────────│  ← 认证成功
   │      (payload 中可含 hello-ok 信息) │
   │                                    │
   │──── req: sessions.patch ──────────►│  ← 开启 tool-events 详细模式
   │     { key, verboseLevel: "on" }    │
   │                                    │
   │──── req: chat.history ────────────►│  ← 加载历史消息
   │                                    │
   │◄──── res: { messages: [...] } ────│
   │                                    │
   ▼                                    ▼
```

#### 连接参数说明

```javascript
const PROTOCOL_VERSION = 3;
const CLIENT_INFO = {
  id: 'openclaw-control-ui',   // 客户端标识
  displayName: 'Web Chat',      // 显示名称
  version: '1.0.0',             // 版本号
  platform: navigator.platform, // 平台
  mode: 'webchat',              // 模式
};
```

#### 能力声明（caps）

```javascript
caps: ['tool-events']  // 声明支持工具事件，Gateway 会推送 agent 事件
```

> **关键**：如果不声明 `tool-events`，Gateway 只发送 `chat` 事件（粗粒度）。声明后，Gateway 会额外推送 `agent` 事件（细粒度的工具调用过程）。

### 2.3 RPC 调用封装

```javascript
// 发送 RPC 请求并返回 Promise
function sendRpc(method, params) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return Promise.reject({ message: 'not connected' });
  }
  const id = String(++reqId);  // 递增的请求 ID
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ type: 'req', id, method, params }));
    // 60 秒超时
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject({ message: 'timeout' });
      }
    }, 60000);
  });
}
```

响应匹配逻辑：

```javascript
// 在 ws.onmessage 中
if (frame.type === 'res' && frame.id && pending.has(frame.id)) {
  const p = pending.get(frame.id);
  pending.delete(frame.id);
  if (frame.ok === false) p.reject(frame.error);
  else p.resolve(frame.payload);
}
```

---

## 三、RPC 方法一览

### 3.1 `connect` — 认证连接

**触发时机**：收到 `connect.challenge` 事件后

```javascript
await sendRpc('connect', {
  minProtocol: 3,
  maxProtocol: 3,
  client: {
    id: 'openclaw-control-ui',
    displayName: 'Web Chat',
    version: '1.0.0',
    platform: navigator.platform,
    mode: 'webchat',
  },
  caps: ['tool-events'],        // 声明支持工具事件
  auth: { token: 'your-token' } // 认证令牌
});
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `minProtocol` | number | ✅ | 最低支持协议版本 |
| `maxProtocol` | number | ✅ | 最高支持协议版本 |
| `client` | object | ✅ | 客户端信息 |
| `client.id` | string | ✅ | 客户端标识 |
| `client.displayName` | string | ❌ | 显示名 |
| `client.version` | string | ✅ | 版本号 |
| `client.platform` | string | ✅ | 平台标识 |
| `client.mode` | string | ✅ | 客户端模式 |
| `caps` | string[] | ❌ | 能力声明列表 |
| `auth.token` | string | ❌ | Token 认证 |
| `auth.password` | string | ❌ | 密码认证 |

---

### 3.2 `ping` — 心跳保活

**用途**：每 30 秒发送一次，防止连接因空闲被断开

```javascript
sendRpc('ping', {});
```

无参数，无返回值。

---

### 3.3 `chat.history` — 加载历史消息

```javascript
const res = await sendRpc('chat.history', {
  sessionKey: 'main',
  limit: 20   // 或 200
});
// res.messages: Array<Message>
// res.sessionKey: string（规范化的 sessionKey）
// res.thinkingLevel: string | null
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `sessionKey` | string | ✅ | 会话标识 |
| `limit` | number | ❌ | 返回消息数上限（1-1000），默认无限制 |

**返回值**：

```typescript
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system' | 'toolResult' | 'tool',
    content: string | ContentBlock[],
    tool_use_id?: string,    // toolResult 角色时的工具调用 ID
    toolCallId?: string,     // 同上（另一种字段名）
    toolName?: string,       // 工具名称
    name?: string,           // 同上
    timestamp?: number,
  }>,
  sessionKey: string,        // 规范化后的会话 key
  thinkingLevel?: string,
}
```

**ContentBlock 类型**：

```typescript
type ContentBlock =
  | { type: 'text', text: string }
  | { type: 'output_text', text: string }
  | { type: 'toolCall' | 'tool_use', id: string, name: string, arguments: string | object }
  | { type: 'image', source?: ImageSource, data?: string, url?: string }
```

---

### 3.4 `chat.send` — 发送消息

```javascript
await sendRpc('chat.send', {
  sessionKey: 'main',
  message: '你好',
  idempotencyKey: crypto.randomUUID(), // 幂等键
  attachments: [                        // 可选图片附件
    {
      type: 'image',
      mimeType: 'image/png',
      content: 'base64编码的图片数据...'
    }
  ]
});
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `sessionKey` | string | ✅ | 会话标识 |
| `message` | string | ✅ | 消息文本（可为空字符串，配合附件使用） |
| `idempotencyKey` | string | ✅ | 幂等键，防止重复发送 |
| `attachments` | array | ❌ | 图片附件列表 |
| `deliver` | boolean | ❌ | 是否投递到外部渠道 |
| `thinking` | string | ❌ | 思考级别覆盖 |
| `timeoutMs` | number | ❌ | 超时毫秒数 |

**返回值**：

```json
{ "runId": "xxx", "status": "started" }
```

> **重要**：`chat.send` 是**非阻塞**的。它立即返回 ack，然后通过 `chat` 和 `agent` 事件流式推送响应。

**幂等行为**：
- 首次发送：返回 `{ status: "started" }`
- 重复发送（相同 idempotencyKey）：运行中返回 `{ status: "in_flight" }`，完成后返回 `{ status: "ok" }`

---

### 3.5 `chat.abort` — 中断生成

```javascript
await sendRpc('chat.abort', { sessionKey: 'main' });
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `sessionKey` | string | ✅ | 会话标识 |
| `runId` | string | ❌ | 指定中断某个运行 ID（不填则中断所有） |

---

### 3.6 `sessions.patch` — 修改会话设置

```javascript
await sendRpc('sessions.patch', {
  key: 'main',
  verboseLevel: 'on'  // 开启工具事件详细推送
});
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | string | ✅ | 会话标识 |
| `verboseLevel` | string/null | ❌ | 工具事件详细级别 |
| `thinkingLevel` | string/null | ❌ | 思考级别 |
| `reasoningLevel` | string/null | ❌ | 推理级别 |
| `label` | string/null | ❌ | 会话标签 |
| `model` | string/null | ❌ | 模型覆盖 |
| `elevatedLevel` | string/null | ❌ | 提权级别 |
| `execHost` | string/null | ❌ | exec 目标主机 |
| `execSecurity` | string/null | ❌ | exec 安全级别 |

---

### 3.7 `sessions.list` — 获取会话列表

```javascript
const res = await sendRpc('sessions.list', {
  includeGlobal: false,
  includeUnknown: false,
  includeDerivedTitles: true,    // 从首条用户消息派生标题
  includeLastMessage: true       // 包含最近消息预览
});
// res.sessions: Array<SessionInfo>
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `includeGlobal` | boolean | ❌ | 包含全局会话 |
| `includeUnknown` | boolean | ❌ | 包含未知会话 |
| `includeDerivedTitles` | boolean | ❌ | 读取会话首条消息作为标题（有 IO 开销） |
| `includeLastMessage` | boolean | ❌ | 读取最近消息预览（有 IO 开销） |
| `limit` | number | ❌ | 返回数量上限 |
| `agentId` | string | ❌ | 按 Agent 过滤 |
| `label` | string | ❌ | 按标签过滤 |
| `search` | string | ❌ | 搜索关键词 |

**返回的 SessionInfo 结构**：

```typescript
{
  key: string,               // 会话 key（如 "agent:main:dingtalk:xxx"）
  channel?: string,          // 渠道
  chatType?: string,         // "direct" | "group"
  updatedAt?: number,        // 最后更新时间戳
  derivedTitle?: string,     // 从首条消息派生的标题
  lastMessagePreview?: string, // 最近消息预览
  displayName?: string,
  label?: string,
  origin?: {
    label?: string,
    chatType?: string,
  }
}
```

---

### 3.8 `sessions.reset` — 清除会话上下文

```javascript
await sendRpc('sessions.reset', { key: 'main' });
```

清除指定会话的所有消息历史，但保留会话设置。

---

### 3.9 `sessions.delete` — 删除会话

```javascript
await sendRpc('sessions.delete', {
  key: 'agent:main:webchat:0101-1200',
  deleteTranscript: true   // 同时删除聊天记录文件
});
```

---

### 3.10 `agents.list` — 获取 Agent 列表

```javascript
const res = await sendRpc('agents.list', {});
// res.agents: Array<AgentSummary>
// res.defaultId: string
```

**AgentSummary 结构**：

```typescript
{
  id: string,
  name?: string,
  identity?: {
    name?: string,
    emoji?: string,
    avatar?: string,
  }
}
```

---

### 3.11 `agents.files.get` — 读取 Agent 配置文件

```javascript
const res = await sendRpc('agents.files.get', {
  agentId: 'main',
  name: 'IDENTITY.md'   // 或 'SOUL.md', 'USER.md'
});
// res.file.content: string（文件内容）
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `agentId` | string | ✅ | Agent ID |
| `name` | string | ✅ | 文件名 |

---

### 3.12 `agents.files.set` — 写入 Agent 配置文件

```javascript
await sendRpc('agents.files.set', {
  agentId: 'main',
  name: 'IDENTITY.md',
  content: '# IDENTITY.md\n\n- **Name:** 小助手\n'
});
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `agentId` | string | ✅ | Agent ID |
| `name` | string | ✅ | 文件名 |
| `content` | string | ✅ | 文件内容 |

---

### 3.13 `cron.list` — 获取定时任务列表

```javascript
const res = await sendRpc('cron.list', { includeDisabled: true });
// res.jobs: Array<CronJob>
```

**CronJob 结构**：

```typescript
{
  id: string,              // 任务 ID
  jobId?: string,          // 同上（别名）
  name?: string,           // 任务名称
  agentId?: string,        // 所属 Agent
  enabled: boolean,
  schedule: {
    kind: 'at' | 'every' | 'cron',
    at?: string,           // ISO 时间（kind=at）
    everyMs?: number,      // 毫秒间隔（kind=every）
    expr?: string,         // cron 表达式（kind=cron）
    tz?: string,           // 时区
  },
  payload: {
    kind: 'agentTurn' | 'systemEvent',
    message?: string,
    text?: string,
  }
}
```

---

### 3.14 `cron.add` — 创建定时任务

```javascript
await sendRpc('cron.add', {
  name: '每日提醒',
  agentId: 'main',
  schedule: { kind: 'every', everyMs: 86400000 },
  payload: { kind: 'agentTurn', message: '提醒我查看邮件' },
  sessionTarget: 'isolated',
  enabled: true,
});
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ❌ | 任务名称 |
| `agentId` | string | ❌ | Agent ID |
| `schedule` | object | ✅ | 调度配置（见上方结构） |
| `payload` | object | ✅ | 执行内容 |
| `sessionTarget` | string | ✅ | `"main"` 或 `"isolated"` |
| `enabled` | boolean | ❌ | 是否启用 |

---

### 3.15 `cron.update` — 更新定时任务

```javascript
await sendRpc('cron.update', {
  jobId: 'xxx',
  patch: { enabled: false }  // 停用任务
});
```

---

### 3.16 `cron.remove` — 删除定时任务

```javascript
await sendRpc('cron.remove', { jobId: 'xxx' });
```

---

### 3.17 `cron.run` — 立即执行定时任务

```javascript
await sendRpc('cron.run', {
  jobId: 'xxx',
  mode: 'force'   // 强制执行
});
```

---

## 四、事件系统详解

Gateway 主动推送三类事件：`connect.challenge`、`chat`、`agent`。

### 4.1 `connect.challenge` 事件

**触发时机**：WebSocket 连接建立后，Gateway 立即发送

```json
{
  "type": "event",
  "event": "connect.challenge",
  "payload": { "nonce": "随机字符串" }
}
```

**处理逻辑**：收到后立即发送 `connect` RPC 完成认证。

---

### 4.2 `chat` 事件

**事件名**：`chat`

**触发时机**：Agent 处理用户消息期间，实时推送进度

#### 4 种状态

| 状态 | 含义 | 说明 |
|------|------|------|
| `delta` | 增量更新 | 流式推送 Assistant 正在生成的文本 |
| `final` | 完成 | Agent 完成所有处理，消息定稿 |
| `aborted` | 中断 | 用户手动停止或超时 |
| `error` | 错误 | Agent 处理出错 |

#### `delta` 状态

```json
{
  "type": "event",
  "event": "chat",
  "payload": {
    "runId": "xxx",
    "sessionKey": "agent:main:webchat:0101",
    "state": "delta",
    "message": {
      "content": [{ "type": "text", "text": "到目前为止生成的全部文本..." }]
    }
  }
}
```

> **注意**：`delta` 中的 `message.content` 是**累积的完整文本**，不是增量片段。每次 delta 直接替换显示内容即可。

**处理逻辑**：

```javascript
if (payload.state === 'delta') {
  const text = extractText(payload.message.content);
  streamBuf = text;                          // 保存完整文本
  streamingEl.innerHTML = renderMarkdown(streamBuf);  // 渲染到 DOM
}
```

#### `final` 状态

```json
{
  "type": "event",
  "event": "chat",
  "payload": {
    "runId": "xxx",
    "sessionKey": "...",
    "state": "final"
  }
}
```

**处理逻辑**：

```javascript
if (payload.state === 'final') {
  setRunning(false);      // 结束运行状态
  loadHistory();          // 重新加载完整历史（获取格式化后的最终消息）
}
```

> **为什么 final 时要重新加载历史？** 因为 delta 流只包含纯文本，而 final 后的历史包含完整的消息结构（工具调用卡片、图片等）。重新加载确保显示正确。

#### `aborted` 状态

```json
{
  "type": "event",
  "event": "chat",
  "payload": {
    "runId": "xxx",
    "sessionKey": "...",
    "state": "aborted"
  }
}
```

**处理逻辑**：在流式文本末尾追加 `⏹ 已停止` 标记。

#### `error` 状态

```json
{
  "type": "event",
  "event": "chat",
  "payload": {
    "runId": "xxx",
    "sessionKey": "...",
    "state": "error",
    "errorMessage": "model rate limited"
  }
}
```

**处理逻辑**：显示错误提示消息。

---

### 4.3 `agent` 事件

**事件名**：`agent`

**触发条件**：客户端在 `connect` 时声明了 `caps: ['tool-events']`，且会话开启了 `verboseLevel: 'on'`

**与 chat 事件的关系**：
- `agent` 事件更细粒度，提供**逐工具调用**的实时更新
- 当收到 `agent` 事件时，应**忽略** `chat` 的 `delta` 事件（避免内容冲突）
- `chat` 的 `final` / `aborted` / `error` 事件仍然需要处理

```javascript
let hasAgentEvents = false;

function handleAgentEvent(payload) {
  hasAgentEvents = true;  // 标记已收到 agent 事件
  // ... 处理 agent 事件
}

function handleChatEvent(payload) {
  if (payload.state === 'delta' && hasAgentEvents) {
    return;  // 有 agent 事件时忽略 chat delta
  }
  // ... 处理 chat 事件
}
```

#### AgentEvent 结构

```typescript
{
  runId: string,
  seq: number,           // 序列号
  stream: string,        // "assistant" | "tool"
  ts: number,            // 时间戳
  data: {
    // stream="assistant" 时
    text?: string,       // 累积的文本内容

    // stream="tool" 时
    toolCallId?: string, // 工具调用 ID
    name?: string,       // 工具名称
    phase?: string,      // "start" | "update" | "result"
    args?: object,       // 工具参数（phase=start）
    partialResult?: any, // 部分结果（phase=update）
    result?: any,        // 完整结果（phase=result）
  }
}
```

#### `stream: "assistant"` — 文本流

Agent 正在生成的文本内容，与 `chat` 的 `delta` 类似但更精确。

```javascript
if (stream === 'assistant') {
  streamBuf = data.text;
  if (!streamingEl) {
    // 创建新的消息气泡
    streamingEl = document.createElement('div');
    streamingEl.className = 'msg assistant streaming';
    msgBox.appendChild(wrapInRow('assistant', streamingEl));
  }
  streamingEl.innerHTML = renderMarkdown(streamBuf);
}
```

#### `stream: "tool"` — 工具调用

3 个阶段（phase）：

| Phase | 含义 | 包含数据 |
|-------|------|---------|
| `start` | 工具调用开始 | `name`（工具名）、`args`（参数） |
| `update` | 中间结果 | `partialResult`（部分结果） |
| `result` | 工具执行完成 | `result`（完整结果） |

**完整处理流程**：

```
收到 tool.start
  → 结束当前流式文本
  → 创建工具卡片（显示工具名 + 参数）
  → 等待结果...

收到 tool.update（可选）
  → 更新工具卡片中的结果区域

收到 tool.result
  → 显示完整结果
  → 准备下一轮文本（turnIndex++）
```

```javascript
if (phase === 'start') {
  finalizeStreamingEl();  // 结束当前文本
  const card = createToolCard({ name, id: toolCallId, arguments: data.args });
  const container = getOrCreateToolContainer();
  container.appendChild(card);
}

if (phase === 'result') {
  attachToolResult(toolCallId, formatToolResult(data.result));
  startNewTurn();  // 准备下一轮
}
```

#### 多轮工具调用的渲染

Agent 可能在一次回复中交替生成文本和调用工具：

```
文本: "让我帮你搜索一下..."
  ↓
工具: web_search("xxx")  → 结果
  ↓
文本: "根据搜索结果..."
  ↓
工具: read("/path/to/file")  → 结果
  ↓
文本: "文件内容显示..."
```

通过 `turnIndex` 跟踪当前轮次，每次从文本切换到工具（或工具完成后）递增，确保 DOM 元素不冲突。

---

### 4.4 中途重连（Mid-Run Reconnect）

如果用户在 Agent 运行过程中重新连接（如刷新页面），需要特殊处理：

```javascript
// 检测中途重连：收到 agent 事件但 isRunning=false
if (!isRunning && !joinedMidRun) {
  joinedMidRun = true;
  setRunning(true);
  midRunHistoryLoading = true;
  midRunEventQueue = [];   // 缓存重连期间的事件

  // 重新加载历史（获取已完成的轮次）
  await loadHistory();
  midRunHistoryLoading = false;

  // 显示重连提示
  // 回放缓存的事件
  for (const evt of midRunEventQueue) {
    handleAgentEvent(evt);
  }
}
```

---

## 五、消息渲染机制

### 5.1 消息角色

| 角色 | 显示方式 | 说明 |
|------|---------|------|
| `user` | 右对齐，蓝色背景 | 用户发送的消息 |
| `assistant` | 左对齐，带 Bot 头像 | AI 回复 |
| `system` | 居中，灰色小字 | 系统提示（清除上下文、断线等） |
| `toolResult` / `tool` | 工具卡片 | 工具执行结果 |

### 5.2 内容提取

从不同格式的 content 中提取纯文本：

```javascript
function extractText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(c => c.type === 'text' || c.type === 'output_text')
      .map(c => c.text || '')
      .join('');
  }
  return '';
}
```

### 5.3 用户消息信封清理

OpenClaw 会在用户消息前注入元数据信封，需要在显示前清理：

```javascript
function stripUserEnvelope(text) {
  // 移除 "Conversation info (untrusted metadata):\n```json\n{...}\n```"
  text = text.replace(
    /^Conversation info \(untrusted metadata\):\s*```json\s*[\s\S]*?```\s*/m, ''
  );
  // 移除时间戳前缀 "[Wed 2026-03-04 21:10 GMT+8]"
  text = text.replace(
    /^\[(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+GMT[+-]\d+\]\s*/m, ''
  );
  return text.trim();
}
```

### 5.4 Markdown 渲染

```javascript
marked.setOptions({
  breaks: true,   // \n → <br>（聊天风格换行）
  gfm: true,      // GitHub Flavored Markdown（表格、删除线等）
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});
```

自定义渲染器（图片懒加载 + 链接新窗口）：

```javascript
const renderer = new marked.Renderer();
renderer.image = function(token) {
  return `<img loading="lazy" data-src="${token.href}"
    alt="${escHtml(token.text)}" class="chat-img lazy-img"
    onclick="showImageLightbox(this.src)">`;
};
renderer.link = function(token) {
  return `<a href="${token.href}" target="_blank" rel="noopener">${token.text}</a>`;
};
```

### 5.5 工具调用卡片

#### 创建卡片

```javascript
function createToolCard(tc) {
  const name = tc.name || 'unknown';
  const icon = TOOL_ICONS[name] || '🔧';
  const summary = summarizeToolArgs(name, tc.arguments);
  // 生成可折叠的卡片 DOM
}
```

#### 工具图标映射

```javascript
const TOOL_ICONS = {
  read: '📄', write: '✏️', edit: '🔧', exec: '⚡',
  web_search: '🔍', web_fetch: '🌐', browser: '🖥️',
  memory_search: '🧠', memory_get: '🧠',
  message: '💬', tts: '🔊', cron: '⏰', gateway: '🔌',
  canvas: '🎨', nodes: '📡', sessions_spawn: '🚀',
  // ...
};
```

#### 参数摘要

根据工具类型显示最有用的参数：

```javascript
function summarizeToolArgs(name, args) {
  if (name === 'exec') return args.command?.substring(0, 60);
  if (name === 'web_search') return args.query;
  if (name === 'read' || name === 'write') return args.path || args.file_path;
  if (name === 'web_fetch') return args.url?.substring(0, 60);
  // ...
}
```

#### 附加结果

```javascript
function attachToolResult(id, text) {
  const group = toolCallElements.get(id);
  const resultEl = group.querySelector('.tool-result-text');
  // 超过 2000 字符截断
  resultEl.textContent = text.length > 2000
    ? text.substring(0, 2000) + `\n... (${text.length - 2000} chars truncated)`
    : text;
}
```

### 5.6 图片懒加载

使用 `IntersectionObserver` 实现：

```javascript
const lazyObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src && !img.src) {
        img.src = img.dataset.src;
      }
      lazyObserver.unobserve(img);
    }
  }
}, { rootMargin: '200px' });
```

图片使用 `data-src` 属性存储真实 URL，进入视口 200px 范围内时才加载。

### 5.7 图片 Lightbox

点击图片弹出全屏查看：

```javascript
function showImageLightbox(src) {
  const overlay = document.createElement('div');
  overlay.className = 'img-lightbox';
  overlay.innerHTML = `<img src="${src}">`;
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
  // ESC 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.remove();
  });
}
```

---

## 六、会话管理

### 6.1 会话 Key 格式

```
agent:<agentId>:<渠道/来源信息>
```

示例：
- `agent:main:webchat:0306-1527` — 网页聊天
- `agent:main:dingtalk:direct:449423` — 钉钉私聊
- `agent:main:dingtalk:group:cidllp1nbe` — 钉钉群聊
- `agent:xiaodai:webchat:0306-1530` — 小代的网页聊天

### 6.2 会话列表分组

按 Agent ID 分组显示，每组默认显示前 5 个，可展开查看全部。

```javascript
function extractAgentId(key) {
  const m = (key || '').match(/^agent:([^:]+):/);
  return m ? m[1] : 'main';
}
```

### 6.3 会话命名优先级

1. `derivedTitle`（从首条用户消息清理后的文本）
2. `origin.label`（来源标签，如群名 + 用户名）
3. `displayName`
4. `label`
5. 自动生成：`渠道名称 + 日期时间`

```javascript
function sessionDisplayName(s) {
  const cleaned = cleanTitle(s.derivedTitle);
  if (cleaned && cleaned.length > 2 && !looksLikeMachineId(cleaned)) {
    return cleaned.length > 30 ? cleaned.substring(0, 30) + '…' : cleaned;
  }
  if (s.origin?.label && !looksLikeMachineId(s.origin.label)) return s.origin.label;
  // ... 更多降级
}
```

### 6.4 会话切换

```javascript
function switchSession(newKey) {
  sessionKey = newKey;
  canonicalKey = '';
  cfgSession.value = newKey;
  saveConfig();
  // 重置状态
  streamingEl = null;
  streamBuf = '';
  toolCallElements.clear();
  loadHistory();         // 加载新会话的历史
  renderSessionList();   // 更新列表高亮
}
```

### 6.5 历史消息两阶段加载

为了快速展示，采用两阶段加载策略：

```
阶段 1: 初始加载 — 20 条消息（快速渲染）
         ↓
阶段 2: 用户滚动到顶部 → 加载 200 条，差集插入顶部
```

```javascript
const INITIAL_LIMIT = 20;
const FULL_LIMIT = 200;

// 阶段 1
const res = await sendRpc('chat.history', { sessionKey, limit: INITIAL_LIMIT });

// 阶段 2（用户滚动到顶部时触发）
msgBox.addEventListener('scroll', () => {
  if (msgBox.scrollTop < 60 && !hasLoadedFull) {
    loadOlderMessages();  // 加载 200 条并 prepend 差集
  }
});
```

加载更多消息时，保持用户的滚动位置不跳动：

```javascript
const prevScrollHeight = msgBox.scrollHeight;
// ... prepend 旧消息 ...
const newScrollHeight = msgBox.scrollHeight;
msgBox.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
```

---

## 七、Agent 管理模态框

### 7.1 四个 Tab

| Tab | 对应文件 | 说明 |
|-----|---------|------|
| 身份 (identity) | `IDENTITY.md` | 名称、角色、风格、emoji、头像 |
| 性格与风格 (soul) | `SOUL.md` | 核心定位、工作风格、行为边界、擅长领域 |
| 用户信息 (user) | `USER.md` | 用户名、称呼、时区、偏好 |
| 定时任务 (cron) | — | 通过 RPC 管理 cron 任务 |

### 7.2 Markdown 文件解析

#### IDENTITY.md 解析

```javascript
function parseIdentityMd(content) {
  const kv = parseMdKv(content); // 解析 "- **Key:** value" 格式
  return {
    name: kv.name || '',
    creature: kv.creature || '',
    vibe: kv.vibe || '',
    emoji: kv.emoji || '',
    avatar: kv.avatar || '',
  };
}
```

#### SOUL.md 解析

按 `##` 标题分节，匹配到对应字段：

```javascript
function parseSoulMd(content) {
  // 按 ## 标题分节
  // 通过关键词匹配：
  //   "核心定位" / "core" → core
  //   "工作风格" / "style" → style
  //   "边界" / "boundaries" → boundaries
  //   "擅长" / "skills" → skills
  // 未匹配的节 → extra
}
```

#### USER.md 解析

```javascript
function parseUserMd(content) {
  const kv = parseMdKv(content);
  return {
    name: kv.name || '',
    callme: kv.what_to_call_them || '',
    pronouns: kv.pronouns || '',
    timezone: kv.timezone || '',
    notes: kv.notes || '',
    context: /* 从 ## Context 节提取 */,
  };
}
```

### 7.3 保存流程

1. 读取表单数据
2. 构建 Markdown 内容
3. 与原始数据比对，只更新有变化的文件
4. 通过 `agents.files.set` RPC 写入

```javascript
const saves = [];
if (identityMd !== agentOriginalData.rawIdentity) {
  saves.push(sendRpc('agents.files.set', {
    agentId: currentAgentId, name: 'IDENTITY.md', content: identityMd
  }));
}
// ... 同理处理 SOUL.md, USER.md
await Promise.all(saves);
```

---

## 八、断线重连机制

### 8.1 指数退避

```javascript
const RECONNECT_BASE_MS = 1000;      // 初始等待 1 秒
const RECONNECT_MAX_MS = 60000;      // 最长等待 60 秒
const RECONNECT_MAX_ATTEMPTS = 10;   // 最多重连 10 次

function getReconnectDelay() {
  // 1s → 2s → 4s → 8s → 16s → 32s → 60s（封顶）
  const delay = Math.min(
    RECONNECT_BASE_MS * Math.pow(2, reconnectAttempt),
    RECONNECT_MAX_MS
  );
  const jitter = delay * 0.2 * Math.random(); // 20% 随机抖动
  return Math.floor(delay + jitter);
}
```

### 8.2 重连触发

```javascript
ws.onclose = (e) => {
  if (manualDisconnect) {
    setStatus('已断开', '');
  } else {
    scheduleReconnect();  // 自动重连
  }
};
```

### 8.3 心跳保活

```javascript
// 每 30 秒发送一次 ping
pingInterval = setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    sendRpc('ping', {}).catch(() => {});
  }
}, 30000);
```

### 8.4 手动断开不重连

```javascript
function disconnect() {
  manualDisconnect = true;    // 标记为手动断开
  cancelReconnect();          // 取消定时重连
  ws.close();
}
```

---

## 九、图片上传

### 9.1 三种上传方式

```javascript
// 1. 文件选择按钮
uploadBtn.onclick = () => fileInput.click();

// 2. 粘贴图片 (Ctrl/Cmd + V)
input.addEventListener('paste', (e) => {
  const items = e.clipboardData?.items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      handleFileSelect([item.getAsFile()]);
    }
  }
});

// 3. 拖拽上传
app.addEventListener('drop', (e) => {
  const files = Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'));
  handleFileSelect(files);
});
```

### 9.2 处理流程

```
选择文件 → FileReader 转 DataURL → base64 提取 → 预览 → 随消息发送
```

```javascript
async function handleFileSelect(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    if (file.size > 10 * 1024 * 1024) continue;  // 10MB 限制
    const dataUrl = await readFileAsDataUrl(file);
    const base64 = dataUrl.split(',')[1];
    pendingImages.push({ file, dataUrl, base64, mimeType: file.type });
  }
  renderPreviews();
}
```

### 9.3 发送格式

```javascript
const attachments = pendingImages.map(img => ({
  type: 'image',
  mimeType: img.mimeType,
  content: img.base64          // base64 编码
}));

sendRpc('chat.send', {
  sessionKey,
  message: text,
  idempotencyKey: genUUID(),
  attachments,
});
```

---

## 十、输入处理

### 10.1 IME 中文输入

```javascript
let isComposing = false;
input.addEventListener('compositionstart', () => { isComposing = true; });
input.addEventListener('compositionend', () => { isComposing = false; });

input.addEventListener('keydown', e => {
  // 输入法正在组字时不发送
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !isComposing) {
    e.preventDefault();
    sendMessage();
  }
});
```

> **为什么需要 `isComposing` 标志？** 中文拼音输入时按 Enter 是确认候选词，不应触发消息发送。`compositionstart` / `compositionend` 事件精确标记了输入法的活跃状态。

### 10.2 自动高度

```javascript
function autoResize() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 150) + 'px';
}
input.addEventListener('input', autoResize);
```

---

## 十一、主题系统

### 11.1 CSS 变量

```css
:root, [data-theme="dark"] {
  --bg: #0f0f0f;
  --surface: #1a1a1a;
  --text: #e0e0e0;
  --accent: #4a9eff;
  --user-bg: #1a3a5c;
  --assistant-bg: #1e1e1e;
  /* ... */
}

[data-theme="light"] {
  --bg: #f5f5f5;
  --surface: #ffffff;
  --text: #1a1a1a;
  --accent: #2563eb;
  --user-bg: #dbeafe;
  --assistant-bg: #ffffff;
  /* ... */
}
```

### 11.2 切换逻辑

```javascript
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('oc-chat-theme', theme);
}
themeBtn.onclick = () => {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
};
```

---

## 十二、开发指南

### 12.1 如何新增一个 RPC 调用

1. **定义方法**：确认 Gateway 支持该方法（查看 `protocol/schema/` 目录）

2. **调用**：使用 `sendRpc` 封装

```javascript
async function myNewFunction() {
  try {
    const res = await sendRpc('method.name', {
      param1: 'value',
      param2: 123,
    });
    console.log('结果:', res);
  } catch (err) {
    console.error('失败:', err.message);
  }
}
```

3. **错误处理**：`sendRpc` 在 `ok: false` 时自动 reject

### 12.2 如何处理一个新的事件类型

1. 在 `ws.onmessage` 中添加事件分发：

```javascript
if (frame.type === 'event') {
  if (frame.event === 'your-new-event') {
    handleYourNewEvent(frame.payload);
    return;
  }
}
```

2. 实现处理函数：

```javascript
function handleYourNewEvent(payload) {
  // 校验 sessionKey
  if (payload.sessionKey && !matchSession(payload.sessionKey)) return;
  // 处理逻辑
}
```

### 12.3 如何新增一个工具卡片类型

1. **添加图标**：

```javascript
const TOOL_ICONS = {
  // ... 现有图标
  my_new_tool: '🆕',
};
```

2. **自定义摘要**：

```javascript
function summarizeToolArgs(name, args) {
  // ... 现有逻辑
  if (name === 'my_new_tool') return args.key_param || '';
}
```

3. **自定义结果渲染**（可选，高级）：

修改 `createToolCard` 或 `attachToolResult` 中根据工具名做特殊渲染。

### 12.4 如何添加新的 Agent 配置 Tab

1. **HTML**：在 `.modal-tabs` 中添加按钮，在 `.modal-body` 中添加内容：

```html
<button class="modal-tab" data-tab="mytab">新 Tab</button>

<div class="tab-pane" id="tab-mytab">
  <div class="form-group">
    <label>字段名</label>
    <input type="text" id="mytab-field">
  </div>
</div>
```

2. **JS**：Tab 切换已由通用逻辑处理（`data-tab` 属性匹配）。需要添加数据加载和保存逻辑。

3. **数据流**：选择合适的 RPC（`agents.files.get/set` 读写 Markdown 文件，或其他方法）。

---

## 十三、消息流完整时序图

```
用户点击发送
    │
    ├── addMessage('user', text)          ← 立即显示用户消息
    ├── setRunning(true)                  ← UI 进入加载状态
    ├── sendRpc('chat.send', { ... })     ← 发送到 Gateway
    │
    │   Gateway 处理中...
    │
    ├── 收到 event: agent (stream=assistant)
    │   └── 创建流式文本气泡，逐步渲染
    │
    ├── 收到 event: agent (stream=tool, phase=start)
    │   └── 结束文本，创建工具卡片
    │
    ├── 收到 event: agent (stream=tool, phase=result)
    │   └── 填充工具结果
    │
    ├── 收到 event: agent (stream=assistant)
    │   └── 创建新的文本气泡，继续渲染
    │
    ├── 收到 event: chat (state=final)
    │   ├── setRunning(false)             ← UI 恢复
    │   ├── loadHistory()                 ← 重新加载完整历史
    │   └── hasAgentEvents = false        ← 重置状态
    │
    ▼ 完成
```

---

## 十四、关键全局变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `ws` | WebSocket | 当前连接 |
| `sessionKey` | string | 当前会话 key |
| `canonicalKey` | string | 规范化后的会话 key（从 chat.history 返回） |
| `isRunning` | boolean | Agent 是否正在运行 |
| `streamingEl` | HTMLElement | 当前流式文本的 DOM 元素 |
| `streamBuf` | string | 当前流式文本的累积内容 |
| `hasAgentEvents` | boolean | 是否收到过 agent 事件（控制是否忽略 chat delta） |
| `joinedMidRun` | boolean | 是否是中途重连 |
| `toolCallElements` | Map | toolCallId → DOM 元素的映射 |
| `allMessages` | Array | 当前消息缓存 |
| `hasLoadedFull` | boolean | 是否已加载完整历史（200条） |
| `turnIndex` | number | 当前文本/工具交替轮次 |
| `pendingImages` | Array | 待发送的图片列表 |
| `manualDisconnect` | boolean | 是否手动断开（阻止自动重连） |
| `reconnectAttempt` | number | 当前重连次数 |
| `pending` | Map | reqId → Promise 的映射（等待 RPC 响应） |

---

## 十五、FAQ

### Q: 为什么 final 后要重新 loadHistory？
因为 streaming 期间只能拿到纯文本，而完整的消息包含结构化的工具调用数据。重新加载历史确保最终展示是完整且正确的。

### Q: chat 事件和 agent 事件有什么区别？
- `chat` 事件：粗粒度，只有纯文本流 + 完成/中断/错误状态
- `agent` 事件：细粒度，包含逐工具调用的实时过程（开始、中间结果、完成）
- 有 `agent` 事件时忽略 `chat` 的 `delta`，但 `final`/`aborted`/`error` 仍然需要

### Q: idempotencyKey 有什么用？
防止网络抖动导致的重复发送。Gateway 会根据 key 去重：
- 首次：正常处理
- 运行中重复发送：返回 `in_flight`
- 已完成重复发送：返回 `ok`

### Q: 为什么需要 `verboseLevel: 'on'`？
这告诉 Gateway 推送详细的 `agent` 事件。不开启则只有 `chat` 事件，无法展示工具调用过程。

### Q: 如何支持新的渠道类型？
在 `sessionKindInfo()` 中添加渠道识别逻辑，在 `looksLikeMachineId()` 中添加渠道前缀的过滤规则。

---

*文档版本: 1.0 | 基于 Web Chat index.html 源码分析生成*

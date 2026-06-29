# useTypingEffect Hook 详细说明

## 概述

`useTypingEffect` 是一个自定义 React Hook，提供**消息队列处理**和**打字机效果**功能。

**导出内容**：

```typescript
return {
  processTypingEffect, // 文本打字机
  processPlanTypingEffect, // Plan 打字机
  processQueue, // 队列处理入口
  pauseQueue, // 暂停队列
  resumeQueue, // 恢复队列
  jumpToResult, // 跳过打字机，直接显示结果
  replayQueue, // 重播队列
  processStatus, // 当前处理状态（响应式）
};
```

---

## 内部状态 state.current

所有运行时状态存储在 `useRef` 中，不会触发重渲染：

```typescript
state.current = {
  // ===== 队列相关 =====
  isProcessing: boolean,       // 队列是否正在处理
  isPaused: boolean,           // 队列是否暂停
  currentIndex: number,        // 当前处理到第几条消息
  messageQueue: TypeMessage[], // 消息队列
  handlerMap: Map<string, Function>, // type -> handler 映射
  handlerMaps: TypeHandlerMap[],     // 原始配置（用于 replay）
  onComplete: Function,        // 队列完成回调

  // ===== 文本打字机相关 =====
  isTextTyping: boolean,       // 是否正在进行文本打字
  typingCurIndex: number,      // 当前打到第几个字符
  typeText: Function,          // 打字机递归函数（暂停恢复用）

  // ===== Plan 打字机相关 =====
  isPlanTyping: boolean,       // 是否正在进行 Plan 打字
  currentItemIndex: number,    // 当前处理 content 数组的第几项
  currenttitleIndex: number,   // 当前 item.title 打到第几个字符
  currentDescriptionIndex: number, // 当前 item.description 打到第几个字符
  typePlan: Function,          // Plan 打字机递归函数

  // ===== 控制标志 =====
  disableTyping: boolean,      // 跳过打字机，直接输出剩余内容
  processNextMessage: Function, // 处理下一条消息的函数
};
```

---

## 函数详解

### 1. processQueue

**功能**：启动消息队列处理，按顺序执行每条消息对应的 handler。

**签名**：

```typescript
function processQueue(params: {
  messageQueue: TypeMessage[]; // 要处理的消息数组
  handlerMaps: TypeHandlerMap[]; // handler 配置数组
  onComplete?: (data: any) => void; // 队列完成回调
}): void;
```

**TypeHandlerMap 结构**：

```typescript
interface TypeHandlerMap {
  type: string; // 消息类型，如 "text", "plan"
  handler: (message: TypeMessage) => void; // 对应的处理函数
}
```

**使用示例**：

```typescript
const { processQueue } = useTypingEffect();

// 创建 handler 配置
const handlerMaps = createHandlerMap(ctx, options);

// 启动队列处理
processQueue({
  messageQueue: messages,
  handlerMaps,
  onComplete: () => console.log("队列处理完成"),
});
```

**执行流程**：

```
1. 设置 processStatus = PROCESSING
2. 重置 state
3. 将 handlerMaps 转换为 Map 便于查找
4. 调用 processNextMessage() 开始处理
```

**内部 processNextMessage 逻辑**：

```typescript
const processNextMessage = () => {
  // 1. 检查暂停
  if (isPaused) return;

  // 2. 检查是否处理完
  if (currentIndex >= messageQueue.length) {
    setProcessStatus(COMPLETED);
    onComplete();
    return;
  }

  // 3. 获取当前消息和 handler
  const message = messageQueue[currentIndex];
  const handler = handlerMap.get(message.type);

  // 4. 递增索引
  currentIndex++;

  // 5. 执行 handler
  handler(message);

  // 6. 关键判断：如果 handler 启动了打字机，不继续
  //    打字机完成后会自己调用 processNextMessage
  if (!isTextTyping && !isPlanTyping) {
    processNextMessage();
  }
};
```

---

### 2. processTypingEffect

**功能**：对文本内容进行逐字输出的打字机效果。

**签名**：

```typescript
function processTypingEffect(
  message: TypeMessage, // 原始消息
  options: { speed?: number; step?: number }, // 打字配置
  onProgress: (chunk: TypeMessage) => void, // 每打一批字调用
  onComplete: () => void, // 打字完成回调
): void;
```

**参数说明**：

| 参数            | 类型          | 默认值 | 说明                                           |
| --------------- | ------------- | ------ | ---------------------------------------------- |
| `message`       | `TypeMessage` | -      | 要打字的消息，从 `message.content` 读取文本    |
| `options.speed` | `number`      | `50`   | 每批字符的间隔时间（毫秒）                     |
| `options.step`  | `number`      | `5`    | 每批输出几个字符                               |
| `onProgress`    | `Function`    | -      | 每打一批字符时调用，参数是包含当前字符的 chunk |
| `onComplete`    | `Function`    | -      | 全部打完后调用                                 |

**使用示例**：

```typescript
// 在 handler 中调用
function handleTextWithTyping(curMsg, enableTyping, ctx, options) {
  if (enableTyping && ctx.processTypingEffect) {
    ctx.processTypingEffect(
      curMsg,
      { speed: 50, step: 5 },
      (chunk) => {
        // chunk.content 是当前这批字符，如 "你好"
        textHandler.handle(chunk, ctx, options);
      },
      () => {
        // 打字完成
      },
    );
  } else {
    textHandler.handle(curMsg, ctx, options);
  }
}
```

**执行流程**：

```
假设 content = "你好世界真精彩", step = 3, speed = 50

t=0ms:
  - state.isTextTyping = true
  - typingCurIndex = 0
  - 截取 content[0:3] = "你好世"
  - onProgress({ ...message, content: "你好世" })
  - typingCurIndex = 3
  - setTimeout(typeText, 50)

t=50ms:
  - 截取 content[3:6] = "界真精"
  - onProgress({ ...message, content: "界真精" })
  - typingCurIndex = 6
  - setTimeout(typeText, 50)

t=100ms:
  - 截取 content[6:9] = "彩"
  - onProgress({ ...message, content: "彩" })
  - typingCurIndex = 9
  - setTimeout(typeText, 50)

t=150ms:
  - typingCurIndex >= content.length
  - 清理定时器
  - onComplete()
  - state.isTextTyping = false
  - 调用 processNextMessage() 处理下一条
```

**关键特性**：

1. **设置 isTextTyping = true**：阻止 `processNextMessage` 立即处理下一条
2. **打完后调用 processNextMessage()**：继续队列处理
3. **支持暂停**：检查 `isPaused`，为 true 时直接 return
4. **支持跳过**：检查 `disableTyping`，为 true 时一次性输出剩余内容

---

### 3. processPlanTypingEffect

**功能**：对 Plan 消息（数组结构）进行打字机效果。

**签名**：

```typescript
function processPlanTypingEffect(
  message: TypeMessage, // Plan 消息
  options: { speed?: number; step?: number },
  onProgress: (chunk: TypeMessage) => void,
  onComplete: () => void,
): void;
```

**Plan 消息结构**：

```typescript
// message.content 是数组
content = [
  { title: "分析用户需求", description: "识别设计风格和目标" },
  { title: "生成设计方案", description: "创建多个候选设计" },
  { title: "优化细节", description: "调整颜色和排版" },
];
```

**执行流程**：

```
遍历 content 数组的每一项：
  对当前项 item：
    1. 先逐字输出 item.title
    2. 再逐字输出 item.description
    3. 完成后移到下一项

全部完成后：
  - isPlanTyping = false
  - onComplete()
  - processNextMessage()
```

**使用示例**：

```typescript
// 在 PlanHandler 中
if (options?.typing && ctx.processPlanTypingEffect) {
  ctx.processPlanTypingEffect(
    message,
    { speed: 50, step: 5 },
    (chunk) => {
      // chunk.content 是逐步累加的数组
      // 第一次: [{ title: "分析" }]
      // 第二次: [{ title: "分析用户" }]
      // ...
      this.updatePlanBubble(chunk, ctx);
    },
    () => {},
  );
}
```

---

### 4. pauseQueue

**功能**：暂停队列处理。

**签名**：

```typescript
function pauseQueue(): void;
```

**使用示例**：

```typescript
const { pauseQueue } = useTypingEffect();

// 用户点击暂停按钮
const handlePause = () => {
  pauseQueue();
};
```

**行为**：

- 设置 `state.current.isPaused = true`
- 设置 `processStatus = PAUSED`
- 正在进行的打字机会在下次循环时检测到 `isPaused` 并停止

---

### 5. resumeQueue

**功能**：恢复暂停的队列处理。

**签名**：

```typescript
function resumeQueue(): void;
```

**使用示例**：

```typescript
const { resumeQueue } = useTypingEffect();

// 用户点击继续按钮
const handleResume = () => {
  resumeQueue();
};
```

**行为**：

```typescript
const resumeQueue = () => {
  state.current.isPaused = false;
  setProcessStatus(PROCESSING);

  // 如果之前在打字中，继续打字
  if (isTextTyping && typeText) {
    typeText(); // 从断点继续
  }
  if (isPlanTyping && typePlan) {
    typePlan();
  }

  // 如果不在打字中，继续处理下一条
  if (!isTextTyping && !isPlanTyping && processNextMessage) {
    processNextMessage();
  }
};
```

---

### 6. jumpToResult

**功能**：跳过所有打字机效果，直接显示最终结果。

**签名**：

```typescript
function jumpToResult(): void;
```

**使用示例**：

```typescript
const { jumpToResult } = useTypingEffect();

// 用户点击"跳过"按钮
const handleSkip = () => {
  jumpToResult();
};
```

**行为**：

```typescript
const jumpToResult = () => {
  state.current.disableTyping = true;

  // 如果当前是暂停状态，恢复队列
  if (isProcessing && isPaused) {
    resumeQueue();
  }
};
```

**打字机中的 disableTyping 检测**：

```typescript
// processTypingEffect 内部
if (state.current.disableTyping) {
  // 一次性输出所有剩余内容
  const typingChunk = {
    ...message,
    content: content.slice(currentCharIndex), // 从当前位置到结尾
  };
  onProgress(typingChunk);

  // 立即完成
  state.current.isTextTyping = false;
  processNextMessage();
  return;
}
```

---

### 7. replayQueue

**功能**：重新播放队列（用于分享页的"重播"功能）。

**签名**：

```typescript
function replayQueue(options?: any): void;
```

**使用示例**：

```typescript
const { replayQueue, processStatus } = useTypingEffect();

// 用户点击"重播"按钮
const handleReplay = () => {
  replayQueue();
};
```

**行为**：

```typescript
const replayQueue = (options) => {
  // 只有在 COMPLETED 状态才能重播
  if (processStatus === ProcessStatus.COMPLETED) {
    // 使用之前保存的 messageQueue 和 handlerMaps 重新开始
    processQueue({
      messageQueue: state.current.messageQueue,
      handlerMaps: state.current.handlerMaps,
      onComplete: state.current.onComplete,
      ...options,
    });
  }
};
```

---

### 8. processStatus

**功能**：当前队列处理状态，是 `useState` 响应式变量。

**类型**：

```typescript
enum ProcessStatus {
  DEFAULT = "default", // 初始状态
  PROCESSING = "processing", // 正在处理
  PAUSED = "paused", // 已暂停
  COMPLETED = "completed", // 已完成
}
```

**使用示例**：

```typescript
const { processStatus } = useTypingEffect();

// 根据状态渲染不同 UI
return (
  <div>
    {processStatus === ProcessStatus.PROCESSING && <span>播放中...</span>}
    {processStatus === ProcessStatus.PAUSED && (
      <button onClick={resumeQueue}>继续</button>
    )}
    {processStatus === ProcessStatus.COMPLETED && (
      <button onClick={replayQueue}>重播</button>
    )}
  </div>
);
```

---

## 与 handlers 配合使用

### 不使用打字机的 handler

```typescript
// StatusHandler
handle(message, ctx) {
  // 直接处理，不调用 processTypingEffect
  ctx.bubbleRef.current.data.push(newBubble);
  ctx.setBubbles([...]);
}

// 因为 isTextTyping = false
// processNextMessage 会立即调用自己，处理下一条
```

### 使用打字机的 handler

```typescript
// handleTextWithTyping
function handleTextWithTyping(curMsg, enableTyping, ctx, options) {
  if (enableTyping && ctx.processTypingEffect) {
    // 调用打字机
    // processTypingEffect 内部会设置 isTextTyping = true
    ctx.processTypingEffect(
      curMsg,
      { speed: 50, step: 5 },
      (chunk) => textHandler.handle(chunk, ctx, options),
      () => {},
    );
    // 返回后 isTextTyping = true
    // processNextMessage 检测到后不会继续处理
    // 等打字机完成后，打字机内部会调用 processNextMessage()
  } else {
    textHandler.handle(curMsg, ctx, options);
  }
}
```

### typing vs streamTyping

在 `createHandlerMap` 中有两个不同的配置：

```typescript
// TEXT 类型使用 typing
{
  type: MESSAGE_TYPE_CONSTANTS.TEXT,
  handler: (curMsg) => handleTextWithTyping(curMsg, !!typing, ctx, options),
},

// TEXT_STREAM 类型使用 streamTyping
{
  type: MESSAGE_TYPE_CONSTANTS.TEXT_STREAM,
  handler: (curMsg) => handleTextWithTyping(curMsg, !!streamTyping, ctx, options),
},
```

**区别**：

| 配置           | 适用场景       | 说明                                                              |
| -------------- | -------------- | ----------------------------------------------------------------- |
| `typing`       | 一次性完整内容 | 服务端一次返回全部文本，客户端用打字机逐字显示                    |
| `streamTyping` | 流式增量内容   | 服务端流式返回（SSE），内容本身就是累加的，通常不需要客户端打字机 |

---

## 完整调用链

```
┌──────────────────────────────────────────────────────────────┐
│                      processQueue 入口                        │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    初始化 state, 创建 handlerMap
                              │
                              ▼
               ┌──────────────────────────────┐
               │      processNextMessage      │◄─────────────┐
               └──────────────┬───────────────┘              │
                              │                              │
              ┌───────────────┼───────────────┐              │
              ▼               ▼               ▼              │
         isPaused?      处理完毕?       获取 handler          │
              │               │               │              │
              │               │               ▼              │
              │               │         handler(msg)         │
              │               │               │              │
              │               │    ┌──────────┴──────────┐   │
              │               │    │                     │   │
              │               │    ▼                     ▼   │
              │               │ 不用打字机            用打字机 │
              │               │    │                     │   │
              │               │    │              isTextTyping=true
              │               │    │                     │   │
              │               │    │         processTypingEffect
              │               │    │                     │   │
              │               │    │              逐字输出...│
              │               │    │                     │   │
              │               │    │              打字完成  │
              │               │    │              isTextTyping=false
              │               │    │                     │   │
              │               │    └──────────┬──────────┘   │
              │               │               │              │
              ▼               ▼               └──────────────┘
           return         onComplete
```
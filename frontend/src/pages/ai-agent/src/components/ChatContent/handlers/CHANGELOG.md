# Handlers 消息处理器说明文档

> 本文档描述 ChatContent 组件中消息处理器的架构设计和各处理器的职责

## 目录结构

```
handlers/
├── index.ts              # 入口文件，导出所有处理器和工厂函数
├── types.ts              # 类型定义
├── handlerUtils.ts       # 公共工具函数
├── TextHandler.ts        # 文本消息处理器
├── PlanHandler.ts        # 任务规划处理器
├── DesignHandler.ts      # 单图设计处理器
├── MultiMediaHandler.ts  # 多图消息处理器
├── OfferHandler.ts       # 商品消息处理器
├── ImageChooseHandler.ts # 图片选择处理器
├── UserHandler.ts        # 用户消息处理器
├── IntentHandler.ts      # 意图消息处理器
├── StatusHandler.ts      # 状态变化处理器
└── CHANGELOG.md          # 本文档
```

---

## 核心架构

### 1. 处理器接口 (`TypeMessageHandler`)

所有处理器都实现 `TypeMessageHandler` 接口：

```typescript
interface TypeMessageHandler {
  /** 处理的消息类型（支持单个或多个） */
  type: string | string[];
  /** 处理消息 */
  handle: (
    message: any,
    context: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ) => void;
}
```

### 2. 处理器上下文 (`TypeHandlerContext`)

处理器通过上下文获取所需依赖：

| 属性                      | 类型                                | 说明                       |
| ------------------------- | ----------------------------------- | -------------------------- |
| `bubbleRef`               | `MutableRefObject<TypeBubbleState>` | 气泡状态引用               |
| `setBubbles`              | `(bubbles: any[]) => void`          | 触发气泡渲染               |
| `setProjectName`          | `(name: string) => void`            | 设置会话名称               |
| `setSessionId`            | `(sessionId: string) => void`       | 设置会话 ID                |
| `setCreateDisabled`       | `(disabled: boolean) => void`       | 是否允许创建新会话         |
| `insertStepCardInOrder`   | `Function`                          | 按 stepId 顺序插入步骤卡片 |
| `mergeNonEmptyFields`     | `Function`                          | 合并非空字段               |
| `store`                   | `any`                               | 全局 store                 |
| `fallbackImage`           | `string`                            | 兜底图                     |
| `processTypingEffect`     | `Function`                          | 文本打字机效果处理         |
| `processPlanTypingEffect` | `Function`                          | 任务规划打字机效果处理     |
| `setStatus`               | `Function`                          | 设置输入框状态             |
| `InputStatus`             | `Object`                            | 输入框状态枚举             |

### 3. 处理器选项 (`TypeHandlerOptions`)

| 属性              | 类型      | 说明                   |
| ----------------- | --------- | ---------------------- |
| `addToCanvas`     | `boolean` | 是否添加到画布         |
| `addUserToCanvas` | `boolean` | 用户消息是否添加到画布 |
| `typing`          | `boolean` | 是否启用打字机效果     |
| `streamTyping`    | `boolean` | 是否启用流式打字机效果 |
| `speed`           | `number`  | 打字机速度             |
| `step`            | `number`  | 打字机步长             |

---

## 处理器详解

### 1. TextHandler（文本消息处理器）

**文件**: `TextHandler.ts`

**处理消息类型**:

- `text` - 文本消息（后端一次性传完整内容）
- `text_stream` - 流式文本消息（后端分多次传全量累积内容）
- `design_analyzer` - 设计分析消息（同 text_stream）
- `text_card` - 文本卡片出框
- `text_card_content` - 文本卡片内容回填
- `knowledge` - 知识库消息

**核心逻辑**:

- `text`: 对完整内容直接做打字机效果
- `text_stream`: 计算增量（`calcDelta`），对增量部分做打字机
- 多步骤任务时，文本内容写入步骤卡片的 `contentBlocks`
- 通过 `cardId` 判断是否复用气泡

**关键方法**:

- `handleText()` - 处理一次性完整文本
- `handleTextStream()` - 处理流式文本（计算增量）
- `handleMultiStepTextStream()` - 多步骤任务的文本处理
- `handleTextCard()` - 创建文本卡片占位
- `handleTextCardContent()` - 回填文本卡片内容

---

### 2. PlanHandler（任务规划处理器）

**文件**: `PlanHandler.ts`

**处理消息类型**:

- `plan` - 任务规划（一次性完整内容）
- `plan_stream` - 流式任务规划（全量累积，需计算增量）
- `plan_status` - 步骤状态更新

**核心逻辑**:

- 解析 `content` JSON 获取 `stepNum`、`planId`、`steps`
- `stepNum <= 1` 时不展示任务规划卡片
- 对每个 step 的 `title` 和 `description` 分别计算增量做打字机
- 保存 plan 信息到 `bubbleRef.current.currentPlan`

**关键方法**:

- `handlePlan()` - 处理 plan/plan_stream 消息
- `handlePlanStatus()` - 处理步骤完成状态
- `calcPlanItemsDelta()` - 计算 planItems 的增量
- `mergePlanItems()` - 合并 oldItems 和打字机输出的增量

**数据结构**:

```typescript
// plan 内容结构
{
  stepNum: number,
  planId: string,
  steps: [
    { stepId, displayTitle, displayContent, ... }
  ]
}
```

---

### 3. DesignHandler（单图设计处理器）

**文件**: `DesignHandler.ts`

**处理消息类型**:

- `design` - 单图设计
- `percent_loading` - 进度更新

**核心逻辑**:

- 通过 `cardId` 判断是否复用气泡
- 多步骤任务时，设计内容写入步骤卡片的 `contentBlocks`
- 兼容老的 design 类型多图消息（`handleLegacyMultiImage`）
- 解析 `content` JSON 获取 `mediaModel`

**关键方法**:

- `handleDesign()` - 处理单图设计消息
- `handleMultiStepDesign()` - 多步骤任务的设计处理
- `handlePercentLoading()` - 处理进度更新
- `fillDesignBubble()` - 填充单步骤 design 气泡
- `fillDesignBlock()` - 填充多步骤中的 design 块

**失败处理**:

- 解析失败时设置 `failed: true` 并使用兜底图

---

### 4. MultiMediaHandler（多图消息处理器）

**文件**: `MultiMediaHandler.ts`

**处理消息类型**:

- `multi_media` - 多图出框（创建占位）
- `multi_media_content` - 多图内容回填
- `multi_percent_loading` - 多图进度更新

**核心逻辑**:

- `multi_media`: 创建占位气泡，初始化 `multiImages` 数组
- `multi_media_content`: 根据 `mediaIndex` 回填对应位置的图片
- 多步骤任务时，多图内容写入步骤卡片的 `contentBlocks`
- 动态扩展 `multiImages` 数组长度

**关键方法**:

- `handleMultiMediaCreate()` - 创建多图占位
- `handleMultiMediaContent()` - 回填多图内容
- `handleMultiMediaProgress()` - 更新多图进度
- `getMultiImagesFromBubble()` - 从气泡中获取 multiImages
- `checkAllCompleted()` - 检查是否所有图片都完成

**数据结构**:

```typescript
// multiImages 数组结构
[
  {
    mediaIndex: number,
    startTime: number,
    endTime: number,
    queueWaitingEndTime: number,
    media_item: TypeMediaItem | null,
    is_uncompleted: boolean,
    failed: boolean,
  },
];
```

---

### 5. OfferHandler（商品消息处理器）

**文件**: `OfferHandler.ts`

**处理消息类型**:

- `offer` - 商品结果
- `offer_percent_loading` - 商品 loading 状态
- `oneClickOptResult` - 一键优化结果

**核心逻辑**:

- `offer_percent_loading`: 创建占位气泡
- `offer`: 解析商品数据并回填，同时添加到画布
- `oneClickOptResult`: 直接添加优化后的商品到画布

**关键方法**:

- `handleOfferPercentLoading()` - 处理商品 loading
- `handleOffer()` - 处理商品结果
- `handleOneClickOptResult()` - 处理一键优化结果

---

### 6. ImageChooseHandler（图片选择处理器）

**文件**: `ImageChooseHandler.ts`

**处理消息类型**:

- `imageChoose` - 图片选择

**核心逻辑**:

- 解析 `content` JSON 获取 `images`、`chooseStatus`、`chooseIndex` 等
- 通过 `cardId` 判断是否复用气泡
- `chooseStatus` 为 undefined 时表示未完成

**数据结构**:

```typescript
// content 解析后结构
{
  images: string[],
  chooseStatus: string,
  chooseIndex: number,
  multiSelect: boolean,
  node: string
}
```

---

### 7. UserHandler（用户消息处理器）

**文件**: `UserHandler.ts`

**处理消息类型**:

- `USER` - 用户输入的消息

**核心逻辑**:

- 从 `attachments` 提取图片媒体项
- 从 `offerInfos` 提取商品媒体项
- 创建用户气泡，`is_uncompleted` 直接为 `false`
- 可选添加到画布

---

### 8. IntentHandler（意图消息处理器）

**文件**: `IntentHandler.ts`

**处理消息类型**:

- `intent` - 意图识别结果

**核心逻辑**:

- **不创建气泡**，只存储 `currentIntent` 到 `bubbleRef.current.currentIntent`
- 后续由内容 handler（TextHandler/DesignHandler 等）在创建气泡时带上 intent

---

### 9. StatusHandler（状态变化处理器）

**文件**: `StatusHandler.ts`

**处理消息类型**:

- `statusChange` - 状态变化

**处理状态**:

- `stopByUser` - 用户终止任务
- `allDone` - 任务完成

**核心逻辑**:

- 调用 `markAllUncompletedAsFailed()` 兜底处理未完成的气泡
- 添加任务结束状态气泡
- 重置 `currentIntent`
- 闲聊模式（`smallTalk`）不输出任务已结束

---

## 公共工具函数 (`handlerUtils.ts`)

| 函数                                                             | 说明                         |
| ---------------------------------------------------------------- | ---------------------------- |
| `findBubbleByCardId(cardId, ctx)`                                | 通过 cardId 查找已存在的气泡 |
| `recordCardIdMapping(cardId, ctx)`                               | 记录 cardId 到气泡的映射     |
| `createBubble(cardDetail, ctx, role)`                            | 创建新气泡                   |
| `getOrCreateStepCard(planId, stepId, ctx, initialContentBlocks)` | 获取或创建步骤卡片           |
| `createInitialMultiImages(mediaNum)`                             | 创建初始多图数组             |
| `parseMediaContent(content, contentType)`                        | 解析媒体内容 JSON            |
| `isMultiStepTask(ctx)`                                           | 检查是否是多步骤任务         |
| `addMediaToCanvas(items, contentType, ctx)`                      | 添加媒体到画布               |
| `calcDelta(oldContent, newContent)`                              | 计算增量内容                 |

---

## 消息类型映射表

| 消息类型                | 处理器             | 说明         |
| ----------------------- | ------------------ | ------------ |
| `session`               | index.ts           | 设置会话名称 |
| `intent`                | IntentHandler      | 存储意图     |
| `USER`                  | UserHandler        | 用户消息     |
| `error`                 | index.ts           | 错误消息     |
| `text`                  | TextHandler        | 文本消息     |
| `text_stream`           | TextHandler        | 流式文本     |
| `design_analyzer`       | TextHandler        | 设计分析     |
| `text_card`             | TextHandler        | 文本卡片出框 |
| `text_card_content`     | TextHandler        | 文本卡片回填 |
| `knowledge`             | TextHandler        | 知识库消息   |
| `multi_media`           | MultiMediaHandler  | 多图出框     |
| `multi_media_content`   | MultiMediaHandler  | 多图回填     |
| `multi_percent_loading` | MultiMediaHandler  | 多图进度     |
| `design`                | DesignHandler      | 单图设计     |
| `percent_loading`       | DesignHandler      | 单图进度     |
| `multi_image`           | DesignHandler      | 多图（兼容） |
| `plan`                  | PlanHandler        | 任务规划     |
| `plan_stream`           | PlanHandler        | 流式任务规划 |
| `plan_status`           | PlanHandler        | 步骤状态     |
| `offer`                 | OfferHandler       | 商品结果     |
| `offer_percent_loading` | OfferHandler       | 商品进度     |
| `oneClickOptResult`     | OfferHandler       | 一键优化     |
| `imageChoose`           | ImageChooseHandler | 图片选择     |
| `statusChange`          | StatusHandler      | 状态变化     |

---

## 去重策略

所有处理器统一使用 **cardId** 进行去重：

1. 后端返回的消息中，同一个气泡的 `cardId` 是相同的（如流式消息的多次推送）
2. 通过 `ctx.bubbleRef.current.cardIdMap` 维护 `cardId -> bubbleIndex` 的映射
3. 收到消息时先通过 `findBubbleByCardId()` 查找是否已存在
4. 已存在则更新，不存在则创建并调用 `recordCardIdMapping()` 记录映射

---

## 多步骤任务处理

当 `isMultiStepTask(ctx)` 返回 `true` 且消息带有 `planId` 和 `stepId` 时：

1. 调用 `getOrCreateStepCard()` 获取或创建步骤卡片
2. 内容写入步骤卡片的 `contentBlocks` 数组
3. `contentBlocks` 结构：
   ```typescript
   [
     { type: 'text', content: { ... } },
     { type: 'design', content: { ... } },
     { type: 'multi_media', content: { ... } }
   ]
   ```
4. 所有内容块完成后，标记步骤卡片 `is_uncompleted = false`

---

## 打字机效果

### 文本打字机 (`processTypingEffect`)

- 用于 `text`、`text_stream` 等文本消息
- **注意**：`onProgress` 回调返回的是**当前步进的字符**，而不是累积后的内容，需要手动累积

```typescript
let accumulatedContent = "";
processTypingEffect(
  { content },
  { speed, step },
  (chunk) => {
    accumulatedContent += chunk.content; // 手动累积
    bubble.card_detail.content = accumulatedContent;
    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  },
  () => {},
);
```

### 任务规划打字机 (`processPlanTypingEffect`)

- 用于 `plan`、`plan_stream` 消息
- 接收 `{ title, description }` 数组
- 返回的 `chunk.content` 是从零开始累积的数组（与 `processTypingEffect` 行为不同）

### 增量计算 (`calcDelta`)

- 后端返回全量累积内容，前端计算增量
- 例如：旧内容 `"abc"`，新内容 `"abcdef"`，增量为 `"def"`

---

## 使用示例

```typescript
import { createHandlerMap } from "./handlers";

// 创建处理器映射
const handlerMap = createHandlerMap(ctx, {
  typing: true,
  streamTyping: true,
  addToCanvas: true,
});

// 处理消息
function handleMessage(message: any) {
  const handler = handlerMap.find((h) => h.type === message.type);
  if (handler) {
    handler.handler(message);
  }
}
```

/**
 * 文本消息处理器
 *
 * 处理以下消息类型：
 * - text: 文本消息
 * - text_stream: 流式文本消息
 * - design_analyzer: 设计分析消息
 * - knowledge: 知识库消息
 */

import { MESSAGE_TYPE_CONSTANTS } from "../constants";
import type {
  TypeHandlerContext,
  TypeHandlerOptions,
  TypeMessageHandler,
  TypeBubble,
} from "./types";
import {
  findBubbleByCardId,
  createBubble,
  recordCardIdMapping,
  getOrCreateStepCard,
  isMultiStepTask,
  calcDelta,
} from "./handlerUtils";

class TextHandler implements TypeMessageHandler {
  type = [
    MESSAGE_TYPE_CONSTANTS.TEXT,
    MESSAGE_TYPE_CONSTANTS.TEXT_STREAM,
    MESSAGE_TYPE_CONSTANTS.DESIGN_ANALYZER,
    MESSAGE_TYPE_CONSTANTS.KNOWLEDGE,
  ];

  handle(
    message: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const { type } = message;

    switch (type) {
      // text: 一次性传完整内容，直接对完整内容做打字机
      case MESSAGE_TYPE_CONSTANTS.TEXT:
        this.handleText(message, ctx, options);
        break;
      // text_stream: 分多次传全量累积内容，需要计算增量做打字机
      case MESSAGE_TYPE_CONSTANTS.TEXT_STREAM:
        this.handleTextStream(message, ctx, options);
        break;
      // design_analyzer: content 是 JSON 字符串，需要先解析
      case MESSAGE_TYPE_CONSTANTS.DESIGN_ANALYZER:
        this.handleDesignAnalyzer(message, ctx, options);
        break;
      case MESSAGE_TYPE_CONSTANTS.KNOWLEDGE:
        this.handleCommonMsg(message, ctx);
        break;
    }
  }

  /**
   * 处理 type: text 消息
   *
   * 一次性传完整内容，直接对完整内容做打字机
   * 多步骤任务时，需要将文本插入到步骤卡片的 contentBlocks 中
   */
  private handleText(
    data: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const { cardId, type, content, planId, stepId, ...others } = data;

    // 多步骤任务：文本内容写入步骤卡片的 contentBlocks
    if (isMultiStepTask(ctx) && stepId && planId) {
      this.handleMultiStepText(data, ctx, options);
      return;
    }

    // ===== 单步骤任务逻辑 =====
    // 1. 通过 cardId 找已存在的气泡
    let targetBubble = findBubbleByCardId(cardId, ctx);

    // 2. 已有气泡则合并元数据，否则创建新气泡
    if (targetBubble) {
      targetBubble.card_detail = ctx.mergeNonEmptyFields(
        targetBubble.card_detail,
        others,
      );
    } else {
      targetBubble = createBubble(
        {
          ...others,
          type: type || MESSAGE_TYPE_CONSTANTS.TEXT,
          content: "",
          is_uncompleted: true,
          cardId,
        },
        ctx,
      );
      recordCardIdMapping(cardId, ctx);
    }

    // 3. 有内容才做打字机
    if (content) {
      this.updateTextBubbleDirect(targetBubble, content, ctx, options);
    } else {
      ctx.setBubbles([...ctx.bubbleRef.current.data]);
    }
  }

  /**
   * 多步骤任务的文本处理（type: text）
   * 将文本插入到步骤卡片的 contentBlocks 中
   */
  private handleMultiStepText(
    data: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const { type, content, planId, stepId, ...others } = data;

    const { bubble: stepCardBubble } = getOrCreateStepCard(
      planId,
      stepId,
      ctx,
      [],
    );

    // 确保 contentBlocks 存在
    if (!stepCardBubble.card_detail.contentBlocks) {
      stepCardBubble.card_detail.contentBlocks = [];
    }

    const { contentBlocks } = stepCardBubble.card_detail;
    let lastBlock = contentBlocks[contentBlocks.length - 1];

    // 如果最后一块不是 text，创建新的 text 块
    if (lastBlock?.type !== MESSAGE_TYPE_CONSTANTS.TEXT) {
      lastBlock = {
        type: MESSAGE_TYPE_CONSTANTS.TEXT,
        content: {
          ...others,
          type: type || MESSAGE_TYPE_CONSTANTS.TEXT,
          content: "",
        },
      };
      contentBlocks.push(lastBlock);
    }

    // 对完整内容做打字机效果
    const { processTypingEffect } = ctx;
    const { typing, speed, step } = options || {};
    const oldContent = lastBlock.content.content ?? "";

    if (typing && processTypingEffect && content) {
      // 启用打字机：对完整内容逐字显示
      let accumulatedContent = "";
      processTypingEffect(
        { content },
        { speed, step },
        (chunk) => {
          accumulatedContent += chunk.content;
          lastBlock.content.content = oldContent + accumulatedContent;
          ctx.setBubbles([...ctx.bubbleRef.current.data]);
        },
        () => {},
      );
    } else {
      // 不启用打字机：直接追加内容
      lastBlock.content.content = oldContent + (content ?? "");
      ctx.setBubbles([...ctx.bubbleRef.current.data]);
    }
  }

  /**
   * 处理 type: design_analyzer 消息
   *
   * content 是 JSON 字符串 {"toolResultType":"text","content":"实际markdown内容"}
   * 需要先解析 JSON 提取实际内容
   *
   * contentType 区分两种模式：
   * - "text_stream"：分多次传全量累积内容，需要计算增量再做打字机
   * - "text"（默认）：一次性返回完整内容，直接对完整内容做打字机
   */
  private handleDesignAnalyzer(
    data: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    // 1. 解析 JSON content
    let content = "";
    try {
      const parseContent = JSON.parse(data.content);
      if (parseContent?.toolResultType === MESSAGE_TYPE_CONSTANTS.TEXT) {
        content = parseContent.content;
      }
    } catch (err) {}

    const { planId, stepId, contentType } = data;
    // contentType 区分模式：text_stream 是流式（需计算增量），text 是一次性
    const isStreamMode = contentType === MESSAGE_TYPE_CONSTANTS.TEXT_STREAM;

    // 2. 多步骤任务
    if (isMultiStepTask(ctx) && stepId && planId) {
      if (isStreamMode) {
        this.handleMultiStepTextStream({ ...data, content }, ctx, options);
      } else {
        this.handleMultiStepText({ ...data, content }, ctx, options);
      }
      return;
    }

    // 3. 单步骤任务
    if (isStreamMode) {
      this.handleTextStream({ ...data, content }, ctx, options);
    } else {
      this.handleText({ ...data, content }, ctx, options);
    }
  }

  /**
   * 处理 type: text_stream 消息
   *
   * 分多次传全量累积内容，需要计算增量做打字机
   */
  private handleTextStream(
    data: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const { cardId, type, content, planId, stepId, isCompleted, ...others } =
      data;

    // 多步骤任务：文本内容写入步骤卡片的 contentBlocks
    if (isMultiStepTask(ctx) && stepId && planId) {
      this.handleMultiStepTextStream(data, ctx, options);
      return;
    }

    // ===== 单步骤任务逻辑 =====
    // 1. 通过 cardId 找已存在的气泡
    let targetBubble = findBubbleByCardId(cardId, ctx);

    // 2. 已有气泡则合并元数据，否则创建新气泡
    if (targetBubble) {
      targetBubble.card_detail = ctx.mergeNonEmptyFields(
        targetBubble.card_detail,
        others,
      );
    } else {
      targetBubble = createBubble(
        {
          ...others,
          type: type || MESSAGE_TYPE_CONSTANTS.TEXT,
          content: "",
          is_uncompleted: true,
          cardId,
        },
        ctx,
      );
      recordCardIdMapping(cardId, ctx);
    }

    // 3. 流式增量更新（含 isCompleted 标记）
    const oldContent = targetBubble.card_detail.content ?? "";
    this.applyStreamDelta(
      targetBubble.card_detail,
      content,
      oldContent,
      ctx,
      options,
      isCompleted,
    );
  }

  /**
   * 多步骤任务的文本处理（type: text_stream）
   * 分多次传全量累积内容，需要计算增量做打字机
   */
  private handleMultiStepTextStream(
    data: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const { type, content, planId, stepId, isCompleted, ...others } = data;

    const { bubble: stepCardBubble } = getOrCreateStepCard(
      planId,
      stepId,
      ctx,
      [],
    );

    // 无论有没有内容，先确保 block 存在并合并元数据（title/icon 等）
    const { block, oldContent } = this.ensureStepCardTextBlock(
      stepCardBubble,
      type,
      others,
      ctx,
    );

    // 流式增量更新（含 isCompleted 标记）
    this.applyStreamDelta(
      block.content,
      content,
      oldContent,
      ctx,
      options,
      isCompleted,
    );
  }

  /**
   * 通用消息处理（knowledge 等）：通过 cardId 找到对应气泡并合并数据
   */
  private handleCommonMsg(data: any, ctx: TypeHandlerContext): void {
    const { cardId } = data;
    let targetBubble = findBubbleByCardId(cardId, ctx);

    if (!targetBubble) {
      targetBubble = createBubble(
        {
          ...data,
          is_uncompleted: true,
          cardId,
        },
        ctx,
      );
      recordCardIdMapping(cardId, ctx);
    }

    targetBubble.card_detail = ctx.mergeNonEmptyFields(
      targetBubble.card_detail,
      data,
    );

    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  /**
   * 更新气泡内容（type: text）
   * 对完整内容做打字机
   */
  private updateTextBubbleDirect(
    bubble: TypeBubble,
    content: string,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const { processTypingEffect } = ctx;
    const { typing, speed, step } = options || {};

    if (typing && processTypingEffect && content) {
      // 启用打字机：对完整内容逐字显示
      // 注意：processTypingEffect 每次回调只返回当前步进的字符，需要手动累积
      let accumulatedContent = "";
      processTypingEffect(
        { content },
        { speed, step },
        (chunk) => {
          accumulatedContent += chunk.content;
          bubble.card_detail.content = accumulatedContent;
          ctx.setBubbles([...ctx.bubbleRef.current.data]);
        },
        () => {
          // 打字完成，标记气泡为已完成（触发 analyzer 折叠）
          bubble.card_detail.is_uncompleted = false;
          ctx.setBubbles([...ctx.bubbleRef.current.data]);
        },
      );
    } else {
      // 不启用打字机：直接显示完整内容
      bubble.card_detail.content = content ?? "";
      bubble.card_detail.is_uncompleted = false;
      ctx.setBubbles([...ctx.bubbleRef.current.data]);
    }
  }

  /**
   * 流式增量更新（通用）
   *
   * 统一处理 text_stream 模式下的增量计算、打字机效果、isCompleted 标记
   *
   * @param target      读写 content / is_uncompleted 的目标对象
   * @param newContent  本次消息的全量文本（可能为空）
   * @param oldContent  上一次的文本内容，用于计算增量
   * @param ctx         handler 上下文
   * @param options     打字机选项
   * @param isCompleted 消息是否已完成
   */
  private applyStreamDelta(
    target: any,
    newContent: string | undefined,
    oldContent: string,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
    isCompleted?: boolean,
  ): void {
    // isCompleted 语义：
    //   true      → 轮询模式最后一条消息，标记完成
    //   false     → 轮询模式中间消息，不标记
    //   undefined → detail/share 模式（无此字段），消息已完整，标记完成
    const shouldMarkCompleted = isCompleted !== false;

    // 标记完成并刷新气泡
    const tryMarkCompleted = () => {
      if (shouldMarkCompleted) {
        target.is_uncompleted = false;
      }
      ctx.setBubbles([...ctx.bubbleRef.current.data]);
    };

    // 没有内容：只处理完成标记
    if (!newContent) {
      tryMarkCompleted();
      return;
    }

    const { delta, baseContent } = calcDelta(oldContent, newContent);

    // 没有增量：只处理完成标记
    if (!delta) {
      if (shouldMarkCompleted) {
        tryMarkCompleted();
      }
      return;
    }

    const { processTypingEffect } = ctx;
    const { typing, speed, step } = options || {};

    if (typing && processTypingEffect) {
      target.content = baseContent;
      let accumulatedDelta = "";
      processTypingEffect(
        { content: delta },
        { speed, step },
        (chunk) => {
          accumulatedDelta += chunk.content;
          target.content = baseContent + accumulatedDelta;
          ctx.setBubbles([...ctx.bubbleRef.current.data]);
        },
        tryMarkCompleted,
      );
    } else {
      target.content = newContent;
      tryMarkCompleted();
    }
  }

  /**
   * 获取或创建步骤卡片中的文本 block，同时合并元数据
   *
   * @returns { block, oldContent } block 引用 + 旧文本内容
   */
  private ensureStepCardTextBlock(
    stepCardBubble: TypeBubble,
    type: string | undefined,
    others: any,
    ctx: TypeHandlerContext,
  ): { block: any; oldContent: string } {
    if (!stepCardBubble.card_detail.contentBlocks) {
      stepCardBubble.card_detail.contentBlocks = [];
    }

    const { contentBlocks } = stepCardBubble.card_detail;
    const lastBlock = contentBlocks[contentBlocks.length - 1];

    let block: any;
    let oldContent = "";

    if (lastBlock?.type === MESSAGE_TYPE_CONSTANTS.TEXT) {
      // 复用已有 text block
      oldContent = lastBlock.content.content ?? "";
      lastBlock.content = ctx.mergeNonEmptyFields(lastBlock.content, others);
      block = lastBlock;
    } else {
      // 新建 text block（即使 content 为空也要创建，以写入 title/icon 等元数据）
      block = {
        type: MESSAGE_TYPE_CONSTANTS.TEXT,
        content: {
          ...others,
          type: type || MESSAGE_TYPE_CONSTANTS.TEXT,
          content: "",
        },
      };
      contentBlocks.push(block);
    }

    return { block, oldContent };
  }
}

const textHandler = new TextHandler();

export default textHandler;

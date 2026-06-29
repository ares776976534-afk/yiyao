/**
 * 设计消息处理器
 *
 * 处理以下消息类型：
 * - design: 单图设计
 * - percent_loading: 进度更新
 */

import { isNil } from "lodash";
import { MESSAGE_TYPE_CONSTANTS, CONTENT_TYPE_CONSTANTS } from "../constants";
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
  parseMediaContent,
  addMediaToCanvas,
} from "./handlerUtils";

class DesignHandler implements TypeMessageHandler {
  type = [
    MESSAGE_TYPE_CONSTANTS.DESIGN,
    MESSAGE_TYPE_CONSTANTS.PERCENT_LOADING,
  ];

  handle(
    message: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const { type } = message;

    switch (type) {
      case MESSAGE_TYPE_CONSTANTS.DESIGN:
        this.handleDesign(message, ctx, options?.addToCanvas);
        break;
      case MESSAGE_TYPE_CONSTANTS.PERCENT_LOADING:
        this.handlePercentLoading(message, ctx);
        break;
    }
  }

  /**
   * 处理 design 消息
   *
   * 核心逻辑：用消息 cardId 判断是否复用气泡
   */
  private handleDesign(
    data: any,
    ctx: TypeHandlerContext,
    addToCanvas?: boolean,
  ): void {
    const { cardId, planId, stepId } = data;

    // 多步骤任务中的单图
    if (isMultiStepTask(ctx) && stepId && planId) {
      this.handleMultiStepDesign(data, ctx, addToCanvas);
      return;
    }

    // ===== 单步骤任务逻辑 =====
    // 通过消息 cardId 找已存在的气泡，没找到则创建
    let targetBubble = findBubbleByCardId(cardId, ctx);

    if (!targetBubble) {
      targetBubble = createBubble(
        {
          ...data,
          type: MESSAGE_TYPE_CONSTANTS.DESIGN,
          is_uncompleted: true,
          media_items: [],
          cardId,
        },
        ctx,
      );
      recordCardIdMapping(cardId, ctx);
    }

    this.fillDesignBubble(data, targetBubble, ctx, addToCanvas);

    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  private handleMultiStepDesign(
    data: any,
    ctx: TypeHandlerContext,
    addToCanvas?: boolean,
  ): void {
    const { cardId, stepId, planId } = data;
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

    // 通过 cardId 精确查找已存在的 design 块
    let designBlock = this.findDesignBlockByCardId(stepCardBubble, cardId);

    // 没找到则创建新的
    if (!designBlock) {
      designBlock = {
        type: MESSAGE_TYPE_CONSTANTS.DESIGN,
        content: {
          type: MESSAGE_TYPE_CONSTANTS.DESIGN,
          media_items: [],
          is_uncompleted: true,
          ...ctx.mergeNonEmptyFields({}, data),
        },
      };
      stepCardBubble.card_detail.contentBlocks.push(designBlock);
    }

    // 填充内容
    this.fillDesignBlock(data, designBlock, ctx, addToCanvas);

    this.markStepCardCompleteIfAllDone(stepCardBubble);
    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  /**
   * 填充单步骤 design 气泡
   */
  private fillDesignBubble(
    data: any,
    targetBubble: TypeBubble,
    ctx: TypeHandlerContext,
    addToCanvas?: boolean,
  ): void {
    const { card_detail } = targetBubble;
    const isFirstDesign = !card_detail.title && !card_detail.icon;
    const hasEmptyIconTitle = data.icon === "" && data.title === "";

    // 卡片头部（第一次返回，只有元数据）
    if (
      !data.content &&
      !data.errContent &&
      !data.errorContent &&
      (isFirstDesign || !hasEmptyIconTitle)
    ) {
      targetBubble.card_detail = {
        ...card_detail,
        ...ctx.mergeNonEmptyFields(card_detail, data),
        media_items: card_detail.media_items || [],
      };
      return;
    }

    // 有内容返回
    const items = parseMediaContent(data.content, data.contentType);

    if (items) {
      card_detail.media_items = items;
      card_detail.is_uncompleted = false;

      if (addToCanvas) {
        addMediaToCanvas(items, data.contentType, ctx);
      }
    } else {
      // 解析失败或错误内容
      this.setDesignFailed(card_detail, ctx.fallbackImage);
    }
  }

  /**
   * 填充多步骤中的 design 块
   */
  private fillDesignBlock(
    data: any,
    designBlock: any,
    ctx: TypeHandlerContext,
    addToCanvas?: boolean,
  ): void {
    const { content } = designBlock;
    const isFirstDesign = !content.title && !content.icon;
    const hasEmptyIconTitle = data.icon === "" && data.title === "";

    // 第一次返回或正常的元数据更新
    if (
      !data.content &&
      !data.errContent &&
      !data.errorContent &&
      (isFirstDesign || !hasEmptyIconTitle)
    ) {
      Object.assign(content, ctx.mergeNonEmptyFields(content, data));
      return;
    }

    // 图片内容
    const items = parseMediaContent(data.content, data.contentType);

    if (items) {
      content.media_items = items;
      content.is_uncompleted = false;

      if (addToCanvas) {
        addMediaToCanvas(items, data.contentType, ctx);
      }
    } else {
      this.setDesignFailed(content, ctx.fallbackImage);
    }
  }

  private handlePercentLoading(data: any, ctx: TypeHandlerContext): void {
    const { stepId, planId, startTime, endTime, queueWaitingEndTime } = data;
    const progressData = { startTime, endTime, queueWaitingEndTime };

    if (isMultiStepTask(ctx) && stepId && planId) {
      this.updateStepCardProgress(data, ctx, progressData);
    } else {
      this.updateSingleBubbleProgress(data, ctx, progressData);
    }

    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  private updateStepCardProgress(
    data: any,
    ctx: TypeHandlerContext,
    progressData: any,
  ): void {
    const { cardId } = data;
    const key = `${data.planId}_${data.stepId}`;
    const bubbleIndex = ctx.bubbleRef.current.bubbleIdMap.get(key);

    if (isNil(bubbleIndex)) return;

    const stepCardBubble = ctx.bubbleRef.current.data[bubbleIndex];
    if (!stepCardBubble) return;

    if (stepCardBubble.card_detail.contentBlocks) {
      const targetBlock = this.findDesignBlockByCardId(stepCardBubble, cardId);
      if (targetBlock?.content) {
        Object.assign(targetBlock.content, progressData);
      }
    } else if (stepCardBubble.card_detail.designContent) {
      Object.assign(stepCardBubble.card_detail.designContent, progressData);
    }
  }

  private updateSingleBubbleProgress(
    data: any,
    ctx: TypeHandlerContext,
    progressData: any,
  ): void {
    const { cardId } = data;

    // 通过消息 cardId 找已存在的气泡
    const targetBubble = findBubbleByCardId(cardId, ctx);

    if (targetBubble) {
      Object.assign(targetBubble.card_detail, progressData);
    }
  }

  // ============ 辅助方法 ============

  private findDesignBlockByCardId(
    stepCardBubble: TypeBubble,
    cardId: string | undefined,
  ): any {
    const blocks = stepCardBubble.card_detail.contentBlocks;
    if (!blocks || isNil(cardId)) return undefined;

    return blocks.find(
      (block: any) =>
        block.type === MESSAGE_TYPE_CONSTANTS.DESIGN &&
        block.content?.cardId === cardId,
    );
  }

  /** 设置 design 卡片失败状态 */
  private setDesignFailed(cardDetail: any, fallbackImg: string): void {
    cardDetail.media_items = [
      {
        media_type: CONTENT_TYPE_CONSTANTS.IMAGE,
        media_cover_url: fallbackImg,
        media_url: fallbackImg,
      },
    ];
    cardDetail.is_uncompleted = false;
    cardDetail.failed = true;
  }

  /** 标记步骤卡片完成（如果所有内容块都完成） */
  private markStepCardCompleteIfAllDone(stepCardBubble: TypeBubble): void {
    const contentBlocks = stepCardBubble.card_detail?.contentBlocks;
    if (!contentBlocks?.length) return;

    const allDone = contentBlocks.every(
      (block: any) => !block.content?.is_uncompleted,
    );
    if (allDone) {
      stepCardBubble.card_detail.is_uncompleted = false;
    }
  }
}

const designHandler = new DesignHandler();

export default designHandler;

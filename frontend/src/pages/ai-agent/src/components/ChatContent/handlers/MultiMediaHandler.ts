/**
 * 多图消息处理器
 *
 * 处理以下消息类型：
 * - multi_media: 多图出框（创建占位）
 * - multi_media_content: 多图内容回填
 * - multi_percent_loading: 多图进度更新
 *
 * 去重策略：
 * - 单步骤：用 cardId 通过 bubbleIdMap 判断是否复用气泡
 * - 多步骤：用 planId_stepId 找步骤卡片，在 contentBlocks 中用 cardId 查找多图块
 */

import { isNil } from "lodash";
import { MESSAGE_TYPE_CONSTANTS, CONTENT_TYPE_CONSTANTS } from "../constants";
import type {
  TypeHandlerContext,
  TypeHandlerOptions,
  TypeMessageHandler,
  TypeBubble,
  TypeMultiImageItem,
} from "./types";
import {
  findBubbleByCardId,
  createBubble,
  recordCardIdMapping,
  getOrCreateStepCard,
  isMultiStepTask,
  createInitialMultiImages,
  parseMediaContent,
  addMediaToCanvas,
} from "./handlerUtils";

class MultiMediaHandler implements TypeMessageHandler {
  type = [
    MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA,
    MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA_CONTENT,
    MESSAGE_TYPE_CONSTANTS.MULTI_PERCENT_LOADING,
  ];

  handle(
    message: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const { type } = message;

    switch (type) {
      case MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA:
        this.handleMultiMediaCreate(message, ctx);
        break;
      case MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA_CONTENT:
        this.handleMultiMediaContent(message, ctx, options?.addToCanvas);
        break;
      case MESSAGE_TYPE_CONSTANTS.MULTI_PERCENT_LOADING:
        this.handleMultiMediaProgress(message, ctx);
        break;
    }
  }

  // ============ 多图出框 ============

  /**
   * 处理多图出框（创建占位气泡）
   */
  private handleMultiMediaCreate(data: any, ctx: TypeHandlerContext): void {
    const { planId, stepId } = data;

    // 多步骤任务：多图作为 contentBlock 添加到步骤卡片
    if (isMultiStepTask(ctx) && stepId && planId) {
      this.handleMultiStepCreate(data, ctx);
      return;
    }

    // 单步骤任务：创建独立的多图气泡
    this.handleSingleStepCreate(data, ctx);
  }

  /**
   * 单步骤：创建独立的多图气泡
   */
  private handleSingleStepCreate(data: any, ctx: TypeHandlerContext): void {
    const { cardId, mediaNum } = data;

    // 用 cardId 检查是否已存在
    if (findBubbleByCardId(cardId, ctx)) return;

    const cardDetail = this.buildMultiMediaCardDetail(data, mediaNum);
    createBubble(cardDetail, ctx);
    recordCardIdMapping(cardId, ctx);

    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  /**
   * 多步骤：多图作为 contentBlock 添加到步骤卡片
   */
  private handleMultiStepCreate(data: any, ctx: TypeHandlerContext): void {
    const { cardId, mediaNum, planId, stepId } = data;

    // 检查步骤卡片的 contentBlocks 中是否已有该 cardId 的多图
    const stepKey = `${planId}_${stepId}`;
    const bubbleIndex = ctx.bubbleRef.current.bubbleIdMap.get(stepKey);
    const stepCard = bubbleIndex
      ? ctx.bubbleRef.current.data[bubbleIndex]
      : null;

    const hasMultiMedia = stepCard?.card_detail?.contentBlocks?.some(
      (block: any) =>
        block.type === MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA &&
        block.content?.cardId === cardId,
    );

    if (hasMultiMedia) return;

    // 获取或创建步骤卡片
    const { bubble: stepCardBubble, bubbleIndex: newBubbleIndex } =
      getOrCreateStepCard(planId, stepId, ctx);

    if (!stepCardBubble || isNil(newBubbleIndex)) return;

    // 添加多图内容块到 contentBlocks
    if (!stepCardBubble.card_detail.contentBlocks) {
      stepCardBubble.card_detail.contentBlocks = [];
    }

    const cardDetail = this.buildMultiMediaCardDetail(data, mediaNum);
    stepCardBubble.card_detail.contentBlocks.push({
      type: MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA,
      content: cardDetail,
    });

    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  // ============ 多图内容回填 ============

  /**
   * 处理多图内容回填
   */
  private handleMultiMediaContent(
    data: any,
    ctx: TypeHandlerContext,
    addToCanvas?: boolean,
  ): void {
    const { planId, stepId } = data;

    // 多步骤任务
    if (isMultiStepTask(ctx) && stepId && planId) {
      this.handleMultiStepContent(data, ctx, addToCanvas);
      return;
    }

    // 单步骤任务
    this.handleSingleStepContent(data, ctx, addToCanvas);
  }

  /**
   * 单步骤：回填独立多图气泡
   */
  private handleSingleStepContent(
    data: any,
    ctx: TypeHandlerContext,
    addToCanvas?: boolean,
  ): void {
    const { cardId, mediaIndex } = data;

    // 用 cardId 找独立多图气泡
    const targetBubble = findBubbleByCardId(cardId, ctx);
    if (!targetBubble) return;

    const { multiImages } = targetBubble.card_detail;
    if (!multiImages || isNil(mediaIndex)) return;

    this.ensureMultiImagesLength(multiImages, mediaIndex);
    this.fillOrFailMediaItem(data, multiImages, mediaIndex, addToCanvas, ctx);

    // 检查是否全部完成
    if (this.isAllCompleted(multiImages)) {
      targetBubble.card_detail.is_uncompleted = false;
    }

    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  /**
   * 多步骤：回填步骤卡片中的多图块
   */
  private handleMultiStepContent(
    data: any,
    ctx: TypeHandlerContext,
    addToCanvas?: boolean,
  ): void {
    const { cardId, mediaIndex, planId, stepId } = data;

    // 用 planId_stepId 找步骤卡片
    const stepKey = `${planId}_${stepId}`;
    const bubbleIndex = ctx.bubbleRef.current.bubbleIdMap.get(stepKey);
    if (isNil(bubbleIndex)) return;

    const stepCardBubble = ctx.bubbleRef.current.data[bubbleIndex];
    if (!stepCardBubble) return;

    // 在 contentBlocks 中用 cardId 找多图块
    const { multiImages, multiMediaBlock } = this.findMultiMediaInStepCard(
      stepCardBubble,
      cardId,
    );

    if (!multiImages || isNil(mediaIndex)) return;

    this.ensureMultiImagesLength(multiImages, mediaIndex);
    this.fillOrFailMediaItem(data, multiImages, mediaIndex, addToCanvas, ctx);

    // 检查是否全部完成
    if (this.isAllCompleted(multiImages)) {
      if (multiMediaBlock) {
        multiMediaBlock.content.is_uncompleted = false;
      }
      this.markStepCardCompleteIfAllDone(stepCardBubble);
    }

    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  // ============ 多图进度更新 ============

  /**
   * 处理多图进度更新
   */
  private handleMultiMediaProgress(data: any, ctx: TypeHandlerContext): void {
    const { planId, stepId } = data;

    // 多步骤任务
    if (isMultiStepTask(ctx) && stepId && planId) {
      this.handleMultiStepProgress(data, ctx);
      return;
    }

    // 单步骤任务
    this.handleSingleStepProgress(data, ctx);
  }

  /**
   * 单步骤：更新独立多图气泡的进度
   */
  private handleSingleStepProgress(data: any, ctx: TypeHandlerContext): void {
    const { cardId, mediaIndex, startTime, endTime, queueWaitingEndTime } =
      data;

    if (isNil(mediaIndex)) return;

    // 用 cardId 找独立多图气泡
    const targetBubble = findBubbleByCardId(cardId, ctx);
    if (!targetBubble) return;

    const { multiImages } = targetBubble.card_detail;
    if (!multiImages) return;

    this.ensureMultiImagesLength(multiImages, mediaIndex);
    this.updateProgress(
      multiImages,
      mediaIndex,
      startTime,
      endTime,
      queueWaitingEndTime,
    );

    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  /**
   * 多步骤：更新步骤卡片中多图块的进度
   */
  private handleMultiStepProgress(data: any, ctx: TypeHandlerContext): void {
    const {
      cardId,
      mediaIndex,
      planId,
      stepId,
      startTime,
      endTime,
      queueWaitingEndTime,
    } = data;

    // 用 planId_stepId 找步骤卡片
    const stepKey = `${planId}_${stepId}`;
    const bubbleIndex = ctx.bubbleRef.current.bubbleIdMap.get(stepKey);
    if (isNil(bubbleIndex) || isNil(mediaIndex)) return;

    const stepCardBubble = ctx.bubbleRef.current.data[bubbleIndex];
    if (!stepCardBubble) return;

    // 在 contentBlocks 中用 cardId 找多图块
    const { multiImages } = this.findMultiMediaInStepCard(
      stepCardBubble,
      cardId,
    );
    if (!multiImages) return;

    this.ensureMultiImagesLength(multiImages, mediaIndex);
    this.updateProgress(
      multiImages,
      mediaIndex,
      startTime,
      endTime,
      queueWaitingEndTime,
    );

    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  // ============ 辅助方法 ============

  private buildMultiMediaCardDetail(data: any, mediaNum: number): any {
    return {
      type: MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA,
      cardId: data.cardId,
      mediaNum,
      planId: data.planId,
      stepId: data.stepId,
      contentType: data.contentType || CONTENT_TYPE_CONSTANTS.MEDIA,
      icon: data.icon,
      sessionId: data.sessionId,
      taskId: data.taskId,
      is_uncompleted: true,
      multiImages: createInitialMultiImages(mediaNum),
    };
  }

  /**
   * 在步骤卡片的 contentBlocks 中查找多图块
   */
  private findMultiMediaInStepCard(
    stepCardBubble: TypeBubble,
    cardId: string,
  ): { multiImages: any[] | null; multiMediaBlock: any } {
    const { contentBlocks } = stepCardBubble.card_detail;

    if (contentBlocks) {
      const multiMediaBlock = contentBlocks.find(
        (block: any) =>
          block.type === MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA &&
          block.content?.cardId === cardId,
      );

      if (multiMediaBlock?.content?.multiImages) {
        return {
          multiImages: multiMediaBlock.content.multiImages,
          multiMediaBlock,
        };
      }
    }

    // 向后兼容旧结构
    if (stepCardBubble.card_detail.multiMediaContent?.multiImages) {
      return {
        multiImages: stepCardBubble.card_detail.multiMediaContent.multiImages,
        multiMediaBlock: null,
      };
    }

    return { multiImages: null, multiMediaBlock: null };
  }

  /**
   * 填充或标记失败
   */
  private fillOrFailMediaItem(
    data: any,
    multiImages: any[],
    mediaIndex: number,
    addToCanvas: boolean | undefined,
    ctx: TypeHandlerContext,
  ): void {
    if (data.content) {
      const items = parseMediaContent(data.content, data.contentType);

      if (items?.[0]) {
        multiImages[mediaIndex] = {
          ...multiImages[mediaIndex],
          media_item: items[0],
          is_uncompleted: false,
        };

        if (addToCanvas) {
          addMediaToCanvas(items, data.contentType, ctx);
        }
        return;
      }
    }

    // 没有内容或解析失败，标记为失败
    console.warn(`图片 ${mediaIndex} 标记为失败`);
    multiImages[mediaIndex] = {
      ...multiImages[mediaIndex],
      is_uncompleted: false,
      failed: true,
    };
  }

  /**
   * 更新进度
   */
  private updateProgress(
    multiImages: any[],
    mediaIndex: number,
    startTime: number,
    endTime: number,
    queueWaitingEndTime: number,
  ): void {
    multiImages[mediaIndex] = {
      ...multiImages[mediaIndex],
      startTime,
      endTime,
      queueWaitingEndTime,
    };
  }

  /**
   * 检查是否所有图片都完成
   */
  private isAllCompleted(multiImages: any[]): boolean {
    return multiImages.every((img) => !img.is_uncompleted || img.media_item);
  }

  /**
   * 标记步骤卡片完成（如果所有内容块都完成）
   */
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

  /**
   * 确保数组长度足够（动态扩展）
   */
  private ensureMultiImagesLength(
    multiImages: TypeMultiImageItem[],
    mediaIndex: number,
  ): void {
    while (mediaIndex >= multiImages.length) {
      multiImages.push({
        mediaIndex: multiImages.length,
        startTime: 0,
        endTime: 0,
        queueWaitingEndTime: 9,
        media_item: null,
        is_uncompleted: true,
      });
    }
  }
}

const multiMediaHandler = new MultiMediaHandler();

export default multiMediaHandler;

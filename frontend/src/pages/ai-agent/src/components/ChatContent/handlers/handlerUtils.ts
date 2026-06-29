/**
 * Handler 公共工具函数
 *
 * 只放真正被多个 handler 复用的工具函数
 */

import { isNil } from "lodash";

import {
  ROLE_CONSTANTS,
  BUBBLE_TYPE_CONSTANTS,
  CONTENT_TYPE_CONSTANTS,
  MESSAGE_TYPE_CONSTANTS,
} from "../constants";
import type {
  TypeHandlerContext,
  TypeBubble,
  TypeBubbleState,
  TypeMultiImageItem,
} from "./types";

/**
 * 判断是否正在显示进度条
 * 条件：有 startTime/endTime 且 is_uncompleted === true（未完成）
 */
const isShowingProgress = (item: any): boolean => {
  if (!item) return false;
  const hasProgress = item.startTime > 0 && item.endTime > 0;
  const isUncompleted = item.is_uncompleted;
  return hasProgress && isUncompleted;
};

/**
 * 判断气泡列表中是否存在正在显示进度条的气泡或 heartbeat 气泡
 * 用于判断是否隐藏"思考中"状态
 */
export const hasLoadingBubble = (bubbles): boolean => {
  return bubbles.some((bubble) => {
    // 检查是否已有 heartbeat 气泡（避免两个思考中同时出现）
    if (bubble?.role === "heartbeat") {
      return true;
    }

    const cardDetail = bubble?.card_detail;
    if (!cardDetail) return false;

    // 1. 直接检查 card_detail 是否有进度信息（offer、单图 design）
    if (isShowingProgress(cardDetail)) {
      return true;
    }

    // 2. 检查 multi_media 里的 multiImages 是否有进度信息
    if (cardDetail.multiImages?.some((img) => isShowingProgress(img))) {
      return true;
    }

    // 3. 检查 step_card 里的 contentBlocks
    if (
      cardDetail.contentBlocks?.some((block) => {
        // 3.1 直接检查 block.content 的进度信息（单图 design）
        if (isShowingProgress(block.content)) {
          return true;
        }
        // 3.2 检查 multi_media block 里的 multiImages
        if (block.content?.multiImages?.some((img) => isShowingProgress(img))) {
          return true;
        }
        return false;
      })
    ) {
      return true;
    }

    return false;
  });
};

// 辅助函数：标记 design 内容为失败
export const markDesignAsFailed = (designContent: any) => {
  if (
    designContent?.is_uncompleted === true &&
    (!designContent?.media_items || designContent.media_items.length === 0)
  ) {
    designContent.is_uncompleted = false;
    designContent.failed = true;
  }
};

// 辅助函数：标记 multi_media 中未完成的图片为失败
export const markMultiMediaAsFailed = (multiMediaContent: any) => {
  if (multiMediaContent?.multiImages) {
    multiMediaContent.multiImages.forEach((img: any) => {
      if (img.is_uncompleted && !img.media_item) {
        img.is_uncompleted = false;
        img.failed = true;
      }
    });
    multiMediaContent.is_uncompleted = false;
  }
};

/**
 * allDone 时把所有气泡标记为完成
 * - design/multi_media 没有数据的额外标记为失败
 */
export const markAllUncompletedAsFailed = (
  bubbleRef: React.MutableRefObject<TypeBubbleState>,
) => {
  bubbleRef.current.data.forEach((bubble) => {
    const cardDetail = bubble?.card_detail;
    if (!cardDetail) return;

    // design 类型：没有图片数据的标记为失败
    if (cardDetail.type === MESSAGE_TYPE_CONSTANTS.DESIGN) {
      markDesignAsFailed(cardDetail);
    }

    // multi_media 类型：没有图片数据的标记为失败
    if (cardDetail.type === MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA) {
      markMultiMediaAsFailed(cardDetail);
    }

    // 步骤卡片：处理内部的内容块
    if (
      cardDetail.type === BUBBLE_TYPE_CONSTANTS.STEP_CARD &&
      cardDetail.contentBlocks
    ) {
      cardDetail.contentBlocks.forEach((block: any) => {
        if (block.type === MESSAGE_TYPE_CONSTANTS.DESIGN) {
          markDesignAsFailed(block.content);
        }
        if (block.type === MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA) {
          markMultiMediaAsFailed(block.content);
        }
        // 所有内容块标记完成
        if (block.content?.is_uncompleted) {
          block.content.is_uncompleted = false;
        }
      });
    }

    if (
      cardDetail.type === MESSAGE_TYPE_CONSTANTS.IMAGE_CHOOSE &&
      !cardDetail.chooseStatus
    ) {
      // 兜底处理，如果任务结束了该环节都没选择过，则标记为跳过
      cardDetail.chooseStatus = "refuse";
    }

    // 所有气泡标记完成
    if (cardDetail.is_uncompleted) {
      cardDetail.is_uncompleted = false;
    }
  });
};

/** 创建初始气泡状态 */
export const createInitialBubbleState = (): TypeBubbleState => ({
  data: [],
  bubbleIdMap: new Map(), // 通用映射：单步骤用 cardId，多步骤用 planId_stepId
  currentPlan: null,
  currentIntent: "",
});

/**
 * 增量更新索引（插入后调用）
 * 只更新 insertIndex 之后的映射，避免全量重建
 *
 * @param bubbleRef - 气泡状态引用
 * @param insertIndex - 插入位置
 * @param planId - 计划 ID
 * @param stepId - 步骤 ID
 */
const updateIndexesAfterInsert = (
  bubbleRef: React.MutableRefObject<TypeBubbleState>,
  insertIndex: number,
  planId: string,
  stepId: string | number,
): void => {
  const { bubbleIdMap } = bubbleRef.current;

  // 1. 更新 bubbleIdMap 中 >= insertIndex 的索引 +1
  for (const [key, index] of bubbleIdMap.entries()) {
    if (index >= insertIndex) {
      bubbleIdMap.set(key, index + 1);
    }
  }

  // 2. 添加新步骤卡片的映射
  const key = `${planId}_${stepId}`;
  bubbleIdMap.set(key, insertIndex);
};

/**
 * 按照 stepId 顺序插入步骤卡片
 * 核心逻辑：找到合适的位置插入，并增量更新索引映射
 */
export const insertStepCardInOrder = (
  bubbleRef: React.MutableRefObject<TypeBubbleState>,
  newStepCard: any,
  planId: string,
  stepId: string | number,
): number => {
  const currentStepId = Number(stepId);
  let insertIndex = bubbleRef.current.data.length;

  // 找到第一个 stepId 大于当前 stepId 的步骤卡片的位置
  for (let index = bubbleRef.current.data.length - 1; index >= 0; index--) {
    const bubble = bubbleRef.current.data[index];
    if (
      bubble.card_detail?.type === BUBBLE_TYPE_CONSTANTS.STEP_CARD &&
      bubble.card_detail?.planId === planId
    ) {
      const existingStepId = Number(bubble.card_detail.stepId);
      if (existingStepId > currentStepId) {
        insertIndex = index;
      } else {
        // 找到第一个小于等于当前 stepId 的，插入到它后面
        break;
      }
    }
  }

  // 在指定位置插入
  bubbleRef.current.data.splice(insertIndex, 0, newStepCard);

  // 增量更新索引（只更新受影响的映射，避免全量重建）
  updateIndexesAfterInsert(bubbleRef, insertIndex, planId, stepId);

  return insertIndex;
};

/**
 * 通过 cardId 查找已存在的气泡
 *
 * 后端返回的消息中，同一个气泡的 cardId 是相同的（如流式消息的多次推送）
 * 用 bubbleIdMap 来判断是否复用气泡
 *
 * @param cardId - 卡片 id
 * @param ctx - 处理器上下文
 * @returns 找到的气泡或 null
 */
export function findBubbleByCardId(
  cardId: string | undefined,
  ctx: TypeHandlerContext,
): TypeBubble | null {
  if (isNil(cardId)) return null;

  const { bubbleIdMap } = ctx.bubbleRef.current;
  const existingIndex = bubbleIdMap?.get(cardId);

  return ctx.bubbleRef.current.data[existingIndex ?? -1] || null;
}

/**
 * 记录 cardId 到气泡的映射（通用）
 *
 * @param cardId - 卡片 id
 * @param ctx - 处理器上下文
 */
export function recordCardIdMapping(
  cardId: string | undefined,
  ctx: TypeHandlerContext,
): void {
  if (isNil(cardId)) return;

  // 只往 bubbleIdMap 写（通用映射）
  ctx.bubbleRef.current.bubbleIdMap?.set(
    cardId,
    ctx.bubbleRef.current.data.length - 1,
  );
}

/**
 * 创建新气泡
 *
 * @param cardDetail - 气泡的 card_detail
 * @param ctx - 处理器上下文
 * @param role - 气泡角色，默认 ASSISTANT
 * @returns 新创建的气泡
 */
export function createBubble(
  cardDetail: any,
  ctx: TypeHandlerContext,
  role: string = ROLE_CONSTANTS.ASSISTANT,
): TypeBubble {
  const newBubble: TypeBubble = {
    role: role as TypeBubble["role"],
    intent: ctx.bubbleRef.current.currentIntent || undefined,
    card_detail: cardDetail,
  };

  ctx.bubbleRef.current.data.push(newBubble);

  return newBubble;
}

/**
 * 获取或创建步骤卡片
 *
 * 前置条件：调用方需确保 isMultiStepTask(ctx) 为 true（即 currentPlan 存在且 stepNum > 1）
 *
 * @param planId - 计划 ID
 * @param stepId - 步骤 ID
 * @param ctx - 处理器上下文
 * @param initialContentBlocks - 初始内容块（可选）
 * @returns { bubble, bubbleIndex }
 */
export function getOrCreateStepCard(
  planId: string,
  stepId: string | number,
  ctx: TypeHandlerContext,
  initialContentBlocks: any[] = [],
): {
  bubble: TypeBubble;
  bubbleIndex: number;
} {
  const key = `${planId}_${stepId}`;
  const { bubbleIdMap, currentPlan, data } = ctx.bubbleRef.current;

  // 已存在则直接返回
  const existingIndex = bubbleIdMap.get(key);
  if (!isNil(existingIndex)) {
    return { bubble: data[existingIndex], bubbleIndex: existingIndex };
  }

  // 创建步骤卡片
  const stepInfo = currentPlan?.steps?.find(
    (step) => String(step.stepId) === String(stepId),
  );
  const stepTitle =
    stepInfo?.displayTitle || stepInfo?.stepTitle || `步骤${stepId}`;

  const stepCardBubble: TypeBubble = {
    role: ROLE_CONSTANTS.ASSISTANT,
    card_detail: {
      type: BUBBLE_TYPE_CONSTANTS.STEP_CARD,
      stepId,
      stepTitle,
      planId,
      is_uncompleted: true,
      contentBlocks: initialContentBlocks,
    },
    _bubbleId: `${
      BUBBLE_TYPE_CONSTANTS.STEP_CARD
    }_${planId}_${stepId}_${Date.now()}`,
  };

  const bubbleIndex = insertStepCardInOrder(
    ctx.bubbleRef,
    stepCardBubble,
    planId,
    stepId,
  );

  return { bubble: data[bubbleIndex], bubbleIndex };
}

/**
 * 创建初始多图数组
 *
 * @param mediaNum - 图片数量
 * @returns 多图数组
 */
export function createInitialMultiImages(
  mediaNum: number,
): TypeMultiImageItem[] {
  return Array.from({ length: mediaNum }, (__, idx) => ({
    mediaIndex: idx,
    startTime: 0,
    endTime: 0,
    queueWaitingEndTime: 0,
    media_item: null,
    is_uncompleted: true,
  }));
}

/**
 * 解析媒体内容并返回标准化的 media_item
 *
 * @param content - JSON 字符串
 * @param contentType - 内容类型
 * @returns 解析后的 media items 数组，解析失败返回 null
 */
export function parseMediaContent(
  content: string,
  contentType?: string,
): any[] | null {
  try {
    const { mediaModel } = JSON.parse(content);
    const model = Array.isArray(mediaModel) ? mediaModel : [mediaModel];

    return model.map((item: any) => ({
      media_id: item.mediaId,
      media_type: contentType,
      media_cover_url: item.mediaCoverUrl,
      media_url: item.mediaUrl,
      width: item.width,
      height: item.height,
    }));
  } catch {
    return null;
  }
}

/**
 * 检查是否是多步骤任务
 *
 * @param ctx - 处理器上下文
 * @returns 是否是多步骤任务
 */
export function isMultiStepTask(ctx: TypeHandlerContext): boolean {
  const { currentPlan } = ctx.bubbleRef.current;
  return !!(currentPlan && currentPlan.stepNum > 1);
}

/**
 * 添加媒体到画布
 *
 * @param items - 媒体项数组
 * @param contentType - 内容类型
 * @param ctx - 处理器上下文
 */
export function addMediaToCanvas(
  items: any[],
  contentType: string | undefined,
  ctx: TypeHandlerContext,
): void {
  if (contentType === CONTENT_TYPE_CONSTANTS.IMAGE) {
    ctx.store.addImgElement(items);
  } else if (contentType === CONTENT_TYPE_CONSTANTS.VIDEO) {
    ctx.store.addVideoElement(items);
  }
}

/**
 * 增量计算结果
 *
 * - 正常增量：baseContent = oldContent，delta = 新增部分
 * - 内容不匹配：baseContent = 最长公共前缀，delta = 新内容去掉公共前缀
 */
export interface TypeCalcDeltaResult {
  /** 需要打字机输出的内容 */
  delta: string;
  /** 打字机输出前，气泡应该显示的基础内容 */
  baseContent: string;
}

/**
 * 计算增量内容
 *
 * 后端返回全量累积内容，前端计算出本次新增的部分
 * 例如：旧内容 "abc"，新内容 "abcdef"，增量为 "def"
 *
 * 当新内容不以旧内容为前缀时（后端修正内容、占位符被替换等），
 * 找最长公共前缀，从分叉点开始算增量，避免丢数据
 *
 * @param oldContent - 旧内容
 * @param newContent - 新内容（全量累积）
 * @returns { delta, baseContent }
 */
export function calcDelta(
  oldContent: string,
  newContent: string,
): TypeCalcDeltaResult {
  if (!oldContent) return { delta: newContent || "", baseContent: "" };
  if (!newContent) return { delta: "", baseContent: oldContent };

  // 正常情况：新内容以旧内容开头，返回增量部分
  if (newContent.startsWith(oldContent)) {
    return {
      delta: newContent.slice(oldContent.length),
      baseContent: oldContent,
    };
  }

  // 内容不匹配：找最长公共前缀，从分叉点开始算增量
  let commonLen = 0;
  const minLen = Math.min(oldContent.length, newContent.length);
  while (
    commonLen < minLen &&
    oldContent[commonLen] === newContent[commonLen]
  ) {
    commonLen++;
  }

  const baseContent = newContent.slice(0, commonLen);
  const delta = newContent.slice(commonLen);

  return { delta, baseContent };
}

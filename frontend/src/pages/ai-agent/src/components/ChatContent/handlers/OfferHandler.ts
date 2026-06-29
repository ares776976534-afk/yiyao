/**
 * 商品处理器
 *
 * 处理以下消息类型：
 * - offer: 商品结果
 * - offer_percent_loading: 商品 loading 状态
 * - oneClickOptResult: 一键优化结果
 */

import { MESSAGE_TYPE_CONSTANTS } from "../constants";
import type { TypeHandlerContext, TypeMessageHandler } from "./types";
import {
  findBubbleByCardId,
  createBubble,
  recordCardIdMapping,
} from "./handlerUtils";

class OfferHandler implements TypeMessageHandler {
  type = [
    MESSAGE_TYPE_CONSTANTS.OFFER,
    MESSAGE_TYPE_CONSTANTS.OFFER_PERCENT_LOADING,
    MESSAGE_TYPE_CONSTANTS.ONE_CLICK_OPT_RESULT,
  ];

  handle(message: any, ctx: TypeHandlerContext): void {
    const { type } = message;

    switch (type) {
      case MESSAGE_TYPE_CONSTANTS.OFFER:
        this.handleOffer(message, ctx);
        break;
      case MESSAGE_TYPE_CONSTANTS.OFFER_PERCENT_LOADING:
        this.handleOfferPercentLoading(message, ctx);
        break;
      case MESSAGE_TYPE_CONSTANTS.ONE_CLICK_OPT_RESULT:
        this.handleOneClickOptResult(message, ctx);
        break;
    }
  }

  /**
   * 处理商品 loading 状态（创建占位气泡）
   *
   * 核心逻辑：用消息 cardId 判断是否复用气泡
   */
  private handleOfferPercentLoading(data: any, ctx: TypeHandlerContext): void {
    const { cardId, startTime, endTime, queueWaitingEndTime } = data;

    // 通过消息 cardId 找已存在的气泡
    let targetBubble = findBubbleByCardId(cardId, ctx);

    if (!targetBubble) {
      targetBubble = createBubble(
        {
          ...data,
          type: MESSAGE_TYPE_CONSTANTS.OFFER,
          is_uncompleted: true,
          cardId,
        },
        ctx,
      );
      recordCardIdMapping(cardId, ctx);
    }

    targetBubble.card_detail = ctx.mergeNonEmptyFields(
      targetBubble.card_detail,
      { startTime, endTime, queueWaitingEndTime },
    );

    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }

  /**
   * 处理对话生成商品结果
   *
   * 核心逻辑：用消息 cardId 判断是否复用气泡
   */
  private handleOffer(data: any, ctx: TypeHandlerContext): void {
    try {
      const { cardId } = data;

      const generatedOfferData = this.parseOfferContent(data.content);

      const cardDetail = generatedOfferData?.length
        ? {
            type: MESSAGE_TYPE_CONSTANTS.OFFER,
            content: generatedOfferData,
            is_uncompleted: false,
          }
        : {
            type: MESSAGE_TYPE_CONSTANTS.OFFER,
            is_uncompleted: false,
            failed: true,
          };

      // 通过消息 cardId 找已存在的气泡
      let targetBubble = findBubbleByCardId(cardId, ctx);

      if (!targetBubble) {
        targetBubble = createBubble(
          {
            ...data,
            type: MESSAGE_TYPE_CONSTANTS.OFFER,
            is_uncompleted: true,
            cardId,
          },
          ctx,
        );
        recordCardIdMapping(cardId, ctx);
      }

      targetBubble.card_detail = ctx.mergeNonEmptyFields(
        targetBubble.card_detail,
        cardDetail,
      );

      ctx.setBubbles([...ctx.bubbleRef.current.data]);

      // 添加到画布
      if (generatedOfferData?.length) {
        ctx.store.addOfferElement(generatedOfferData, "inline");
      }
    } catch (error) {
      console.error("【OfferHandler】处理对话生成商品结果失败:", error);
    }
  }

  /**
   * 处理一键优化结果
   */
  private handleOneClickOptResult(data: any, ctx: TypeHandlerContext): void {
    try {
      const optimizedOfferData =
        typeof data.content === "string"
          ? JSON.parse(data.content)
          : data.content;

      if (!optimizedOfferData?.offerId) {
        console.error(
          "【OfferHandler】优化后的商品数据无效",
          optimizedOfferData,
        );
        return;
      }

      ctx.store.addOfferElement(optimizedOfferData, "inline");
    } catch (error) {
      console.error("【OfferHandler】处理一键优化结果失败:", error);
    }
  }

  // ============ 辅助方法 ============

  private parseOfferContent(content: string): any[] | null {
    try {
      return JSON.parse(content)?.offers || [];
    } catch {
      console.error("【OfferHandler】解析 offer 内容失败");
      return null;
    }
  }
}

const offerHandler = new OfferHandler();

export default offerHandler;

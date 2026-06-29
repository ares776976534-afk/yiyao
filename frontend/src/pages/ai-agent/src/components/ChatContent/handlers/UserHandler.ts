/**
 * 用户消息处理器
 *
 * 处理以下消息类型：
 * - USER: 用户输入的消息
 */

import {
  MESSAGE_TYPE_CONSTANTS,
  CONTENT_TYPE_CONSTANTS,
  ROLE_CONSTANTS,
} from "../constants";
import type {
  TypeHandlerContext,
  TypeHandlerOptions,
  TypeMessageHandler,
  TypeBubble,
} from "./types";

class UserHandler implements TypeMessageHandler {
  type = MESSAGE_TYPE_CONSTANTS.USER;

  handle(
    message: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const { query, attachments = [], offerInfos = [] } = message;
    const addToCanvas = options?.addToCanvas ?? false;

    // 从附件中提取媒体项
    const mediaItemsFromAttachments = attachments.map((item: any) => ({
      media_url: item.sourceUrl,
      media_cover_url: item.sourceUrl,
      media_type: CONTENT_TYPE_CONSTANTS.IMAGE,
      width: item.width,
      height: item.height,
    }));

    // 从商品信息中提取媒体项
    const mediaItemsFromOfferInfos = offerInfos.map((item: any) => ({
      media_url: item.images?.[0],
      media_cover_url: item.images?.[0],
      media_type: CONTENT_TYPE_CONSTANTS.LINK,
      offerId: item.offerId,
    }));

    const mediaItems = [
      ...mediaItemsFromAttachments,
      ...mediaItemsFromOfferInfos,
    ];

    // 添加到画布（如果需要）
    if (addToCanvas) {
      ctx.store.addImgElement(mediaItemsFromAttachments);
      ctx.store.addOfferElement(offerInfos);
    }

    // 创建用户气泡
    const bubble: TypeBubble = {
      role: ROLE_CONSTANTS.USER,
      card_detail: {
        media_items: mediaItems,
        content: query,
        offerInfos,
        is_uncompleted: false, // 用户输入内容节点直接进入完成状态
      },
    };

    ctx.bubbleRef.current.data.push(bubble);
    ctx.setBubbles([...ctx.bubbleRef.current.data]);
  }
}

const userHandler = new UserHandler();

export default userHandler;

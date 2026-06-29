import { isNil } from "lodash";
import { MESSAGE_TYPE_CONSTANTS } from "../constants";
import type { TypeHandlerContext, TypeMessageHandler } from "./types";
import {
  findBubbleByCardId,
  createBubble,
  recordCardIdMapping,
} from "./handlerUtils";

class ImageChooseHandler implements TypeMessageHandler {
  type = MESSAGE_TYPE_CONSTANTS.IMAGE_CHOOSE;

  handle(message: any, ctx: TypeHandlerContext): void {
    const { type } = message;

    switch (type) {
      case MESSAGE_TYPE_CONSTANTS.IMAGE_CHOOSE:
        this.handleImageChoose(message, ctx);
        break;
    }
  }

  /**
   * 处理 imageChoose 消息
   *
   * 核心逻辑：用消息 cardId 判断是否复用气泡
   */
  private handleImageChoose(data: any, ctx: TypeHandlerContext): void {
    const { cardId } = data;

    let parsed: {
      images?: string[];
      chooseStatus?: string;
      chooseIndex?: number;
      multiSelect?: boolean;
      node?: string;
    } = {};
    try {
      parsed = JSON.parse(data.content) || {};
    } catch (err) {
      console.error("【imageChoose】解析 content 失败:", err);
    }

    const cardDetail = {
      type: MESSAGE_TYPE_CONSTANTS.IMAGE_CHOOSE,
      cardId,
      title: data.title,
      icon: data.icon,
      sessionId: data.sessionId,
      taskId: data.taskId,
      is_uncompleted: isNil(parsed.chooseStatus),
      ...parsed,
    };

    // 通过消息 cardId 找已存在的气泡
    let targetBubble = findBubbleByCardId(cardId, ctx);

    if (!targetBubble) {
      targetBubble = createBubble(
        {
          ...data,
          type: MESSAGE_TYPE_CONSTANTS.IMAGE_CHOOSE,
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
  }
}

const imageChooseHandler = new ImageChooseHandler();

export default imageChooseHandler;

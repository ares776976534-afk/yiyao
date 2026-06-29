/**
 * 意图消息处理器
 *
 * 处理以下消息类型：
 * - intent: 意图识别结果
 *
 * 注意：IntentHandler 不再创建气泡，只存储 currentIntent
 * 后续由 TextHandler / DesignHandler / MultiMediaHandler 等在需要时自己创建气泡
 */

import { MESSAGE_TYPE_CONSTANTS } from "../constants";
import type { TypeHandlerContext, TypeMessageHandler } from "./types";

class IntentHandler implements TypeMessageHandler {
  type = MESSAGE_TYPE_CONSTANTS.INTENT;

  handle(message: any, ctx: TypeHandlerContext): void {
    const { intent } = message;

    // 只存储 currentIntent，不创建气泡
    // 后续由内容 handler 在创建气泡时带上 intent
    ctx.bubbleRef.current.currentIntent = intent || "";
  }
}

const intentHandler = new IntentHandler();

export default intentHandler;

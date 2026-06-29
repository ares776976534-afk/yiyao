/**
 * 消息处理器入口
 *
 * 导出所有处理器和工具函数
 */

import multiMediaHandler from "./MultiMediaHandler";
import designHandler from "./DesignHandler";
import textHandler from "./TextHandler";
import planHandler from "./PlanHandler";
import offerHandler from "./OfferHandler";
import imageChooseHandler from "./ImageChooseHandler";
import userHandler from "./UserHandler";
import intentHandler from "./IntentHandler";
import statusHandler from "./StatusHandler";
import type { TypeHandlerContext, TypeHandlerOptions } from "./types";
import { $t } from "@/i18n";
import { MESSAGE_TYPE_CONSTANTS, ROLE_CONSTANTS } from "../constants";

// 类型导出
export * from "./types";

// 处理器实例导出
export {
  multiMediaHandler,
  designHandler,
  textHandler,
  planHandler,
  offerHandler,
  imageChooseHandler,
  userHandler,
  intentHandler,
  statusHandler,
};

/**
 * 所有外部处理器实例数组
 */
export const allHandlers = [
  multiMediaHandler,
  designHandler,
  textHandler,
  planHandler,
  offerHandler,
  userHandler,
  intentHandler,
  statusHandler,
];

/**
 * 处理错误消息
 */
function handleError(curMsg: any, ctx: TypeHandlerContext): void {
  const errorBubble = {
    role: ROLE_CONSTANTS.ASSISTANT,
    card_detail: {
      type: MESSAGE_TYPE_CONSTANTS.ERROR,
      content:
        curMsg.script ||
        curMsg.errorMessage ||
        ($t?.("global-1688-ai-app.ChatContent.systemError", "系统错误") ??
          "系统错误"),
      errorCode: curMsg.errorCode,
      is_uncompleted: false,
    },
  };
  ctx.bubbleRef.current.data.push(errorBubble);
  ctx.setBubbles([...ctx.bubbleRef.current.data]);
}

/**
 * 创建处理器映射表
 */
export function createHandlerMap(
  ctx: TypeHandlerContext,
  options: TypeHandlerOptions = {},
): Array<{ type: string; handler: (message: any) => void }> {
  const { typing, streamTyping, addToCanvas, addUserToCanvas } = options;
  const shouldAddUserToCanvas = addUserToCanvas ?? addToCanvas;

  return [
    // 会话消息
    {
      type: MESSAGE_TYPE_CONSTANTS.SESSION,
      handler: (curMsg) => curMsg.title && ctx.setProjectName(curMsg.title),
    },
    // 意图消息
    {
      type: MESSAGE_TYPE_CONSTANTS.INTENT,
      handler: (curMsg) => intentHandler.handle(curMsg, ctx),
    },
    // 用户消息
    {
      type: MESSAGE_TYPE_CONSTANTS.USER,
      handler: (curMsg) =>
        userHandler.handle(curMsg, ctx, {
          ...options,
          addToCanvas: shouldAddUserToCanvas,
        }),
    },
    // 错误消息
    {
      type: MESSAGE_TYPE_CONSTANTS.ERROR,
      handler: (curMsg) => handleError(curMsg, ctx),
    },
    // 文本消息（后端一次性传完整内容，直接对完整内容做打字机）
    {
      type: MESSAGE_TYPE_CONSTANTS.TEXT,
      handler: (curMsg) =>
        textHandler.handle(curMsg, ctx, { ...options, typing: !!typing }),
    },
    // 流式文本消息（后端分多次传全量累积内容，TextHandler 内部计算增量做打字机）
    {
      type: MESSAGE_TYPE_CONSTANTS.TEXT_STREAM,
      handler: (curMsg) =>
        textHandler.handle(curMsg, ctx, { ...options, typing: !!streamTyping }),
    },
    // 设计分析消息（同 text_stream）
    {
      type: MESSAGE_TYPE_CONSTANTS.DESIGN_ANALYZER,
      handler: (curMsg) =>
        textHandler.handle(curMsg, ctx, { ...options, typing: !!streamTyping }),
    },
    // 知识库消息
    {
      type: MESSAGE_TYPE_CONSTANTS.KNOWLEDGE,
      handler: (curMsg) => textHandler.handle(curMsg, ctx, options),
    },
    // 多图出框消息
    {
      type: MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA,
      handler: (curMsg) => multiMediaHandler.handle(curMsg, ctx, options),
    },
    // 多图内容消息
    {
      type: MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA_CONTENT,
      handler: (curMsg) => multiMediaHandler.handle(curMsg, ctx, options),
    },
    // 多图进度消息
    {
      type: MESSAGE_TYPE_CONSTANTS.MULTI_PERCENT_LOADING,
      handler: (curMsg) => multiMediaHandler.handle(curMsg, ctx, options),
    },
    // 单图消息
    {
      type: MESSAGE_TYPE_CONSTANTS.DESIGN,
      handler: (curMsg) => designHandler.handle(curMsg, ctx, options),
    },
    // 单图进度消息
    {
      type: MESSAGE_TYPE_CONSTANTS.PERCENT_LOADING,
      handler: (curMsg) => designHandler.handle(curMsg, ctx, options),
    },
    // 多图消息
    {
      type: MESSAGE_TYPE_CONSTANTS.MULTI_IMAGE,
      handler: (curMsg) => designHandler.handle(curMsg, ctx, options),
    },
    // 任务规划消息
    {
      type: MESSAGE_TYPE_CONSTANTS.PLAN,
      handler: (curMsg) =>
        planHandler.handle(curMsg, ctx, { ...options, typing }),
    },
    // 流式任务规划消息
    {
      type: MESSAGE_TYPE_CONSTANTS.PLAN_STREAM,
      handler: (curMsg) =>
        planHandler.handle(curMsg, ctx, { ...options, typing: !!streamTyping }),
    },
    // 步骤状态消息
    {
      type: MESSAGE_TYPE_CONSTANTS.PLAN_STATUS,
      handler: (curMsg) => planHandler.handle(curMsg, ctx, options),
    },
    // 商品消息
    {
      type: MESSAGE_TYPE_CONSTANTS.OFFER,
      handler: (curMsg) => offerHandler.handle(curMsg, ctx),
    },
    // 商品进度消息
    {
      type: MESSAGE_TYPE_CONSTANTS.OFFER_PERCENT_LOADING,
      handler: (curMsg) => offerHandler.handle(curMsg, ctx),
    },
    // 一键优化结果消息
    {
      type: MESSAGE_TYPE_CONSTANTS.ONE_CLICK_OPT_RESULT,
      handler: (curMsg) => offerHandler.handle(curMsg, ctx),
    },
    // 图片选择消息
    {
      type: MESSAGE_TYPE_CONSTANTS.IMAGE_CHOOSE,
      handler: (curMsg) => imageChooseHandler.handle(curMsg, ctx),
    },
    // 状态变化消息
    {
      type: MESSAGE_TYPE_CONSTANTS.STATUS_CHANGE,
      handler: (curMsg) => statusHandler.handle(curMsg, ctx),
    },
  ];
}

import { $t } from "@/i18n";
import {
  MESSAGE_TYPE_CONSTANTS,
  ROLE_CONSTANTS,
  STATUS_CONSTANTS,
} from "../constants";
import { markAllUncompletedAsFailed } from "./handlerUtils";
import type { TypeHandlerContext, TypeMessageHandler } from "./types";

/** 状态变化数据 */
export interface TypeStatusChangeData {
  status:
    | typeof STATUS_CONSTANTS.START
    | typeof STATUS_CONSTANTS.END
    | typeof STATUS_CONSTANTS.STOP_BY_USER
    | typeof STATUS_CONSTANTS.WAIT_FOR_USER
    | typeof STATUS_CONSTANTS.STOP_FOR_WAITING
    | typeof STATUS_CONSTANTS.ALL_DONE;
  [key: string]: any;
}

class StatusHandler implements TypeMessageHandler {
  type = MESSAGE_TYPE_CONSTANTS.STATUS_CHANGE;

  handle(message: TypeStatusChangeData, ctx: TypeHandlerContext): void {
    switch (message.status) {
      case STATUS_CONSTANTS.STOP_BY_USER:
        this.handleStopByUser(message, ctx);
        break;
      case STATUS_CONSTANTS.ALL_DONE:
        this.handleAllDone(message, ctx);
        break;
    }
  }

  private handleAllDone(
    _data: TypeStatusChangeData,
    ctx: TypeHandlerContext,
  ): void {
    const { bubbleRef, setBubbles } = ctx;
    // 读取当前意图
    const intent = bubbleRef.current.currentIntent || "";

    // 【兜底处理】遍历所有气泡，把还在 is_uncompleted 状态但没有图片数据的 design/multi_media 强制标记为失败
    markAllUncompletedAsFailed(bubbleRef);

    // 闲聊模式不输出任务已结束
    if (intent !== "smallTalk") {
      bubbleRef.current.data.push({
        role: ROLE_CONSTANTS.TASK_END_STATUS,
        card_detail: {
          is_uncompleted: false,
          type: STATUS_CONSTANTS.ALL_DONE,
          content: $t("global-1688-ai-app.ChatContent.taskyEnd", "任务已结束"),
        },
      });
    }

    // 重置 currentIntent
    bubbleRef.current.currentIntent = "";

    setBubbles([...bubbleRef.current.data]);
  }

  private handleStopByUser(
    _data: TypeStatusChangeData,
    ctx: TypeHandlerContext,
  ): void {
    const { bubbleRef, setBubbles } = ctx;

    // 【兜底处理】遍历所有气泡，把还在 is_uncompleted 状态但没有图片数据的 design/multi_media 强制标记为失败
    markAllUncompletedAsFailed(bubbleRef);

    bubbleRef.current.data.push({
      role: ROLE_CONSTANTS.TASK_END_STATUS,
      card_detail: {
        is_uncompleted: false,
        type: STATUS_CONSTANTS.STOP_BY_USER,
        content: $t("global-1688-ai-app.ChatContent.taskyzz", "任务已终止"),
      },
    });

    // 重置 currentIntent
    bubbleRef.current.currentIntent = "";

    setBubbles([...bubbleRef.current.data]);
  }
}

const statusHandler = new StatusHandler();

export default statusHandler;

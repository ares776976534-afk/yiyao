/**
 * 任务规划处理器
 *
 * 处理以下消息类型：
 * - plan: 任务规划（一次性完整内容）
 * - plan_stream: 流式任务规划（全量累积，需计算增量）
 * - plan_status: 步骤状态更新
 */
import { isNil } from "lodash";
import { MESSAGE_TYPE_CONSTANTS } from "../constants";
import type {
  TypeHandlerContext,
  TypeHandlerOptions,
  TypeMessageHandler,
  TypeBubble,
} from "./types";
import {
  findBubbleByCardId,
  recordCardIdMapping,
  createBubble,
  calcDelta,
} from "./handlerUtils";

class PlanHandler implements TypeMessageHandler {
  type = [
    MESSAGE_TYPE_CONSTANTS.PLAN,
    MESSAGE_TYPE_CONSTANTS.PLAN_STREAM,
    MESSAGE_TYPE_CONSTANTS.PLAN_STATUS,
  ];

  handle(
    message: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const { type } = message;

    switch (type) {
      case MESSAGE_TYPE_CONSTANTS.PLAN:
      case MESSAGE_TYPE_CONSTANTS.PLAN_STREAM:
        this.handlePlan(message, ctx, options);
        break;
      case MESSAGE_TYPE_CONSTANTS.PLAN_STATUS:
        this.handlePlanStatus(message, ctx);
        break;
    }
  }

  /**
   * 处理 plan/plan_stream 消息
   *
   * plan_stream 后端返回全量累积数组，前端计算增量后做打字机
   */
  private handlePlan(
    curMsg: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ): void {
    const parsed = this.parsePlanContent(curMsg.content);
    if (!parsed) return;

    const { stepNum, planId, steps, planItems } = parsed;

    // 保存 plan 信息
    ctx.bubbleRef.current.currentPlan = { stepNum, planId, steps };

    // stepNum <= 1 时不展示任务规划 Card
    if (stepNum <= 1) return;

    // 过滤空内容
    if (!planItems || planItems.length === 0) return;

    // 获取或创建气泡
    const targetBubble = this.ensurePlanBubble(curMsg, ctx, planId);

    // 计算增量并做打字机效果
    this.updatePlanBubbleWithDelta(
      targetBubble,
      planItems,
      curMsg,
      ctx,
      options,
      curMsg.isCompleted,
    );
  }

  /**
   * 确保 plan 气泡存在，不存在则创建
   * @returns 气泡引用
   */
  private ensurePlanBubble(
    curMsg: any,
    ctx: TypeHandlerContext,
    planId: string,
  ): TypeBubble {
    const { cardId } = curMsg;
    let existingBubble = findBubbleByCardId(cardId, ctx);

    if (!existingBubble) {
      existingBubble = createBubble(
        {
          type: curMsg.type || MESSAGE_TYPE_CONSTANTS.PLAN_STREAM,
          icon: curMsg.icon,
          sessionId: curMsg.sessionId,
          taskId: curMsg.taskId,
          title: curMsg.title,
          content: [], // 初始化为空数组
          contentType: curMsg.contentType,
          planId,
          is_uncompleted: true,
          cardId,
        },
        ctx,
      );
      recordCardIdMapping(cardId, ctx);
    }

    return existingBubble;
  }

  /**
   * 更新 plan 气泡内容（计算增量后打字机）
   *
   * 后端返回全量累积数组，每个 step 的 displayTitle 和 displayContent 都是全量累积的
   * 需要对每个 step 的 title 和 description 分别计算增量做打字机
   */
  private updatePlanBubbleWithDelta(
    bubble: TypeBubble,
    newItems: any[],
    curMsg: any,
    ctx: TypeHandlerContext,
    options?: TypeHandlerOptions,
    isCompleted?: boolean,
  ): void {
    // 合并其他字段
    bubble.card_detail = ctx.mergeNonEmptyFields(bubble.card_detail, {
      icon: curMsg.icon,
      sessionId: curMsg.sessionId,
      taskId: curMsg.taskId,
      title: curMsg.title,
      contentType: curMsg.contentType,
    });

    const oldItems: any[] = bubble.card_detail.content || [];
    const { processPlanTypingEffect } = ctx;
    const { typing, speed, step } = options || {};

    // 计算每个 step 的增量
    const { deltaItems, hasAnyDelta } = this.calcPlanItemsDelta(
      oldItems,
      newItems,
    );

    // isCompleted 语义：
    //   true      → 轮询模式最后一条消息，标记完成
    //   false     → 轮询模式中间消息，不标记
    //   undefined → detail/share 模式（无此字段），消息已完整，标记完成
    const shouldMarkCompleted = isCompleted !== false;

    // 标记完成并刷新气泡
    const tryMarkCompleted = () => {
      if (shouldMarkCompleted) {
        bubble.card_detail.is_uncompleted = false;
      }
      ctx.setBubbles([...ctx.bubbleRef.current.data]);
    };

    // 没有任何增量，但如果消息已完成仍需标记
    if (!hasAnyDelta) {
      tryMarkCompleted();
      return;
    }

    if (typing && processPlanTypingEffect) {
      // 启用打字机：对增量部分逐字显示
      // processPlanTypingEffect 接收的是 { title, description } 数组
      // 返回的 chunk.content 是从零开始累积的数组
      processPlanTypingEffect(
        { ...curMsg, content: deltaItems },
        { speed, step },
        (chunk) => {
          // chunk.content 是打字机从零开始累积的增量内容
          // 需要把增量追加到 oldItems 对应位置上
          bubble.card_detail.content = this.mergePlanItems(
            oldItems,
            chunk.content,
          );
          ctx.setBubbles([...ctx.bubbleRef.current.data]);
        },
        tryMarkCompleted,
      );
    } else {
      // 不启用打字机：直接显示完整内容
      bubble.card_detail.content = newItems;
      tryMarkCompleted();
    }
  }

  /**
   * 计算 planItems 的增量
   *
   * 对每个 step 的 title 和 description 分别计算增量
   * 返回增量数组，结构和原数组一致（保持索引对应）
   *
   * 例如：
   * oldItems = [{ title: "第1步", description: "生成一个" }]
   * newItems = [{ title: "第1步", description: "生成一个笑话" }, { title: "第2步", description: "" }]
   * 返回：
   * deltaItems = [{ title: "", description: "笑话" }, { title: "第2步", description: "" }]
   */
  private calcPlanItemsDelta(
    oldItems: any[],
    newItems: any[],
  ): { deltaItems: any[]; hasAnyDelta: boolean } {
    const deltaItems: any[] = [];
    let hasAnyDelta = false;

    for (let index = 0; index < newItems.length; index++) {
      const newItem = newItems[index];
      const oldItem = oldItems[index] || { title: "", description: "" };

      const { delta: titleDelta } = calcDelta(
        oldItem.title || "",
        newItem.title || "",
      );
      const { delta: descDelta } = calcDelta(
        oldItem.description || "",
        newItem.description || "",
      );

      if (titleDelta || descDelta) {
        hasAnyDelta = true;
      }

      // 保持数组索引对应，即使没有增量也要占位
      deltaItems.push({
        title: titleDelta,
        description: descDelta,
      });
    }

    return { deltaItems, hasAnyDelta };
  }

  /**
   * 合并 oldItems 和打字机输出的增量
   *
   * 打字机返回的 chunk.content 是从零开始累积的增量内容
   * 需要把增量追加到 oldItems 对应位置上
   *
   * 例如：
   * oldItems = [{ title: "第1步", description: "生成一个" }]
   * deltaChunks = [{ title: "", description: "笑" }, { title: "第2", description: "" }]
   * 返回：[{ title: "第1步", description: "生成一个笑" }, { title: "第2", description: "" }]
   */
  private mergePlanItems(oldItems: any[], deltaChunks: any[]): any[] {
    const result: any[] = [];

    for (let i = 0; i < deltaChunks.length; i++) {
      const delta = deltaChunks[i] || { title: "", description: "" };
      const oldItem = oldItems[i] || { title: "", description: "" };

      result.push({
        title: (oldItem.title || "") + (delta.title || ""),
        description: (oldItem.description || "") + (delta.description || ""),
      });
    }

    return result;
  }

  /**
   * 处理 plan_status 消息（步骤完成状态）
   */
  private handlePlanStatus(data: any, ctx: TypeHandlerContext): void {
    const { stepId, planId, status: stepStatus } = data;

    // 只处理完成状态
    if (stepStatus !== MESSAGE_TYPE_CONSTANTS.FINISH) return;

    const { currentPlan, bubbleIdMap } = ctx.bubbleRef.current;
    if (!currentPlan || currentPlan.stepNum <= 1) return;

    const key = `${planId}_${stepId}`;
    const bubbleIndex = bubbleIdMap.get(key);

    if (isNil(bubbleIndex)) {
      console.warn("【PlanHandler】未找到步骤卡片:", key);
      return;
    }

    const stepCardBubble = ctx.bubbleRef.current.data[bubbleIndex];
    if (stepCardBubble) {
      stepCardBubble.card_detail.is_uncompleted = false;
      ctx.setBubbles([...ctx.bubbleRef.current.data]);
    }
  }

  // ============ 辅助方法 ============

  private parsePlanContent(content: string): {
    stepNum: number;
    planId: string;
    steps: any[];
    planItems: any[];
  } | null {
    try {
      const parsed = JSON.parse(content);
      const stepNum = parsed?.stepNum || 0;
      const planId = parsed?.planId || "";
      const steps = parsed?.steps || [];

      const planItems = steps.map((item: any) => ({
        title: item.displayTitle,
        description: item.displayContent,
      }));

      return { stepNum, planId, steps, planItems };
    } catch (error) {
      return null;
    }
  }
}

const planHandler = new PlanHandler();

export default planHandler;

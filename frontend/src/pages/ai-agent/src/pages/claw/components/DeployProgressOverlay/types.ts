/**
 * 部署进度遮罩组件类型
 */

/** 单阶段配置：time 为本阶段持续时间（ms），process 为本阶段结束时的目标进度（0-100） */
export interface TypeDeployProgressStage {
  time: number;
  process: number;
}

export interface TypeDeployProgressOverlayProps {
  /** 是否显示 */
  visible: boolean;
  /** 接口是否已成功，为 true 时在 0.5s 内从当前进度过渡到 100% 并触发 onComplete */
  apiSuccess: boolean;
  /** 读条到 100% 结束后的回调 */
  onComplete: () => void;
  /**
   * 分阶段进度配置。每项 time 为相对上一阶段结束后的持续时间（ms），process 为该阶段结束时的目标进度（0-100）。
   * 不传时默认 7 秒内从 0 过渡到 90%。
   */
  stages?: TypeDeployProgressStage[];
}

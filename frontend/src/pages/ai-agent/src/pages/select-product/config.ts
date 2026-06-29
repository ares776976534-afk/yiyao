// 流式显示配置
export const STREAMING_CONFIG = {
  // 字符级别流式显示间隔（毫秒）
  CHAR_INTERVAL: 10,

  // 块级别流式显示间隔（毫秒）
  BLOCK_INTERVAL: 200,

  // 默认流式显示间隔（毫秒）
  DEFAULT_INTERVAL: 200,

  // 快速流式显示间隔（毫秒）
  FAST_INTERVAL: 50,

  // 慢速流式显示间隔（毫秒）
  SLOW_INTERVAL: 300,
} as const;

// 流式显示速度预设
export const STREAMING_SPEEDS = {
  FAST: STREAMING_CONFIG.FAST_INTERVAL,
  NORMAL: STREAMING_CONFIG.CHAR_INTERVAL,
  SLOW: STREAMING_CONFIG.SLOW_INTERVAL,
  BLOCK: STREAMING_CONFIG.BLOCK_INTERVAL,
} as const;


export enum StatusEnum {
  INIT = 'init',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error',
}
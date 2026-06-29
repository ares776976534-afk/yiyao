/**
 * 弹窗基础配置
 */
interface BaseModalConfig {
  // 弹窗唯一标识
  id: string;
  // 弹窗标题
  title: string;
  // 弹窗内容类型
  contentType: 'text' | 'component' | 'image' | 'custom';
  // 弹窗内容（如果是component，这里是组件名称）
  content: string;
  // 自定义内容配置（当contentType为custom时使用）
  customConfig?: Record<string, any>;
  // 优先级 (1-最高优先级，值越大优先级越低)
  priority: number;
  // 是否支持立即插入队列
  immediate?: boolean;
  // 弹窗宽度
  width?: number | string;
  // 弹窗样式
  style?: Record<string, any>;
  // 确认按钮文字
  okText?: string;
  // 取消按钮文字
  cancelText?: string;
  // 是否显示取消按钮
  showCancel?: boolean;
  // 是否显示关闭图标
  closable?: boolean;
  // 点击蒙层是否允许关闭
  maskClosable?: boolean;
  // 弹窗展示前的条件检查
  conditions?: ModalCondition[];
  // 弹窗行为配置
  actions?: ModalAction[];
  // 弹窗展示规则
  rules?: ModalRule;
  // 弹窗分组（用于批量控制）
  group?: string;
  // 弹窗状态
  status: 'active' | 'inactive';
}

/**
 * 弹窗条件配置
 */
interface ModalCondition {
  // 条件类型
  type: 'time' | 'user' | 'ab' | 'custom';
  // 条件配置
  config: {
    // 时间条件
    startTime?: string;
    endTime?: string;
    // 用户条件
    userTypes?: string[];
    userTags?: string[];
    // AB测试条件
    experimentId?: string;
    experimentGroup?: string;
    // 自定义条件
    customCheck?: string;
  };
}

/**
 * 弹窗行为配置
 */
interface ModalAction {
  // 行为触发时机
  trigger: 'onOk' | 'onCancel' | 'onClose' | 'custom';
  // 行为类型
  type: 'api' | 'event' | 'function' | 'link';
  // 行为配置
  config: {
    // API配置
    api?: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      params?: Record<string, any>;
    };
    // 事件配置
    event?: {
      name: string;
      data?: Record<string, any>;
    };
    // 函数配置
    function?: string;
    // 链接配置
    link?: {
      url: string;
      target?: '_blank' | '_self';
    };
  };
  // 行为执行顺序
  order: number;
  // 是否阻止弹窗关闭
  preventClose?: boolean;
  // 失败处理
  onError?: 'ignore' | 'retry' | 'alert';
}

/**
 * 弹窗展示规则
 */
interface ModalRule {
  // 展示频率限制
  frequency?: {
    // 时间范围
    timeRange: 'day' | 'week' | 'month' | 'custom';
    // 自定义时间范围（小时）
    customHours?: number;
    // 最大展示次数
    maxCount: number;
  };
  // 展示间隔（分钟）
  interval?: number;
  // 是否需要用户确认
  requireConfirm?: boolean;
  // 是否记住用户选择
  rememberChoice?: boolean;
  // 记住选择的有效期（天）
  choiceValidDays?: number;
}

/**
 * 弹窗配置中心
 */
interface ModalConfigCenter {
  // 配置版本
  version: string;
  // 更新时间
  updateTime: string;
  // 是否启用配置中心
  enabled: boolean;
  // 全局配置
  globalConfig: {
    // 默认配置
    defaultConfig: Partial<BaseModalConfig>;
    // 队列配置
    queueConfig: {
      // 最大队列长度
      maxLength: number;
      // 默认展示间隔（毫秒）
      defaultInterval: number;
      // 是否自动恢复被打断的弹窗
      autoResume: boolean;
    };
    // 降级配置
    fallbackConfig: {
      // 是否启用降级
      enabled: boolean;
      // 降级策略
      strategy: 'local' | 'empty';
    };
  };
  // 弹窗配置列表
  modalConfigs: BaseModalConfig[];
}

// 示例配置
const exampleConfig: ModalConfigCenter = {
  version: "1.0.0",
  updateTime: "2023-11-20T10:00:00Z",
  enabled: true,
  globalConfig: {
    defaultConfig: {
      width: 520,
      maskClosable: false,
      showCancel: true,
      closable: true
    },
    queueConfig: {
      maxLength: 10,
      defaultInterval: 300,
      autoResume: true
    },
    fallbackConfig: {
      enabled: true,
      strategy: "local"
    }
  },
  modalConfigs: []
};

export type {
  BaseModalConfig,
  ModalCondition,
  ModalAction,
  ModalRule,
  ModalConfigCenter
};

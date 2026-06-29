/**
 * 模式选择器 - 类型定义
 */
import { EnumSearchMode } from '../../enum';

// 模式配置类型
export interface TypeModeConfig {
  key: EnumSearchMode;
  // icon: string;
  title: string;
  description: string;
  // hasArrow?: boolean;
}

// 组件属性类型
export interface TypeModeSelectorProps {
  value?: EnumSearchMode;
  onChange?: (mode: EnumSearchMode) => void;
  disabled?: boolean;
}


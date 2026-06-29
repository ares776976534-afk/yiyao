/**
 * 模式选择器 - 常量定义
 */

import { TypeModeConfig } from './types';
import { EnumSearchMode } from '../../enum';
import { $t } from '@/i18n';

// 模式配置列表
export const MODE_CONFIGS: TypeModeConfig[] = [
  {
    key: EnumSearchMode.SMART,
    // icon: 'https://img.alicdn.com/imgextra/i2/6000000001393/O1CN011WpkiM1MA2ooZjgTx_!!6000000001393-2-gg_dtc.png',
    title: $t("global-1688-ai-app.select-business.ModeSelector.constants.znms", "智能模式"),
    description: $t("global-1688-ai-app.select-business.ModeSelector.constants.mxzdppxq", "模型自动匹配需求"),
  },
  {
    key: EnumSearchMode.PRODUCT_TO_SUPPLIER,
    // icon: 'https://img.alicdn.com/imgextra/i2/6000000007113/O1CN016XY2xJ22PoJfxKFds_!!6000000007113-2-gg_dtc.png',
    title: $t("global-1688-ai-app.select-business.ModeSelector.constants.ypzs", "以品找商"),
    description: $t("global-1688-ai-app.select-business.ModeSelector.constants.xdth", "先定商品再推商家"),
  },
  {
    key: EnumSearchMode.DIRECT_SUPPLIER,
    // icon: 'https://img.alicdn.com/imgextra/i2/6000000004608/O1CN01idqRA61juWAgLZrqB_!!6000000004608-2-gg_dtc.png',
    title: $t("global-1688-ai-app.select-business.ModeSelector.constants.zsmerchant", "直搜商家"),
    description: $t("global-1688-ai-app.select-business.ModeSelector.constants.zcImn", "只搜商家信息"),
  },
];

// 按钮图标
// export const BUTTON_LEFT_ICON = 'https://img.alicdn.com/imgextra/i1/6000000001643/O1CN01eCAJK61O0XpwAzTY9_!!6000000001643-2-gg_dtc.png';
// export const BUTTON_RIGHT_ICON = 'https://img.alicdn.com/imgextra/i4/6000000006001/O1CN01WEPb841uCVtK61oPA_!!6000000006001-2-gg_dtc.png';

// 箭头图标
// export const ARROW_ICON = 'https://img.alicdn.com/imgextra/i2/6000000007060/O1CN01GpJh44221XKBYnKVp_!!6000000007060-2-gg_dtc.png';


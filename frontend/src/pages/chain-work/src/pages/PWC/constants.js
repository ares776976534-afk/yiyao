// 取消合并
export const CANCEL_MERGE = 'cancelMerge';

// 未测量/未入库
export const ITEM_STATUS_PREPARE = 'PREPARE';
// 认证中
export const ITEM_STATUS_MEASURING = 'MEASURING';
// 测量完成
export const ITEM_STATUS_OVER = 'OVER';
// 测量失败
export const ITEM_STATUS_FAIL = 'FAIL';

// 测量成功
export const ITEM_MEASUR_STATUS_SUCCESS = 'SUCCESS';
// 非新
export const ITEM_MEASUR_STATUS_NOT_NEW = 'NOT_NEW';
// 破损
export const ITEM_MEASUR_STATUS_DAMAGED = 'DAMAGED';
// 无实物
export const ITEM_MEASUR_STATUS_NO_MATERIAL = 'NO_MATERIAL';

export const ITEM_STATUS_TEXT_MAP = {
  [ITEM_STATUS_PREPARE]: '待寄样',
  [ITEM_STATUS_MEASURING]: '认证中',
  [ITEM_STATUS_OVER]: '认证完成',
  [ITEM_STATUS_FAIL]: '认证失败',
  [ITEM_MEASUR_STATUS_SUCCESS]: '成功',
  [ITEM_MEASUR_STATUS_NOT_NEW]: '非新',
  [ITEM_MEASUR_STATUS_DAMAGED]: '破损',
  [ITEM_MEASUR_STATUS_NO_MATERIAL]: '无实物',
};

export const ITEM_STATUS_TYPE = {
  [ITEM_STATUS_PREPARE]: 'info',
  [ITEM_STATUS_MEASURING]: 'info',
  [ITEM_STATUS_OVER]: 'success',
  [ITEM_STATUS_FAIL]: 'warning',
};

// 待寄样
export const STATUS_WAITING = 'WAITING';
// 已寄样
export const STATUS_SEND = 'SEND';
// 销毁
export const STATUS_DESTROYED = 'DESTROYED';
// 未支付
export const STATUS_UNPAY = 'UNPAY';
// 已支付
export const STATUS_PAID = 'PAID';
// 已欠费
export const STATUS_ARREARS = 'ARREARS';

// 已拒收
export const STATUS_REFUSED = 'REFUSED';

export const STATUS_TEXT_MAP = {
  [STATUS_WAITING]: '待寄样',
  [STATUS_SEND]: '已寄样',
  [STATUS_DESTROYED]: '样品已处理',
  [STATUS_UNPAY]: '样品已处理',
  [STATUS_PAID]: '样品已处理',
  [STATUS_REFUSED]: '样品已处理',
  [STATUS_ARREARS]: '样品已处理',
};

export const STATUS_TYPE = {
  [STATUS_WAITING]: 'warning',
  [STATUS_SEND]: 'success',
  [STATUS_DESTROYED]: 'disabled',
  [STATUS_UNPAY]: 'success',
  [STATUS_PAID]: 'success',
  [STATUS_REFUSED]: 'disabled',
  [STATUS_ARREARS]: 'disabled',
};

// 件重尺协议
export const SETTLED_TAG = 5175105;

// 打印
export const PRINT_LABEL = 'printLabel';


export const PWC_SEND_URL = (ids) => {
  return `https://work.1688.com/?_path_=gonghuotuoguan/cross_boarder_2/jianzhongchijiyang&_hex_sampleIds=${ids}`;
};

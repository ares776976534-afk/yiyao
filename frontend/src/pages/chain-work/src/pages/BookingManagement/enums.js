// 预约状态
export const StatusType = {
  1: '待预约',
  5: '特殊预约待审核',
  6: '特殊改约待审核',
  10: '已预约',
  12: '部分完成',
  20: '已完成',
  '-10': '已取消',
  '-5': '有责取消中',
  51: '特殊待小二审核',
  55: '等待买家确认',
  60: '统筹中',
};

// 出入库方式
export const InOutType = {
  NORMAL: '物流入库',
  EXPRESS: '快递入库',
};

// 预约单类型名称
export const BookingType = {
  10: '普通直入预约单',
  30: '退供出库预约单',
};

// 预约类型
export const reservationType = {
  NORMAL: '普通预约',
};

// 预约单类型List
export const BookingTypeList = [
  { label: '普通直入预约单', value: 10, key: '普通直入预约单' },
  { label: '退供出库预约单', value: 30, key: '退供出库预约单' },
];

// 出入库方式List
export const InOutTypeList = [
  { label: '物流入库', value: 'NORMAL', key: '物流入库' },
  { label: '快递入库', value: 'EXPRESS', key: '快递入库' },
];

// 预约状态List
export const StatusTypeList = [
  { label: '待预约', value: 1, key: '待预约' },
  { label: '特殊预约待审核', value: 5, key: '特殊预约待审核' },
  { label: '特殊改约待审核', value: 6, key: '特殊改约待审核' },
  { label: '已预约', value: 10, key: '已预约' },
  { label: '部分完成', value: 12, key: '部分完成' },
  { label: '已完成', value: 20, key: '已完成' },
  { label: '已取消', value: -10, key: '已取消' },
  { label: '有责取消中', value: -5, key: '有责取消中' },
  { label: '特殊待小二审核', value: 51, key: '特殊待小二审核' },
  { label: '等待买家确认', value: 55, key: '等待买家确认' },
  { label: '统筹中', value: 60, key: '统筹中' },
];

// 库区类型List
export const WarehouseAreaTypeList = [
  { label: '临租仓', value: 'temporaryStore', key: '临租仓' },
  { label: '主仓', value: 'normalStore', key: '主仓' },
  { label: '品类仓', value: 'commodityStore', key: '品类仓' },
];

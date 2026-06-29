
export enum ORDER_STATUS {
  TO_PAY = 'to_pay', // 待支付
  TO_EFFECTIVE = 'to_effective', // 待生效
  EFFECTIVED = 'effective', // 已生效
  EXPIRED = 'expired', // 已过期
  CANCELLED = 'cancel', // 已取消
}
export interface OrderData {
  key: string;
  orderId: string;
  packageName: string; // 套餐名称
  totalPrice: string; // 套餐积分 
  originalFee: string; // 原价
  payFee: string; // 实付金额
  createTime: string; // 创建时间
  payTime: string; // 支付时间 
  effectiveTime: string; // 生效时间
  expiredTime: string; // 过期时间
  status: ORDER_STATUS;
}

export interface OrderTableProps {
  dataSource?: OrderData[];
}

export interface OrderPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}
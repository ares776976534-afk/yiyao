import actions from '@/service/actions';
import { Message } from '@alifd/next';

export const SML = 'sml';
// [2026-06-22 Offline] 产品要求下线商家自寄Tab，ZJ常量暂时保留供引用不报错
export const ZJ = 'zj';

export const defaultParam = { orderStatus: '', orderNo: '' };

export const aeTabList = [
  {
    title: '上门揽订单',
    subTitle: '速卖通为您提供上门服务，不支持商家自行发货，不收取商家费用。',
    type: SML,
  },
  // [2026-06-22 Offline] 产品要求下线商家自寄Tab
  // {
  //   title: '商家自寄订单',
  //   subTitle: '商家须在限定时效内，自行联系快递公司进行发货。',
  //   type: ZJ,
  // },
];

export const sellStatusMap = [
  {
    value: '',
    label: '全部',
  },
  {
    value: 'waitsellersend',
    label: '等待卖家发货',
  },
  {
    value: 'waitbuyerreceive',
    label: '等待买家收货',
  },
  {
    value: 'confirm_goods_but_not_fund',
    label: '已收货待到账',
  },
  {
    value: 'success',
    label: '交易成功',
  },
  {
    value: 'cancel',
    label: '交易关闭',
  },
];

export const orderConstants = [
  ...sellStatusMap,
  {
    value: 'waitbuyerpay',
    label: '等待买家付款',
  },
  {
    value: 'waitsellermodify',
    label: '等待买家修改信息',
  },
  {
    value: 'waitbuyerrepayment',
    label: '等待买家还款',
  },
  {
    value: 'terminated',
    label: '交易终止', // 该状态下，支付被终止，物流是买家已收货
  },
  {
    value: 'waitsellerbindalipay',
    label: '等待卖家绑定支付宝',
  },
  {
    value: 'waitsellerconfirm',
    label: '等待卖家确认信息',
  },
  {
    value: 'waitbuyerconfirm',
    label: '等待买家确认信息',
  },
  {
    value: 'waitsellerconfirmfund',
    label: '等待卖家确认到账',
  },
  {
    value: 'waitselleract',
    label: '等待卖家操作',
  },
  {
    value: 'waitbuyerconfirmaction',
    label: '等待买家确认操作',
  },
  {
    value: 'waitsellerpush',
    label: '等待卖家推进',
  },
  {
    value: 'waitlogisticstakein',
    label: '等待物流公司揽件',
  },
  {
    value: 'waitbuyersign',
    label: '等待买家签收',
  },
  {
    value: 'signinsuccess',
    label: '买家已签收',
  },
  {
    value: 'signinfailed',
    label: '签收失败',
  },
  {
    value: 'paid_but_not_fund',
    label: '已支付未结算',
  },
  {
    value: 'wait_seller_accept_order',
    label: '等待卖家确认订单',
  },
  {
    value: 'wait_confirm_invoice',
    label: '等待确认发票',
  },
  {
    value: 'wait_pintuan_order',
    label: '待成团订单',
  },
  {
    value: 'confirm_goods_and_has_subsidy',
    label: '已收货已贴现',
  },
  {
    value: 'send_goods_but_not_fund',
    label: '已发货未到账', // 用于全货退完但卖家未收到款的情况
  },
  {
    value: 'paid_and_has_subsidy',
    label: '支付已贴现', // 当面付之类没有发货环节，付款后直接打款
  },
  {
    value: 'confirm_goods',
    label: '已收货',
  },
  {
    value: 'wait_seller_abort_receive_goods',
    label: '等待卖家确认订单',
  },
  {
    value: 'abort_receive_goods',
    label: '终止收货',
  },
  {
    value: 'wait_group_order',
    label: '待成团', // 淘特批发团状态定制
  },
  {
    value: 'group_success_order',
    label: '已成团', // 淘特批发团状态定制
  },
  {
    value: 'plus_order_pay_success',
    label: '已成团', // 淘特批发团状态定制
  },
  {
    value: 'global_part_into_warehouse',
    label: '部分进入仓库',
  },
  {
    value: 'global_all_into_warehouse',
    label: '全部进入仓库',
  },
  {
    value: 'global_package_transporting',
    label: '包裹运输中',
  },
  {
    value: 'global_package_delivered',
    label: '包裹已签收',
  },
];

// 揽收物流状态枚举
export const receiveStatusMap = [
  {
    value: '10',
    label: '待揽收',
  },
  {
    value: '20',
    label: '已派车',
  },
  {
    value: '30',
    label: '已揽收',
  },
  {
    value: '40',
    label: '已送达',
  },
  {
    value: '-10',
    label: '已取消',
  },
  {
    value: '-20',
    label: '揽收失败',
  },
];

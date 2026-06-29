export const TIME_RANGE = [
  { title: '近7天', key: 'data7d' },
  { title: '近30天', key: 'data30d' },
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

export const itemMap = [
  {
    key: 'notOnSale',
    title: '不在售商品列表',
  },
  {
    key: 'onSale',
    title: '在售商品列表',
  },
];

export const videoIntro = 'https://cloud.video.taobao.com/vod/7NKIEJ7mZIk1BSWzZMSFQUkMyphmSd-c8iqxayOO-QI.mp4';

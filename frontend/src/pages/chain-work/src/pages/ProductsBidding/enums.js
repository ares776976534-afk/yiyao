export const BidStatus = {
  BIDDING: 'checking', // 竞价中
  BID_SUCCESSFUL: 'active', // 竞价成功
  BID_FAILED: 'refused', // 竞价失败
  AUDIT_FAILED: 'auditFailed',
};

// 状态文案
export const StatusTextMap = {
  BIDDING: '竞价中',
  BID_SUCCESSFUL: '报名成功',
  BID_FAILED: '竞价失败',
  WITHDRAWING: '撤销中',
  WITHDRAWN: '已撤销',
  AUDIT_FAILED: '审核失败',
  Modification_FAILED: '修改失败',
};

// 状态颜色
export const StatusColors = {
  [BidStatus.BIDDING]: 'orange-dot',
  [BidStatus.BID_SUCCESSFUL]: 'green-dot',
  [BidStatus.BID_FAILED]: 'red-dot',
  [BidStatus.WITHDRAWING]: 'gray-dot',
  [BidStatus.WITHDRAWN]: 'gray-dot',
  [BidStatus.AUDIT_FAILED]: 'red-dot',
};

export const dataList = [
  {
    url: 'https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240517210818311/20240517210818311.html',
    title: '《直通“速卖通爆品”托管技术服务协议》',
  },
  {
    url: 'https://terms.alicdn.com/legal-agreement/terms/suit_bu1_b2b/suit_bu1_b2b202104192035_47290.html',
    title: '《1688官方物流综合解决方案服务协议》',
  },
  {
    url: 'https://terms.alicdn.com/legal-agreement/terms/suit_bu1_b2b/suit_bu1_b2b202112271356_41414.html',
    title: '《1688官方物流信息授权协议》',
  },
  {
    url: 'https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051',
    title: '《支付宝代扣协议》',
  },
  {
    url: 'https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20231215164403513/20231215164403513.html',
    title: '《信息共享授权书》',
  },
];

export const tooltipList = [
  {
    label: '履约方式：',
    value: '平台发货',
    content: '平台发货：中标商家在上门揽货前，需要按照规定将待发货品张贴箱唛及商品标签，进行合理的物流包装、封箱并粘贴运单，后交付给官方合作物流服务商。建议商家索要纸质版交接清单并慎重保留。',
  },
  {
    label: '发货方式：',
    value: '平台上门揽',
    content: '平台上门揽：中标商家接收到下发的补货单后，需在规定时间内根据确认的发货地址进行备货及上门揽货预约。建议商家索要纸质版交接清单并慎重保留。',
  },
];

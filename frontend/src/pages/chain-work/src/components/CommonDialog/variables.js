export const fullDialogStyle = {
  '--dialog-content-padding-top': '20px',
  '--dialog-content-padding-left': '20px',
  '--dialog-content-padding-right': '20px',
  '--dialog-content-padding-bottom': '20px',
  '--dialog-title-font-size': '16px',
  lineHeight: '19px',
  '--dialog-title-font-weight': '500',
  '--dialog-close-size': '20px',
  '--dialog-title-padding-top': '20px',
  '--dialog-title-padding-left-right': '20px',
  '--dialog-close-top': '20px',
  '--dialog-close-right': '20px',
  width: '640px',
  borderRadius: '12px',
};

export const data1 = {
  isAE: true,
  title: '1688跨境“速卖通优选”活动入驻',
  dialogBuryingPoint: 'chain-work/crossborderofferlist@跨境速卖通协议弹窗',
  titleIcon: 'https://img.alicdn.com/imgextra/i4/O1CN01fsJhpu26w6VzEoudc_!!6000000007725-0-tps-38-32.jpg',
  introductionText: [
    {
      title: '尊敬的1688会员：',
      // 描述内容可能是string、ReactNode、
      type: 'string',
      descriptiveContent: '恭喜您的商品被速卖通商机命中，有机会进入速卖通渠道成为出海热卖商品！签署协议后，可有机会参与速卖通专属频道销售机会，获取更多海外渠道流量！',
    },
  ],
  replacements: [
    {
      key: '《直通“速卖通优选”服务协议》',
      typke: 'link',
      href: 'https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240524204617685/20240524204617685_1_0_22987.html',
    },
    {
      key: '《“速卖通优选”活动规则》',
      typke: 'link',
      href: 'https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/AR4GpnMqJzML1lddtEKRkQ2yVKe0xjE3',
    },
    {
      key: '《“速卖通优选”招商规则》',
      typke: 'link',
      href: 'https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/qnYMoO1rWxDl12ddcOOB0aAGW47Z3je9',
    },
    {
      key: '《信息共享授权书》',
      typke: 'link',
      href: 'https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20230928094558858/20230928094558858.html',
    },
    {
      key: '《支付宝付款授权协议》',
      typke: 'link',
      href: 'https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051',
    },
    {
      key: '5%',
      typke: 'specialText',
      children: '<s>5%</s>',
    },
    {
      key: '2.9%',
      typke: 'colorText',
      children: '<span style="color: #ff4d4f;">2.5%</span>',
    },
  ],
  agreements: [
    {
      key: '1',
      content: '我同意入驻速卖通渠道，签署 《直通“速卖通优选”服务协议》 《“速卖通优选”活动规则》 《“速卖通优选”招商规则》《信息共享授权书》《支付宝付款授权协议》，知晓商品在速卖通渠道的订单将按照优惠政策抽取 5% 2.9% 的技术服务费。',
    },
  ],
  btns: [
    {
      key: 'ok',
      buryingPoint: 'CLK_加入跨境速卖通弹窗_一键入驻',
      buryingPointSuccess: 'CLK_加入跨境速卖通弹窗_一键入驻_成功',
      btnText: '一键入驻',
    },
  ],
};

export const data2 = {
  isAE: false,
  title: '商品制造商信息确认',
  introductionText: [
    {
      title: '尊敬的1688会员：',
      // 描述内容可能是string、ReactNode、
      type: 'string',
      descriptiveContent: '根据欧洲通用产品安全法规（GPSR）要求，销往欧洲的商品需提供商品制造商信息并体现在商品实物标签中。因此，参与“速卖通优选”活动的商家需提供商品制造商信息，请您确认如下商品制造商信息是否正确。如不正确，请修改并提交正确的商品制造商信息，您提交的信息将被提供给速卖通并展示在商品实物标签中，以符合GPSR合规要求。',
    },
  ],
  btns: [
    {
      key: 'ok',
      btnText: '确认',
    },
  ],
};


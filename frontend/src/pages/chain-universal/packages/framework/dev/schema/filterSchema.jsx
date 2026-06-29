const PRODUCT_ID = {
  name: "权益",
  key: "rightType",
  type: "input",
};
const PRODUCT_NAME = {
  name: "rightName-false",
  key: "rightName",
  type: "input",
  opt: {
    searchImmediate: true,
  },
};
// 流量渠道
const channel = {
  name: "流量渠道",
  key: "oppReqChannelList",
  type: "selectedCards",
  cardsData: [
    {
      flag: "",
      label: "搜索急招",
      class: "com.alibaba.cbu.supply.model.opportunity.OppConditionModel",
      value: "P00032",
      order: -1,
    },
    {
      flag: "https://img.alicdn.com/imgextra/i3/O1CN01HpSX3F25juU6dzkZZ_!!6000000007563-2-tps-120-56.png",
      label: <span style={{ color: '#e5cf93',}}>优商专属</span>,
      class: "com.alibaba.cbu.supply.model.opportunity.OppConditionModel",
      value: "P00030",
      icon: "https://img.alicdn.com/imgextra/i3/O1CN01aGRO3t1vRSOZ7Kaxd_!!6000000006169-55-tps-200-200.svg",
      order: 0,
      style: { backgroundColor: '#000' }
    },
  ],
  opt: {
    resetTrigger: "false",
    mode: "single",
    searchImmediate: true,
  },
};
export default () => {
  return [channel, PRODUCT_ID, PRODUCT_NAME];
};

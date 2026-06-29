import { SCHEMA_INPUT, SCHEMA_SELECT } from '@/components/CommonTable/contanst';
import { queryOfferEnums } from '@/pages/OverseasDistribution/services';

const ITEM_ID = {
  name: '商品ID',
  key: 'itemId',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '输入文本',
    hasClear: true,
  },
};

// 商品名称
const ITEM_NAME = {
  name: '商品名称',
  key: 'itemName',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '输入文本',
    hasClear: true,
  },
};

// 经营建议
const BUSINESS_ADVICE = {
  name: '经营建议',
  key: 'businessAdvice',
  type: SCHEMA_SELECT,
  opt: {
    placeholder: '请选择文本',
    hasClear: true,
  },
  fetchData: () => queryOfferEnums().then((res) => {
    return res?.offerAdvice?.map(({ code, desc }) => ({ label: desc, key: code, value: code }));
  }),
};

export default (status) => {
  switch (status) {
    case 'QQYX':
      return [ITEM_ID, ITEM_NAME];
    default:
      return [ITEM_ID, ITEM_NAME];
  }
};

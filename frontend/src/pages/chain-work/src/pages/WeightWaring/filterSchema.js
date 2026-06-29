import { SCHEMA_SELECT } from '@/components/CommonTable/contanst';
import { queryItemSearchContent } from '@/pages/Select/services';

// 数据来源
const DATA_SOURCE = {
  name: '数据来源',
  key: 'datasource',
  type: SCHEMA_SELECT,
  opt: {
    placeholder: '请选择',
    hasClear: true,
  },
  fetchData: () => queryItemSearchContent().then((res) => {
    return res?.pwsAlertDatasource?.map(({ code = '', desc = '' }) => ({
      label: desc,
      value: code,
    })) || [];
  }),
};

export default () => {
  return [DATA_SOURCE];
};

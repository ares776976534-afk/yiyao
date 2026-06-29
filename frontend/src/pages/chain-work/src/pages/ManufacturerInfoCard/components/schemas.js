import { SCHEMA_SELECT } from '@/components/CommonTable/contanst';
import { queryAllManufacturerDetailsByUserId } from '@/service/common';

export default (value) => {
  const MANUFACTURER_INFO = {
    name: '选择制造商信息',
    key: 'manufacturerId',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      size: 'large',
      style: { borderRadius: '6px' },
      initValue: value,
      showSearch: true,
    },
    fetchData: () => queryAllManufacturerDetailsByUserId(),
  };
  return [MANUFACTURER_INFO];
};

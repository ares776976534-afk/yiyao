import { fetchListCertCountry, fetchListCertCategory } from '@/pages/Select/services';

export const SCHEMA_SELECT = 'select';
export const SCHEMA_SEARCH = 'search';

const CERTIFICATE_TYPES = {
  name: '类型',
  key: 'categories',
  type: SCHEMA_SELECT,
  opt: {
    placeholder: '请选择',
    hasClear: true,
    // onChange: true,
    showSearch: true,
  },
  fetchData: fetchListCertCategory,
};

const COUNTRY_AFFILIATION = {
  name: '所属国家/地区',
  key: 'certCountryAbbrNames',
  type: SCHEMA_SELECT,
  opt: {
    placeholder: '请选择',
    hasClear: true,
    mode: 'multiple',
    // onChange: true,
    showSearch: true,
    maxTagCount: 2,
    maxTagPlaceholder: (omittedValues) => `+${omittedValues.length}`,
  },
  fetchData: fetchListCertCountry,
};

const NAME_CERTIFICATE_NUMBER = {
  name: '名称/证书编号',
  key: 'certificateNameOrNumber',
  type: SCHEMA_SEARCH,
  opt: {
    placeholder: '请输入',
    onSearch: true,
  },
};

export default (type) => {
  switch (type) {
    case '1':
      return [CERTIFICATE_TYPES, COUNTRY_AFFILIATION];
    case '2':
      return [NAME_CERTIFICATE_NUMBER, CERTIFICATE_TYPES, COUNTRY_AFFILIATION];
    default:
      return [];
  }
};

import React, { useEffect, useState } from 'react';
import { SCHEMA_INPUT, SCHEMA_SELECT, SCHEMA_SEARCH, SCHEMA_TEXTAREA } from '@/components/CommonTable/contanst';
import { queryTranslate, queryAreaInfo, queryAllManufacturerDetailsByUserId } from '@/service/common';
import { MessageError } from '@/utlis';
import configCenter from '@alife/channel-uni-config-center';

export let nameKeyWords = ['公司', '厂'];

const setKeywords = () => {
  return new Promise((resolve) => {
    configCenter.getByResourceId(35998947)
      .then((res) => {
        return Object.keys(res).map((ele) => {
          return res[ele].name;
        });
      })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        resolve(nameKeyWords);
      });
  });
};

setKeywords()
  .then((res) => {
    nameKeyWords = res;
  });

export function includesNameKeyWords(str, values) {
  for (let i = 0; i < values.length; i++) {
    if (str.includes(values[i])) {
      return true; // 如果找到了匹配项，立即返回 true
    }
  }
  return false;
}

export const MANUFACTURER_INFO = {
  name: '选择制造商信息',
  key: 'manufacturerId',
  type: SCHEMA_SELECT,
  opt: {
    placeholder: '请选择',
    hasClear: true,
    size: 'large',
    style: { borderRadius: '6px' },
    showSearch: true,
  },
  fetchData: () => queryAllManufacturerDetailsByUserId(),
};
export default (status, values) => {
  const [manufacturerAddressValue, setManufacturerAddressValue] = useState(values?.manufacturerAddress || '');
  const [detailedAddressCnValue, setDetailedAddressCnValue] = useState(values?.detailedAddressCn || '');
  const [manufacturerNameCnValue, setManufacturerNameCnValue] = useState(values?.manufacturerNameCn || '');
  const [areaCodeValue, setAreaCodeValue] = useState([values?.areaCode || '']);
  const [MANUFACTURER_ENGLISH, setManufacturerEnglish] = useState({
    name: '',
    key: 'manufacturerNameEn',
    type: SCHEMA_INPUT,
    colClassName: 'mt-[8px]',
    opt: {
      placeholder: '请输入英文',
      hasClear: true,
      size: 'large',
      style: { width: '360px', borderRadius: '6px' },
      initValue: values?.manufacturerNameEn || '',
      onChange: (v) => {
        setManufacturerEnglish((prev) => ({
          ...prev,
          opt: {
            ...prev.opt,
            initValue: v,
            value: v,
          },
        }));
      },
    },
  });
  const [ADDRESS_ENGLISH, setAddressEnglish] = useState({
    name: '',
    key: 'detailedAddressEn',
    type: SCHEMA_TEXTAREA,
    colClassName: 'mt-[8px]',
    opt: {
      placeholder: '请输入英文',
      size: 'large',
      maxLength: 500,
      rows: 5,
      style: { width: '360px', borderRadius: '6px' },
      showLimitHint: true,
      initValue: values?.detailedAddressEn || '',
      onChange: (v) => {
        setAddressEnglish((prev) => ({
          ...prev,
          opt: {
            ...prev.opt,
            initValue: v,
            value: v,
          },
        }));
      },
    },
  });
  const [phoneSetter, setPhoneSetter] = useState([]);
  const handleTranslateAndSetNameOrAddress = async (text, type) => {
    queryTranslate({ sourceText_cn: text }).then((res) => {
      const { content = {} } = res;
      const { success, message, data } = content;
      if (success) {
        switch (type) {
          case 'manufacturer':
            setManufacturerEnglish((prev) => ({
              ...prev,
              opt: {
                ...prev.opt,
                initValue: data.translated,
                value: data.translated,
                rules: [
                  {
                    validator: (rule, v, callback) => {
                      if (v || data.translated) {
                        callback();
                      } else {
                        callback('制造商名称翻译不能为空');
                      }
                    },
                  },
                ],
              },
            }));
            break;
          case 'address':
            setAddressEnglish((prev) => ({
              ...prev,
              opt: {
                ...prev.opt,
                initValue: data.translated,
                value: data.translated,
                rules: [
                  {
                    validator: (rule, v, callback) => {
                      if (v || data.translated) {
                        callback();
                      } else {
                        callback('详细地址翻译不能为空');
                      }
                    },
                  },
                ],
              },
            }));
            break;
          default:
            break;
        }
      } else {
        MessageError(message || '系统异常');
      }
    });
  };
  const MANUFACTURER_NAME = {
    name: '制造商名称',
    key: 'manufacturerNameCn',
    type: SCHEMA_INPUT,
    opt: {
      placeholder: '请输入中文，输入后将同步翻译为英文',
      hasClear: true,
      size: 'large',
      required: true,
      style: { width: '360px', borderRadius: '6px' },
      onChange: (v) => {
        setManufacturerNameCnValue(v);
        handleTranslateAndSetNameOrAddress(v, 'manufacturer');
      },
      rules: [
        {
          validator: (rule, v, callback) => {
            if (v || manufacturerNameCnValue) {
              callback();
            } else if (!includesNameKeyWords(v, nameKeyWords)) {
              callback(`制造商名称必须包含 ${nameKeyWords.join('、')}`);
            } else {
              callback('制造商名称不能为空');
            }
          },
        },
      ],
      initValue: manufacturerNameCnValue,
      value: manufacturerNameCnValue,
    },
  };
  const ADDRESS = {
    name: '详细地址',
    key: 'detailedAddressCn',
    type: SCHEMA_TEXTAREA,
    opt: {
      placeholder: '请输入中文，输入后将同步翻译为英文',
      size: 'large',
      maxLength: 500,
      rows: 5,
      required: true,
      style: { width: '360px', borderRadius: '6px' },
      showLimitHint: true,
      onChange: (v) => {
        setDetailedAddressCnValue(v);
        handleTranslateAndSetNameOrAddress(v, 'address');
      },
      rules: [
        {
          validator: (rule, v, callback) => {
            if (v || detailedAddressCnValue) {
              callback();
            } else {
              callback('详细地址不能为空');
            }
          },
        },
      ],
      initValue: detailedAddressCnValue,
      value: detailedAddressCnValue,
    },
  };
  useEffect(() => {
    queryAreaInfo({ queryType: 2, name: 'phoneNumber' }).then((res) => {
      setPhoneSetter(res);
    });
  }, []);
  const PHONE = {
    name: '手机/固定电话号码',
    key: 'phoneNumber',
    type: SCHEMA_SEARCH,
    opt: {
      placeholder: '请输入',
      hasClear: true,
      size: 'large',
      required: true,
      style: { width: '280px', borderRadius: '6px' },
      rules: [
        {
          required: true,
          message: '电话号码不能为空',
        },
      ],
      hasIcon: false,
      filter: phoneSetter,
      initValue: values?.phoneNumber || '',
      defaultFilterValue: areaCodeValue[0].value,
      filterValue: areaCodeValue[0].value,
      onFilterChange: true,
    },
  };
  const MANUFACTURER_ADDRESS = {
    name: '制造商地址',
    key: 'manufacturerAddress',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择国家/地区',
      hasClear: true,
      size: 'large',
      required: true,
      style: { width: '280px', borderRadius: '6px' },
      onChange: (v) => {
        setManufacturerAddressValue(v);
        queryAreaInfo({ queryType: 3, name: 'manufacturerAddressPhone', value: v }).then((res) => {
          setAreaCodeValue(res);
        });
      },
      rules: [
        {
          validator: (rule, v, callback) => {
            if (v || manufacturerAddressValue) {
              callback();
            } else {
              callback('制造商地址不能为空');
            }
          },
        },
      ],
      value: manufacturerAddressValue,
      showSearch: true,
    },
    fetchData: () => queryAreaInfo({ queryType: 0, name: 'manufacturerAddress' }),
  };
  const EMAILADDRESS = {
    name: '电子邮箱',
    key: 'email',
    type: SCHEMA_INPUT,
    opt: {
      placeholder: '请输入邮箱地址',
      hasClear: true,
      size: 'large',
      required: true,
      style: { width: '280px', borderRadius: '6px' },
      rules: [
        {
          required: true,
          message: '邮箱地址不能为空',
          trigger: 'onChange',
        },
        {
          pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
          message: '邮箱地址格式不正确',
          trigger: 'onChange',
        },
      ],
      initValue: values?.email || '',
    },
  };
  switch (status) {
    case 'add':
      return [MANUFACTURER_NAME, MANUFACTURER_ENGLISH, MANUFACTURER_ADDRESS, ADDRESS, ADDRESS_ENGLISH, PHONE, EMAILADDRESS];
    default:
      return [];
  }
};

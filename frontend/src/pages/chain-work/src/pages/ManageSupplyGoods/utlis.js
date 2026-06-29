import React from 'react';
import { NumberPicker } from '@alifd/next';
import './index.scss';

export const inputRender = ({ value, dataIndex, disabled = false, attrs = {}, rules = [], isShow = true, field, precision = 2, hasErr = true }) => {
  const err = field.getError(dataIndex);
  let _value = String(value);
  if (!isShow) {
    return ' -- ';
  }
  if (!value && value !== 0) {
    _value = null;
  }
  return (
    <div>
      <NumberPicker
        style={{ width: attrs?.width || 120 }}
        className="number-picker"
        disabled={disabled}
        {...field.init(dataIndex, {
          initValue: _value || '',
          rules,
        })}
        precision={precision}
        min={0}
        placeholder="请输入"
        hasTrigger={false}
        {...attrs}
      />
      {err && hasErr && (
      <div className="text-[#FB3B20] text-[12px] mt-[8px] text-left">
        {err}
      </div>
      )}
    </div>
  );
};

export const getUrlParam = (key) => {
  const value =
    new URLSearchParams(location.search).get(key) || new URLSearchParams(location.search).get(`_hex_${key}`);

  return value || '';
};

export const getAllUrlParams = () => {
  const paramsObj = Object.fromEntries(new URLSearchParams(location.search));
  return paramsObj;
};

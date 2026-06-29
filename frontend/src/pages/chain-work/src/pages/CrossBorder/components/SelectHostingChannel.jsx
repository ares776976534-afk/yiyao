import React from 'react';
import { SCHEMA_CHECKBOX } from '@/components/CommonTable/contanst';
import RenderField from '@alife/1688-chain-renderfield';
import './SelectHostingChannel.scss';

// 跨境
const CROSS_BORDER = {
  name: '跨境',
  key: 'crossBorder',
  type: SCHEMA_CHECKBOX,
  opt: {
    checked: true,
    disabled: true,
  },
};
// 国内
const DOMESTIC = {
  name: '国内',
  key: 'isDomesticEntrust',
  type: SCHEMA_CHECKBOX,
};
function SelectHostingChannel({ field }) {
  const data = [CROSS_BORDER];
  return (
    data.map(({ name, key, type, opt }) => (
      <RenderField
        fieldInit={field?.init}
        fieldKey={key}
        type={type}
        name={name}
        opt={opt}
      />
    ))
  );
}

export default SelectHostingChannel;

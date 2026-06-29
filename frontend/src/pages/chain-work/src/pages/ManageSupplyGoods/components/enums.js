import React from 'react';

const createField = ({ label, key, unit, innerBefore = null, innerAfter = null, precision = 2, rules, placeholder, min = 0 }) => ({
  label,
  key,
  precision,
  attrs: {
    placeholder: placeholder || label,
    innerBefore,
    innerAfter: innerAfter || <span className="text-[#999] mr-[12px]">{unit}</span>,
    min,
  },
  rules,
});

export const data = {
  moq: [
    createField({
      label: 'MOQ',
      key: 'moq',
    }),
  ],
  pcs: [
    createField({
      label: '箱规',
      key: 'pcs',
      precision: 0,
    }),
  ],
  signUpPrice: [
    createField({
      label: '价格',
      key: 'signUpPrice',
      innerBefore: <span className="text-[#999] ml-[12px]">¥</span>,
    }),
  ],
  stock: [
    createField({
      label: '库存',
      key: 'stock',
      placeholder: '最低输入50',
      rules: [{
        validator: (rule, value, callback) => {
          const _value = parseFloat(value);
          if (_value < 50) {
            return callback('最低输入50');
          }
          return callback();
        },
        trigger: 'onChange',
      }],
    }),
  ],
};

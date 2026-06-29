import React from 'react';
import Mod from '../esm';
import { Field } from '@alifd/next';

export default () => {
    const PRODUCT_ID = {
        name: '产品ID',
        key: 'product_id',
        type: 'input',
        opt: {
          placeholder: '请输入',
          hasClear: true,
        }
      };
      const PRODUCT_NAME = {
        name: '产品名称',
        key: 'product_name',
        type: 'input',
        opt: {
          placeholder: '请输入',
          hasClear: true,
        }
      };
      const filters = [PRODUCT_ID, PRODUCT_NAME];
      const field = Field.useField({
        onChange: (name, value) => {
          // onSearch(field.getValues());
        },
      });
      const { init } = field;
      const handleSearch = () => {
        // onSearch(field.getValues());
      };
      const handleReset = () => {
        field.reset();
        // onSearch(field.getValues());
      };
  return (
    <div>
        {filters?.map(({name, key, type, opt}) => {
            return (
            <div key={name} className="field-block">
                <span>{name}</span>
                <span className="options">
                  <Mod
                    fieldKey={key}
                    type={type}
                    opt={opt}
                    name={name}
                    fieldInit={init}
                  />
                </span>
            </div>
            );
        })}
    </div>
  )
};
---
title: RenderField用法
sidebar_position: 1
---
## @alife/1688-chain-renderfield
组件功能描述
### Install
```tsx
$ npm i @alife/1688-chain-renderfield --save
```
### Usage
```tsx
import RenderField from '@alife/1688-chain-renderfield';
```
## 示例

```tsx preview
import '@alifd/next/dist/next.css'
import React from 'react';
import RenderField from '@alife/1688-chain-renderfield';
import { Field } from '@alifd/next';

export default ()=> {
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
        type: 'select',
        opt: {
          placeholder: '请输入',
          hasClear: true,
        }
      };
      const NUMBER_RANGE = {
        name: '产品数量',
        key: 'product_number',
        type: 'numberRange',
        opt: {
          min: 10,
          max: 99
        }
      }
      const filters = [PRODUCT_ID, PRODUCT_NAME, NUMBER_RANGE];
      const field = Field.useField({
        onChange: (name, value) => {
          console.log(name, value)
        },
      });
      const { init } = field;
      const handleSearch = () => {
        console.log(field.getValues());
      };
      const handleReset = () => {
        field.reset();
      };
  return (
    <div>
      {filters?.map(({name, key, type, opt}) => {
          return (
          <div key={name} style={{display: 'flex'}}>
              <span>{name}：</span>
              <RenderField
                fieldKey={key}
                type={type}
                opt={opt}
                name={name}
                fieldInit={init}
              />
          </div>
          );
      })}
      <button onClick={handleSearch}>查询</button>
    </div>
  )
};
```

###  API
| 参数      | 说明     | 类型      | 默认值  |
| --------- | -------- | --------- | ------- |
| fieldKey  | 字段key  | string    |     ''    |
| type      | 字段类型: 'input', 'select', 'rangePicker', 'datePicker', 'search', 'textArea', 'barcode', 'checkbox', 'treeSelect'  | string    |     'input'    |
| opt       | 字段配置: 如：'input'[详情](https://fusion.alibaba-inc.com/dsm/pc/components/detail/input?themeid=40463&tabActiveKey=component#Input)  | object    |    -     |
| name      | 字段名称  | string    |    -     |
| fieldInit | 字段初始化 | function  |    init     |
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
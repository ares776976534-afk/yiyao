---
title: Framework
sidebar_position: 1
---
## @alife/1688-chain-framework
组件功能描述
### Install
```tsx
$ npm i @alife/1688-chain-framework --save
```
### Usage
```tsx
import Framework from '@alife/1688-chain-framework';
```

## 示例

```tsx preview
import '@alife/theme-103433/variables.css';
import '@alife/theme-103433/dist/next.var.css';

import React from 'react';
import Framework from '@alife/1688-chain-framework';
import schema from '../dev/schema';

export default () => {
  const fetchQueryItem = (values) => {
    return new Promise((resolve) => {
      resolve([]);
    });
  };
  return <Framework schema={schema} listQueryFn={fetchQueryItem} searchFilterType='4' />;
};
```

### schema

```tsx
import colSchema from './colSchema';
import filterSchema from './filterSchema';

export default {
  colSchema,
  filterSchema,
  batchActionSchema: () => [],
};
```

### colSchema.jsx

```tsx
const PRODUCT_INFO = {
    title: '产品信息',
    dataIndex: 'productInfo',
    cell: (value, index, record) => value
};
const PRODUCT_ID = {
    title: '产品ID',
    dataIndex: 'productId',
    cell: (value, index, record) => value
};
const PRODUCT_NAME = {
    title: '产品名称',
    dataIndex: 'productName',
    cell: (value, index, record) => value
};

export default () => {
    return [PRODUCT_INFO, PRODUCT_ID, PRODUCT_NAME]
}
```

### filterSchema.jsx

```tsx
const PRODUCT_ID = {
    name: '权益',
    key: 'rightType',
    type: 'input',
  };
  const PRODUCT_NAME = {
    name: '权益名称',
    key: 'rightName',
    type: 'input',
  };

export default () => {
  return [PRODUCT_ID, PRODUCT_NAME]
}
```

### API

| 参数      | 说明    | 类型      | 默认值    |
| --------- | -------- | -------- | -------- |
| schema      | 列配置    | `object` | {filterSchema: () => [], colSchema: () => []} |
| listQueryFn      | 列表查询方法    | `function` | - |
| pageSize      | 每页显示条数    | `number` | 10 |
| tableChange      | 可选。给父组件传递tableChange事件    | `function` | () => { } |
| onActionComplete      | 可选。用于接收点击事件的回调，会有两个入参，一个是type代表当前点击事件的类型    | `function` | () => { } |
| getStatusFnOrStatusList      | 可选。用于接收tab项   | `array` | [{ name: '待提报商机', code: '1'},{ name: '我的提报', code: '2'}] |
｜statusReload      | 可选。用于配置StatusFilter组件，根据statusReload判断是否需要刷新所有的状态   | `boolean` | false |
| SlotOrShowStatusFilter      | 可选。支持传入slot或者boolean。布尔值表示是否需要默认状态栏，默认true   | `boolean` | true |
| SlotOrShowMsgBar      | 可选。支持传入slot或者boolean。布尔值表示是否需要默认信息栏，默认false   | `boolean` | false |
| ShowDataTable      | 可选。boolean。表示是否需要默认表单，默认true   | `boolean` | true |
| statusFilterType      | 可选。用于配置StatusFilter组件，type表示状态筛选的嵌套层级，shape支持 'pure,wrapped,text,capsule'   | `object` | { shape: 'pure', type: 1 } |
| statusFilterLabelMap      | 可选。用于配置StatusFilter组件，处理字段映射关系，默认是name,code,subStatusList,quantity。也可以在接口处理   | `object` | { name: 'name', code: 'code', subStatusList: 'subStatusList', quantity: 'quantity' } |
| searchFilterType      | 可选。用于配置SearchFilter组件样式，默认为'1', 内置了四套样式（1，2，3，4）   | `string` | '1' |
| tableStyle      | 可选   | `object` | {}' |
| tabStyle      | 可选   | `boolean` | false |
| searchChangeFn      | 可选。外部父组件可以在这里拿到改变search变量方法的回调   | `function` | () => { } |
| tableProps      | 可选   | `object` | {} |
| showSearchAction      | 可选  | `boolean` | true |
| statusFilterExtra      | 可选。表示是否需要默认查询，默认true  | `boolean`/`ReactNode` | true |
| pageSizeSelector      | 可选。用于配置分页pageSizeSelector，默认为'dropdown'  | `string` | 'dropdown' |
| otherAttributes      |  可选。用于配置Table的属性  | `object` | {} |
| showPagination      | 可选。表示是否需要默认分页  | `boolean` | 'true' |
| blockBorder      | 可选。表示是否需要默认边框  | `boolean` | true |
| otherPagination      | 可选。分页组件的属性  | `object` | {} |
| reloadTable      | 可选。用于刷新表格  | `function` | () => { } |
| searchInstance      | 可选。外部父组件可以在这里拿到改变search变量方法的回调  | `function` | () => { } |
| extraButtons      | 可选。筛选项右侧额外功能，默认空标签  | `ReactNode` |  |
| searchActionSlot      | 可选。表示是否需要样式，默认空标签  | `ReactNode` |  |

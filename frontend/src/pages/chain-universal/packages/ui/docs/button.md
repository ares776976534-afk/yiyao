---
title: Button（按钮）
sidebar_position: 2
---
### Install
```tsx
$ npm i @alife/1688-chain-ui --save
```
### Usage
```tsx
import { Button } from '@alife/1688-chain-ui';
```

## 示例

```tsx preview
import '@alifd/next/dist/next.css'
import { Button } from '@alife/1688-chain-ui';

const App = () => {
  const onClick = () => {
    console.log('click');
  }
  const style = {
    marginLeft: '12px',
    borderRadius: '6px',
    width: '62px',
  }
  return (
    <div>
       <Button
        style={style}
        onClick={onClick}
        type="normal:primary-ghost"
      >
        add
      </Button>
      <Button
        style={style}
        onClick={onClick}
        type="normal:primary-small"
      >
        add
      </Button>
    </div>
  )
}

export default App;
```

### API
| 参数      | 说明     | 类型      | 默认值  |
| --------- | -------- | --------- | ------- |
| type      | 可选值:'primary', 'secondary', 'normal', 'normal:primary-small', 'normal:primary-ghost'  |Enum    |    'normal:primary-ghost     |
| 同Fusion Button     | [详情](https://fusion.alibaba-inc.com/dsm/pc/components/detail/animate?themeid=null#demo-api)     | -    |    -     |

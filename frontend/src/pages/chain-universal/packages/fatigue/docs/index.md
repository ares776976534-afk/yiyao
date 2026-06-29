---
title: 简介
sidebar_position: 1
---

### Install
```tsx
$ npm i @alife/1688-chain-fatigue --save
```
### Usage
```tsx
import fatigue from '@alife/1688-chain-fatigue';
```

## 示例

```tsx preview
import { useState } from 'react';
import fatigue from '@alife/1688-chain-fatigue';

const App = () => {
  const [fatigueValue, setFatigueValue] = useState('');

  const handleSet = () => {
    fatigue.set('dev-test', {
      rule: '* * * * 5 * 3', // 年 月 日 时 分 秒 周 重复次数
    }, { mtop: false })
    .then((res) => {
      setFatigueValue(JSON.stringify(res))
    });
  }

  const handleGet = () => {
    fatigue.get('dev-test', { mtop: false })
    .then((res) => {
      setFatigueValue(JSON.stringify(res))
    });
  }

  const handleToggle = () => {
    fatigue.toggle('dev-test', {
      rule: '* * * * 5 * 3',
    }, { mtop: false })
    .then((res) => {
      setFatigueValue(JSON.stringify(res))
    });
  }
  
  return (
    <div>
      <button onClick={handleSet}>设置疲劳度</button>
      <button onClick={handleGet}>获取疲劳度</button>
      <button onClick={handleToggle}>自动设置疲劳度</button>
      <div>
        {
          fatigueValue
        }
      </div>
    </div>
  )
}

export default App;
```
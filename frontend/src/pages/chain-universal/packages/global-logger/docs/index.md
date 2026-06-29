---
title: 简介
sidebar_position: 1
---

### Install
```tsx
$ npm i @alife/1688-chain-global-logger --save
```
### Usage
```tsx
import globalLogger from '@alife/1688-chain-global-logger';
```

## 示例

```tsx preview
import { useState, useEffect } from 'react';
import globalLogger from '@alife/1688-chain-global-logger';

const App = () => {

  useEffect(() => {
    globalLogger.init('info')
  }, [])
  
  return (
   <div />
  )
}

export default App;
```
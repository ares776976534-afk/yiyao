---
title: Dialog（弹窗）
sidebar_position: 3
---
### Install
```tsx
$ npm i @alife/1688-chain-ui --save
```
### Usage
```tsx
import { Dialog } from '@alife/1688-chain-ui';
```

## 示例

### 基本用法

```tsx preview
import '@alifd/next/dist/next.css'
import { Dialog } from '@alife/1688-chain-ui';

const App = () => {
   // 增加弹窗
  const openTest = () => {
    Dialog.queuePush({
      title: '弹窗1',
      queue: {
        priority: 2, // 优先级
      },
      content: (p) => {
        return (
          <div>
            弹窗1的内容
          </div>
        )
      },
      onOk: () => {
        console.log('ok');
      },
      onCancel: () => {
        console.log('cancel');
      },
    })
    
    Dialog.queuePush({
      title: '弹窗2',
      queue: {
        priority: 1 // 优先级
      },
      content: (p) => {
        return (
          <div>
            弹窗2的内容
          </div>
        )
      },
      onOk: () => {
        console.log('ok');
      },
      onCancel: () => {
        console.log('cancel');
      },
    })
  }

  // 执行弹窗队列
  const openStart = () => {
    Dialog.queue.start();
  }

  return (
    <div>
      <button onClick={openTest}>增加弹窗</button>
      <button onClick={openStart}>执行弹窗</button>
    </div>
  )
}

export default App;
```

### 隐藏弹窗

```tsx preview
import '@alifd/next/dist/next.css'
import { Dialog } from '@alife/1688-chain-ui';

const App = () => {
   // 增加弹窗
  const openTest = () => {
    Dialog.queuePush({
      title: '弹窗1 - 这个弹窗不显示',
      queue: {
        priority: 2, // 优先级
        show: false, // 是否显示
      },
      content: (p) => {
        return (
          <div>
            弹窗1的内容
          </div>
        )
      },
      onOk: () => {
        console.log('ok');
      },
      onCancel: () => {
        console.log('cancel');
      },
    })
    
    Dialog.queuePush({
      title: '弹窗2',
      queue: {
        priority: 1 // 优先级
      },
      content: (p) => {
        return (
          <div>
            弹窗2的内容
          </div>
        )
      },
      onOk: () => {
        console.log('ok');
      },
      onCancel: () => {
        console.log('cancel');
      },
    })
  }

  // 执行弹窗队列
  const openStart = () => {
    Dialog.queue.start();
  }

  return (
    <div>
      <button onClick={openTest}>增加弹窗</button>
      <button onClick={openStart}>执行弹窗</button>
    </div>
  )
}

export default App;
```

### 暂停队列

```tsx preview
import '@alifd/next/dist/next.css'
import { Dialog } from '@alife/1688-chain-ui';

const App = () => {

  const openTest = () => {
    Dialog.queuePush({
      title: '弹窗1 - 继续',
      queue: {
        priority: 1,
      },
      onOk: () => {
        console.log('ok');
      },
      onCancel: () => {
        console.log('cancel');
      },
    })
    
    Dialog.queuePush({
      title: '弹窗2',
      queue: {
        priority: 3
      },
      content: (p) => {
        return <div>
        <button onClick={() => p.instance.hide()}>内部关闭</button>
        </div>
      },
      onOk: () => {
        console.log('ok');
      },
      onCancel: () => {
        console.log('cancel');
      },
    })

    Dialog.queuePush({
      title: '弹窗3 - 暂停',
      queue: {
        priority: 2,
      },
      onOk: () => {
      // 暂停
       Dialog.queue.pause();
       setTimeout(() => {
        // 3秒后继续
         Dialog.queue.start();
       }, 3000)
      },
      onCancel: () => {
        console.log('cancel');
      },
    })
  }

  const openStart = () => {
    Dialog.queue.start();
  }

  return (
    <div>
      <button onClick={openTest}>增加弹窗</button>
      <button onClick={openStart}>执行弹窗</button>
    </div>
  )
}

export default App;
```

### 疲劳度

```tsx preview
import '@alifd/next/dist/next.css'
import { Dialog } from '@alife/1688-chain-ui';

const App = () => {

  const openTest = () => {
    Dialog.queuePush({
      title: '疲劳度 - 5分钟内执行3次',
      queue: {
        priority: 2,
        fatigue: {
          key: 'ui2-dialog-dev-test',
          rule: '* * * * 5 * 3',
        }
      },
      onOk: () => {
        console.log('ok');
      },
      onCancel: () => {
        console.log('cancel');
      },
    })

    
  }

  const openStart = () => {
    Dialog.queue.start();
  }

  return (
    <div>
      <button onClick={openTest}>增加弹窗</button>
      <button onClick={openStart}>执行弹窗</button>
    </div>
  )
}

export default App;
```
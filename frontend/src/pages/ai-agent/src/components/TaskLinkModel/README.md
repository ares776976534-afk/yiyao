# TaskLinkModal 组件

任务链接卡片弹窗组件，用于提示用户将任务链接粘贴到PC浏览器查看运行结果。

## 功能特性

- ✅ 支持两种使用方式：受控组件 和 命令式调用
- ✅ 基于 antd-mobile 的 Popup 组件
- ✅ 支持点击遮罩关闭
- ✅ 自动禁止页面滚动
- ✅ 优雅的动画效果
- ✅ 自定义关闭按钮
- ✅ 可配置标题和按钮文案
- ✅ 点击按钮后可控制状态变化
- ✅ **默认导出命令式调用，使用更便捷**

## 使用方式

### 方式一：命令式调用（推荐 ⭐）

命令式调用是默认导出，使用最简单：

```tsx
import showTaskLinkModal from '@/pages/mobile-agent-home/components/TaskLinkCard';

// 最简单的用法
showTaskLinkModal();

// 自定义配置
showTaskLinkModal({
  title: '复制链接到浏览器访问',
  buttonText: '立即复制',
  titleAfterClick: '链接已复制成功！',
  onButtonClick: () => {
    console.log('按钮被点击');
  },
  onClose: () => {
    console.log('弹窗关闭');
  },
});
```

### 方式二：受控组件（用于需要状态管理的场景）

```tsx
import { useState } from 'react';
import { TaskLinkModal } from '@/pages/mobile-agent-home/components/TaskLinkCard';

const YourComponent = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button onClick={() => setVisible(true)}>
        打开弹窗
      </button>

      <TaskLinkModal
        visible={visible}
        onClose={() => setVisible(false)}
        title='自定义标题'
        buttonText='确认'
        onButtonClick={() => {
          console.log('按钮被点击');
        }}
      />
    </>
  );
};
```

## Props 说明

### 受控组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | - | 容器的 id 属性 |
| `visible` | `boolean` | `false` | 是否显示弹窗 |
| `onClose` | `() => void` | - | 关闭弹窗的回调函数 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭弹窗 |
| `title` | `string` | `'请在PC电脑端浏览器打开，查看运行结果或解锁完整功能'` | 弹窗标题文案 |
| `titleAfterClick` | `string` | - | 点击按钮后显示的标题文案 |
| `buttonText` | `string` | `'复制链接'` | 按钮文案 |
| `onButtonClick` | `() => void` | - | 按钮点击回调 |
| `hideButtonAfterClick` | `boolean` | `true` | 点击按钮后是否隐藏按钮 |

### 命令式调用 Options

所有受控组件的 Props（除了 `visible`）都可以作为命令式调用的配置项。

### Handler 对象方法

命令式调用返回一个 handler 对象，包含以下方法：

| 方法 | 说明 |
|------|------|
| `close()` | 手动关闭弹窗 |
| `update(options)` | 更新弹窗配置 |

## 示例

### 示例1：基本使用（命令式）

```tsx
import showTaskLinkModal from '@/pages/mobile-agent-home/components/TaskLinkCard';

// 使用默认配置打开
showTaskLinkModal();
```

### 示例2：自定义文案

```tsx
import showTaskLinkModal from '@/pages/mobile-agent-home/components/TaskLinkCard';

showTaskLinkModal({
  title: '请在PC浏览器中打开',
  titleAfterClick: '复制成功！\n请粘贴到浏览器访问',
  buttonText: '确认复制',
  onButtonClick: () => {
    // 执行复制操作
    navigator.clipboard.writeText(window.location.href);
  },
});
```

### 示例3：控制按钮点击后的行为

```tsx
import showTaskLinkModal from '@/pages/mobile-agent-home/components/TaskLinkCard';

showTaskLinkModal({
  title: '点击按钮复制链接',
  titleAfterClick: '链接已复制！',
  buttonText: '复制',
  hideButtonAfterClick: true, // 点击后隐藏按钮
  onButtonClick: async () => {
    await navigator.clipboard.writeText(window.location.href);
    console.log('复制成功');
  },
});
```

### 示例4：手动控制弹窗

```tsx
import { useRef } from 'react';
import showTaskLinkModal, { TypeTaskLinkModalHandler } from '@/pages/mobile-agent-home/components/TaskLinkCard';

const YourComponent = () => {
  const handlerRef = useRef<TypeTaskLinkModalHandler | null>(null);

  const handleShow = () => {
    handlerRef.current = showTaskLinkModal({
      onClose: () => {
        handlerRef.current = null;
      },
    });
  };

  const handleClose = () => {
    if (handlerRef.current) {
      handlerRef.current.close();
    }
  };

  return (
    <>
      <button onClick={handleShow}>打开</button>
      <button onClick={handleClose}>关闭</button>
    </>
  );
};
```

### 示例5：使用受控组件

```tsx
import { useState } from 'react';
import { TaskLinkModal } from '@/pages/mobile-agent-home/components/TaskLinkCard';

const YourComponent = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button onClick={() => setVisible(true)}>打开弹窗</button>
      
      <TaskLinkModal
        visible={visible}
        onClose={() => setVisible(false)}
        title='自定义标题'
        buttonText='确认'
        onButtonClick={() => {
          console.log('按钮被点击');
        }}
      />
    </>
  );
};
```

## 导出说明

组件提供以下导出：

```tsx
// 默认导出：命令式调用函数（推荐使用）
import showTaskLinkModal from '@/pages/mobile-agent-home/components/TaskLinkCard';

// 按需导入：组件本身
import { TaskLinkModal } from '@/pages/mobile-agent-home/components/TaskLinkCard';

// 按需导入：命令式调用函数
import { showTaskLinkModal } from '@/pages/mobile-agent-home/components/TaskLinkCard';

// 按需导入：TypeScript 类型
import type { 
  TypeTaskLinkModalProps,
  TypeTaskLinkModalHandler 
} from '@/pages/mobile-agent-home/components/TaskLinkCard';
```

## 注意事项

1. **命令式调用会创建新的 DOM 节点**：每次调用 `showTaskLinkModal()` 都会创建一个新的容器元素，关闭时会自动清理。

2. **避免重复打开**：如果需要保持单例模式（同时只显示一个弹窗），建议使用 `useRef` 保存 handler 引用，打开前先检查并关闭已存在的弹窗。

3. **内存管理**：命令式调用会在弹窗关闭后自动清理，但建议在组件卸载时手动调用 `handler.close()`。

4. **状态重置**：弹窗关闭后会自动重置内部状态（如按钮点击状态），下次打开时会恢复初始状态。

5. **文案换行**：title 支持 `\n` 换行符，会自动处理为多行显示。

## 更多示例

查看完整的使用示例：`/test/TaskLinkCardExample.tsx`

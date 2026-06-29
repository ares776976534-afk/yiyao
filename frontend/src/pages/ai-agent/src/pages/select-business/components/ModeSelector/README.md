# ModeSelector - 模式选择器组件

## 组件描述

模式选择器组件用于切换搜索模式，基于 Ant Design 的 Dropdown 组件实现。支持三种模式：智能模式、以品找商、直搜商家。

## 功能特性

- ✅ 基于 Ant Design Dropdown 组件
- ✅ 三种搜索模式切换
- ✅ 自定义下拉菜单样式
- ✅ 支持受控模式
- ✅ 完全 TypeScript 支持
- ✅ 按钮展开/收起动画效果
- ✅ 选中状态高亮显示

## 使用方法

### 基础使用

```tsx
import ModeSelector from '@/pages/select-product/select-business/components/ModeSelector';

function App() {
  return <ModeSelector />;
}
```

### 受控模式

```tsx
import { useState } from 'react';
import ModeSelector from '@/pages/select-product/select-business/components/ModeSelector';
import { EnumSearchMode } from '@/pages/select-product/select-business/enum';

function App() {
  const [mode, setMode] = useState(EnumSearchMode.SMART);

  return (
    <ModeSelector
      value={mode}
      onChange={(newMode) => {
        console.log('模式切换为:', newMode);
        setMode(newMode);
      }}
    />
  );
}
```

### 禁用状态

```tsx
<ModeSelector disabled />
```

## API

### TypeModeSelectorProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 当前选中的模式 | `EnumSearchMode` | `EnumSearchMode.SMART` |
| onChange | 模式切换回调 | `(mode: EnumSearchMode) => void` | - |
| disabled | 是否禁用 | `boolean` | `false` |

### EnumSearchMode

搜索模式枚举：

```typescript
enum EnumSearchMode {
  // 智能模式
  SMART = 'AUTO',
  // 以品找商
  PRODUCT_TO_SUPPLIER = 'SEARCH_PROVIDER',
  // 找商
  DIRECT_SUPPLIER = 'SEARCH_OFFER',
}
```

### TypeModeConfig

模式配置类型：

```typescript
interface TypeModeConfig {
  key: EnumSearchMode;  // 模式标识
  icon: string;         // 图标URL
  title: string;        // 标题
  description: string;  // 描述
  hasArrow?: boolean;   // 是否显示箭头
}
```

## 样式定制

组件使用 CSS Modules，可以通过覆盖以下类名进行样式定制：

- `.modeButton`: 按钮样式
- `.dropdownMenu`: 下拉菜单容器样式
- `.modeItem`: 模式选项样式
- `.selected`: 选中状态样式

## 交互说明

1. **按钮点击**: 点击按钮展开/收起下拉菜单
2. **模式选择**: 点击下拉菜单中的选项切换模式
3. **自动收起**: 选择模式后自动收起下拉菜单
4. **展开动画**: 按钮右侧箭头图标在展开时旋转180度
5. **选中高亮**: 当前选中的模式在下拉菜单中高亮显示

## 模式说明

### 智能模式 (SMART)
- 图标: 带有智能标识的图标
- 特点: 下拉菜单中显示箭头图标
- 描述: 智能搜索模式

### 以品找商 (PRODUCT_TO_SUPPLIER)
- 图标: 商品相关图标
- 特点: 根据商品查找供应商
- 描述: 商品到供应商的搜索模式

### 直搜商家 (DIRECT_SUPPLIER)
- 图标: 商家相关图标
- 特点: 直接搜索商家
- 描述: 直接搜索供应商模式

## 注意事项

1. 组件依赖 antd 的 Dropdown 组件，请确保已安装 antd
2. 需要安装 classnames 库用于类名拼接
3. 图标资源来自阿里CDN，请确保网络可访问
4. 下拉菜单宽度固定为280px
5. 按钮最小宽度为118px，高度为36px

## 示例

完整示例请参考：`/test/ModeSelectorExample.tsx`


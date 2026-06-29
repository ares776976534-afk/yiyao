# Studio Canvas 组件完整文档

## 概述
基于 Konva.js 的完整画布组件，提供图形编辑、图层管理、缩放移动、历史记录、序列化、导入导出等功能。

## 架构设计
- **core.tsx**: 核心画布组件，负责渲染逻辑、事件处理、序列化、导入导出API、历史记录管理
- **index.tsx**: 增强画布组件，负责状态管理、工具栏集成、API转发
- **外部组件**: 自定义UI界面，调用画布API

## 核心功能
- 画布操作：缩放、移动、抓手工具、背景网格
- 工具栏：工具切换、撤销重做、缩放控制、导入导出
- 图层管理：选择、复制、删除、置顶置底、属性编辑
- 定位功能：定位到指定元素，支持动画过渡
- 序列化：JSON格式保存恢复画布状态
- 导入导出：文件操作和程序化调用
- 历史记录：完整的撤销重做系统，由画布内部管理

## API接口

### CanvasRef (core.tsx)
```typescript
interface CanvasRef {
  // 基础功能
  locate: (target: string | string[] | 'all' | 'selected', options?: LocateOptions) => void;
  zoomToFit: () => void;
  stage: () => Konva.Stage | null | undefined;
  
  // 序列化
  toJSON: () => CanvasJSON;
  fromJSON: (json: CanvasJSON) => void;
  
  // 导入导出
  exportCanvas: () => { success: boolean; data?: CanvasJSON; error?: string };
  importCanvas: (json?: any) => Promise<any>;
  
  // 历史记录管理（新增）
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
```

### EnhancedCanvasRef (index.tsx)
```typescript
interface EnhancedCanvasRef {
  toJSON: () => CanvasJSON;
  fromJSON: (json: CanvasJSON) => void;
  // 导入导出API - 直接调用core.tsx中的方法
  exportCanvas: () => { success: boolean; data?: CanvasJSON; error?: string };
  importCanvas: (json?: any) => Promise<any>;
  // 历史记录管理API - 直接调用core.tsx中的方法
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToHistory: (elements: TypeLayer[]) => void;
  clearHistory: () => void;
}
```

## 历史记录功能

### 配置选项
```typescript
interface CanvasProps {
  // ... 其他属性
  enableHistory?: boolean;      // 是否启用历史记录，默认true
  maxHistorySize?: number;      // 最大历史记录数量，默认50
}
```

### 历史记录API使用
```typescript
const canvasRef = useRef<CanvasRef>(null);

// 撤销操作
const handleUndo = () => {
  const result = canvasRef.current?.undo();
  if (result) {
    console.log('撤销成功');
  } else {
    console.log('无法撤销');
  }
};

// 重做操作
const handleRedo = () => {
  const result = canvasRef.current?.redo();
  if (result) {
    console.log('重做成功');
  } else {
    console.log('无法重做');
  }
};

// 检查是否可以撤销/重做
const canUndo = canvasRef.current?.canUndo() || false;
const canRedo = canvasRef.current?.canRedo() || false;

// 清除历史记录
canvasRef.current?.clearHistory();
```

### 自动历史记录
画布会自动记录以下操作：
- 元素拖拽结束
- 元素属性变化
- 元素添加/删除
- 元素可见性变化
- 元素层级变化

### 快捷键支持
- `ctrl+Z` / `cmd+Z`: 撤销
- `ctrl+Alt+Z` / `cmd+Option+Z`: 重做

## 键盘快捷键

Canvas 组件支持以下键盘快捷键：

### 基础操作
- **ctrl + Z**: 撤销操作
- **ctrl + Alt + Z**: 重做操作
- **Delete (Windows) / Backspace (Mac)**: 删除选中的元素（需要先选中元素）
- **Space**: 切换抓手工具（在抓手工具和选择工具之间切换）

### 工具切换
- **H**: 切换到抓手工具
- **V**: 切换到选择工具

### 注意事项
- 删除快捷键功能只在有元素被选中时生效
- Windows 系统使用 Delete 键，Mac 系统使用 Backspace 键
- 删除操作会自动记录到历史记录中，支持撤销/重做
- 删除元素后，选中状态会自动清空（选择框消失）
- 键盘事件是全局监听的，不需要画布获得焦点

## 使用方法

### 基础使用
```tsx
import CanvasDemo from '@/components/studio-canvas/CanvasDemo';
<CanvasDemo />
```

### 高级使用（带历史记录）
```tsx
import Canvas, { CanvasRef } from '@/components/studio-canvas';

const canvasRef = useRef<CanvasRef>(null);

<Canvas
  ref={canvasRef}
  width={800}
  height={600}
  elements={elements}
  onElementsChange={setElements}
  enableHistory={true}
  maxHistorySize={100}
/>

// 历史记录操作
canvasRef.current?.undo();
canvasRef.current?.redo();
```

### 增强画布使用（带历史记录）
```tsx
import EnhancedCanvas, { EnhancedCanvasRef } from '@/components/studio-canvas';

const enhancedCanvasRef = useRef<EnhancedCanvasRef>(null);

<EnhancedCanvas
  ref={enhancedCanvasRef}
  width={800}
  height={600}
  elements={elements}
  onElementsChange={setElements}
/>

// 历史记录操作
enhancedCanvasRef.current?.undo();
enhancedCanvasRef.current?.redo();
```

## 操作指南

### 画布操作
- 缩放：鼠标滚轮或工具栏按钮
- 移动：抓手工具拖拽或空格键临时抓手
- 滚轮移动：鼠标滚轮移动画布
- 精确移动：shift + 滚轮

### 图层操作
- 选择：点击图层或图层面板
- 移动：拖拽图层改变位置
- 调整：选中后拖拽变换框
- 管理：右键菜单操作
- 定位：双击图层面板中的图层项目

### 历史记录操作
- 撤销：ctrl+Z 或工具栏撤销按钮
- 重做：ctrl+Alt+Z 或工具栏重做按钮
- 自动记录：所有元素操作自动记录
- 历史信息：查看当前历史状态

## 配置选项

### CanvasProps
```typescript
interface CanvasProps {
  width?: number;
  height?: number;
  elements?: TypeLayer[];
  onElementsChange?: (elements: TypeLayer[]) => void;
  onElementSelect?: (elementId: string | null) => void;
  enableHistory?: boolean;
  maxHistorySize?: number;
}
```

### 默认配置
- 画布尺寸：800x600
- 缩放范围：10% - 500%
- 网格大小：20px
- 大网格大小：100px
- 历史记录：启用，最大50条

## 测试组件
- **CanvasDemo**: 完整功能演示
- **CanvasCoreAPITest**: API功能测试
- **CanvasSerializationTest**: 序列化功能测试
- **CanvasHistoryTest**: 历史记录功能测试（新增）

## 重构优势
1. **消除代码重复**: 导入导出逻辑只在一个地方实现
2. **职责清晰**: core.tsx专注核心功能，index.tsx专注组件封装
3. **易于维护**: 修改逻辑只需要改一个地方
4. **功能一致性**: 避免重复实现可能导致的功能差异
5. **架构清晰**: 代码结构更加合理，易于理解和维护
6. **历史记录内聚**: 历史记录管理完全由画布内部处理，外部只需调用API

## 注意事项
- 确保 Konva.js 依赖正确安装
- 大量元素时注意性能优化
- API调用时机：确保画布组件完全加载后再调用
- 文件格式：导入文件必须是有效的JSON格式
- 状态同步：导入后需要手动更新外部状态
- 错误处理：始终检查API返回的success状态
- 历史记录：启用历史记录会增加内存使用，可通过maxHistorySize控制

## 扩展功能
- 更多图层类型（圆形、线条、路径等）
- 颜色选择器和属性面板
- 导入/导出更多格式支持
- 更多键盘快捷键
- 触摸设备手势支持
- 数据压缩和加密功能
- 增量序列化支持
- 序列化模板支持
- 历史记录压缩和优化
- 历史记录导出/导入

## 总结
Studio Canvas 组件通过分层架构设计，实现了核心功能完整、序列化功能强大、导入导出灵活、历史记录完善、API设计统一、架构清晰、易于扩展、测试覆盖完整等特性。该组件可以满足各种画布编辑需求，支持完整的画布数据迁移和历史记录管理，为后续的功能扩展奠定了良好的基础。

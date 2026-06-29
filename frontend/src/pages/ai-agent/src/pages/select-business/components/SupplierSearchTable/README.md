# SupplierSearchTable - 找商表格组件

## 组件描述

找商表格组件用于展示供应商搜索结果的对比信息，基于 Ant Design 的 Table 组件实现，提供了丰富的供应商信息展示功能，包括推荐商品列表。

## 功能特性

- ✅ 基于 Ant Design Table 组件
- ✅ 支持供应商信息、AI总览、用户需求解析、主营类目等多维度展示
- ✅ 支持横向滚动和固定列
- ✅ 支持分页、加载状态
- ✅ 支持行点击事件
- ✅ 支持推荐商品点击事件
- ✅ 完全 TypeScript 支持
- ✅ 响应式设计

## 使用方法

### 基础使用

```tsx
import SupplierSearchTable from '@/components/SupplierSearchTable';
import { mockSupplierData } from '@/components/SupplierSearchTable/mock';

function App() {
  return (
    <SupplierSearchTable
      dataSource={mockSupplierData}
    />
  );
}
```

### 带分页

```tsx
<SupplierSearchTable
  dataSource={mockSupplierData}
  pagination={{
    pageSize: 10,
    showTotal: (total) => `共 ${total} 条`,
  }}
/>
```

### 处理行点击和商品点击

```tsx
<SupplierSearchTable
  dataSource={mockSupplierData}
  onRowClick={(record) => {
    console.log('点击了供应商:', record);
  }}
  onProductClick={(product, supplier) => {
    console.log('点击了商品:', product, '所属供应商:', supplier);
  }}
/>
```

### 加载状态

```tsx
<SupplierSearchTable
  dataSource={[]}
  loading
/>
```

## API

### TypeSupplierSearchTableProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dataSource | 数据源 | `TypeSupplierData[]` | `[]` |
| loading | 是否加载中 | `boolean` | `false` |
| pagination | 分页配置，同 antd Table | `boolean \| object` | `false` |
| onRowClick | 行点击事件 | `(record: TypeSupplierData) => void` | - |
| onProductClick | 推荐商品点击事件 | `(product: TypeRecommendedProduct, supplier: TypeSupplierData) => void` | - |

### TypeSupplierData

供应商数据类型定义，包含以下字段：

```typescript
interface TypeSupplierData {
  id: string;                           // 供应商ID
  companyName: string;                  // 公司名称
  supplierTags: TypeSupplierTag[];      // 供应商标签（徽章、工厂、特性）
  aiSummary: string[];                  // AI总结
  demandAnalysis: TypeDemandItem[];     // 需求解析
  mainCategory: string;                 // 主营类目
  merchantService: TypeMerchantServiceMetrics; // 商家服务指标
  recommendedProducts: TypeRecommendedProduct[]; // 推荐商品列表
}
```

### TypeSupplierTag

供应商标签类型定义：

```typescript
interface TypeSupplierTag {
  type: 'badge' | 'factory' | 'feature'; // 标签类型：徽章、工厂、特性
  text?: string;                         // 标签文本
  imageUrl?: string;                     // 标签图片URL
}
```

### TypeRecommendedProduct

推荐商品类型定义：

```typescript
interface TypeRecommendedProduct {
  id: string;        // 商品ID
  image: string;     // 商品图片
  title: string;     // 商品标题
  price: string;     // 商品价格
}
```

## 表格列说明

1. **供应商信息**: 展示公司名称、认证徽章、源头工厂标签和特性标签
2. **AI总览**: 展示AI生成的差异点总结
3. **用户需求解析&满足情况**: 展示用户需求的解析和匹配情况（带图标）
4. **主营类目**: 展示供应商的主营产品类别
5. **商家服务**: 展示8个商家服务指标（2行4列布局）
6. **推荐商品**: 展示3个推荐商品卡片（图片、标题、价格）

## 样式定制

组件使用 CSS Modules，可以通过覆盖以下类名进行样式定制：

- `.supplierSearchTable`: 表格容器
- `.supplierInfo`: 供应商信息列样式
- `.aiSummary`: AI总览列样式
- `.demandAnalysis`: 用户需求解析列样式
- `.mainCategory`: 主营类目列样式
- `.merchantService`: 商家服务列样式
- `.recommendedProducts`: 推荐商品列样式

## 与其他表格组件的区别

- **ImageSearchTable（仅图搜表格）**: 展示单个商品的详细信息对比
- **ProductSearchTable（以品找商表格）**: 展示商品搜索结果，包含需求解析列
- **SupplierSearchTable（找商表格）**: 展示供应商信息，包含主营类目和推荐商品列

本组件主要用于供应商维度的对比，而不是单个商品对比，同时提供了推荐商品的快速查看功能。

## 注意事项

1. 表格宽度为1652px，建议在宽屏环境下使用或配置横向滚动
2. 左侧供应商信息列已设置为固定列，滚动时不会隐藏
3. 推荐商品支持独立点击事件，不会触发行点击事件
4. 图片资源请确保CDN地址可访问
5. 建议配合分页使用，避免一次性加载过多数据

## 示例

完整示例请参考：`/test/SupplierSearchTableExample.tsx`


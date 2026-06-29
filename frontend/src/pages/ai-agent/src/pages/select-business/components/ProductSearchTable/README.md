# ProductSearchTable - 以品找商表格组件

## 组件描述

以品找商表格组件用于展示基于商品搜索的结果对比信息，基于 Ant Design 的 Table 组件实现，提供了丰富的商品信息展示功能，包括用户需求解析和满足情况。

## 功能特性

- ✅ 基于 Ant Design Table 组件
- ✅ 支持商品信息、供应商信息、AI总览、用户需求解析等多维度展示
- ✅ 支持横向滚动和固定列
- ✅ 支持分页、加载状态
- ✅ 支持行点击事件
- ✅ 完全 TypeScript 支持
- ✅ 响应式设计

## 使用方法

### 基础使用

```tsx
import ProductSearchTable from '@/components/ProductSearchTable';
import { mockProductData } from '@/components/ProductSearchTable/mock';

function App() {
  return (
    <ProductSearchTable
      dataSource={mockProductData}
    />
  );
}
```

### 带分页

```tsx
<ProductSearchTable
  dataSource={mockProductData}
  pagination={{
    pageSize: 10,
    showTotal: (total) => `共 ${total} 条`,
  }}
/>
```

### 处理行点击

```tsx
<ProductSearchTable
  dataSource={mockProductData}
  onRowClick={(record) => {
    console.log('点击了商品:', record);
  }}
/>
```

### 加载状态

```tsx
<ProductSearchTable
  dataSource={[]}
  loading
/>
```

## API

### TypeProductSearchTableProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dataSource | 数据源 | `TypeProductData[]` | `[]` |
| loading | 是否加载中 | `boolean` | `false` |
| pagination | 分页配置，同 antd Table | `boolean \| object` | `false` |
| onRowClick | 行点击事件 | `(record: TypeProductData) => void` | - |

### TypeProductData

商品数据类型定义，包含以下字段：

```typescript
interface TypeProductData {
  id: string;                    // 商品ID
  rank: number;                  // 排名
  productImage: string;          // 商品图片
  productTitle: string;          // 商品标题
  productPrice: string;          // 商品价格
  supplierName: string;          // 供应商名称
  supplierTags: TypeSupplierTag[]; // 供应商标签
  aiSummary: string[];           // AI总结
  demandAnalysis: TypeDemandItem[]; // 需求解析
  sales: {                       // 销量信息
    salesVolume: number;
    orderCount: string;
    buyerCount: string;
  };
  coreAttributes: Record<string, string>; // 核心属性
  purchaseInfo: {                // 采购信息
    minOrderQuantity: string;
    service: string;
  };
  deliveryInfo: {                // 发货履约
    fulfillmentRate: string;
    pickupRate: string;
    location: string;
  };
  merchantService: {             // 商家服务
    qualityRefundRate: string;
    customerServiceResponseRate: string;
    repeatPurchaseRate90Days: string;
    comprehensiveServiceScore: string;
    orders180Days: string;
    buyers180Days: string;
    totalProducts: string;
    newProducts30Days: string;
  };
}
```

### TypeDemandItem

需求项类型定义：

```typescript
interface TypeDemandItem {
  icon: string;        // 需求图标URL
  text: string;        // 需求文本
  satisfied: boolean;  // 是否满足需求
}
```

## 表格列说明

1. **商品信息**: 展示商品图片、排名、标题和价格
2. **供应商信息**: 展示供应商名称和标签（徽章、源头工厂等）
3. **AI总览**: 展示AI生成的差异点总结
4. **用户需求解析&满足情况**: 展示用户需求的解析和匹配情况（带图标）
5. **近30天销量**: 展示销量、订单数、买家数
6. **核心属性**: 展示商品的核心属性键值对
7. **采购信息**: 展示起批量和服务信息
8. **发货履约**: 展示发货履约率、揽收率和发货地
9. **商家服务**: 展示多个商家服务指标

## 样式定制

组件使用 CSS Modules，可以通过覆盖以下类名进行样式定制：

- `.productSearchTable`: 表格容器
- `.productInfo`: 商品信息列样式
- `.supplierInfo`: 供应商信息列样式
- `.aiSummary`: AI总览列样式
- `.demandAnalysis`: 用户需求解析列样式
- `.salesInfo`: 销量信息列样式
- `.merchantService`: 商家服务列样式

## 与 ImageSearchTable 的区别

相比于"仅图搜表格"组件，本组件增加了"用户需求解析&满足情况"列，用于展示用户需求的解析和匹配情况，每个需求项包含图标和文本。

## 注意事项

1. 表格宽度较大（2335px），建议在宽屏环境下使用或配置横向滚动
2. 左侧商品信息列已设置为固定列，滚动时不会隐藏
3. 图片资源请确保CDN地址可访问
4. 建议配合分页使用，避免一次性加载过多数据

## 示例

完整示例请参考：`/test/ProductSearchTableExample.tsx`


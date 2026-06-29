/**
 * 仅图搜表格 - 类型定义
 */
 import { TablePaginationConfig } from 'antd/es/table';
// 供应商标签类型
export interface TypeSupplierTag {
  type: 'badge' | 'factory';
  text?: string;
  imageUrl?: string;
}

// 商品数据类型
export interface TypeProductData {
  id: string;
  rank: number;
  productImage: string;
  productTitle: string;
  productPrice: string;
  supplierName: string;
  supplierTags: TypeSupplierTag[];
  aiSummary: string[];
  sales: {
    salesVolume: number;
    orderCount: string;
    buyerCount: string;
  };
  coreAttributes: Record<string, string>;
  purchaseInfo: {
    minOrderQuantity: string;
    service: string;
  };
  deliveryInfo: {
    fulfillmentRate: string;
    pickupRate: string;
    location: string;
  };
  merchantService: {
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

// 表格组件属性类型
export interface TypeImageSearchTableProps {
  dataSource?: TypeProductData[];
  loading?: boolean;
  pagination?: false | TablePaginationConfig;
  onRowClick?: (record: TypeProductData) => void;
}


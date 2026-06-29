import { TablePaginationConfig } from 'antd/es/table';
import { EnumTagStyle } from '../../enum';
/**
 * 以品找商表格 - 类型定义
 */

// ==================== 旧版类型定义（保留用于对照） ====================

// 供应商标签类型（旧版）
export interface TypeSupplierTagOld {
  type: 'badge' | 'factory';
  text?: string;
  imageUrl?: string;
}

// 需求项类型（旧版）
export interface TypeDemandItemOld {
  icon: string;
  text: string;
  satisfied: boolean;
}

// 商品数据类型（旧版）
export interface TypeProductDataOld {
  id: string;
  rank: number;
  productImage: string;
  productTitle: string;
  productPrice: string;
  supplierName: string;
  supplierTags: TypeSupplierTagOld[];
  aiSummary: string[];
  demandAnalysis: TypeDemandItemOld[];
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

// ==================== 新版类型定义（基于新数据结构） ====================

// 供应商标签类型
export interface TypeProviderTag {
  tagName: string;
  tagStyle: EnumTagStyle | string;
}

// 供应商信息类型
export interface TypeProviderInfo {
  companyName: string;
  factoryUrl: string;
  providerTags: TypeProviderTag[];
  isLowRespRate?: boolean;
  userId?: string;
  memberId?: string;
}

// 通用标签-值对类型
export interface TypeLabelValue {
  label: string;
  value: string;
}

// 核心属性类型
export interface TypeCoreAttribute {
  label: string;
  value: string;
}

// 满足需求项类型
export interface TypeSatisfyRequirement {
  indicatorContent: string;
  isSatisfy: boolean;
  requirement: string;
}

// 商品数据类型（新版）
export interface TypeProductData {
  aiAttentions?: string[];
  coreAttributes?: TypeCoreAttribute[];
  imageUrl?: string;
  itemId?: string;
  itemPrice?: string;
  offerDetailUrl?: string;
  providerInfo?: TypeProviderInfo;
  providerServices?: TypeLabelValue[];
  purchaseInfos?: TypeLabelValue[];
  salesInfos?: TypeLabelValue[];
  satisfyRequirements?: TypeSatisfyRequirement[];
  shipInfos?: TypeLabelValue[];
  title?: string;
  providerKjCustomTags?: string[];
}

// 表格组件属性类型
export interface TypeProductSearchTableProps {
  isReplay?: boolean;
  rawData?: {
    offerInfo: {
      offerList: TypeProductData[];
      aiRequirementAnalysis?: {
        fullSatisfy?: number;
        isDisplay?: boolean;
        partSatisfy?: number;
        requirements?: string[];
        total?: number;
      };
    };
  };

  loading?: boolean;
  pagination?: false | TablePaginationConfig;
  onRowClick?: (record: TypeProductData) => void;
}


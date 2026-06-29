import { TablePaginationConfig } from 'antd/es/table';
import { EnumTagStyle } from '../../enum';

/**
 * 找商表格 - 类型定义
 */

// ==================== 旧版类型定义（保留用于对照） ====================

// 供应商标签类型（旧版）
export interface TypeSupplierTagOld {
  type: 'badge' | 'factory' | 'feature';
  text?: string;
  imageUrl?: string;
}

// 需求项类型（旧版）
export interface TypeDemandItemOld {
  icon: string;
  text: string;
  satisfied: boolean;
}

// 推荐商品类型（旧版）
export interface TypeRecommendedProductOld {
  id: string;
  image: string;
  title: string;
  price: string;
}

// 商家服务指标类型（旧版）
export interface TypeMerchantServiceMetricsOld {
  qualityRefundRate: string;
  customerServiceResponseRate: string;
  repeatPurchaseRate90Days: string;
  comprehensiveServiceScore: string;
  orders180Days: string;
  buyers180Days: string;
  totalProducts: string;
  newProducts30Days: string;
}

// 供应商数据类型（旧版）
export interface TypeSupplierDataOld {
  id: string;
  companyName: string;
  supplierTags: TypeSupplierTagOld[];
  aiSummary: string[];
  demandAnalysis: TypeDemandItemOld[];
  mainCategory: string;
  merchantService: TypeMerchantServiceMetricsOld;
  recommendedProducts: TypeRecommendedProductOld[];
}

// ==================== 新版类型定义（基于新数据结构） ====================


// 供应商标签类型
export interface TypeProviderTag {
  tagName: string;
  tagStyle: EnumTagStyle | string;
}

// 通用标签-值对类型
export interface TypeLabelValue {
  label: string;
  value: string;
}

// 满足需求项类型
export interface TypeSatisfyRequirement {
  indicatorContent: string;
  isSatisfy: boolean;
  requirement: string;
}

// 推荐商品类型
export interface TypeRecommendedItem {
  imageUrl: string;
  itemId: string;
  itemPrice: string;
  offerDetailUrl: string;
  title: string;
}

// 供应商数据类型（新版）
export interface TypeSupplierData {
  aiAttentions?: string[];
  companyName?: string;
  factoryUrl?: string;
  loginId?: string;
  mainCategoryName?: string;
  memberId?: string;
  providerServices?: TypeLabelValue[];
  providerTags?: TypeProviderTag[];
  recommendItems?: TypeRecommendedItem[];
  satisfyRequirements?: TypeSatisfyRequirement[];
  providerKjCustomTags?: string[];
  isLowRespRate?: string;
}

// 表格组件属性类型
export interface TypeSupplierSearchTableProps {
  // dataSource?: TypeSupplierData[];
  rawData?: {
    providerInfo: {
      aiRequirementAnalysis?: {
        fullSatisfy?: number;
        isDisplay?: boolean;
        partSatisfy?: number;
        requirements?: string[];
        total?: number;
      };
      providerList: TypeSupplierData[];
    };
  };
  loading?: boolean;
  pagination?: false | TablePaginationConfig;
  onRowClick?: (record: TypeSupplierData) => void;
  onProductClick?: (product: TypeRecommendedItem, supplier: TypeSupplierData) => void;
  isReplay?: boolean;
}


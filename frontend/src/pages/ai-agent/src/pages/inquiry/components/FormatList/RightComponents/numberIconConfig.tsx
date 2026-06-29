import React from 'react';
import { Number1Icon, Number2Icon, Number3Icon, Number4Icon, Number5Icon } from '@/components/Icon';

// 数字图标映射
export const numberIconMap: Record<number, React.ComponentType<any>> = {
  1: Number1Icon,
  2: Number2Icon,
  3: Number3Icon,
  4: Number4Icon,
  5: Number5Icon,
};

// 根据数字获取对应的图标组件
export const getNumberIcon = (number: number): React.ComponentType<any> => {
  return numberIconMap[number] || Number1Icon;
};

// 默认情况下的数字映射（当没有OfferAndSupplierList时）
export const defaultNumberMapping = {
  itemInfo: 1,           // 商品信息
  supplierInfo: 2,       // 选择供应商
  inquiryQuestions: 3,   // 选择询盘问题
  basicInfo: 4,          // 基本信息
  autoOrderSettings: 5,   // 设置自动下单条件
};

// 有OfferAndSupplierList时的数字映射
export const offerAndSupplierListNumberMapping = {
  offerAndSupplierList: 1,  // 询盘商品与供应商
  inquiryQuestions: 2,      // 选择询盘问题
  basicInfo: 3,             // 基本信息
  autoOrderSettings: 4,      // 设置自动下单条件
};


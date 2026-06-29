/**
 * 仅图搜表格 - 模拟数据
 */

import type { TypeProductData } from './types';

// 生成模拟数据
export const mockProductData: TypeProductData[] = Array.from({ length: 8 }, (_, index) => ({
  id: `product-${index + 1}`,
  rank: index + 1,
  productImage: 'https://img.alicdn.com/imgextra/i2/6000000007436/O1CN01dm4xjB24nkFH7J9IG_!!6000000007436-2-gg_dtc.png',
  productTitle: '适用苹果17手机壳磁吸15promax透明14批发13防摔12不发黄iphone16不发黄iphone16',
  productPrice: '¥2.00',
  supplierName: '广州雅露雅化妆品有限公司',
  supplierTags: [
    {
      type: 'badge',
      imageUrl: 'https://img.alicdn.com/imgextra/i2/6000000003509/O1CN01D8qogd1bnAtXk2AhQ_!!6000000003509-2-gg_dtc.png',
    },
    {
      type: 'factory',
      text: '源头工厂',
    },
  ],
  aiSummary: [
    'AI总结差异点',
    'AI总结差异点',
    'AI总结差异点',
  ],
  sales: {
    salesVolume: 5000,
    orderCount: '1400+笔',
    buyerCount: '200+个',
  },
  coreAttributes: {
    XXX: 'XXXXXXXXX',
    YYY: 'YYYYYYYYY',
  },
  purchaseInfo: {
    minOrderQuantity: '3件起批',
    service: '先采后付',
  },
  deliveryInfo: {
    fulfillmentRate: '48%',
    pickupRate: '48%',
    location: '广东东莞',
  },
  merchantService: {
    qualityRefundRate: '10%',
    customerServiceResponseRate: '10%',
    repeatPurchaseRate90Days: '10%',
    comprehensiveServiceScore: '10%',
    orders180Days: '10%',
    buyers180Days: '10%',
    totalProducts: '10%',
    newProducts30Days: '10%',
  },
}));


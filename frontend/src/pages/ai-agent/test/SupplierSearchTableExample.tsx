import React from 'react';
import SupplierSearchTable from '../src/pages/mobile-select-business/components/SupplierSearchTable';
import Title from '../src/pages/mobile-select-business/components/Title';
import type { TypeSupplierSearchTableProps } from '../src/pages/select-business/components/SupplierSearchTable/types';

const SupplierSearchTableExample: React.FC = () => {
  const mockData: TypeSupplierSearchTableProps = {
    rawData: {
      providerInfo: {
        aiRequirementAnalysis: {
          fullSatisfy: 16,
          partSatisfy: 4,
          total: 20,
          isDisplay: true,
          requirements: ['材质要求', '认证要求', '价格区间'],
        },
        providerList: [
          {
            memberId: '1',
            companyName: '永康市典威工贸有限公司',
            factoryUrl: 'https://factory.example.com',
            mainCategoryName: '手机壳',
            providerTags: [
              { tagName: '超级工厂', tagStyle: 'factory' },
              { tagName: '10年', tagStyle: 'normal' },
            ],
            providerServices: [
              { label: '90天回头率', value: '85%' },
              { label: '品质退款率', value: '0.5%' },
            ],
            providerKjCustomTags: ['tpu', 'CQC认证', '支持来图加工'],
            satisfyRequirements: [
              { indicatorContent: '材质符合', isSatisfy: true, requirement: 'TPU材质' },
              { indicatorContent: '价格合适', isSatisfy: true, requirement: '价格在预算内' },
              { indicatorContent: '有认证', isSatisfy: true, requirement: 'CQC认证' },
              { indicatorContent: '支持定制', isSatisfy: true, requirement: '来图加工' },
              { indicatorContent: '快速发货', isSatisfy: true, requirement: '48小时' },
            ],
            aiAttentions: ['首饰', '小众', '新潮'],
            recommendItems: [
              {
                itemId: '101',
                imageUrl: 'https://img.alicdn.com/imgextra/i3/6000000003645/O1CN01PQFki11cnSlO4pOqH_!!6000000003645-2-gg_dtc.png',
                title: '适用苹果17手机壳',
                itemPrice: '2.00',
                offerDetailUrl: 'https://example.com/item/101',
              },
              {
                itemId: '102',
                imageUrl: 'https://img.alicdn.com/imgextra/i3/6000000003645/O1CN01PQFki11cnSlO4pOqH_!!6000000003645-2-gg_dtc.png',
                title: 'iPhone保护壳',
                itemPrice: '3.50',
                offerDetailUrl: 'https://example.com/item/102',
              },
              {
                itemId: '103',
                imageUrl: 'https://img.alicdn.com/imgextra/i3/6000000003645/O1CN01PQFki11cnSlO4pOqH_!!6000000003645-2-gg_dtc.png',
                title: '透明防摔手机壳',
                itemPrice: '2.80',
                offerDetailUrl: 'https://example.com/item/103',
              },
            ],
          },
          {
            memberId: '2',
            companyName: '深圳市华强电子有限公司',
            factoryUrl: 'https://factory2.example.com',
            mainCategoryName: '手机配件',
            providerTags: [
              { tagName: '认证工厂', tagStyle: 'factory' },
              { tagName: '8年', tagStyle: 'normal' },
            ],
            providerServices: [
              { label: '90天回头率', value: '80%' },
              { label: '品质退款率', value: '1.0%' },
            ],
            providerKjCustomTags: ['硅胶', 'ISO认证'],
            satisfyRequirements: [
              { indicatorContent: '材质符合', isSatisfy: true, requirement: '硅胶材质' },
              { indicatorContent: '价格合适', isSatisfy: true, requirement: '价格在预算内' },
              { indicatorContent: '有认证', isSatisfy: true, requirement: 'ISO认证' },
            ],
            aiAttentions: ['热销', '品质保证'],
            recommendItems: [
              {
                itemId: '201',
                imageUrl: 'https://img.alicdn.com/imgextra/i3/6000000003645/O1CN01PQFki11cnSlO4pOqH_!!6000000003645-2-gg_dtc.png',
                title: '硅胶手机壳',
                itemPrice: '3.00',
                offerDetailUrl: 'https://example.com/item/201',
              },
              {
                itemId: '202',
                imageUrl: 'https://img.alicdn.com/imgextra/i3/6000000003645/O1CN01PQFki11cnSlO4pOqH_!!6000000003645-2-gg_dtc.png',
                title: '防摔保护套',
                itemPrice: '4.00',
                offerDetailUrl: 'https://example.com/item/202',
              },
              {
                itemId: '203',
                imageUrl: 'https://img.alicdn.com/imgextra/i3/6000000003645/O1CN01PQFki11cnSlO4pOqH_!!6000000003645-2-gg_dtc.png',
                title: '磁吸手机壳',
                itemPrice: '5.50',
                offerDetailUrl: 'https://example.com/item/203',
              },
            ],
          },
        ],
      },
    },
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', maxWidth: '375px', margin: '0 auto' }}>
      <Title title="iphonecase找供应商" />
      <div style={{ marginTop: '20px' }}>
        <SupplierSearchTable rawData={mockData.rawData} />
      </div>
    </div>
  );
};

export default SupplierSearchTableExample;

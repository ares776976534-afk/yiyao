import React from 'react';
import ProductSearchTable from '../src/pages/mobile-select-business/components/ProductSearchTable';
import Title from '../src/pages/mobile-select-business/components/Title';
import type { TypeProductSearchTableProps } from '../src/pages/select-business/components/ProductSearchTable/types';

const ProductSearchTableExample: React.FC = () => {
  const mockData: TypeProductSearchTableProps = {
    rawData: {
      offerInfo: {
        aiRequirementAnalysis: {
          fullSatisfy: 16,
          partSatisfy: 4,
          total: 20,
          isDisplay: true,
          requirements: ['材质要求', '认证要求', '价格区间'],
        },
        offerList: [
          {
            itemId: '1',
            title: '适用苹果17手机壳磁吸15promax透明14批发13防摔12不发黄iphone16',
            imageUrl: 'https://img.alicdn.com/imgextra/i2/6000000001527/O1CN01Q44OUs1N9PtboHPwI_!!6000000001527-2-gg_dtc.png',
            itemPrice: '2.00',
            coreAttributes: [
              { label: '材质', value: 'TPU' },
              { label: '认证', value: 'CQC认证' },
              { label: '加工', value: '支持来图加工' },
            ],
            salesInfos: [
              { label: '近30天销量', value: '近30天售 300+' },
            ],
            shipInfos: [
              { label: '揽收时效', value: '48小时揽收' },
              { label: '发货地', value: '浙江杭州' },
            ],
            satisfyRequirements: [
              { indicatorContent: '材质符合', isSatisfy: true, requirement: 'TPU材质' },
              { indicatorContent: '价格合适', isSatisfy: true, requirement: '价格在预算内' },
              { indicatorContent: '有认证', isSatisfy: true, requirement: 'CQC认证' },
              { indicatorContent: '支持定制', isSatisfy: true, requirement: '来图加工' },
              { indicatorContent: '快速发货', isSatisfy: true, requirement: '48小时' },
            ],
            aiAttentions: ['首饰', '小众', '新潮'],
          },
          {
            itemId: '2',
            title: 'iPhone保护壳透明防摔硅胶软壳适用于iPhone15/14/13系列',
            imageUrl: 'https://img.alicdn.com/imgextra/i2/6000000001527/O1CN01Q44OUs1N9PtboHPwI_!!6000000001527-2-gg_dtc.png',
            itemPrice: '3.50',
            coreAttributes: [
              { label: '材质', value: '硅胶' },
              { label: '特性', value: '防摔' },
            ],
            salesInfos: [
              { label: '近30天销量', value: '近30天售 500+' },
            ],
            shipInfos: [
              { label: '揽收时效', value: '24小时揽收' },
              { label: '发货地', value: '广东深圳' },
            ],
            satisfyRequirements: [
              { indicatorContent: '材质符合', isSatisfy: true, requirement: '硅胶材质' },
              { indicatorContent: '价格合适', isSatisfy: true, requirement: '价格在预算内' },
              { indicatorContent: '防摔性能', isSatisfy: true, requirement: '防摔要求' },
            ],
            aiAttentions: ['热销', '品质保证'],
          },
        ],
      },
    },
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', maxWidth: '375px', margin: '0 auto' }}>
      <Title title="iphonecase找供应商" />
      <div style={{ marginTop: '20px' }}>
        <ProductSearchTable rawData={mockData.rawData} />
      </div>
    </div>
  );
};

export default ProductSearchTableExample;

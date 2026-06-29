import React from 'react';
import { ProductMarketList } from '@/pages/select-product/components/ImageSearchComponents';

const TypeProductMarketListExample: React.FC = () => {
  const handleDetailClick = () => {
    console.log('查看详情被点击');
  };

  const mockData = {
    title: '商品市场',
    cards: [
      {
        title: '有相似款在销市场',
        subtitle: '2个有相似款在销市场',
      },
      {
        title: '待拓展市场',
        subtitle: '6个无相似款在销市场',
      },
    ],
    onDetailClick: handleDetailClick,
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h2>商品市场列表组件示例</h2>
      <ProductMarketList {...mockData} />
    </div>
  );
};

export default TypeProductMarketListExample;


import React from 'react';
import Product1688AbstractCard from '@/components/ChatFlow/Product1688AbstractCard';

const Product1688AbstractInfo = (props: any) => {
  const { componentData, index } = props;
  return (
    <div>
      <Product1688AbstractCard
        index={index}
        data={componentData}
      />
    </div>
  );
};

export default Product1688AbstractInfo;

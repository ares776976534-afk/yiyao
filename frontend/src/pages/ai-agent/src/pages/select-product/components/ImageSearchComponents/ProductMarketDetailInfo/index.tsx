import React from 'react';
import CommonTable from '@/components/CommonTable';
import type { TypeTableData } from '@/components/CommonTable/types';

const ProductMarketDetailInfo: React.FC<{
  cardId?: string;
  cardType?: string;
  cardSubType?: string;
  imageSearchMarketDetailInfoTableData: {
    tableDataList: TypeTableData<any>[];
  };
  onMoreClick: (cardSubType: any, data: any) => void;
}> = (props) => {
  const { imageSearchMarketDetailInfoTableData, cardType, onMoreClick,
    cardId, cardSubType,
   } = props;
  return (
    <CommonTable
      cardId={cardId}
      cardType={cardType}
      cardSubType={cardSubType}
      tableDatas={imageSearchMarketDetailInfoTableData}
      onFoldClick={() => {
        onMoreClick?.(cardType, props);
      }}
      alwaysShowFoldText
    />
  );
};

export default ProductMarketDetailInfo;

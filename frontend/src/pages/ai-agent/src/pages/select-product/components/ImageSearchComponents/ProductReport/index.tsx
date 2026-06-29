import ColorfulCard from '@/components/ChatFlow/ColorfulCard';
import { TypeRightPanelSide } from '@/types/select-product';
import { useEffect, useRef, useCallback, useState } from 'react';

interface TypeReportProps {
  onViewDetails?: () => void;
  title?: string;
  itemBtn?: {
    key: string;
    value: string;
  }[];
  cardType?: TypeRightPanelSide;
  onMoreClick: (cardType: TypeRightPanelSide, data: any) => void;
  rightSideType: string;
  defaultShowKeyword: string;
  currentViewingKeyword?: string; // 当前正在查看的关键词
  cardId?: string;
  cardSubType?: string;
  rightSideCardId?: string;
}

const ProductReport = (props: TypeReportProps) => {
  const { title, itemBtn, onMoreClick, rightSideType,
    cardId, cardSubType, cardType, rightSideCardId } = props;
  // const isViewingCurrentKeyword = rightSideType !== '' && currentViewingKeyword === defaultShowKeyword;
  // const isViewing = !!isViewingCurrentKeyword;
  const isViewing = rightSideCardId === cardId;
  const type = rightSideType === '' ? 'br' : 'bm';
  const hasCalledRef = useRef(false);

  const handleMoreClick = useCallback(() => {
    onMoreClick('REPORT_CARD', props);
  }, [onMoreClick, props]);

  useEffect(() => {
    // 只在首次渲染时调用，避免死循环
    if (!hasCalledRef.current) {
      hasCalledRef.current = true;
      handleMoreClick();
    }
  }, [handleMoreClick]);

  return (<ColorfulCard
    cardId={cardId}
    cardSubType={cardSubType}
    cardType={cardType}
    title={title}
    type={type}
    onClick={handleMoreClick}
    itemBtn={itemBtn}
    isViewing={isViewing}
  />);
};

export default ProductReport;
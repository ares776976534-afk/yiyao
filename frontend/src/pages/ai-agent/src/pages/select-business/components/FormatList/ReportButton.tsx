import ColorfulCard from '../ColorfulCard';
import { useSelectProductStore } from '@/stores/select-product';
import { TypeRightPanelSide } from '@/types/select-product';
import { useEffect, useRef, useCallback } from 'react';

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
  rawData?: any;
  imageUrl?: string;
  cardId?: string;
  rightSideCardId?: string;
}

export default (props: TypeReportProps) => {
  const { title, itemBtn, onMoreClick, imageUrl, rightSideType, defaultShowKeyword, rawData = '', cardId, rightSideCardId = '' } = props;
  // 当 rightSideType 为空字符串时type为'br'，否则为'bm'
  const type = rightSideType === '' ? 'br' : 'bm';

  const { setTabLoadingIndex } = useSelectProductStore();
  const hasCalledRef = useRef(false);

  const handleMoreClick = useCallback(() => {
    onMoreClick('REPORT_CARD', props);
  }, [onMoreClick, props]);

  useEffect(() => {
    if (rawData && rightSideType === 'REPORT_CARD' && rightSideCardId === cardId) {
      handleMoreClick();
    }
  }, [rawData, rightSideCardId]);

  // 监听 postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type: messageType, data } = event.data;
      if (messageType === 'TAB_SWITCH' && defaultShowKeyword === data?.keyword) {
        console.log('收到 Tab 切换消息:', data);
        handleMoreClick();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // 只在首次渲染时调用，避免死循环
    if (!hasCalledRef.current) {
      hasCalledRef.current = true;
      handleMoreClick();
      setTabLoadingIndex(-1);
    }
  }, [handleMoreClick]);

  return (<ColorfulCard
    isViewing={rightSideType === 'REPORT_CARD' && rightSideCardId === cardId}
    title={title}
    type={type}
    imageUrl={imageUrl}
    onClick={handleMoreClick}
    itemBtn={itemBtn}
  />);
};
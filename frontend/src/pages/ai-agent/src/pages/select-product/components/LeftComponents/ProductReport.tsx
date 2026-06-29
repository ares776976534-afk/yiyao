import ColorfulCard from '@/components/ChatFlow/ColorfulCard';
import { useSelectProductStore } from '@/stores/select-product';
import { TypeRightPanelSide } from '@/types/select-product';
import { useEffect, useRef, useCallback, useState } from 'react';
import log from '@/utils/log';

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
  logKey?: string; // 埋点KEY
}

export const ProductReport = (props: TypeReportProps) => {
  const { title, itemBtn, onMoreClick, rightSideType,
    cardId, cardSubType, cardType,
    defaultShowKeyword, currentViewingKeyword, logKey } = props;
  const isViewingCurrentKeyword = rightSideType !== '' && currentViewingKeyword === defaultShowKeyword;
  const isViewing = !!isViewingCurrentKeyword;
  const type = rightSideType === '' ? 'br' : 'bm';
  const { setTabLoadingIndex } = useSelectProductStore();
  const hasCalledRef = useRef(false);

  const handleMoreClick = useCallback(() => {
    onMoreClick('REPORT_CARD', props);
  }, [onMoreClick, props]);

  // 用户点击时的处理（包含埋点）
  const handleUserClick = useCallback(() => {
    if (logKey) {
      log.record(logKey as `/${string}.${string}.${string}`, 'CLK', {
        title: title || '',
        keyword: defaultShowKeyword || '',
      });
    }
    handleMoreClick();
  }, [logKey, title, defaultShowKeyword, handleMoreClick]);

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
    cardId={cardId}
    cardSubType={cardSubType}
    cardType={cardType}
    title={title}
    type={type}
    onClick={handleUserClick}
    itemBtn={itemBtn}
    isViewing={isViewing}
  />);
};
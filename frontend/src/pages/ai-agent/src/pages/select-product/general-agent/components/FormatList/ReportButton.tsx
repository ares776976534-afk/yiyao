import ColorfulCard from '@/components/ChatFlow/ColorfulCard';
import { useSelectProductStore } from '@/stores/select-product';
import { TypeRightPanelSide } from '@/types/select-product';
import { useEffect, useRef, useCallback } from 'react';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

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
  rawData?: string;
  cardId?: string;
  rightSideCardId?: string;
  fileList?: any;
}

export default (props: TypeReportProps) => {
  const { title, itemBtn, onMoreClick, rightSideType, defaultShowKeyword, rawData = '', cardId, rightSideCardId = '', fileList = {} } = props;
  // 当 rightSideType 为空字符串时type为'br'，否则为'bm'
  const type = rightSideType === '' ? 'br' : 'bm';

  const { setTabLoadingIndex } = useSelectProductStore();
  const hasCalledRef = useRef(false);
  const hasExpRef = useRef(false);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const logParamsRef = useRef({ title, defaultShowKeyword });
  logParamsRef.current = { title, defaultShowKeyword };

  const handleMoreClick = useCallback(() => {
    onMoreClick('REPORT_CARD', props);
  }, [onMoreClick, props]);

  // 曝光打点：卡片进入视口时触发
  useEffect(() => {
    const el = cardWrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasExpRef.current) {
          hasExpRef.current = true;
          log.record(LOG_KEYS.GENERAL_AGENT.LP.REPORT_CARD, 'EXP', {
            title: logParamsRef.current.title || '',
            keyword: logParamsRef.current.defaultShowKeyword || '',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 用户点击时的处理（包含埋点）
  const handleUserClick = useCallback(() => {
    log.record(LOG_KEYS.GENERAL_AGENT.LP.REPORT_CARD, 'CLK', {
      title: title || '',
      keyword: defaultShowKeyword || '',
    });
    handleMoreClick();
  }, [title, defaultShowKeyword, handleMoreClick]);

  useEffect(() => {
    if (rawData && rightSideType === 'REPORT_CARD' && rightSideCardId === cardId) {
      handleMoreClick();
    }
  }, [rawData, rightSideCardId]);

  useEffect(() => {
    if (fileList && (fileList?.pdf_file_url || fileList?.html_file_url || fileList?.md_file_url)) {
      handleMoreClick();
    }
  }, [fileList]);

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

      // 滚动定位到报告卡片
      setTimeout(() => {
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        if (cardElement) {
          cardElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  }, [handleMoreClick]);

  return (
    <div ref={cardWrapperRef}>
      <ColorfulCard
        title={title}
        type={type}
        onClick={handleUserClick}
        itemBtn={itemBtn}
        isViewing={rightSideType === 'REPORT_CARD' && rightSideCardId === cardId}
        cardId={cardId}
      />
    </div>
  );
};
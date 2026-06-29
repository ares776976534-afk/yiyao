import React, { useState, useEffect } from 'react';
import styles from './HistoryList.module.css';
import HistoryItem from './HistoryItem';
import httpRequest from '@/services/httpRequest';
import { message } from 'antd';
import VisibilityChange from '@ice/appear';
import { CloseIcon } from '@/components/Icons';
import { $t } from '@/i18n';
import { selApiBaseUrl, serviceBaseUrl } from '@/utils/env';


export enum Scence {
  NEW_PRODUCT_DISCOVERY = 'NEW_PRODUCT_DISCOVERY',
  PRODUCT_IMPROVEMENT = 'PRODUCT_IMPROVEMENT',
  ALGO = 'ALGO',
  FIND_PROVIDER = 'FIND_PROVIDER',
  PLATFORM_MARKET_MIGRATION = 'PLATFORM_MARKET_MIGRATION',
  COUNTRY_MARKET_MIGRATION = 'COUNTRY_MARKET_MIGRATION',
  CONSULT = 'CONSULT',
  INQUIRY = 'INQUIRY',
  GENERAL_IMAGE_SEARCH = 'GENERAL_IMAGE_SEARCH',
  API_NEW_PRODUCT_DISCOVERY = 'API_NEW_PRODUCT_DISCOVERY',
}

export interface HistoryRecord {
  sessionTitle: string;
  sessionId: string;
  oppScene: Scence;
  createdTime: string;
}

interface HistoryListProps {
  id?: string;
  onClose?: () => void;
  onSelectSession?: (sessionId: string, scence: Scence) => void;
  scence?: Scence[];
  reload?: boolean;
  sessionId?: string;
  titleText?: string;
}

const HistoryList: React.FC<HistoryListProps> = ({ id, onClose, onSelectSession, scence = [], reload, sessionId, titleText }) => {
  const [activeId, setActiveId] = useState<string>(sessionId || '');
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [pageNum, setpageNum] = useState<number>(1);

  const getHistoryData = async (params: { pageSize: number; pageNum: number; scence: Scence[] }) => {
    try {
      const res = await httpRequest(`${serviceBaseUrl}/opp/history/list`, {
        method: 'POST',
        body: JSON.stringify({
          pageSize: params.pageSize || 10000,
          pageNum: params.pageNum || 1,
          oppSceneList: params.scence || '',
        }),
      });
      if (res?.success) {
        setHistoryData(params.pageSize === 1 ? res?.list : historyData.concat(res?.list));
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error('获取历史记录失败', error);
    }
  };

  const handleItemClick = (item: HistoryRecord) => {
    setActiveId(item.sessionId);
    onSelectSession?.(item.sessionId, item.oppScene || '');
  };

  const handleDelete = () => {
    getHistoryData({ pageSize: 20, pageNum: 1, scence: scence || [] });
  };

  const handleCloseClick = () => {
    onClose?.();
  };

  const handleLoadMore = () => {
    getHistoryData({ pageSize: 20, pageNum: Number(pageNum) + 1, scence: scence || [] });
    setpageNum(Number(pageNum) + 1);
  };

  useEffect(() => {
    if (reload) {
      getHistoryData({ pageSize: 20, pageNum: 1, scence: scence || [] });
    } else {
      setHistoryData([]);
    }
  }, [reload]);

  return (
    <div id={id} className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{titleText || $t("global-1688-ai-app.select-product.ChatHistory.HistoryList.xplsjl", "选品历史记录")}</span>
        <div className={styles.closeIconWrapper} onClick={handleCloseClick}>
          <CloseIcon />
        </div>
      </div>
      <div className={styles.historyList}>
        {historyData.map((item) => (
          <HistoryItem
            key={item.sessionId}
            item={item}
            isActive={activeId === item.sessionId}
            onClick={handleItemClick}
            onDelete={handleDelete}
          />
        ))}
        {
          historyData.length > 0 && (
            <VisibilityChange onAppear={handleLoadMore}>
              <div className={styles.loadMorePlaceholder} />
            </VisibilityChange>
          )
        }
      </div>
    </div>
  );
};

export default HistoryList;

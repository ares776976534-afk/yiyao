import { InfiniteScroll, List } from 'antd-mobile'
import styles from './index.module.scss';
import httpRequest from '@/services/httpRequest';
import { useEffect, useState } from 'react';
import { message } from 'antd';
import { useChatHistory } from '@/pages/select-product/components/ChatHistory/useChatHistory';
import AgentPopup from '../agentPopup';
import { Empty } from '@/pages/mobile/components/empty';

export enum Scence {
  NEW_PRODUCT_DISCOVERY = 'NEW_PRODUCT_DISCOVERY',
  PRODUCT_IMPROVEMENT = 'PRODUCT_IMPROVEMENT',
  ALGO = 'ALGO',
  FIND_PROVIDER = 'FIND_PROVIDER',
  PLATFORM_MARKET_MIGRATION = 'PLATFORM_MARKET_MIGRATION',
  COUNTRY_MARKET_MIGRATION = 'COUNTRY_MARKET_MIGRATION',
  CONSULT = 'CONSULT',
  INQUIRY = 'INQUIRY',
}
const ChatHistoryScenceUrl = {
  [Scence.NEW_PRODUCT_DISCOVERY]: '/select-product',
  [Scence.PRODUCT_IMPROVEMENT]: '/select-product/improve-agent',
  [Scence.PLATFORM_MARKET_MIGRATION]: '/select-product/platform-agent',
  [Scence.COUNTRY_MARKET_MIGRATION]: '/select-product/country-agent',
  [Scence.ALGO]: '/select-product/general-agent',
  [Scence.FIND_PROVIDER]: '/sourcing',
  [Scence.CONSULT]: '/chat',
}
interface HistoryRecord {
  sessionTitle: string;
  sessionId: string;
  oppScene: Scence;
  createdTime: string;
}
interface Props {
  visible: boolean,
  onMaskClick: () => void,
  scence?: Scence[],
}

const HistoryPopup = ({
  visible,
  onMaskClick,
  scence = [Scence.ALGO, Scence.NEW_PRODUCT_DISCOVERY, Scence.PRODUCT_IMPROVEMENT, Scence.PLATFORM_MARKET_MIGRATION, Scence.COUNTRY_MARKET_MIGRATION]
}: Props) => {
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { navigateToChatHistory } = useChatHistory();

  const pageSize = 20;

  const getHistoryData = async (params: { pageSize: number, pageNum: number, scence: Scence[] }) => {
    try {
      const res = await httpRequest('/opp/history/list', {
        method: 'POST',
        body: JSON.stringify({
          pageSize: params.pageSize,
          pageNum: params.pageNum,
          oppSceneList: params.scence,
        }),
      });
      if (res?.success) {
        return res?.list || [];
      }
      return [];
    } catch (error) {
      console.error('获取历史记录失败', error);
      return [];
    }
  };

  async function loadMore() {
    const nextPage = pageNum + 1;
    const append = await getHistoryData({ pageSize, pageNum: nextPage, scence });
    setHistoryData([...historyData, ...append]);
    setHasMore(append.length >= pageSize);
    if (append.length > 0) {
      setPageNum(nextPage);
    }
  }

  useEffect(() => {
    if (visible) {
      setPageNum(1);
      setHasMore(true);
      getHistoryData({ pageSize, pageNum: 1, scence }).then((data) => {
        setHistoryData(data);
        setHasMore(data.length >= pageSize);
      });
    } else {
      setHistoryData([]);
    }
  }, [visible]);
  const handleSelectSession = (sessionId: string, scenceType: Scence) => {
    if (!scenceType) {
      message.error('该历史记录已失效');
      return;
    }
    onMaskClick();
    navigateToChatHistory(ChatHistoryScenceUrl[scenceType || Scence.NEW_PRODUCT_DISCOVERY], sessionId);
  };
  return (
    <AgentPopup visible={visible} onMaskClick={onMaskClick} title="选品历史记录">
      {historyData.length > 0 ? (
        <div className={styles.historyPopupList}>
          <List>
            {historyData.map((item) => (
              <List.Item
                key={item.sessionId}
                onClick={() => handleSelectSession(item.sessionId, item.oppScene)}
                className={styles.historyPopupItem}
              >
                {item.sessionTitle}
              </List.Item>
            ))}
          </List>
          {hasMore && (
            <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
              <div className={styles.loadingText}>加载中...</div>
            </InfiniteScroll>
          )}
        </div>
      ) : (
        <Empty text='暂无历史' style={{ padding: '120px 20px 240px 20px' }} />
      )}
    </AgentPopup>
  );
};

export default HistoryPopup;
import React, { useState } from 'react';
import { Button, Drawer, message } from 'antd';
import HistoryList, { Scence } from './HistoryList';
import styles from './index.module.css';
import { useChatHistory } from './useChatHistory';
import TimeIcon from './Icon/Time';
import log, { commonRecord } from '@/utils/log';
import { $t } from '@/i18n';

interface ChatHistoryProps {
  scence: Scence[];
  onSelectSession?: (sessionId: string, scence: Scence) => void;
  sessionId?: string;
  btnText?: string;
  titleText?: string;
  historyLogKey?: string;
}

const ChatHistoryScenceUrl = {
  [Scence.NEW_PRODUCT_DISCOVERY]: '/select-product',
  [Scence.PRODUCT_IMPROVEMENT]: '/select-product/improve-agent',
  [Scence.PLATFORM_MARKET_MIGRATION]: '/select-product/platform-agent',
  [Scence.COUNTRY_MARKET_MIGRATION]: '/select-product/country-agent',
  [Scence.ALGO]: '/select-product/general-agent',
  [Scence.FIND_PROVIDER]: '/sourcing',
  [Scence.CONSULT]: '/chat',
  [Scence.GENERAL_IMAGE_SEARCH]: '/select-product/image-search-agent',
  [Scence.API_NEW_PRODUCT_DISCOVERY]: '/select-product',
};

const ChatHistory = ({ scence = [], onSelectSession, sessionId, btnText, titleText, historyLogKey }: ChatHistoryProps) => {
  const [open, setOpen] = useState(false);
  const { navigateToChatHistory } = useChatHistory();

  const handleSelectSession = (selectedSessionId: string, scenceType: Scence) => {
    if (!scenceType) {
      message.error('该历史记录已失效');
      return;
    }
    setOpen(false);
    if (historyLogKey) {
      log.record(historyLogKey as `/${string}.${string}.${string}`, 'CLK', { chat_history_session: selectedSessionId });
    }
    commonRecord(`对话历史选择-${scenceType}`);
    const url = ChatHistoryScenceUrl[scenceType || Scence.NEW_PRODUCT_DISCOVERY];
    if (!url) {
      message.error('该历史记录已失效');
      return;
    }
    navigateToChatHistory(url, selectedSessionId);
    onSelectSession?.(selectedSessionId, scenceType);
  };

  const handleOpen = (visible: boolean) => {
    setOpen(visible);
    commonRecord(`对话历史${visible ? '打开' : '关闭'}`);
  };

  return (
    <div className={styles.chatHistory}>
      <Button
        onClick={() => handleOpen(true)}
        type="text"
        icon={<TimeIcon style={{ width: 16, height: 16 }} />}
        className={styles.chatHistoryButton}
      >{btnText || $t("global-1688-ai-app.select-product.ChatHistory.dhls.2", "对话历史")}</Button>
      <Drawer
        className={styles.chatHistoryDrawer}
        open={open}
        onClose={() => handleOpen(false)}
        mask={false}
        closeIcon={null}
        title={null}
        getContainer={() => document.getElementById('agent-layout-sider') as HTMLElement}
        placement="left"
        rootStyle={{ position: 'absolute', zIndex: 10 }}
        width={300}
      >
        <HistoryList
          onClose={() => handleOpen(false)}
          scence={scence || []}
          onSelectSession={handleSelectSession}
          reload={open}
          sessionId={sessionId}
          titleText={titleText}
        />
      </Drawer>
    </div>
  );
};

export default ChatHistory;
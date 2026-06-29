import React from 'react';
import styles from './index.module.scss';
import Dashboard from '@/pages/common-chat/components/Dashboard';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import log, { googleRecord } from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';


export default () => {
  const { navigateByCache } = useChatQuery();

  const handleSubmit = (data: any) => {
    log.record(LOG_KEYS.AGENT_HOME.CHATBOX.CHAT_CLICK, 'CLK', { query: data?.query || data || '' });
    googleRecord('chat_submit', {}, '/');
    navigateByCache({ chatInput: data, url: '/chat' });
  };

  return (
    <div className={styles.commonChat}>
      <Dashboard onSubmit={handleSubmit} />
    </div>
  );
};
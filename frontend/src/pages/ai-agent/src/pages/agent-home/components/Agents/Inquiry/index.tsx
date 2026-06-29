import React from 'react';
import styles from './index.module.css';
import Dashborad from '@/pages/inquiry/components/Dashborad';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import log, { googleRecord } from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

export default () => {
  const { navigateByCache } = useChatQuery();

  return (
    <div className={styles.inquiry}>
      <Dashborad
        onlyShowDemo
        onNewClick={() => {
          log.record(LOG_KEYS.AGENT_HOME.CHATBOX.INQUIRY_CLICK, 'CLK');
          googleRecord('inquiry_submit', {}, '/');
          navigateByCache({ chatInput: {}, url: '/inquiry' });
        }}
      />
    </div>
  );
};
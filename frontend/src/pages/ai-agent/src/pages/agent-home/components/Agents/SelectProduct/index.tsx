import React from 'react';
import styles from './index.module.css';
import Content from '@/pages/select-product/home/components/Content';
import { LOG_KEYS } from '@/utils/logConfig';

export default () => {
  return (
    <div className={styles.selectProduct}>
      <Content
        logKeys={{
          INSIGHT_CLICK: LOG_KEYS.AGENT_HOME.CHATBOX.INSIGHT_CLICK,
          INSIGHT_CHANNEL: LOG_KEYS.AGENT_HOME.CHATBOX.INSIGHT_CHANNEL,
          INSIGHT_COUNTRY: LOG_KEYS.AGENT_HOME.CHATBOX.INSIGHT_COUNTRY,
        }}
        cardLogKeys={{
          IMG_SEARCH: LOG_KEYS.AGENT_HOME.CARD.IMG_SEARCH,
          INSIGHT_NEW: LOG_KEYS.AGENT_HOME.CARD.INSIGHT_NEW,
          INSIGHT_IMPROVE: LOG_KEYS.AGENT_HOME.CARD.INSIGHT_IMPROVE,
          INSIGHT_PLATFORM: LOG_KEYS.AGENT_HOME.CARD.INSIGHT_PLATFORM,
          INSIGHT_COUNTRY: LOG_KEYS.AGENT_HOME.CARD.INSIGHT_COUNTRY,
        }}
        showcaseLogKeys={{
          VIEW: LOG_KEYS.AGENT_HOME.SHOWCASE.INSIGHT_VIEW,
          SAME: LOG_KEYS.AGENT_HOME.SHOWCASE.INSIGHT_SAME,
        }}
      />
    </div>
  );
};
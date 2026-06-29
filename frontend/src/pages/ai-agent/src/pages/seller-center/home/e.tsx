import React from 'react';
import { definePageConfig } from 'ice';
import Layout from './components/Layout';
import SimpleNote from './components/SimpleNote';
import AgentNote from './components/AgentNote';
import CustomVoice from './components/CustomVoice';
import McpServer from './components/McpServer';
import ApiServer from './components/APIServer';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';

import styles from './index.module.scss';
import { useIsMobile } from '@/hooks/useDeviceDetection';
import { $t } from '@/i18n';

const Home = () => {
  const navigate = useNavigateWithScroll();
  const handleToWaitingList = () => {
    navigate('/seller-center/home/waiting-list');
  };

  const isMobile = useIsMobile();

  return (
    <Layout contentStyle={{ padding: '0' }}>
      <div className={styles.firstCommonBlock}>
        <SimpleNote />
      </div>
      <div className={styles.agentNote}>
        <AgentNote />
      </div>
      {/* <div className={styles.commonBlock}>
        <ChoiceSample />
      </div> */}

      {isMobile && (
        <img
          className="w-full h-full"
          src="https://img.alicdn.com/imgextra/i2/O1CN01lptWV61XDDKd8Lhrf_!!6000000002889-2-tps-563-72.png"
        />
      )}
      <div
        className={`${styles.commonBlock} ${styles.customVoiceBlock}`}
      >
        <CustomVoice />
      </div>
      <div className={styles.commonBlock}>
        <ApiServer />
      </div>
      <div className={styles.commonBlock} style={{ paddingTop: '0' }}>
        <McpServer />
      </div>
      <div className={styles.waitingListBtn}>
        <div className={styles.ctaSection}>
          <div className={styles.ctaContent} onClick={handleToWaitingList}>
            <div className={styles.actionText}>
              <span className={styles.actionTitle}>{$t("global-1688-ai-app.seller-center.home.e.nowhd", "现在行动")}</span>
              <img
                src="https://img.alicdn.com/imgextra/i3/O1CN01L0CSLv1GIOKo7PlWX_!!6000000000599-2-tps-87-45.png"
                className={styles.arrowIcon}
                alt={$t("global-1688-ai-app.seller-center.home.e.jt", "箭头")}
              />
            </div>
            <div className={styles.ctaButton}>
              <span className={styles.buttonText}>{$t("global-1688-ai-app.seller-center.home.e.jti", "加入 Waiting List")}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.seller-center.home.e.ajA", "遨虾-AI跨境电商运营Agent"),
  spm: {
    spmB: 'seller-center-home',
  },
});

export default Home;
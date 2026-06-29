import React, { useState } from 'react';
import { Button } from 'antd';
import styles from './index.module.css';
import { ReplayStatus } from '../../hooks/useChatStream';
import { useChatHistory } from '../ChatHistory/useChatHistory';
import { transformRawData } from '../LeftComponents/UserInputText';
import useChatQuery from '../../hooks/useChatQuery';
import { $t } from '@/i18n';
import { MainBtn, SecondaryBtn } from '@/components/ChatFlow/Btn';

interface ReplayStatusCardsProps {
  status?: ReplayStatus;
  showReplayResult?: boolean;
  setShowReplayResult?: (show: boolean) => void;
  replayFn?: (shareCode: string) => void;
  userRequest?: any;
  showMakeSimilar?: boolean;
}

const ReplayStatusCards: React.FC<ReplayStatusCardsProps> = ({ status, showReplayResult, setShowReplayResult, replayFn, userRequest, showMakeSimilar = true }) => {
  const { shareCode } = useChatHistory();
  const { navigateByCache } = useChatQuery();
  const handleMakeSimilar = () => {
    const { rawData } = userRequest;
    const _rawData = transformRawData(rawData);
    navigateByCache({ chatInput: _rawData, url: window.location.pathname.replace('/app', ''), isMakeSimilar: true, target: 'blank' });
    // console.log('做同款', _rawData);
  };

  const handleJumpToResult = () => {
    setShowReplayResult?.(true);
  };

  const handleReplay = () => {
    if (!shareCode) {
      window.location.reload();
      return;
    }
    replayFn?.(shareCode);
  };

  const isPlaying = status === ReplayStatus.REPLAYING;
  const isCompleted = status === ReplayStatus.COMPLETED;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.statusSection}>
          <img
            className={styles.statusIcon}
            src="https://img.alicdn.com/imgextra/i3/O1CN01cxxoG21CSEOS67xhJ_!!6000000000079-2-tps-52-39.png"
            alt={$t("global-1688-ai-app.select-product.ReplayStatusBar.bficon", "播放图标")}
          />
          <span className={styles.statusText}>
            {isPlaying ? $t("global-1688-ai-app.select-product.ReplayStatusBar.zzhf", "正在回放...") : isCompleted ? $t("global-1688-ai-app.select-product.ReplayStatusBar.hfend", "回放结束") : ''}
          </span>
        </div>
        <div className={styles.buttonGroup}>
          {showMakeSimilar && (<SecondaryBtn
            icon={
              <img
                className={styles.buttonIcon}
                src="https://img.alicdn.com/imgextra/i1/O1CN01BB2XPS1qdIaxaYXKU_!!6000000005518-2-tps-56-56.png"
                alt={$t("global-1688-ai-app.select-product.ReplayStatusBar.ztkicon", "做同款图标")}
              />
            }
            style={{ height: 36 }}
            handleBtn={handleMakeSimilar}
            text={$t("global-1688-ai-app.select-product.ReplayStatusBar.ztk", "做同款")}
          />)}
          <MainBtn
            style={{ height: 36 }}
            handleBtn={isPlaying ? handleJumpToResult : handleReplay}
            text={`${isPlaying ? $t("global-1688-ai-app.select-product.ReplayStatusBar.tzkresult", "跳转看结果") : isCompleted ? $t("global-1688-ai-app.select-product.ReplayStatusBar.zb", "重播") : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ReplayStatusCards;

import React, { useState } from 'react';
import classNames from 'classnames';
import { NavBar, SafeArea } from 'antd-mobile';
import { MobileShareIcon } from '@/components/Icons';
import { HistoryIcon } from '@/components/Icons/History';
import { ReturnArrowIcon } from '@/components/Icon';
import History from '@/pages/mobile-studio/components/History';
import Share from '@/pages/mobile-studio/components/Share';
import { getUrlSearchParams, routeJump } from '@/utils/url';
import styles from './index.module.scss';

const MobileNavigator = (props) => {
  const { title, historyList, deleteSession } = props;
  const [historyPopupVisible, setHistoryPopupVisible] = useState(false);
  const [sharePopupVisible, setSharePopupVisible] = useState(false);
  const { sessionId: activeSessionId = '' } = getUrlSearchParams();
  const disabled = !activeSessionId;

  const handleBack = () => {
    routeJump('mobile/home');
  };

  const handleHistoryPopupOpen = () => {
    setHistoryPopupVisible(true);
  };

  const handleHistoryPopupClose = () => {
    setHistoryPopupVisible(false);
  };

  const handleSharePopupOpen = () => {
    if (disabled) {
      return;
    }
    setSharePopupVisible(true);
  };

  const handleSharePopupClose = () => {
    setSharePopupVisible(false);
  };

  const ActionArea = () => {
    return (
      <div className={styles.actionArea}>
        <HistoryIcon
          className={styles.actionIcon}
          onClick={handleHistoryPopupOpen}
        />
        <Share
          propsSessionId={activeSessionId}
          visible={sharePopupVisible}
          onClose={handleSharePopupClose}
        >
          <MobileShareIcon
            className={classNames(styles.actionIcon, {
              [styles.disabled]: disabled,
            })}
            onClick={handleSharePopupOpen}
          />
        </Share>
      </div>
    );
  };

  return (
    <div className={classNames(styles.navigator, styles.sticky)}>
      <SafeArea position="top" />
      <NavBar
        backIcon={<ReturnArrowIcon className={styles.actionIcon} />}
        onBack={handleBack}
        right={<ActionArea />}
      >
        <div className={styles.navigatorTitle}>
          <div className={styles.navigatorTitleContent}>{title}</div>
        </div>
      </NavBar>
      <History
        propsSessionId={activeSessionId}
        historyList={historyList}
        visible={historyPopupVisible}
        deleteSession={deleteSession}
        onClose={handleHistoryPopupClose}
      />
    </div>
  );
};

export default MobileNavigator;

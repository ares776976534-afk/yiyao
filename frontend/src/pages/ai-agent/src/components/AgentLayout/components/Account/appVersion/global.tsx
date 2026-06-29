import React, { useState, useEffect } from 'react';
import { getUserInfo, logout } from '@/utils/login';
import styles from './global.module.css';
import { defaultUserImg } from '@/utils/env';
import LinkCard from '../components/LinkCard';
import { $t } from '@/i18n';
import TitleHeater from '../../Settings/TitleHeater';

interface AccountProps {

}

const Account: React.FC<AccountProps> = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [is1688Auth, setIs1688Auth] = useState(false);

  const handleGetUserInfo = (refresh = false) => {
    getUserInfo({ refresh }).then((user) => {
      const { linkedRelationMemberS = [] } = user?.linkInfo;
      const linkList = linkedRelationMemberS.filter((item => {
        if (item.thirdPartyType === 'HAVANA') {
          setIs1688Auth(true);
        }
        return item.thirdPartyType !== 'HAVANA';
      }));
      setUserInfo({
        ...user,
        linkList,
      });
    });
  };

  const handleLogout = () => {
    logout();
  };

  const handleLinkSuccess = () => {
    handleGetUserInfo(true);
  };

  useEffect(() => {
    handleGetUserInfo();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TitleHeater title={$t("global-1688-ai-app.AgentLayout.Account.account", "账户")} />
        {/* <span className={styles.headerTitle}>{$t("global-1688-ai-app.AgentLayout.Account.account", "账户")}</span> */}
      </div>
      <div className={styles.sections}>
        {
          userInfo ? (
            <div className={styles.section}>
              <span className={styles.title}>{$t("global-1688-ai-app.AgentLayout.Account.account", "账户")}</span>
              <div className={styles.card}>
                <div className={styles.userSection}>
                  <div className={styles.userInfo}>
                    <img
                      className={styles.avatar}
                      src={userInfo?.userImg || defaultUserImg}
                    />
                    <div className={styles.nameContainer}>
                      <span className={styles.nickname}>{userInfo?.loginId || ''}</span>
                    </div>
                  </div>
                  <div className={styles.logoutButton}>
                    <span className={styles.logoutText} onClick={handleLogout}>{$t('global-1688-ai-app.AgentLayout.Account.logout', 'Log out')}</span>
                  </div>
                </div>
                <img
                  className={styles.divider}
                  src="https://img.alicdn.com/imgextra/i3/6000000001824/O1CN01Ndkqro1PLRXLb4PAS_!!6000000001824-2-gg_dtc.png"
                />
                {
                  userInfo?.linkList?.map((link) => (
                    <div className={styles.accountRow}>
                      <div className={styles.accountInfo}>
                        <img
                          className={styles.providerIcon}
                          src="https://img.alicdn.com/imgextra/i4/6000000007893/O1CN01gsRyc828B3GCT26f5_!!6000000007893-2-gg_dtc.png"
                        />
                        <span className={styles.providerName}>Google</span>
                      </div>
                      <span className={styles.email}>{link.displayCode}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          ) : null
        }
        <div className={styles.section}>
          <span className={styles.title}>{$t('global-1688-ai-app.AgentLayout.Account.authorization', 'Authorization')}</span>
          <div>
            <LinkCard onSuccess={handleLinkSuccess} isAuth={is1688Auth} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;

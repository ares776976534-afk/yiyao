import React, { useEffect, useState } from 'react';
import { Progress } from 'antd';
import { CreditData } from '../../types';
import { getBalanceStatistics } from '@/pages/seller-center/services';
import { CreditCard } from './CreditCard';
import styles from './index.module.css';
import { $t } from '@/i18n';

const CreditOverview: React.FC = () => {
  const [creditData, setCreditData] = useState<CreditData>({
    total: 0,
    used: 0,
    using: 0,
    remaining: 0,
  });

  const {
    total,
    used,
    using,
    remaining,
  } = creditData;

  const usingPercent = (using / total) * 100;
  const usedPercent = (used / total) * 100;

  useEffect(() => {
    getBalanceStatistics()
      .then((res) => {
        const { success, data } = res;
        if (success) {
          setCreditData({
            total: data.totalObtainPoint,
            used: data.costPoint,
            using: data.remainUnavailablePoint,
            remaining: data.remainAvailablePoint,
          });
        } else {
          setCreditData({
            total: 0,
            used: 0,
            using: 0,
            remaining: 0,
          });
        }
      })
      .catch(() => {
        setCreditData({
          total: 0,
          used: 0,
          using: 0,
          remaining: 0,
        });
      });
  }, []);

  return (
    <div className={styles.creditOverview}>
      <div className={styles.creditTotal}>
        <div className={styles.creditTotalTitle}>{$t("global-1688-ai-app.seller-center.credit-management.CreditOverview.zed", "总额度")}</div>
        <div className={styles.creditProgressContainer}>
          <div className={styles.creditNumber}>{total}</div>
          <Progress
            percent={usedPercent}
            success={{ percent: usingPercent }}
            strokeColor="#66AFFA"
            showInfo={false}
            className={styles.creditProgress}
            strokeWidth={16}
          />
        </div>
        <div className={styles.creditInfo}>{$t("global-1688-ai-app.seller-center.credit-management.CreditOverview.yieii", `已使用${used}积分，剩余${remaining}积分`, [used, remaining])}</div>
      </div>


      <div className={styles.creditCards}>
        <CreditCard
          value={using}
          label={$t("global-1688-ai-app.seller-center.credit-management.CreditOverview.syz", "使用中")}
          background="linear-gradient(104deg, #ECFCF0, #F5FFF8)"
          borderColor="#A9EDB9"
        />
        <CreditCard
          value={used}
          label={$t("global-1688-ai-app.seller-center.credit-management.CreditOverview.ysy", "已使用")}
          background="linear-gradient(105deg, #EFF7FD, #F3F9FF)"
          borderColor="#66AFFA"
        />
        <CreditCard
          value={remaining}
          label={$t("global-1688-ai-app.seller-center.credit-management.CreditOverview.remaining", "剩余")}
          background="#FAFAFA"
          borderColor="#E7E8EE"
        />
      </div>
    </div>
  );
};

export default CreditOverview;
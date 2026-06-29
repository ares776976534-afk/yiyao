import { useEffect, useState } from 'react';
import { Progress } from 'antd';
import { getExchangeQuota } from '@/pages/seller-center/services';
import { CreditCard } from '../CreditOverview/CreditCard';
import styles from '../CreditOverview/index.module.css';
import LlmUsageDetails from './LlmUsageDetails';
import { $t } from '@/i18n';

export const LlmQuota = () => {
  const [creditData, setCreditData] = useState({
    costToken: 0,
    remainAvailableToken: 0,
    remainUnAvailableToken: 0,
    totalObtainToken: 0,
  });

  const {
    costToken,
    remainAvailableToken,
    remainUnAvailableToken,
    totalObtainToken,
  } = creditData;

  const usedPercent = totalObtainToken ? (costToken / totalObtainToken) * 100 : 0;
  const usingPercent = totalObtainToken ? (remainUnAvailableToken / totalObtainToken) * 100 : 0;

  useEffect(() => {
    getExchangeQuota({ scene: 'llm' }).then((res) => {
      const { success, data, retMsg } = res;
      if (success) {
        setCreditData({
          costToken: Number(data.costToken) || 0,
          remainAvailableToken: Number(data.remainAvailableToken) || 0,
          remainUnAvailableToken: Number(data.remainUnAvailableToken) || 0,
          totalObtainToken: Number(data.totalObtainToken) || 0,
        });
      } else {
        console.log(retMsg);
      }
    });
  }, []);

  return (
    <div>
      <div className={styles.creditOverview}>
        <div className={styles.creditTotal}>
          <div className={styles.creditTotalTitle}>{$t('global-1688-ai-app.seller-center.credit-management.LlmQuota.total', '总额度')}</div>
          <div className={styles.creditProgressContainer}>
            <div className={styles.creditNumber}>{totalObtainToken}</div>
            <Progress
              percent={usedPercent}
              success={{ percent: usingPercent }}
              strokeColor="#66AFFA"
              showInfo={false}
              className={styles.creditProgress}
              strokeWidth={16}
            />
          </div>
          <div className={styles.creditInfo}>
            {$t('global-1688-ai-app.seller-center.credit-management.LlmQuota.usageSummary', `已使用${costToken}积分，剩余${remainAvailableToken}积分`, [costToken, remainAvailableToken])}
          </div>
        </div>

        <div className={styles.creditCards}>
          <CreditCard
            value={remainUnAvailableToken}
            label={$t('global-1688-ai-app.seller-center.credit-management.LlmQuota.using', '使用中')}
            background="linear-gradient(104deg, #ECFCF0, #F5FFF8)"
            borderColor="#A9EDB9"
          />
          <CreditCard
            value={costToken}
            label={$t('global-1688-ai-app.seller-center.credit-management.LlmQuota.used', '已使用')}
            background="linear-gradient(105deg, #EFF7FD, #F3F9FF)"
            borderColor="#66AFFA"
          />
          <CreditCard
            value={remainAvailableToken}
            label={$t('global-1688-ai-app.seller-center.credit-management.LlmQuota.remaining', '剩余')}
            background="#FAFAFA"
            borderColor="#E7E8EE"
          />
        </div>
      </div>

      <div className="flex items-center py-7 pb-6 border-b border-[#0000000A]">
        <h2 className="text-2xl font-medium leading-9 text-[#000000DE]">{$t('global-1688-ai-app.seller-center.credit-management.LlmQuota.usageDetails', '用量详情')}</h2>
        <span className="text-sm font-normal leading-[22px] text-[#7B7B8D] ml-4">{$t('global-1688-ai-app.seller-center.credit-management.LlmQuota.usageDesc', '查看您的API服务使用情况和消耗明细')}</span>
      </div>

      <LlmUsageDetails />
    </div>
  );
};

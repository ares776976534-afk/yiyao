import React, { useState } from 'react';
import CreditOverview from './components/CreditOverview';
import UsageDetails from './components/UsageDetails';
import Framework from '@/components/BaseFramework';
import { FilterState } from './types';
import styles from './index.module.css';
import { definePageConfig, useSearchParams } from 'ice';
import { Tabs } from 'antd';
import { ExchangeQuota } from './components/ExchangeQuota';
import { LlmQuota } from './components/LlmQuota';
import { $t } from '@/i18n';

const CreditManagement: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    apiName: '',
    requestId: '',
    dateRange: null,
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const items = [
    {
      key: '1',
      label: $t("global-1688-ai-app.seller-center.credit-management.pointsed", "积分额度"),
      children: (
        <div className={styles.creditContainer}>
          <CreditOverview />
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{$t("global-1688-ai-app.seller-center.credit-management.yldetails", "用量详情")}</h2>
            <span className={styles.sectionSubtitle}>{$t("global-1688-ai-app.seller-center.credit-management.vdeehte", "查看您的API服务使用情况和积分消耗明细")}</span>
          </div>
          <UsageDetails
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: $t("global-1688-ai-app.seller-center.credit-management.exchangeed", "兑换额度"),
      children: <ExchangeQuota />,
    },
    {
      key: '3',
      label: $t("global-1688-ai-app.seller-center.credit-management.qwenLlm", "大模型额度"),
      children: <LlmQuota />,
    },
  ];

  const tabKeys = items.map((item) => item.key);
  const defaultTab = () => {
    const tab = searchParams.get('tab');
    return tab && tabKeys.includes(tab) ? tab : tabKeys[0];
  };

  const [activeKey, setActiveKey] = useState(defaultTab());

  return (
    <Framework title="">
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        destroyInactiveTabPane
        items={items}
      />

    </Framework>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.seller-center.credit-management.pointsgl", "积分管理"),
  spm: {
    spmB: 'seller-center-credit-management',
  },
});


export default CreditManagement;
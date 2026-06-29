import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import styles from './index.module.css';
import Layout from '../select-product/components/Layout';
import SupplierList from './components/SupplierList';
import { $t } from '@/i18n';
import { ReturnArrowIcon } from '@/components/Icon';
import { definePageConfig } from 'ice';

const PersonalizedSettings = () => {

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps['items'] = [
    {
      key: 'supplier-library',
      label: <div className={styles.supplierLibraryLabel}>{$t("global-1688-ai-app.personalized-settings.gysk", "供应商库")}</div>,
      children: <SupplierList />
    },
  ];
  // 返回上一页
  const handleReturn = () => {
    history.back();
  };
  return (
    <Layout showUserInfo={false}>
      <div className={styles.personalizedSettings}>
        <div className={styles.content}>
          <div className={styles.title}>
            <div className={styles.icon} onClick={handleReturn}><ReturnArrowIcon width={16} height={16} fill={'#7C7F9A'} /></div>
            {/* {$t("global-1688-ai-app.personalized-settings.gts", "个性化设置")} */}
            {$t("global-1688-ai-app.personalized-settings.gysk", "供应商库")}

          </div>
          <SupplierList />
          {/* <Tabs className={styles.tabs} defaultActiveKey="supplier-library" items={items} onChange={onChange} /> */}
        </div>
      </div>
    </Layout>
  );
};


export const pageConfig = definePageConfig({
  title: '供应商库',
  spm: {
    spmB: 'personalized-settings-page',
  },
});

export default PersonalizedSettings;
import React, { useEffect, useState } from 'react';
import { definePageConfig } from 'ice';
import Layout from '../components/Layout';
import APIPackage from './components/APIPackage';
import APIPackageNote from './components/APIPackageNote';
import { getApiPackageAndServiceList } from '../../services';
import { APICard } from './components/APIPackage';
import styles from './index.module.scss';
import { $t } from '@/i18n';

const ApiList = () => {
  const [apiPackageAndServiceList, setApiPackageAndServiceList] = useState<any>(null);

  useEffect(() => {
    getApiPackageAndServiceList({}).then((res) => {
      setApiPackageAndServiceList(res.data);
    });
  }, []);

  return (
    <Layout
      layoutStyle={{ backgroundColor: '#F9F9FB' }}
      contentStyle={{ padding: '0' }}
    >
      <div className={styles.container}>
        <div className={styles.apiPackageCardSection}>
          <APICard packageData={apiPackageAndServiceList?.packageDetailModelList} />
        </div>
        <div className={styles.apiPackageNote}>
          <APIPackageNote />
        </div>
        <div className={styles.apiPackage}>
          <APIPackage
            packageData={apiPackageAndServiceList?.packageDetailModelList}
            serviceData={apiPackageAndServiceList?.serviceDetailModelList}
          />
        </div>
      </div>
    </Layout>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.seller-center.home.api-list.APIlist", "API列表"),
  spm: {
    spmB: 'seller-center-home-api-list',
  },
});

export default ApiList;
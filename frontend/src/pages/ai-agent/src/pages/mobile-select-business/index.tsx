import React from 'react';
import case1 from './usercase/case1';
import case2 from './usercase/case2';
import case3 from './usercase/case3';
import case4 from './usercase/case4';
import case5 from './usercase/case5';
import case6 from './usercase/case6';
import { useSearchParams, definePageConfig } from 'ice';
import Title from './components/Title';
import ProductSearchTable from './components/ProductSearchTable';
import SupplierSearchTable from './components/SupplierSearchTable';
import { SafeArea } from 'antd-mobile';
import GuideButton from '@/components/GuideButton';

import styles from './index.module.scss';
import MobileNavigator from '@/components/MobileNavigator';
import { $t } from '@/i18n';

const userCaseMap = {
  '6d4762b6a5': case1,
  '004b72d99b': case2,
  b1b29fee02: case3,
  '8d1edae850': case4,
  '3531c95646': case5,
  '30cc221f23': case6,
};

const MobileSelectBusiness = () => {
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get('__share_code__') || '';

  if (!shareCode) {
    return null;
  }

  const userCase = userCaseMap[shareCode];

  if (!userCase) {
    return null;
  }

  return (
    <div className={styles.selectBusinessContainer}>
      {/* <SafeArea position="top" /> */}
      <MobileNavigator sticky />
      <div className={styles.selectBusinessContent}>
        <div className={styles.userQuery}>
          {
            userCase?.rawData?.selectProviderRequestDTO?.searchImageUrl
              ? <img src={userCase?.rawData?.selectProviderRequestDTO?.searchImageUrl} alt="" />
              : null
          }
          {userCase?.rawData?.selectProviderRequestDTO?.query}
        </div>
        <Title title={userCase.title} />
        {
          userCase?.cardSubType === 'SELECT_PROVIDER_BY_OFFER_CARD'
            ? <ProductSearchTable rawData={userCase.rawData} /> : null
        }
        {
          userCase?.cardSubType === 'SELECT_PROVIDER_CARD'
            ? <SupplierSearchTable rawData={userCase.rawData} /> : null
        }

      </div>
      <GuideButton />
      <SafeArea position="bottom" />
    </div>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.mobile-select-business.axxsAgent", "遨虾-选商Agent"),
  spm: {
    spmB: 'mobile-select-business-page',
  },
});

export default MobileSelectBusiness;

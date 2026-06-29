import React from 'react';
import { SafeArea } from 'antd-mobile';
import { useSearchParams, definePageConfig } from 'ice';
import MobileNavigator from '@/components/MobileNavigator';
import Title from './components/Title';
import GuideButton from '@/components/GuideButton';
import InquiryReport from './components/InquiryReport';
import case1 from './usercase/case1';
import case2 from './usercase/case2';
import case3 from './usercase/case3';

import styles from './index.module.scss';
import { $t } from '@/i18n';

const userCaseMap = {
  '5c5f193bbc': case1,
  '5659edfb06': case2,
  'e8813a1b63': case3,
};

function MobileInquiry() {
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
    <div className={styles.mobileInquiryContainer}>
      {/* <SafeArea position="top" /> */}
      <MobileNavigator sticky />
      <div className={styles.mobileInquiryContent}>
        <Title title={userCase.title} />
        <InquiryReport data={userCase} />
      </div>
      <GuideButton />
      <SafeArea position="bottom" />
    </div>
  );
}

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.mobile-inquiry.axxpAgent", "遨虾-询盘Agent"),
  spm: {
    spmB: 'mobile-inquiry-page',
  },
});

export default MobileInquiry;

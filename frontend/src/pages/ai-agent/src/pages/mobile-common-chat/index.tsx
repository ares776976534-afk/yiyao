import React from 'react';
import { SafeArea } from 'antd-mobile';
import { useSearchParams, definePageConfig } from 'ice';
import MobileNavigator from '@/components/MobileNavigator';
import Title from './components/Title';
import GuideButton from '@/components/GuideButton';
import { Markdown } from '@/components/MobileMarkdown';
import case1 from './usercase/case1';
import case2 from './usercase/case2';
import case3 from './usercase/case3';
import case4 from './usercase/case4';
import case5 from './usercase/case5';
import case6 from './usercase/case6';

import styles from './index.module.scss';
import { $t } from '@/i18n';

const userCaseMap = {
  'fd6e58782c': case1,
  '69950bcb01': case2,
  '471d4086d9': case3,
  '650fa4c6d1': case4,
  '741f90c5c6': case5,
  'cb2034a683': case6,
};

const MobileSelectProduct = () => {
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
    <div className={styles.mobileCommonChatContainer}>
      {/* <SafeArea position="top" /> */}
      <MobileNavigator sticky />
      <div className={styles.mobileCommonChatContent}>
        <Title title={userCase.title} />
        <div>
          <Markdown text={userCase.rawData} />
        </div>
      </div>
      <GuideButton />
      <SafeArea position="bottom" />
    </div>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.mobile-common-chat.astg", "遨虾-咨询Agent"),
  spm: {
    spmB: 'mobile-common-chat-page',
  },
});

export default MobileSelectProduct;

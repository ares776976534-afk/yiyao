import React from 'react';
import { SafeArea } from 'antd-mobile';
import { useSearchParams, definePageConfig } from 'ice';
import MobileNavigator from '@/components/MobileNavigator';
import Title from './components/Title';
import PlatformReport from './components/PlatformReport';
import CountryReport from './components/CountryReport';
import ImproveReport from './components/ImproveReport';
import GeneralAgent from './components/GeneralAgent';
// import { platformAgent, countryAgent, improveAgent } from './utils';
import GuideButton from '@/components/GuideButton';
import { data as platformAgent1Data, blocks as platformAgent1Blocks } from './usercase/platformCase1';
import { data as platformAgent2Data, blocks as platformAgent2Blocks } from './usercase/platformCase2';
import { data as platformAgent3Data, blocks as platformAgent3Blocks } from './usercase/platformCase3';

import { data as generalAgentText1 } from './usercase/generalAgentCase1';
import { data as generalAgentText2 } from './usercase/generalAgentCase2';
import { data as generalAgentText3 } from './usercase/generalAgentCase3';
import styles from './index.module.scss';
import { $t } from '@/i18n';


const userCaseMap = {
  eee44b9278: {
    type: 'platformAgent',
    format: 'productAgent',
    data: platformAgent1Data,
    blocks: platformAgent1Blocks,
  },
  '986b6b4f92': {
    type: 'platformAgent',
    format: 'improveAgent',
    data: platformAgent2Data,
    blocks: platformAgent2Blocks,
  },
  '30339c1cb0': {
    type: 'platformAgent',
    format: 'platformAgent',
    data: platformAgent3Data,
    blocks: platformAgent3Blocks,
  },
  ffb2ed50c5: {
    type: 'generalAgent',
    data: generalAgentText1,
  },
  '22d7f75950': {
    type: 'generalAgent',
    data: generalAgentText2,
  },
  '2c754e5de1': {
    type: 'generalAgent',
    data: generalAgentText3,
  },
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

  const renderReport = () => {
    switch (userCase.type) {
      case 'platformAgent':
        return <PlatformReport data={userCase.data} format={userCase.format} blocks={userCase.blocks} />;
      // case 'countryAgent':
      //   return <CountryReport data={userCase.data} blocks={userCase.blocks} />;
      // case 'improveAgent':
      //   return <ImproveReport data={userCase.data} blocks={userCase.blocks} />;
      case 'generalAgent':
        return <GeneralAgent text={userCase.data} />;
      default:
        return null;
    }
    return null;
  };

  return (
    <div className={styles.mobileSelectProductContainer}>
      {/* <SafeArea position="top" /> */}
      <MobileNavigator sticky />
      <div className={styles.mobileSelectProductContent}>
        <Title title={userCase?.data?.title} />
        <div>
          {renderReport()}
        </div>
      </div>
      <GuideButton />
      <SafeArea position="bottom" />
    </div>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.mobile-select-product.axxpAgent", "遨虾-选品Agent"),
  spm: {
    spmB: 'mobile-select-product-page',
  },
});

export default MobileSelectProduct;

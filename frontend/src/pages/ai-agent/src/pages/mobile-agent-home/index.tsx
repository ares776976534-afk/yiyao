import { useState } from 'react';
import Agents from './components/Agents';
import { AgentType } from './enum';
import { SelectProductIcon, SelectSellerIcon, InquiryIcon, TalkIcon, StudioIcon, MobileLogoIcon } from '@/components/Icon';
import classNames from 'classnames';
import { definePageConfig } from 'ice';

import styles from './index.module.scss';
import Navigation from './components/Navigation';
import Framework from '../mobile/components/framework';

// import { IconPreview } from '@/components/icon-preview';
import PartnerFooter from './components/PartnerFooter';
import { $t } from '@/i18n';

const navigationItems = [
  {
    id: AgentType.SELECT_PRODUCT,
    icon: <SelectProductIcon width="4.8vw" height="4.8vw" />,
    text: $t("global-1688-ai-app.mobile-agent-home.xp", "选品"),
  },
  {
    id: AgentType.SELECT_SELLER,
    icon: <SelectSellerIcon width="4.8vw" height="4.8vw" />,
    text: $t("global-1688-ai-app.mobile-agent-home.zs", "找商"),
  },
  {
    id: AgentType.MATERIAL,
    icon: <StudioIcon width="4.8vw" height="4.8vw" />,
    text: $t("global-1688-ai-app.mobile-agent-home.sc", "素材"),
  },
  {
    id: AgentType.INQUIRY,
    icon: <InquiryIcon width="4.8vw" height="4.8vw" />,
    text: $t("global-1688-ai-app.mobile-agent-home.xp.2", "询盘"),
  },
  {
    id: AgentType.COMMON_CHAT,
    icon: <TalkIcon width="4.8vw" height="4.8vw" />,
    text: $t("global-1688-ai-app.mobile-agent-home.consultation", "咨询"),
  },
];

const MobileAgentHome = () => {
  const [activeAgent, setActiveAgent] = useState(AgentType.MATERIAL);


  const handleNavigationClick = (id) => {
    setActiveAgent(id);
  };

  return (
    <div className={styles.mobileAgentHome}>
      {/* <IconPreview /> */}
      {/* <div className={styles.bgLeftTop}>
        <img src="https://gw.alicdn.com/imgextra/i4/O1CN01UucVZ91xfm2sQWQwj_!!6000000006471-2-tps-1236-744.png" alt="" />
      </div>
      <div className={styles.bgRightBottom}>
        <img src="https://gw.alicdn.com/imgextra/i2/O1CN01uzS2Ie1J7Le0X52NS_!!6000000000981-2-tps-1300-987.png" alt="" />
      </div> */}
      <div className={styles.titleContainer}>
        {/* <span className={styles.titleText}>
          全天候
        </span>
        <span className={classNames(styles.titleText, styles.titleTextAi)}>
          AI
        </span> */}
        <div className={styles.titleText}>{$t("global-1688-ai-app.mobile-agent-home.kjdssy", "跨境电商生意")}</div>
        <div className={styles.titleTextAgentContainer}>
          <span className={classNames(styles.titleText, styles.titleTextAgent)}>Agent</span>
          <span className={styles.titleTextFree}>{$t("global-1688-ai-app.mobile-agent-home.limitedtimeFree", "限时免费")}</span>
        </div>
      </div>
      <div className={styles.agentContent}>
        <div className={styles.navigationContainer}>
          <Navigation
            items={navigationItems}
            activeId={activeAgent}
            onItemClick={handleNavigationClick}
          />
        </div>
        <div className={styles.agentsContainer}>
          <Agents type={activeAgent} />
        </div>
      </div>

      {/* <div>
        <div>合作伙伴</div>
        <div><img src="xx" alt="" /></div>
        <div />
        <div><img src="xx" alt="" /></div>
        <div />
        <div><img src="xx" alt="" /></div>
      </div>
      <div>

      </div> */}
      <PartnerFooter />
    </div>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.mobile-agent-home.ase", "遨虾-跨境电商生意Agent"),
  spm: {
    spmB: 'mobile-agent-home-page',
  },
});
export default function Home() {
  return (
    <Framework children={<MobileAgentHome />} type="home" />
  );
}

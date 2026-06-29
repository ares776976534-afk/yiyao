import React, { useState } from "react";
import { useSearchParams } from 'ice';
import styles from "./index.module.css";
import { definePageConfig } from "ice";
import classnames from 'classnames';
import Navigation from "./components/Navigation";
import Layout from "../select-product/components/Layout";
import {
  SelectProductIcon,
  SelectSellerIcon,
  StudioIcon,
  InquiryIcon,
  TalkIcon,
} from "@/components/Icon";
import Agents, { AgentType } from "./components/Agents";
import Title from "./components/Title";
import { commonRecord } from "@/utils/log";
import { $t } from "@/i18n";
import Copyright from "./components/Copyright";
import BookmarkTip from "./components/BookmarkTip";
import UserTour from "./components/UserTour";
import { StoreProvider } from "@/stores/context";
import { storeServices } from "@/services/studio/storeServices";
import { LANG_MAPPING, DEFAULT_LANG } from "@/i18n/constants";
import Herder from "./components/Herder";

export const HeaderLogo = (props: { className?: string }) => {
  const { className } = props;
  return DEFAULT_LANG === LANG_MAPPING.zh_CN ? (
    <img
      src="https://img.alicdn.com/imgextra/i1/O1CN01GgyTaK1gOy2rYnyKS_!!6000000004133-2-tps-524-172.png"
      alt="logo"
      className={classnames(styles.headerLogo, className)}
    />
  ) : (
    <img
      src="https://img.alicdn.com/imgextra/i1/O1CN01E6XYvu1yUc1150lSM_!!6000000006582-55-tps-268-38.svg"
      alt="logo"
      className={classnames(styles.headerLogoGlobal, className)}
    />
  );
};

export const AgentHomeContent = ({
  children,
  title,
  colorTitle,
}: {
  children: React.ReactNode;
  title?: string;
  colorTitle?: string;
}) => {
  return (
    <div className={styles.container}>
      <span className={styles.topLeftCorner} />
      <span className={styles.topRightCorner} />
      <span className={styles.bottomLeftCorner} />
      <span className={styles.bottomRightCorner} />
      <div className={styles.agentHomeContent}>
        {title && (
          <div className={styles.titleContainer}>
            {colorTitle && (
              <span className={styles.headerTextColor}>{colorTitle}</span>
            )}
            <Title>{title}</Title>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

const AiPlatform: React.FC = () => {
  const navigationItems = [
    {
      id: AgentType.SELECT_PRODUCT,
      icon: <SelectProductIcon />,
      text: $t("global-1688-ai-app.agent-home.xp", "选品"),
    },
    {
      id: AgentType.SELECT_SELLER,
      icon: <SelectSellerIcon />,
      text: $t("global-1688-ai-app.agent-home.zs", "找商"),
    },
    {
      id: AgentType.MATERIAL,
      icon: <StudioIcon />,
      text: $t("global-1688-ai-app.agent-home.sc", "素材"),
    },
    {
      id: AgentType.INQUIRY,
      icon: <InquiryIcon />,
      text: $t("global-1688-ai-app.agent-home.xp.2", "询盘"),
    },
    {
      id: AgentType.COMMON_CHAT,
      icon: <TalkIcon />,
      text: $t("global-1688-ai-app.agent-home.consultation", "咨询"),
    },
  ];

  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  // 根据 URL 参数 type 获取对应的初始 AgentType
  const getInitialAgent = () => {
    if (typeParam && Object.values(AgentType).includes(typeParam as AgentType)) {
      return typeParam as AgentType;
    }
    return AgentType.MATERIAL;
  };

  const [activeAgent, setActiveAgent] = useState<AgentType>(getInitialAgent);

  const handleNavigationClick = (itemId: string) => {
    setActiveAgent(itemId as AgentType);
    commonRecord(
      `${navigationItems.find((item) => item.id === itemId)?.text}button`
    );
  };

  return (
    <Layout showBanner>
      <StoreProvider services={storeServices}>
        <UserTour />
        <BookmarkTip />
      </StoreProvider>
      <AgentHomeContent>
        <Herder />
        <div className={styles.content}>
          <Navigation
            items={navigationItems}
            activeId={activeAgent}
            onItemClick={handleNavigationClick}
          />
          <div className={styles.agentsContainer}>
            <Agents type={activeAgent as AgentType} />
          </div>
          <Copyright />
        </div>
      </AgentHomeContent>
    </Layout>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.agent-home.ajA", "遨虾-跨境电商生意Agent"),
  spm: {
    spmB: "agent-home-page",
  },
});

export default AiPlatform;

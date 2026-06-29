import React from "react";
import { ArrowIcon } from "@/components/Icon";
import {
  IconRank,
  IconAgent,
  IconClaw,
  IconSKill,
  IconOpenPlatform,
  IconSettings,
  IconInsight,
  IconSourcing,
  IconDesign,
  IconInquiry,
  IconChat,
} from "@/components/Icon/Layout";
import {
  HomeLineIcon,
  HomeLineActionIcon,
} from '@/components/Icon';
import AgentLayout from "@/components/AgentLayout";
import { useNavigateWithScroll } from "@/hooks/useNavigateWithScroll";
import { useLocation } from "ice";
import { LOG_KEYS } from "@/utils/logConfig";
import styles from "./index.module.css";
import { $t } from "@/i18n";

const getSidebarLogKeys = (pathname: string) => {
  if (pathname === "/home") return LOG_KEYS.AGENT_HOME.SIDEBAR;
  return LOG_KEYS.SELECT_PRODUCT_HOME.SIDEBAR;
};

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  contentStyle?: React.CSSProperties;
  sessionId?: string;
  initFn?: () => void;
  showUserInfo?: boolean;
  showBanner?: boolean;
  onBack?: any;
}

// Agent 子菜单配置
const agentChildrenConfig = [
  // {
  //   key: $t("global-1688-ai-app.select-product.Layout.home", "首页"),
  //   label: $t("global-1688-ai-app.select-product.Layout.home", "首页"),
  //   path: '/',
  //   matchPaths: ['', '/', '/home'],
  //   icons: { default: HomeLineIcon, active: HomeLineActionIcon },
  //   className: styles.hideMenu,
  // },
  {
    key: $t("global-1688-ai-app.select-product.Layout.xp", "选品"),
    label: $t("global-1688-ai-app.select-product.Layout.xp", "选品"),
    path: "/insight",
    matchPaths: [
      "/select-product",
      "/insight",
      "/select-product/improve-agent",
      "/select-product/platform-agent",
      "/select-product/country-agent",
      "/select-product/general-agent",
    ],
    icons: { default: IconInsight },
  },
  {
    key: $t("global-1688-ai-app.select-product.Layout.zs", "找商"),
    label: $t("global-1688-ai-app.select-product.Layout.zs", "找商"),
    path: "/sourcing",
    matchPaths: ["/sourcing"],
    icons: { default: IconSourcing },
  },
  {
    key: $t("global-1688-ai-app.select-product.Layout.sc", "素材"),
    label: $t("global-1688-ai-app.select-product.Layout.sc", "素材"),
    path: "/design",
    matchPaths: ["/design"],
    icons: { default: IconDesign },
  },
  {
    key: $t("global-1688-ai-app.select-product.Layout.xp.2", "询盘"),
    label: $t("global-1688-ai-app.select-product.Layout.xp.3", "询盘"),
    path: "/inquiry",
    matchPaths: ["/inquiry", "/inquiry/"],
    icons: { default: IconInquiry },
  },
  {
    key: $t("global-1688-ai-app.select-product.Layout.consultation", "咨询"),
    label: $t("global-1688-ai-app.select-product.Layout.consultation", "咨询"),
    path: "/chat",
    matchPaths: ["/chat", "/chat/"],
    icons: { default: IconChat },
  },
];

const AGENT_MATCH_PATHS = [
  "/",
  "/home",
  "/select-product",
  "/insight",
  "/sourcing",
  "/design",
  "/inquiry",
  "/chat",
  "/select-product/improve-agent",
  "/select-product/platform-agent",
  "/select-product/country-agent",
  "/select-product/general-agent",
];

const menuConfig = [
  { type: "divider" },
  {
    key: "hotRanking",
    label: $t("global-1688-ai-app.select-product.Layout.hotRanking", "热榜"),
    path: "/ranking",
    matchPaths: ["/ranking"],
    icons: { default: IconRank },
  },
  {
    key: "agent",
    label: "Agent",
    path: "/home",
    matchPaths: AGENT_MATCH_PATHS,
    icons: { default: IconAgent },
    children: agentChildrenConfig,
  },
  { type: "divider" },
  {
    key: "claw",
    label: $t("global-1688-ai-app.select-product.Layout.claw", "Claw"),
    path: "/claw",
    matchPaths: [/^\/claw/],
    icons: { default: IconClaw },
  },
  {
    key: "skillhub",
    label: $t("global-1688-ai-app.select-product.Layout.skillhub", "社区"),
    path: "https://skill.alphashop.cn",
    target: "_blank",
    matchPaths: [],
    icons: { default: IconSKill },
  },
];

// 检查路径是否匹配
const isPathMatch = (currentPath: string, matchPaths: (string | RegExp)[]) => {
  return matchPaths.some((path) =>
    path instanceof RegExp ? path.test(currentPath) : currentPath === path,
  );
};

// 生成子菜单 Popover 内容
const buildChildrenPopover = (
  childrenConfig: typeof agentChildrenConfig,
  currentPath: string,
  onNavigate: (path: string) => void,
) => (
  <div className={styles.agentSubMenu}>
    {childrenConfig.map((child) => {
      const isChildActive = isPathMatch(currentPath, child.matchPaths);
      const ChildIcon = child.icons?.default;
      return (
        <div
          key={child.key}
          className={`${styles.agentSubMenuItem} ${
            isChildActive ? styles.agentSubMenuItemActive : ""
          }`}
          onClick={() => onNavigate(child.path)}
        >
          {ChildIcon && <ChildIcon />}
          <span>{child.label}</span>
        </div>
      );
    })}
  </div>
);

// 生成菜单项
const createMenuItem = (
  config: any,
  currentPath: string,
  collapsed: boolean,
  onNavigate: (path: string) => void,
) => {
  if (config.type === "divider") return { type: "divider" as const };

  const {
    key,
    label,
    path,
    target,
    matchPaths,
    icons,
    showArrow,
    children: childrenConfig,
  } = config;
  const isActive = isPathMatch(currentPath, matchPaths);
  const iconValue = icons?.default;
  const IconComponent =
    typeof iconValue === "string" ? () => <img src={iconValue} /> : iconValue;

  return {
    key,
    isActive,
    icon: (
      <div className={styles.menuItemIcon}>
        {key === "hotRanking" && collapsed && (
          <img
            className={styles.hotRankingIcon}
            src="https://img.alicdn.com/imgextra/i4/O1CN014LFCi01cispN93FV6_!!6000000003635-55-tps-28-12.svg"
            alt="hotRanking"
          />
        )}
        <IconComponent />
      </div>
    ),
    label: (
      <div
        className={styles.menuItemLabel}
        style={isActive ? { fontWeight: 500 } : {}}
      >
        <span>{label}</span>
        {key === "hotRanking" && (
          <img
            className={styles.hotRankingLabelIcon}
            src="https://img.alicdn.com/imgextra/i4/O1CN014LFCi01cispN93FV6_!!6000000003635-55-tps-28-12.svg"
            alt="hotRanking"
          />
        )}
        {showArrow && !collapsed && (
          <span className={styles.menuItemArrow}>
            <ArrowIcon color="#BBBDCA" />
          </span>
        )}
      </div>
    ),
    popoverLabel: label,
    popoverContent: childrenConfig?.length
      ? buildChildrenPopover(childrenConfig, currentPath, onNavigate)
      : undefined,
    data: { path, ...(target && { target }) },
  };
};

const getMenuItems = (
  currentPath: string,
  collapsed: boolean,
  onNavigate: (path: string) => void,
) => {
  return menuConfig.map((config) =>
    createMenuItem(config, currentPath, collapsed, onNavigate),
  );
};

// 底部菜单配置
const footerConfig = [
  {
    key: "platform",
    label: $t("global-1688-ai-app.select-product.Layout.kfpt", "开放平台"),
    icon: IconOpenPlatform,
    path: "/about-us",
    target: "_blank",
  },
  {
    key: "settings",
    label: $t("global-1688-ai-app.select-product.Layout.settings", "设置"),
    icon: IconSettings,
  },
];

const footerItems = footerConfig.map(
  ({ key, label, icon: Icon, path, target }) => ({
    key,
    icon: <Icon />,
    label: (
      <div className={styles.footerItemLabel}>
        <span>{label}</span>
      </div>
    ),
    ...(path && { data: { path, ...(target && { target }) } }),
  }),
);

const Layout = ({
  children,
  title,
  sessionId,
  initFn,
  showUserInfo = true,
  showBanner = false,
  onBack,
  ...props
}: LayoutProps) => {
  const navigate = useNavigateWithScroll();
  const location = useLocation();
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/home");
    }
  };

  const handleSubMenuNavigate = (path: string) => {
    navigate(path, { replace: true });
  };

  return (
    <AgentLayout
      menuItems={(collapsed) =>
        getMenuItems(location.pathname, collapsed, handleSubMenuNavigate)
      }
      footerMenuItems={footerItems}
      onBack={handleBack}
      title={title}
      sessionId={sessionId}
      initFn={initFn}
      showUserInfo={showUserInfo}
      showBanner={showBanner}
      sidebarLogKeys={getSidebarLogKeys(location.pathname)}
      {...props}
    >
      {children}
    </AgentLayout>
  );
};

export default Layout;

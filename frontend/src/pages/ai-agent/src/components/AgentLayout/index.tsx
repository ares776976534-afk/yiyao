import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Layout, Popover, message } from "antd";
import styles from "./index.module.css";
import { useLocation, useSpm } from "ice";
import {
  IconOpenPlatform,
  IconSettings,
  IconToggle,
} from "@/components/Icon/Layout";
import Navigation from "@/components/ChatFlow/Navigation";
import UsercenterModal from "./components/UsercenterModal";
import PromoBanner, { PROMO_BANNER_HEIGHT } from "./components/PromoBanner";
import LanguageSettings from "@/components/ChatFlow/LanguageSettings";
import log, { commonRecord } from "@/utils/log";
import { LOG_KEYS } from "@/utils/logConfig";
import { useNavigateWithScroll } from "@/hooks/useNavigateWithScroll";
import { $t } from "@/i18n";
import { StoreProvider } from "@/stores/context";
import { storeServices } from "@/services/studio/storeServices";
import { useFullScreen } from "@/hooks/useUtils";
import { event_setLanguage } from "@/components/studio/event";
import CookieConfirm from "@/components/CookieConfirm";

type TypeSidebarLogKeys =
  | typeof LOG_KEYS.AGENT_HOME.SIDEBAR
  | typeof LOG_KEYS.SELECT_PRODUCT_HOME.SIDEBAR;

const { Content, Sider } = Layout;

const SIDER_WIDTH = 180;
const SIDER_COLLAPSED_WIDTH = 60;
const BRAND_LOGO_URL =
  "https://img.alicdn.com/imgextra/i2/O1CN01rPylwe27dcMYgB01X_!!6000000007820-55-tps-36-36.svg";
const BRAND_TEXT_URL =
  "https://img.alicdn.com/imgextra/i3/O1CN010ibttM1TaKtV0cY4d_!!6000000002398-55-tps-55-24.svg";

type TypeMenuItem = {
  type?: "divider";
  key?: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  popoverLabel?: React.ReactNode;
  popoverContent?: React.ReactNode;
  isActive?: boolean;
  data?: { path?: string; target?: string };
};

type AgentLayoutProps = {
  menuItems: TypeMenuItem[] | ((collapsed: boolean) => TypeMenuItem[]);
  footerMenuItems?: any[];
  onBack?: () => void;
  title?: string;
  children: React.ReactNode;
  checkAccessPermission?: boolean;
  contentStyle?: React.CSSProperties;
  sessionId?: string;
  initFn?: () => void;
  showUserInfo?: boolean;
  showBanner?: boolean;
  indexPage?: string;
  sidebarLogKeys?: TypeSidebarLogKeys;
};

export const postAgentLayoutEvent = ({
  key,
  data,
}: {
  key: string;
  data?: any;
}) => {
  if (window.parent) {
    window.parent.postMessage(
      {
        key: `agentLayout::${key}`,
        data,
      },
      "*",
    );
  }
};
const footerConfig = [
  {
    key: "platform",
    label: $t("global-1688-ai-app.AgentLayout.kfpt", "开放平台"),
    icon: IconOpenPlatform,
    path: "/about-us",
    target: "_blank",
  },
  {
    key: "settings",
    label: $t("global-1688-ai-app.AgentLayout.settings", "设置"),
    icon: IconSettings,
  },
];

export const listenAgentLayoutEvent = (event, callback) => {
  const key = event?.data?.key?.startsWith("agentLayout::")
    ? event.data.key.split("agentLayout::")[1]
    : null;
  if (key) {
    callback(key, event.data?.data);
  }
};

const handleGetCollapsedStore = () => {
  const collapsed = localStorage.getItem("agentLayoutCollapsed");
  if (collapsed) {
    return collapsed === "true";
  }
  return true;
};

const PATH_TO_LOG_KEY: Record<string, keyof TypeSidebarLogKeys> = {
  "/": "HOME",
  "/home": "HOME",
  "/insight": "INSIGHT",
  "/select-product": "INSIGHT",
  "/sourcing": "SOURCING",
  "/design": "DESIGN",
  "/commodity-material": "DESIGN",
  "/inquiry": "INQUIRY",
  "/chat": "CHAT",
  "/ranking": "HOT_RANKING",
};

const App: React.FC<AgentLayoutProps> = ({
  children,
  title,
  menuItems = [],
  footerMenuItems = [],
  onBack,
  checkAccessPermission = true,
  contentStyle = {},
  sessionId,
  initFn,
  showUserInfo = true,
  showBanner = false,
  indexPage = "/home",
  sidebarLogKeys,
}) => {
  const [_showBanner, _setShowBanner] = useState(showBanner);
  const [collapsed, setCollapsed] = useState(handleGetCollapsedStore);
  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("agentLayoutCollapsed", String(next));
      return next;
    });
  }, []);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState("account");
  const navigate = useNavigateWithScroll();
  const location = useLocation();
  const fullScreen = useFullScreen();
  const [spmA, spmB] = useSpm();

  const handleToIndex = () => {
    if (sidebarLogKeys?.LOGO) {
      log.record(sidebarLogKeys.LOGO, "CLK");
    }
    navigate(indexPage);
  };

  const actualMenuItems = useMemo(() => {
    return typeof menuItems === "function" ? menuItems(collapsed) : menuItems;
  }, [menuItems, collapsed]);

  const getSelectedKeyByPath = useCallback(
    (pathname: string) => {
      const pathMatchRules = {
        "select-product": ["/home", "/select-product/"],
        "commodity-material": ["/commodity-material", "/commodity-material/"],
      };

      const matchedItem = actualMenuItems.find((item) => {
        if (!item.data?.path) return false;
        if (item.data.path === pathname) return true;

        const matchPaths = item.key ? pathMatchRules[item.key] : undefined;
        return matchPaths?.some(
          (path) => pathname === path || pathname.indexOf(path) !== -1,
        );
      });

      return matchedItem?.key;
    },
    [actualMenuItems],
  );

  const sidebarExposedRef = useRef(false);
  useEffect(() => {
    if (fullScreen || !sidebarLogKeys || sidebarExposedRef.current) return;
    sidebarExposedRef.current = true;
    if (sidebarLogKeys.LOGO) {
      log.record(sidebarLogKeys.LOGO, "EXP");
    }
    actualMenuItems.forEach(
      (item: { data?: { path?: string }; type?: string }) => {
        if (item.type === "divider" || !item.data?.path) return;
        const logKeyName = PATH_TO_LOG_KEY[item.data.path];
        if (logKeyName && sidebarLogKeys[logKeyName]) {
          log.record(sidebarLogKeys[logKeyName], "EXP");
        }
      },
    );
    if (sidebarLogKeys.SET) {
      log.record(sidebarLogKeys.SET, "EXP");
    }
    if (sidebarLogKeys.OPENPLATFORM) {
      log.record(sidebarLogKeys.OPENPLATFORM, "EXP");
    }
  }, [fullScreen, sidebarLogKeys, actualMenuItems]);

  const handleMenuItemClick = useCallback(
    (item: TypeMenuItem) => {
      const { path, target } = item.data || {};
      if (!path) return;

      const logKeyName = PATH_TO_LOG_KEY[path];
      if (sidebarLogKeys && logKeyName && sidebarLogKeys[logKeyName]) {
        log.record(sidebarLogKeys[logKeyName], "CLK");
      }
      commonRecord(`菜单-${item.key}`);
      if (target) {
        // 检查 path 是否已包含 spm 参数
        const url = new URL(path, window.location.origin);

        if (!url.searchParams.has("spm") && spmA && spmB) {
          // 如果没有 spm 参数，追加 spmA 和 spmB
          url.searchParams.append("spm", `${spmA}.${spmB}`);
        }

        window.open(url.toString(), target);
      } else {
        setSelectedKeys([item.key || ""]);
        navigate(path, { replace: true });
      }
    },
    [sidebarLogKeys, navigate, spmA, spmB],
  );

  const handleFooterMenuClick = (menuInfo) => {
    const { item = {}, key } = menuInfo;
    switch (key) {
      case "settings":
        if (sidebarLogKeys?.SET) {
          log.record(sidebarLogKeys.SET, "CLK");
        }
        commonRecord("菜单-设置");
        setIsModalOpen(true);
        setSelected("user_settings");
        break;
      case "platform":
        if (sidebarLogKeys?.OPENPLATFORM) {
          log.record(sidebarLogKeys.OPENPLATFORM, "CLK");
        }
        window.open(item.path, item.target);
        break;
      default:
        window.open(item.path, item.target);
        break;
    }
  };

  const handleSetLanguage = () => {
    message.loading($t("global-1688-ai-app.page.prepareReload", "即将刷新页面..."));
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  useEffect(() => {
    window.addEventListener(event_setLanguage, handleSetLanguage);
    return () => {
      window.removeEventListener(event_setLanguage, handleSetLanguage);
    };
  }, []);

  // 监听路由变化，更新选中状态
  useEffect(() => {
    const currentKey = getSelectedKeyByPath(location.pathname);
    currentKey && setSelectedKeys([currentKey]);
  }, [location.pathname, getSelectedKeyByPath]);

  return (
    <StoreProvider services={storeServices}>

      <Layout
        style={{
          height: "100vh",
          ["--promo-banner-offset" as string]: _showBanner
            ? `${PROMO_BANNER_HEIGHT}px`
            : "0px",
        }}
      >
        {_showBanner && <PromoBanner onClose={() => _setShowBanner(false)} />}
        <Layout>
          {!fullScreen && (
            <Sider
              collapsible
              collapsed={collapsed}
              onCollapse={toggleCollapsed}
              trigger={null}
              width={SIDER_WIDTH}
              collapsedWidth={SIDER_COLLAPSED_WIDTH}
              theme="light"
              className={`${styles.sider} ${collapsed ? styles.collapsedSider : styles.siderExpanded
                }`}
            >
              <div className={styles.siderHeader}>
                <div className={styles.brandLogo} onClick={handleToIndex}>
                  <img
                    src={BRAND_LOGO_URL}
                    alt="Logo"
                    className={styles.brandLogoIcon}
                  />
                  {!collapsed && (
                    <img
                      src={BRAND_TEXT_URL}
                      alt="Brand"
                      className={styles.brandTextIcon}
                    />
                  )}
                </div>
                <Popover
                  content={
                    <div className={styles.menuPopoverSimple}>
                      {collapsed
                        ? $t("global-1688-ai-app.AgentLayout.zkcbl", "展开侧边栏")
                        : $t(
                          "global-1688-ai-app.AgentLayout.sqcbl",
                          "收起侧边栏",
                        )}
                    </div>
                  }
                  placement="right"
                  trigger="hover"
                  overlayClassName={styles.menuPopover}
                  arrow={false}
                >
                  <div
                    className={styles.collapseToggle}
                    onClick={toggleCollapsed}
                  >
                    <IconToggle
                      className={`${styles.collapseToggleIcon} ${collapsed ? styles.collapseToggleIconRotate : ""
                        }`}
                    />
                  </div>
                </Popover>
              </div>

              <div className={styles.siderContent}>
                <ul className={styles.menuList}>
                  {actualMenuItems.map((item, idx) => {
                    if (item.type === "divider") {
                      return (
                        <li
                          key={`divider-${idx}`}
                          className={styles.menuDivider}
                        />
                      );
                    }

                    const isSelected = selectedKeys.includes(item.key || "");
                    const active = item.isActive || isSelected;

                    const innerEl = (
                      <li
                        className={`${styles.menuItem} ${active ? styles.menuItemActive : ""
                          }`}
                        onClick={() => handleMenuItemClick(item)}
                      >
                        {item.icon}
                        {!collapsed && item.label}
                      </li>
                    );

                    const hasPopoverContent = !!item.popoverContent;

                    if (!collapsed && !hasPopoverContent) {
                      return (
                        <React.Fragment key={item.key}>{innerEl}</React.Fragment>
                      );
                    }

                    const popContent = item.popoverContent || (
                      <div className={styles.menuPopoverSimple}>
                        {item.popoverLabel ?? item.label}
                      </div>
                    );

                    return (
                      <Popover
                        key={item.key}
                        content={popContent}
                        placement={hasPopoverContent ? "rightTop" : "right"}
                        trigger="hover"
                        overlayClassName={
                          hasPopoverContent
                            ? styles.menuPopoverList
                            : styles.menuPopover
                        }
                        arrow={false}
                      >
                        {innerEl}
                      </Popover>
                    );
                  })}
                </ul>
              </div>

              <ul className={`${styles.menuList} ${styles.siderFooter}`}>
                {footerConfig.map((item) => {
                  const footerEl = (
                    <li
                      className={`${styles.menuItem} ${styles.footerMenuItem}`}
                      onClick={() => {
                        handleFooterMenuClick({
                          item: { path: item.path, target: item.target },
                          key: item.key,
                        });
                      }}
                    >
                      <item.icon />
                      {!collapsed && <span>{item.label}</span>}
                    </li>
                  );

                  if (!collapsed) {
                    return (
                      <React.Fragment key={item.key}>{footerEl}</React.Fragment>
                    );
                  }

                  return (
                    <Popover
                      key={item.key}
                      content={
                        <div className={styles.menuPopoverSimple}>
                          {item.label}
                        </div>
                      }
                      placement="right"
                      trigger="hover"
                      overlayClassName={styles.menuPopover}
                      arrow={false}
                    >
                      {footerEl}
                    </Popover>
                  );
                })}
              </ul>
            </Sider>
          )}
          <Layout>
            <Content
              style={{
                position: "relative",
                backgroundColor: "#f9f9fc",
                overflow: "auto",
                ...contentStyle,
              }}
            >
              <div
                id="agent-layout-sider"
                className={styles.agentLayoutSiderHistoryHolder}
              />
              {title && !fullScreen && (
                <Navigation title={title} onBack={onBack} sessionId={sessionId} />
              )}
              {children}
            </Content>
          </Layout>
          <UsercenterModal
            selected={selected}
            isModalOpen={isModalOpen}
            handleCancel={() => setIsModalOpen(false)}
          />
          {showUserInfo && <LanguageSettings />}
        </Layout>
        <CookieConfirm />
      </Layout>
    </StoreProvider>
  );
};

export default App;

import React, { useState } from "react";
import type {
  TypeAlphaClawSettingsPanelProps,
  TypeAlphaClawSettingsMenuId,
  TypePanelView,
  TypeCreditsRecord,
} from "./types";
import styles from "./index.module.scss";
import BasicTab from "./BasicTab";
import PersonalTab from "./PersonalTab";
import AuthTab from "./AuthTab";
import ModelTab from "./ModelTab";
import ChatToolTab from "./ChatToolTab";
import CreditsTab from "./CreditsTab";
import CreditsPurchaseTab from "./CreditsPurchaseTab";
import CreditsDetailView from "./CreditsDetailView";
import TerminalView from "./TerminalView";

const MENU_ICONS: Record<TypeAlphaClawSettingsMenuId | "chatTool", string> = {
  basic:
    "https://img.alicdn.com/imgextra/i4/O1CN01gm03bv1Lyawc88Cgu_!!6000000001368-55-tps-16-16.svg",
  personal:
    "https://img.alicdn.com/imgextra/i2/O1CN01adWQ8E1HK3QJx60yH_!!6000000000738-55-tps-16-16.svg",
  auth: "https://img.alicdn.com/imgextra/i4/O1CN01uYFyfu28nywHV8ab3_!!6000000007978-55-tps-16-16.svg",
  model:
    "https://img.alicdn.com/imgextra/i1/O1CN01PZm8hC1S9wS2Rq9Hl_!!6000000002205-55-tps-16-16.svg",
  chatTool:
    "https://img.alicdn.com/imgextra/i1/O1CN01WRbFtg1Q5F9mrlBsl_!!6000000001924-55-tps-16-16.svg",
  credits:
    "https://gw.alicdn.com/imgextra/i4/O1CN010raV4u1YQmiVbeVYT_!!6000000003054-55-tps-16-16.svg",
  creditsPurchase:
    "https://gw.alicdn.com/imgextra/i4/O1CN010raV4u1YQmiVbeVYT_!!6000000003054-55-tps-16-16.svg",
};

const CREDITS_LIST_MOCK: TypeCreditsRecord[] = [
  { callTime: "2026-03-06 15:00:00", amount: -230 },
  { callTime: "2026-03-06 15:00:00", amount: -230 },
  { callTime: "2026-03-06 15:00:00", amount: -230 },
  { callTime: "2026-03-06 15:00:00", amount: -230 },
  { callTime: "2026-03-06 15:00:00", amount: -230 },
  { callTime: "2026-03-06 15:00:00", amount: -230 },
  { callTime: "2026-03-06 15:00:00", amount: -230 },
  { callTime: "2026-03-06 15:00:00", amount: -230 },
  { callTime: "2026-03-06 15:00:00", amount: -230 },
  { callTime: "2026-03-06 15:00:00", amount: -230 },
];

const CREDITS_TOTAL_PAGES = 100;

const AlphaClawSettingsPanel: React.FC<TypeAlphaClawSettingsPanelProps> = ({
  sessionId = "",
  onClose,
  defaultActiveMenu,
}) => {
  const [activeMenu, setActiveMenu] = useState<TypeAlphaClawSettingsMenuId>(
    () => defaultActiveMenu ?? "basic",
  );
  const [panelView, setPanelView] = useState<TypePanelView>("settings");
  const [creditsPage, setCreditsPage] = useState(1);
  const [terminalUrl, setTerminalUrl] = useState<string | null>(null);

  const menuItems: {
    id: TypeAlphaClawSettingsMenuId | "chatTool";
    label: string;
  }[] = [
    { id: "basic", label: "基础操作" },
    { id: "personal", label: "个性化设定" },
    { id: "auth", label: "账号授权" },
    { id: "model", label: "模型设置" },
    // { id: "credits", label: "积分使用" },
    // { id: "creditsPurchase", label: "积分购买" },
    { id: "chatTool", label: "聊天工具绑定" },
  ];

  if (panelView === "creditsDetail") {
    return (
      <div className={styles.container}>
        <CreditsDetailView
          creditsList={CREDITS_LIST_MOCK ?? []}
          creditsPage={creditsPage}
          creditsTotalPages={CREDITS_TOTAL_PAGES}
          onPageChange={setCreditsPage}
          onBack={() => setPanelView("settings")}
        />
      </div>
    );
  }

  if (panelView === "terminal") {
    return (
      <div className={styles.container}>
        <TerminalView
          terminalUrl={terminalUrl ?? null}
          onBack={() => setPanelView("settings")}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>AlphaClaw</span>
        </div>
        <div className={styles.menuList}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              role="button"
              className={
                activeMenu === item.id
                  ? styles.menuItemActive
                  : item.id === "chatTool"
                  ? styles.menuItemLast
                  : styles.menuItem
              }
              onClick={() => setActiveMenu(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveMenu(item.id);
                }
              }}
            >
              <div
                className={`${styles.menuContent} ${
                  activeMenu === item.id ? styles.active : ""
                }`}
              >
                <div
                  className={styles.menuItemIcon}
                  style={{ maskImage: `url(${MENU_ICONS[item.id]})` }}
                />
                <span className={styles.menuText}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          {activeMenu === "chatTool" ? (
            <>
              <span className={styles.contentTitle}>聊天工具绑定</span>
              <a
                className={styles.chatToolTutorialLink}
                href="https://alidocs.dingtalk.com/i/nodes/oP0MALyR8kzGnoOwFQqbNwxdJ3bzYmDO"
                target="_blank"
                rel="noopener noreferrer"
              >
                查看教程
              </a>
            </>
          ) : activeMenu === "model" ? (
            <>
              <span className={styles.contentTitle}>模型设置</span>
              <a
                className={styles.chatToolTutorialLink}
                href="https://alidocs.dingtalk.com/i/nodes/oP0MALyR8kzGnoOwFQqbNwxdJ3bzYmDO"
                target="_blank"
                rel="noopener noreferrer"
              >
                查看教程
              </a>
            </>
          ) : activeMenu === "credits" ? (
            <span className={styles.contentTitle}>积分使用</span>
          ) : activeMenu === "creditsPurchase" ? (
            <span className={styles.contentTitle}>积分购买</span>
          ) : (
            <span className={styles.contentTitle}>
              {activeMenu === "auth"
                ? "账号授权"
                : activeMenu === "personal"
                ? "个性化设定"
                : "基础设置"}
            </span>
          )}
        </div>
        <div className={styles.contentBody}>
          {activeMenu === "chatTool" && <ChatToolTab />}
          {activeMenu === "auth" && <AuthTab />}
          {activeMenu === "model" && (
            <ModelTab
              onShowCreditsDetail={() => setPanelView("creditsDetail")}
            />
          )}
          {activeMenu === "credits" && <CreditsTab />}
          {activeMenu === "creditsPurchase" && <CreditsPurchaseTab />}
          {activeMenu === "personal" && <PersonalTab />}
          {activeMenu === "basic" && (
            <BasicTab
              sessionId={sessionId}
              onTerminalReady={(url) => {
                setTerminalUrl(url);
                setPanelView("terminal");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AlphaClawSettingsPanel;

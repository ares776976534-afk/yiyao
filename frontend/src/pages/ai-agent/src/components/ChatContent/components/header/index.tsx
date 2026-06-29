import { useState, useEffect } from "react";
import View from "@alife/channel-fe-materials-react-appear";
import { Popover, Tooltip } from "antd";
import PopoverContent from "./popoverContent";
import HistoryList from "../historyList";
import BackArrowIcon from "@/components/Icons/BackArrowIcon";
import { isMac } from "@/components/studio-canvas";
import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";
import { HistoryItem } from "../../index.d";
import { $t } from "@/i18n";
import aplus from "@/utils/log";

const COLLAPSE_HEIGHT = 70;
const EXPAND_WIDTH = 400;

interface TypeHeaderProps {
  logMaps?: {
    share?: string;
    history?: string;
    copyurl?: string;
    newtask?: string;
  };
  isShared: boolean;
  isMobile?: boolean;
  changeProjectName: (name: string) => void;
  backHome: () => void;
  createNewSession: () => void;
  createShare: () => void;
  onSelect: (sessionId: string) => void;
  deleteSession: (groupKey: string, itemKey: string) => void;
  title: string;
  createDisabled: boolean;
  historyList: HistoryItem[];
  sessionId: string;
  onCollapseChange?: (collapsed: boolean, curWidth: number) => void;
}
export default function Header(props: TypeHeaderProps) {
  const {
    logMaps,
    isShared = false,
    isMobile = false,
    changeProjectName = () => {},
    backHome = () => {},
    createNewSession = () => {},
    createShare = () => {},
    onSelect = () => {},
    deleteSession = () => {},
    title = "",
    createDisabled = false,
    historyList = [],
    sessionId,
    onCollapseChange = () => {},
  } = props;

  // 根据 isMobile 选择样式
  const styles = isMobile ? mobileStyles : pcStyles;

  const [collapse, setCollapse] = useState(false);

  const handleCollapse = () => {
    setCollapse(true);
    const title = document.getElementById("ChatTitle");
    const width = title?.offsetWidth || 0;
    const chatBody = document.getElementById("chatBody");
    if (chatBody) {
      chatBody.style.width = `${width + 56}px`;
      chatBody.style.height = `${COLLAPSE_HEIGHT}px`;
    }
    onCollapseChange?.(true, width + 56);
  };

  const handleExpand = () => {
    const chatBody = document.getElementById("chatBody");
    if (chatBody) {
      chatBody.style.width = `${EXPAND_WIDTH}px`;
      chatBody.style.height = "calc(100vh - 42px)";
    }
    setCollapse(false);
    onCollapseChange?.(false, EXPAND_WIDTH);
  };

  useEffect(() => {
    // 监听折叠/展开的快捷键 ctrl + . 和 cmd + .
    const handleKeyboardEvent = (e: KeyboardEvent) => {
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (isCtrlOrCmd && e.key === ".") {
        e.preventDefault();

        if (collapse) {
          handleExpand();
        } else {
          handleCollapse();
        }
      }
    };
    window.addEventListener("keydown", handleKeyboardEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyboardEvent);
    };
  }, [collapse]);

  if (isShared) {
    return (
      <div className={styles.headerContainer}>
        <div
          className={styles.titleContainer}
          id="ChatTitle"
          style={{ maxWidth: "100%" }}
        >
          <div className={styles.title}>
            {title ||
              $t("global-1688-ai-app.ChatContent.header.wmmhh", "未命名会话")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.headerContainer}>
      <div>
        <Tooltip
          color="#fff"
          styles={{
            body: { color: "rgba(0, 0, 0, 0.87)" },
          }}
          placement="bottom"
          title={$t(
            "global-1688-ai-app.ChatContent.header.returnHome",
            "返回首页",
          )}
        >
          <div className={styles.backIcon} onClick={backHome}>
            <BackArrowIcon />
          </div>
        </Tooltip>

        <Popover
          classNames={{
            body: styles.myPopoverBody,
          }}
          trigger="click"
          placement="bottomLeft"
          content={
            <PopoverContent
              changeProjectName={changeProjectName}
              backHome={backHome}
              title={title}
            />
          }
          arrow={false}
        >
          <div className={styles.titleContainer} id="ChatTitle">
            <div className={styles.title}>
              {title ||
                $t("global-1688-ai-app.ChatContent.header.wmmhh", "未命名会话")}
            </div>
            <div className={styles.arrowDown} />
          </div>
        </Popover>
      </div>
      <div className={styles.actionIcons}>
        {!collapse && (
          <>
            <View
              className={`${styles.iconWrap}${
                createDisabled ? ` ${styles.iconWrapDisabled}` : ""
              }`}
              onClick={() => {
                !createDisabled && createShare();
              }}
              onFirstAppear={() => {
                if (logMaps?.share) {
                  aplus.record(logMaps.share, "EXP");
                }
              }}
            >
              <div className={`${styles.actionIcon} ${styles.share}`} />
              <div className={styles.actionText}>
                {$t("global-1688-ai-app.ChatContent.header.share", "分享")}
              </div>
            </View>

            <View
              className={`${styles.iconWrap}${
                createDisabled ? ` ${styles.iconWrapDisabled}` : ""
              }`}
              onClick={() => !createDisabled && createNewSession()}
              onFirstAppear={() => {
                if (logMaps?.newtask) {
                  aplus.record(logMaps.newtask, "EXP");
                }
              }}
            >
              <div className={`${styles.actionIcon} ${styles.newChat}`} />
              <div className={styles.actionText}>
                {$t("global-1688-ai-app.ChatContent.header.newj", "新建")}
              </div>
            </View>

            <HistoryList
              placement="bottomLeft"
              triggerNode={
                <View
                  className={styles.iconWrap}
                  onFirstAppear={() => {
                    if (logMaps?.history) {
                      aplus.record(logMaps.history, "EXP");
                    }
                  }}
                >
                  <div className={`${styles.actionIcon} ${styles.history}`} />
                  <div className={styles.actionText}>
                    {$t("global-1688-ai-app.ChatContent.header.ls", "历史")}
                  </div>
                </View>
              }
              sessionId={sessionId}
              historyList={historyList}
              onSelect={onSelect}
              deleteSession={deleteSession}
            />
          </>
        )}

        {collapse ? (
          <div className={styles.iconWrap} onClick={handleExpand}>
            <div className={`${styles.actionIcon} ${styles.expand}`} />
            <div className={styles.actionText}>
              {$t("global-1688-ai-app.ChatContent.header.zk", "展开")}
            </div>
          </div>
        ) : (
          <div className={styles.iconWrap} onClick={handleCollapse}>
            <div className={`${styles.actionIcon} ${styles.close}`} />
            <div className={styles.actionText}>
              {$t("global-1688-ai-app.ChatContent.header.sq", "收起")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

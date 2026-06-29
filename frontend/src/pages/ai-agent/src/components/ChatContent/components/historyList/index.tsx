import { useState, useEffect } from "react";
import { Popover, Image } from "antd";
import { HistoryMoreIcon } from "@/components/Icons/History";
import DustbinIcon from "@/components/Icons/DustbinIcon";
import styles from "./index.module.scss";
import { $t } from "@/i18n";

const fallbackImage =
  "https://img.alicdn.com/imgextra/i4/O1CN01ztTvu31jhh5NdMVeN_!!6000000004580-55-tps-20-15.svg";

export default function HistoryList(props) {
  const {
    trigger = "hover",
    placement = "bottomLeft",
    triggerNode,
    canDelete = true,
    onSelect = () => {},
    deleteSession = () => {},
    historyList = [],
    sessionId,
  } = props;

  const handleDelete = (sessionId) => {
    deleteSession(sessionId);
  };

  const [hasOpen, setHasOpen] = useState(false);
  const [openActionPopover, setOpenActionPopover] = useState(null); // 跟踪当前打开的删除popover

  const actionList: {
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick: (sessionId: string) => void;
  }[] = [];

  if (canDelete) {
    actionList.push({
      key: "delete",
      icon: <DustbinIcon className={`${styles.actionIcon}`} />,
      label: $t("global-1688-ai-app.ChatContent.historyList.delete", "删除"),
      onClick: (sessionId) => {
        handleDelete(sessionId);
      },
    });
  }

  // 处理滚动时关闭删除popover
  const handleScroll = () => {
    if (openActionPopover !== null) {
      setOpenActionPopover(null);
    }
  };

  // 处理鼠标移入其他历史项时关闭当前删除popover
  const handleItemMouseEnter = (index) => {
    if (openActionPopover !== null && openActionPopover !== index) {
      setOpenActionPopover(null);
    }
  };

  useEffect(() => {
    if (!hasOpen) return;
    const el = document.querySelector(`div[data-id="${sessionId}"]`);
    requestAnimationFrame(() => {
      if (el) {
        el.scrollIntoView();
      }
    });
  }, [hasOpen, sessionId]);

  return (
    <Popover
      destroyOnHidden
      align={{
        offset: [0, 12],
      }}
      mouseLeaveDelay={.3}
      rootClassName={styles.historyListPopover}
      classNames={{
        body: styles.historyListPopoverBody,
      }}
      placement={placement}
      arrow={false}
      onOpenChange={(open) => {
        if (!open) {
          setOpenActionPopover(null);
        }
        setHasOpen(open);
      }}
      content={
        <div
          className={styles.historyListContainer}
          data-id={"historyListContainer"}
        >
          <div className={styles.historyListContent} onScroll={handleScroll}>
            {historyList.length > 0 ? (
              historyList.map((item, index) => {
                return (
                  <div
                    className={`${styles.historyItem} ${
                      sessionId === item.sessionId ? styles.active : ""
                    }`}
                    key={item.sessionId}
                    data-id={item.sessionId}
                    onClick={() => onSelect(item.sessionId)}
                    onMouseEnter={() => handleItemMouseEnter(index)}
                  >
                    <Image
                      className={styles.historyItemImage}
                      src={item.sessionImage || fallbackImage}
                      fallback={fallbackImage}
                      preview={false}
                    />

                    <div className={styles.historyItemTitle}>
                      {item.title ||
                        $t(
                          "global-1688-ai-app.ChatContent.historyList.wmmhh",
                          "未命名会话"
                        )}
                    </div>
                    {actionList.length > 0 && hasOpen && (
                      <Popover
                        open={openActionPopover === index}
                        onOpenChange={(open) => {
                          setOpenActionPopover(open ? index : null);
                        }}
                        placement="bottomLeft"
                        styles={{
                          body: {
                            padding: 0,
                            borderRadius: "12px",
                          },
                        }}
                        content={
                          <div className={styles.actionBar}>
                            {actionList.map((action) => {
                              return (
                                <div
                                  key={action.key}
                                  className={styles.actionBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action?.onClick?.(item?.sessionId);
                                  }}
                                >
                                  <span className={styles.actionIcon}>
                                    {action.icon}
                                  </span>
                                  <span>
                                    {action.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        }
                        arrow={false}
                      >
                        <div
                          className={styles.moreIconWrap}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <HistoryMoreIcon className={styles.moreIcon} />
                        </div>
                      </Popover>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyHistory}>
                {$t(
                  "global-1688-ai-app.ChatContent.historyList.zwlsjl",
                  "暂无历史记录"
                )}
              </div>
            )}
          </div>
        </div>
      }
    >
      {triggerNode || null}
    </Popover>
  );
}

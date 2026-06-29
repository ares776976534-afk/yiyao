import React, { useCallback } from "react";
import classNames from "classnames";
import { Popup, Modal } from "antd-mobile";
import ProgressiveImage from "@/components/ProgressiveImage";
import DustbinIcon from "@/components/Icons/DustbinIcon";
import $t from "@/i18n";
import styles from "./index.module.scss";

interface TypeHistoryItem {
  sessionId: string;
  title: string;
  createdTime: number | string;
  sessionImage: string;
}

interface TypeHistoryProps {
  propsSessionId: string;
  historyList: TypeHistoryItem[];
  visible: boolean;
  onClose: () => void;
  deleteSession: (sessionId: string) => void;
}

const fallbackImage =
  "https://img.alicdn.com/imgextra/i4/O1CN01ztTvu31jhh5NdMVeN_!!6000000004580-55-tps-20-15.svg";

export default function History(props: TypeHistoryProps) {
  const { propsSessionId, historyList, visible, onClose, deleteSession } =
    props;

  // 元素挂载时滚动到可视区域
  const activeItemRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollIntoView({ block: "center" });
    }
  }, []);

  const onSelect = (sessionId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("sessionId", sessionId);
    window.location.href = url.toString();
  };

  const onDelete = (sessionId: string) => {
    const handler = Modal.show({
      bodyClassName: styles.modalConfirm,
      title: $t(
        "global-1688-ai-app.ChatContent.deleteConfirm",
        "确定删除这条记录吗？",
      ),
      content: $t(
        "global-1688-ai-app.ChatContent.dewunDe",
        "删除后记录将无法恢复，确认删除？",
      ),
      showCloseButton: true,
      actions: [
        {
          key: "cancel",
          text: "取消",
          className: styles.modalConfirmCancelButton,
          onClick: () => {
            handler.close();
          },
        },
        {
          key: "delete",
          text: "删除",
          className: styles.modalConfirmDeleteButton,
          onClick: async () => {
            await deleteSession(sessionId);
            handler.close();
          },
        },
      ],
    });
  };

  return (
    <Popup
      position="bottom"
      visible={visible}
      closeOnMaskClick
      showCloseButton
      destroyOnClose
      className={styles.historyPopup}
      onClose={onClose}
    >
      <div className={styles.historyPopupContent}>
        <div className={styles.historyPopupTitle}>
          {$t(
            "global-1688-ai-app.mobile-studio.navigator.historyPopupTitle",
            "素材历史记录",
          )}
        </div>
        <div className={styles.historyPopupList}>
          {historyList?.length > 0 ? (
            historyList?.map((item) => {
              const { sessionId, sessionImage, title } = item;
              const isActive = sessionId === propsSessionId;
              return (
                <div
                  key={sessionId}
                  ref={isActive ? activeItemRefCallback : undefined}
                  className={classNames(styles.historyPopupItem, {
                    [styles.active]: isActive,
                  })}
                  onClick={() => onSelect(sessionId)}
                >
                  <ProgressiveImage
                    className={styles.historyPopupItemImage}
                    src={sessionImage}
                    fallback={fallbackImage}
                  />
                  <div className={styles.historyPopupItemTitle}>
                    {title ||
                      $t(
                        "global-1688-ai-app.ChatContent.historyList.wmmhh",
                        "未命名会话",
                      )}
                  </div>
                  <DustbinIcon
                    className={styles.historyPopupItemDeleteIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(sessionId);
                    }}
                  />
                </div>
              );
            })
          ) : (
            <div className={styles.historyPopupEmpty}>
              <ProgressiveImage
                className={styles.historyPopupEmptyImage}
                src="https://gw.alicdn.com/imgextra/i3/O1CN01JsiVCA1szOwyUUIWA_!!6000000005837-55-tps-96-96.svg"
              />
              <div className={styles.historyPopupEmptyText}>
                {$t(
                  "global-1688-ai-app.ChatContent.historyList.zwlsjl",
                  "暂无历史记录",
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Popup>
  );
}

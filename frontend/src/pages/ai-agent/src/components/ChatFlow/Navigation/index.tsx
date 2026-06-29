import React, { useState, useMemo } from "react";
import * as clipboard from "clipboard-polyfill";
import styles from "./index.module.css";
import { imgIcon } from "../imgIcon";
import { useNavigate } from "ice";
import { Popover, message, Tooltip } from "antd";
import request from "@/services/httpRequest";
import { useChatHistory } from "@/pages/select-product/components/ChatHistory/useChatHistory";
import { commonRecord } from "@/utils/log";
import { $t } from "@/i18n";
import { serviceBaseUrl } from "@/utils/env";
import { CopyTaskIcon } from '@/components/Icon';
import jumpTo from '@/utils/jumpTo';
import { useSelectProductStore } from "@/stores/select-product";
import { observer } from "mobx-react-lite";

interface NavigationProps {
  onBack?: () => void;
  title?: React.ReactNode | string;
  style?: React.CSSProperties;
  sessionId?: string;
  sharePopoverStyle?: React.CSSProperties;
  shareDescription?: string;
}

const getShareCode = async (sessionId: string) => {
  try {
    const res = await request(`${serviceBaseUrl}/opp/share/createShareCode`, {
      method: "POST",
      body: JSON.stringify({
        sessionId,
      }),
    });
    return res.data;
  } catch (err) {
    console.error("获取分享码失败:", err);
    return "";
  }
};

const ShareDialog: React.FC<{
  sessionId: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  shareDescription?: string;
}> = ({ sessionId, children, style, shareDescription }) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      const shareCode = await getShareCode(sessionId);
      if (!shareCode) {
        message.error("获取分享码失败");
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete("__share_code__");
      searchParams.set("__share_code__", shareCode);
      searchParams.delete("__chat_input_cache_id__");
      searchParams.delete("__chat_history_session__");
      const shareUrl = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;

      commonRecord(`复制分享链接`);

      await clipboard.writeText(shareUrl);

      setCopied(true);

      // 2秒后重置状态
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const content = () => {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.title}>
              {$t("global-1688-ai-app.ChatFlow.Navigation.sharedh", "分享对话")}
            </span>
            <img
              className={styles.closeIcon}
              src="https://img.alicdn.com/imgextra/i1/6000000002682/O1CN01O7dPJ31VgPLm292jQ_!!6000000002682-2-gg_dtc.png"
              alt={$t("global-1688-ai-app.ChatFlow.Navigation.off", "关闭")}
              onClick={handleClose}
            />
          </div>
          <span className={styles.description}>
            {shareDescription ||
              $t(
                "global-1688-ai-app.ChatFlow.Navigation.cihhkwnjtp",
                "复制链接并分享后，获得链接的人可访问，对话内容将实时更新。",
              )}
          </span>
        </div>
        <div
          className={`${styles.button} ${copied ? styles.buttonCopied : ""}`}
          onClick={handleCopy}
        >
          <img
            className={styles.buttonIcon}
            src={
              copied
                ? "https://img.alicdn.com/imgextra/i1/O1CN01EbcuPf1MOhUmuQwgm_!!6000000001425-2-tps-28-28.png"
                : "https://img.alicdn.com/imgextra/i3/6000000003711/O1CN01eMoSdw1dHgty1LdA8_!!6000000003711-2-gg_dtc.png"
            }
            alt={
              copied
                ? $t(
                  "global-1688-ai-app.ChatFlow.Navigation.linkyCopy",
                  "链接已复制",
                )
                : $t("global-1688-ai-app.ChatFlow.Navigation.copy", "复制")
            }
          />
          <span className={styles.buttonText}>
            {copied
              ? $t(
                "global-1688-ai-app.ChatFlow.Navigation.linkyCopy",
                "链接已复制",
              )
              : $t(
                "global-1688-ai-app.ChatFlow.Navigation.copyLink",
                "复制链接",
              )}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Popover
      content={content}
      trigger="click"
      arrow={false}
      open={open}
      classNames={{
        root: styles.shareDialogRoot,
        body: styles.shareDialogBody,
      }}
      styles={{
        root: style,
      }}
      placement="bottomRight"
    >
      {React.cloneElement(children as React.ReactElement, {
        onClick: () => {
          if (!sessionId) {
            return;
          }
          setOpen(true);
          commonRecord(`打开分享`);
        },
      })}
    </Popover>
  );
};

const Navigation: React.FC<NavigationProps> = observer(({
  onBack,
  title,
  style,
  sessionId,
  sharePopoverStyle,
  shareDescription,
}) => {
  const navigate = useNavigate();
  const { shareCode } = useChatHistory();
  const { taskStatus } = useSelectProductStore();
  
  const handleDefaultBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleShare = () => {
    console.log(sessionId);
  };
  const showShareBtn = sessionId && !shareCode;
  // 获取地址参数taskId
  const taskId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('taskId');
  }, [window.location.search]);
  const handleCopyTask = () => {
    jumpTo(`/inquiry?fromPage=ZS&taskId=${taskId || sessionId}`);
  };

  const canCopy = taskStatus?.canCopy ?? false;
  return (
    <div className={`${styles.navigation} navigations`} style={style}>
      <div
        className={`${styles.navigationBackContainer} navigation-back-container`}
        onClick={handleDefaultBack}
      >
        <img className={styles.navigationBack} src={imgIcon[24]} alt="img" />
      </div>
      <div className={styles.navigationTitle}>{title}</div>
      <div className={styles.navigationBackContainerRight}>
        {(sessionId && canCopy) && (
          <Tooltip placement="bottom" title='复制任务' overlayInnerStyle={{
            borderRadius: 8,
            padding: '8px 12px',
          }}>
            <div
              className={`${styles.navigationBackContainer} navigation-back-container `}
              onClick={handleCopyTask}
            > 
              <CopyTaskIcon />
            </div>
          </Tooltip>
        )}
        <div
          className={`${styles.navigationBackContainer} navigation-back-container ${!showShareBtn ? !shareCode ? styles.navigationBackContainerDisabled : styles.navigationBackContainerShare : ''}`}
        > 
          {
            !shareCode && (
              <ShareDialog sessionId={sessionId || ''} style={sharePopoverStyle} shareDescription={shareDescription}>
                <img
                  className={styles.navigationShare}
                  src={showShareBtn ? imgIcon[12] : 'https://img.alicdn.com/imgextra/i2/O1CN01tQ48gc1MxVbFRxQo0_!!6000000001501-2-tps-80-80.png'}
                  alt="img"
                  onClick={handleShare}
                />
              </ShareDialog>
            )
          }
        </div>
      </div>
    </div>
  );
});

export default Navigation;

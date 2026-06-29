import React, { useState } from "react";
import * as clipboard from "clipboard-polyfill";
import styles from "./navigation.module.scss";
import { imgIcon } from "@/components/ChatFlow/imgIcon";
import { useNavigate } from "ice";
import { message } from "antd";
import { Dialog } from "antd-mobile";
import request from "@/services/httpRequest";
import { useChatHistory } from "@/pages/select-product/components/ChatHistory/useChatHistory";
import { commonRecord } from "@/utils/log";
import { serviceBaseUrl } from "@/utils/env";

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
}> = ({ sessionId, children, shareDescription }) => {
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

  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        onClick: () => {
          if (!sessionId) {
            return;
          }
          setOpen(true);
          commonRecord(`打开分享`);
        },
      })}
      <Dialog
        visible={open}
        onClose={handleClose}
        closeOnMaskClick
        bodyClassName={styles.dialogBody}
        content={
          <div className={styles.dialogContent}>
            <div className={styles.header}>
              <span className={styles.title}>分享对话</span>
              <img
                className={styles.closeIcon}
                src="https://img.alicdn.com/imgextra/i1/6000000002682/O1CN01O7dPJ31VgPLm292jQ_!!6000000002682-2-gg_dtc.png"
                alt='关闭'
                onClick={handleClose}
              />
            </div>
            <span className={styles.description}>
              {shareDescription || '复制链接并分享后，获得链接的人可访问，对话内容将实时更新。'}
            </span>
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
                alt={copied ? '链接已复制' : '复制'}
              />
              <span className={styles.buttonText}>
                {copied ? '链接已复制' : '复制链接'}
              </span>
            </div>
          </div>
        }
      />
    </>
  );
};

const Navigation: React.FC<NavigationProps> = ({
  onBack,
  title,
  style,
  sessionId,
  sharePopoverStyle,
  shareDescription,
}) => {
  const navigate = useNavigate();
  const { shareCode } = useChatHistory();
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

  return (
    <div className={`${styles.navigation} navigations`} style={style}>
      <div
        className={`${styles.navigationBackContainer} navigation-back-container`}
        onClick={handleDefaultBack}
      >
        <img className={styles.navigationBack} src={imgIcon[24]} alt="img" />
      </div>
      <div className={styles.navigationTitle}>{title}</div>
      <div
        className={`${styles.navigationBackContainer} navigation-back-container ${!showShareBtn ? !shareCode ? styles.navigationBackContainerDisabled : styles.navigationBackContainerShare : ''}`}
      >
        {
          !shareCode && sessionId && (
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
  );
};

export default Navigation;

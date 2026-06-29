import React, { useState } from 'react';
import * as clipboard from "clipboard-polyfill";
import styles from './index.module.scss';
import { CheckMarkIcon, ImgLinkIcon } from '@/components/Icon';
import classNames from 'classnames';
import { $t } from '@/i18n';
export interface TypeTaskLinkContentProps {
  url?: string;
  title?: string;
  titleAfterClick?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  hideButtonAfterClick?: boolean;
  onClose?: () => void;
  isClickable?: boolean;
}

export const TaskLinkContent: React.FC<TypeTaskLinkContentProps> = ({
  title = $t("global-1688-ai-app.TaskLinkModel.TaskLinkContent.qndwsjuo", "请在PC电脑端浏览器打开，查看运行结果或解锁完整功能"),
  titleAfterClick = $t("global-1688-ai-app.TaskLinkModel.TaskLinkContent.zkdqyu", "粘贴任务链接到PC浏览器\n查看运行结果"),
  buttonText = $t("global-1688-ai-app.TaskLinkModel.TaskLinkContent.copyLink", "复制链接"),
  onButtonClick,
  onClose,
  hideButtonAfterClick = false,
  isClickable = false,
  url,
}) => {
  const [isClicked, setIsClicked] = useState(isClickable);

  const handleButtonClick = () => {
    setIsClicked(true);
    if (url) {
      // 复制链接

      // 默认添加 amug_biz=growth&amug_fl_src=aoxia_xx5 参数
      const newUrl = new URL(url);
      newUrl.searchParams.set('amug_biz', 'growth');
      newUrl.searchParams.set('amug_fl_src', 'aoxia_xx5');
      url = newUrl.toString();
      console.log('url', url);
      clipboard.writeText(url);
    }
    if (onButtonClick) {
      onButtonClick();
    }
  };

  const currentTitle = isClicked && titleAfterClick ? titleAfterClick : title;
  const showButton = !(isClicked && hideButtonAfterClick);

  return (
    <div className={styles.popupContent}>
      <div className={styles.container}>
        <div className={styles.card}>
          <span className={styles.title}>
            {currentTitle}
          </span>
          <div className={styles.content}>
            <div className={styles.browserMockup}>
              <div className={styles.browserWindow}>
                <img
                  src="https://gw.alicdn.com/imgextra/i4/O1CN01bcHOrF21KwUf8nXEW_!!6000000006967-2-tps-1088-572.png"
                  alt="Browser background"
                  className={styles.browserBg}
                />
                {/* <div className={styles.addressBar}>
                  <div className={styles.urlContainer}>
                    <img
                      src="https://img.alicdn.com/imgextra/i1/6000000008018/O1CN01JDK43k296Il5zqhDD_!!6000000008018-2-gg_dtc.png"
                      alt="URL bar"
                      className={styles.urlBar}
                    />
                    <span className={styles.urlText}>https://</span>
                  </div>
                </div>
                <img
                  src="https://img.alicdn.com/imgextra/i3/6000000000396/O1CN01UyapSO1EnPwf6arWi_!!6000000000396-2-gg_dtc.png"
                  alt="Copy icon"
                  className={styles.copyIcon}
                /> */}
              </div>
            </div>
            {showButton && (
              <div
                className={classNames(styles.copyButton,
                  { [styles.linkButton]: isClicked })}
                onClick={handleButtonClick}
              >
                {
                  isClicked ? (
                    <CheckMarkIcon width={16} height={16} className={styles.linkIcon} fill="currentColor" />
                  ) : (
                    <ImgLinkIcon width={16} height={16} className={styles.linkIcon} fill="currentColor" />
                  )
                }
                <span className={styles.buttonText}>{buttonText}</span>
              </div>
            )}
          </div>
        </div>
        <img
          onClick={onClose}
          src="https://img.alicdn.com/imgextra/i1/6000000004627/O1CN01rYw7zl1k3DhRh7cs3_!!6000000004627-2-gg_dtc.png"
          alt="Bottom icon"
          className={styles.bottomIcon}
        />
      </div>
    </div>
  );
};


import React from 'react';
import styles from './index.module.css';
import { $t } from '@/i18n';
import { checkAuthAndLogin } from '@/utils/login';

interface IntelligentInquiryProps {
  id?: string;
  onNewClick?: () => void;
}

const IntelligentInquiry: React.FC<IntelligentInquiryProps> = ({ id, onNewClick }) => {
  const handleClick = () => {
    if (onNewClick) {
      checkAuthAndLogin({
        onSuccess: () => {
          onNewClick();
        },
      })
        .then((loginSuccess) => {
          if (loginSuccess) {
            onNewClick();
          }
        });
    }
  };

  return (
    <div className={styles.container} id={id}>
      <div className={styles.contentLeft}>
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <img
              className={styles.icon}
              src="https://img.alicdn.com/imgextra/i1/O1CN01ksBmLL1xxB62SfUhx_!!6000000006509-2-tps-32-32.png"
              alt="icon"
            />
            <span className={styles.featureText}>{$t("global-1688-ai-app.inquiry.NewHomeContent.yhnjh", "一键多发，Agent自动跟进，全天候执行")}</span>
          </div>
          <div className={styles.featureItem}>
            <img
              className={styles.icon}
              src="https://img.alicdn.com/imgextra/i1/O1CN01ksBmLL1xxB62SfUhx_!!6000000006509-2-tps-32-32.png"
              alt="icon"
            />
            <span className={styles.featureText}>{$t("global-1688-ai-app.inquiry.NewHomeContent.Arl", "AI模拟真人沟通，随时灵活介入")}</span>
          </div>
          <div className={styles.featureItem}>
            <img
              className={styles.icon}
              src="https://img.alicdn.com/imgextra/i1/O1CN01ksBmLL1xxB62SfUhx_!!6000000006509-2-tps-32-32.png"
              alt="icon"
            />
            <span className={styles.featureText}>{$t("global-1688-ai-app.inquiry.NewHomeContent.zcb", "智能解析，生成AI分析报告")}</span>
          </div>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <img
          className={styles.centerImage}
          src="https://img.alicdn.com/imgextra/i4/O1CN01KYgjqh1F2zQMGUKNQ_!!6000000000430-2-tps-888-555.png"
          alt="center"
        />
      </div>

      {/* <div className={styles.rightImageContainer}>
        <img
          className={styles.rightImage}
          src="https://img.alicdn.com/imgextra/i1/6000000003199/O1CN01Mu06dD1ZVC7DvjeWT_!!6000000003199-2-gg_dtc.png"
          alt="right"
        />
      </div> */}

      <div className={styles.actionCard} onClick={handleClick}>
        <img
          className={styles.actionCardBackground}
          src="https://img.alicdn.com/imgextra/i2/O1CN01CXy8ZJ22eSzhpUGZd_!!6000000007145-2-tps-1336-512.png"
          alt="background"
        />
        <div className={styles.actionImagesContainer}>
          <img
            className={`${styles.actionImage} ${styles.actionImage1}`}
            src="https://img.alicdn.com/imgextra/i4/O1CN01offoNt1YI5ACqHLpp_!!6000000003035-2-tps-219-219.png"
            alt="chart icon"
          />
          <img
            className={`${styles.actionImage} ${styles.actionImage3}`}
            src="https://img.alicdn.com/imgextra/i1/O1CN01n2b88x1ggpUT1EjFO_!!6000000004172-2-tps-222-222.png"
            alt="ai icon"
          />
          <img
            className={`${styles.actionImage} ${styles.actionImage2}`}
            src="https://img.alicdn.com/imgextra/i3/O1CN01xFgOJl1gmmdhEMJ44_!!6000000004185-2-tps-219-219.png"
            alt="analytics icon"
          />
        </div>
        <div className={styles.actionButton}>
          <img
            className={styles.buttonIcon}
            src="https://img.alicdn.com/imgextra/i4/O1CN01dkOjev1vZFAWXoQYT_!!6000000006186-2-tps-80-80.png"
            alt="button icon"
          />
          <span className={styles.buttonText}>{$t("global-1688-ai-app.inquiry.NewHomeContent.djfqxptask", "点击发起询盘任务")}</span>
        </div>
      </div>
    </div>
  );
};

export default IntelligentInquiry;

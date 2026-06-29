import React, { useState } from 'react';
import { Modal } from 'antd';
import ContactService from './ContactService';
import styles from './customCard.module.scss';
import { $t } from '@/i18n';

interface CustomPricingCardProps {
  id?: string;
}

const CustomPricingCard: React.FC<CustomPricingCardProps> = ({ id }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div id={id} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <span className={styles.subtitle}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.CustomCard.sst", "商务咨询")}</span>
            <div className={styles.priceContainer}>
              <span className={styles.price}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.CustomCard.dztc", "定制套餐")}</span>
            </div>
          </div>
          <div className={styles.divider}></div>
        </div>
        <div className={styles.description}>
          <div className={styles.descriptionText}>
            <span className={styles.text}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.CustomCard.rbnyacnwjytcr", "若线上资源包未能满足您的需求；资源包定制&大量采购，请联系我们，我们将尽快与您联系&竭诚为您服务")}</span>
          </div>
          <div className={styles.features}>
            {/* <div className={styles.feature}>
              <img
                src="https://img.alicdn.com/imgextra/i4/6000000002520/O1CN012O8jNU1UUDB0U0HIn_!!6000000002520-2-gg_dtc.png"
                className={styles.featureIcon}
                alt="feature"
              />
              <span className={styles.featureText}>支持大量采购和企业级定制</span>
            </div> */}
            <div className={styles.feature}>
              <img
                src="https://img.alicdn.com/imgextra/i4/6000000002520/O1CN012O8jNU1UUDB0U0HIn_!!6000000002520-2-gg_dtc.png"
                className={styles.featureIcon}
                alt="feature"
              />
              <span className={styles.featureText}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.CustomCard.zjut", "专属商务对接和技术支持")}</span>
            </div>
          </div>
        </div>
        <div className={styles.consultButton} onClick={() => setIsModalOpen(true)}>
          <span className={styles.buttonText}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.CustomCard.dst", "点击咨询")}</span>
        </div>
      </div>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={false}
        closable={false}
        title={null}
        centered
        width={474}
        styles={{
          content: {
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <ContactService onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default CustomPricingCard;

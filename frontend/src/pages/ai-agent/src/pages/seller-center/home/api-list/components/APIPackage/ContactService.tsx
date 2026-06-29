import React from 'react';
import { qrcodeUrl } from '@/utils/env';
import styles from './contactService.module.scss';
import { $t } from '@/i18n';

interface ContactServiceProps {
  id?: string;
  onClose: () => void;
}

const ContactService: React.FC<ContactServiceProps> = ({ id, onClose }) => {
  return (
    <>
      <div id={id} className={styles.container}>
        <div className={styles.backgroundImage1}>
          <img
            src="https://img.alicdn.com/imgextra/i3/6000000006499/O1CN01lBFwu01xsb7dm0tDK_!!6000000006499-2-gg_dtc.png"
            alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.bjzs1", "背景装饰1")}
          />
        </div>

        <div className={styles.backgroundImage2}>
          <img
            src="https://img.alicdn.com/imgextra/i1/6000000001168/O1CN01KgUTpC1KUzh7KBbDz_!!6000000001168-2-gg_dtc.png"
            alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.bjzs2", "背景装饰2")}
          />
        </div>

        <div className={styles.backgroundImage3}>
          <img
            src="https://img.alicdn.com/imgextra/i1/6000000000585/O1CN01gMPD2k1GByn1o6xjr_!!6000000000585-2-gg_dtc.png"
            alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.bjzs3", "背景装饰3")}
          />
        </div>

        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <div className={styles.titleWrapper}>
              <span className={styles.title}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.contactCustomerserviceConsultation", "联系客服咨询")}</span>
            </div>
          </div>
          <img
            src="https://img.alicdn.com/imgextra/i4/6000000006803/O1CN01LjxGry207pWi3dLc4_!!6000000006803-2-gg_dtc.png"
            alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.offIcon", "关闭图标")}
            className={styles.closeIcon}
            onClick={onClose}
          />
        </div>

        <span className={styles.description}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.rsxpedsri", "若有任何问题或需要帮助？欢迎下方二维码添加钉钉客服群")}</span>
        <img
          src={qrcodeUrl}
          alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.dtscm", "钉钉客服群二维码")}
          className={styles.qrCode}
        />
      </div>
      <div className={styles.mobileContactServiceModal}>
        <span className={styles.contactServiceModalCloseIcon}>
          <img
            src="https://img.alicdn.com/imgextra/i4/6000000006803/O1CN01LjxGry207pWi3dLc4_!!6000000006803-2-gg_dtc.png"
            alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.offIcon", "关闭图标")}
            className={styles.closeIcon}
            onClick={() => onClose()}
          />
        </span>
        <div className={styles.contactServiceModalTitle}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.contactCustomerserviceConsultation", "联系客服咨询")}</div>
        <div className={styles.contactServiceModalDescription}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.rsxpedsri", "若有任何问题或需要帮助？欢迎下方二维码添加钉钉客服群")}</div>
        <img src={qrcodeUrl} alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.ContactService.dtscm", "钉钉客服群二维码")} className={styles.contactServiceModalQrcode} />
      </div>
    </>
  );
};

export default ContactService;

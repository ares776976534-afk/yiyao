import React from 'react';
import styles from './index.module.scss';
import { $t } from '@/i18n';

interface TypePartnerFooterProps {

}

const PartnerFooter: React.FC<TypePartnerFooterProps> = () => {
  return (
    <div className={styles.container}>
      <div className={styles.partnerSection}>
        <span className={styles.partnerLabel}>{$t("global-1688-ai-app.mobile-agent-home.PartnerFooter.hzhb", "合作伙伴")}</span>
        <div className={styles.partnerLogos}>
          <img
            src="https://gw.alicdn.com/imgextra/i2/O1CN01j23Ssg1U3Bp85WiC6_!!6000000002461-2-tps-418-54.png"
            className={styles.logo1}
            alt={$t("global-1688-ai-app.mobile-agent-home.PartnerFooter.hzhb1", "合作伙伴1")}
          />
          <span
            className={styles.separator}
          />
          <img
            src="https://gw.alicdn.com/imgextra/i2/O1CN01eYU25g1q5rgT0BIJC_!!6000000005445-2-tps-139-54.png"
            className={styles.logo2}
            alt={$t("global-1688-ai-app.mobile-agent-home.PartnerFooter.hzhb2", "合作伙伴2")}
          />
          <span
            className={styles.separator}
          />
          <img
            src="https://gw.alicdn.com/imgextra/i4/O1CN01VdDk6p1G2MUGAn7SS_!!6000000000564-2-tps-177-64.png"
            className={styles.logo3}
            alt={$t("global-1688-ai-app.mobile-agent-home.PartnerFooter.hzhb3", "合作伙伴3")}
          />
        </div>
      </div>

      <div className={styles.legalSection}>
        <span className={styles.legalText}>{$t("global-1688-ai-app.mobile-agent-home.PartnerFooter.z300", "浙公网安备 33010002000121号")}</span>
        <div className={styles.dot} />
        <span className={styles.legalText}>{$t("global-1688-ai-app.mobile-agent-home.PartnerFooter.z11", "ICP备2026014275号-1")}</span>
        <div className={styles.dot} />
        <span
          onClick={() => {
            location.href = 'https://terms.alicdn.com/legal-agreement/terms/privacy/20221101140343728/20221101140343728.html';
          }}
          className={styles.legalText}
        >{$t("global-1688-ai-app.mobile-agent-home.PartnerFooter.snadw", "算法备案信息: 点击查看")}</span>
      </div>
    </div>
  );
};

export default PartnerFooter;


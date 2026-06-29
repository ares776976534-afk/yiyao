import styles from './index.module.css';
import { $t } from '@/i18n';
import { getVersionComponent } from '@/utils/versionRouter';

const Cn = () => {
  return (
    <div className={styles.copyright}>
      <div className={styles.copyrightImage}>
        <img src="https://img.alicdn.com/imgextra/i4/O1CN01ytSDui29im1wk0D73_!!6000000008102-2-tps-583-40.png" />
      </div>
      <div className={styles.copyrightText}>
        <a href="https://zzlz.gsxt.gov.cn/businessCheck/verifKey.do?showType=p&serial=91330108793696828A-SAIC_SHOW_10000091330108793696828A1765961105583&signData=MEQCIHH3CjFlKgrNl6xazXS+lT3fEl3D8sPpkcRrPCLBywlSAiBV0aoBXNPbX2J/PJeVZy9gcowk5lPmwh1xCU79u9WWrQ==" target='_blank'>
          <img src="https://img.alicdn.com/imgextra/i4/O1CN01jlh36d1UtrNS6L7Zq_!!6000000002576-1-tps-65-70.gif" className={styles.iconImage} />
        </a>
        <img src="https://img.alicdn.com/imgextra/i4/O1CN01gAfMyf1YgMAB1sQ47_!!6000000003088-2-tps-36-40.png" className={styles.iconImage} />
        <a href="https://beian.mps.gov.cn/#/query/webSearch?code=33010802014152" target="_blank">浙公网安备33010802014152号</a>
        <a href="https://beian.miit.gov.cn/" target="_blank">ICP备2026014275号-1</a>
        <a href="https://terms.alicdn.com/legal-agreement/terms/privacy/20221101140343728/20221101140343728.html" target="_blank">{$t("global-1688-ai-app.seller-center.home.Layout.Footer.snadw", "算法备案信息：点击查看")}</a>
      </div>
    </div>
  );
};

const Global = () => {
  return (
    <div className={styles.copyright}>
      <div className={styles.partnerSection}>
        <div className={styles.partnerLabel}>{$t("global-1688-ai-app.mobile-agent-home.PartnerFooter.hzhb", "合作伙伴")}</div>
        <div className={styles.partnerLogos}>
          <img className={styles.icon1688} src="https://img.alicdn.com/imgextra/i3/O1CN01hirItI1uEnsgangAH_!!6000000006006-2-tps-209-27.png" alt="1688icon" />
          <div className={styles.divider}/>
          <img className={styles.app1688} src="https://img.alicdn.com/imgextra/i4/O1CN01WBC8V31kcwbGkqtKm_!!6000000004705-2-tps-70-27.png" alt="1688" />
          <div className={styles.divider}/>
          <img className={styles.iconTongYi} src="https://img.alicdn.com/imgextra/i1/O1CN01jfGHyF1IQIPqkYYee_!!6000000000887-2-tps-1774-400.png" alt="tongyi" />
        </div>
      </div>
    </div>
  );
};


export default getVersionComponent({
  CN: Cn,
  GLOBAL: Global,
});

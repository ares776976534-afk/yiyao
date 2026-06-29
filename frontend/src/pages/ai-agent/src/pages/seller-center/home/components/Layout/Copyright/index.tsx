import { getVersionComponent } from '@/utils/versionRouter';
import styles from '../footer.module.scss';
import style from './index.module.scss';
import { $t } from '@/i18n';

const Cn = () => {
  return (
    <div className={styles.copyright}>
      <div className={styles.copyrightImage}>
        <img src="https://img.alicdn.com/imgextra/i4/O1CN010Mk3Bf1SVT2tX3uft_!!6000000002252-2-tps-583-40.png" />
      </div>
      <div className={styles.copyrightText}>
        <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank">{$t("global-1688-ai-app.seller-center.home.Layout.Footer.z300", "浙公网安备 33010002000121号")}</a>
        <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">{$t("global-1688-ai-app.seller-center.home.Layout.Footer.z11", "ICP备2026014275号-1")}</a>
        <a href="https://terms.alicdn.com/legal-agreement/terms/privacy/20221101140343728/20221101140343728.html" target="_blank">{$t("global-1688-ai-app.seller-center.home.Layout.Footer.snadw", "算法备案信息：点击查看")}</a>
      </div>
    </div>
  )
};
const Global = () => {
  return (
    <div className={style.copyright}>
      <div className={style.partnerSection}>
        <div className={style.partnerLabel}>{$t("global-1688-ai-app.seller-center.home.Layout.Footer.hzhb", "合作伙伴")}</div>
        <div className={style.partnerLogos}>
          <img className={style.icon1688} src="https://img.alicdn.com/imgextra/i3/O1CN01hirItI1uEnsgangAH_!!6000000006006-2-tps-209-27.png" alt="1688icon" />
          <div className={style.divider}/>
          <img className={style.app1688} src="https://img.alicdn.com/imgextra/i4/O1CN01WBC8V31kcwbGkqtKm_!!6000000004705-2-tps-70-27.png" alt="1688" />
          <div className={style.divider}/>
          <img className={style.iconTongYi} src="https://img.alicdn.com/imgextra/i4/O1CN01v997WQ1x1TCR6JLKo_!!6000000006383-2-tps-142-32.png" alt="tongyi" />
        </div>
      </div>
    </div>
  )
};

export default getVersionComponent({
  CN: Cn,
  GLOBAL: Global,
});
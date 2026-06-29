import { qrcodeUrl, wxcodeUrl } from '@/utils/env';
import styles from './concat.module.css';
import { $t } from '@/i18n';
import TitleHeater from './Settings/TitleHeater';

const Concat = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <span className={styles.title}>{$t("global-1688-ai-app.AgentLayout.Concat.contactwm", "联系我们")}</span> */}
        <TitleHeater title={$t("global-1688-ai-app.AgentLayout.Concat.contactwm", "联系我们")} />
        <span className={styles.description}>{$t("global-1688-ai-app.AgentLayout.Concat.jecuoaca", "加入社群，反馈产品功能，了解最新产品动态。")}</span>
      </div>
      <div className={styles.qrcodeContainer}>
        <img
          className='qrcode' 
          src={qrcodeUrl}
          alt={$t("global-1688-ai-app.AgentLayout.Concat.dtscm", "钉钉客服群二维码")}
          width={260}
        />
        <img
          className='qrcode' 
          src={wxcodeUrl}
          alt={$t("global-1688-ai-app.AgentLayout.Concat.wxscm", "微信公众号二维码")}
          width={260}
        />
      </div>
      <span className={styles.email}>{$t("global-1688-ai-app.AgentLayout.Concat.camlhrab", "投诉邮箱：alphashop@service.alibaba.com")}</span>
    </div>
  );
};

export default Concat;
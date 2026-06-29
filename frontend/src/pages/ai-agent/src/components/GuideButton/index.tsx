import React from 'react';
import * as clipboard from "clipboard-polyfill";
import styles from './index.module.scss';
import showTaskLinkModal from '../TaskLinkModel';
import { $t } from '@/i18n';


const GuideButton = () => {
  return (
    <div
      onClick={() => {
        clipboard.writeText('https://alphashop.cn?amug_biz=growth&amug_fl_src=aoxia_xx5');
        const handler = showTaskLinkModal({
          isClickable: true,
          titleAfterClick: $t("global-1688-ai-app.GuideButton.yyew", "域名复制成功，请前往PC体验"),
          hideButtonAfterClick: true,
          onClose: () => {
            handler.close();
          },
        });
      }}
      className={styles.guideButton}
    >{$t("global-1688-ai-app.GuideButton.dlhtl", "电脑访问 alphashop.cn，体验完整能力")}</div>
  );
};

export default GuideButton;

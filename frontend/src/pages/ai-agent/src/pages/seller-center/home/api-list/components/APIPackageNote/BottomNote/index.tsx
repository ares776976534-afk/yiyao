import React from 'react';
import styles from './index.module.scss';
import { $t } from '@/i18n';

interface MarcoTranslationProps {
  id?: string;
}

const MarcoTranslation: React.FC<MarcoTranslationProps> = ({ id }) => {
  return (
    <div id={id} className={styles.container}>
      <img
        className={styles.logo}
        src="https://img.alicdn.com/imgextra/i1/6000000003608/O1CN01fL3Gjl1cWW62QakYR_!!6000000003608-2-gg_dtc.png"
        alt="Marco Logo"
      />
      <div className={styles.textContainer}>
        <span className={styles.title}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.BottomNote.largemxfy", "大模型翻译")}</span>
        <span className={styles.description}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.BottomNote.jgqjsmefx", "经过大模型增强和电商场景优化，在电商场景完成远超通用翻译的翻译效果")}</span>
      </div>
      <img
        className={styles.mainImage}
        src="https://img.alicdn.com/imgextra/i4/O1CN01PZLWp21b0AVVxlrdx_!!6000000003402-2-tps-2704-1312.png"
        alt="Translation Demo"
      />
    </div>
  );
};

export default MarcoTranslation;

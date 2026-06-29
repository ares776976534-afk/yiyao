import React from 'react';
import ProductCardsGrid from './ProductCards';

import styles from './index.module.scss';
import { $t } from '@/i18n';

export default () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>{$t("global-1688-ai-app.seller-center.home.ChoiceSample.jxal", "精选案例")}</span>
        <span className={styles.headerSubtitle}>{$t("global-1688-ai-app.seller-center.home.ChoiceSample.sotehjz", "所有社区内容均有用户资源分享，未经同意不会展示。")}</span>
      </div>
      <div className={styles.productCardsGrid}>
        <ProductCardsGrid />
      </div>
    </div>
  )
}
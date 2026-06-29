import styles from './index.module.css';
import { $t } from '@/i18n';

const RecommendCard = () => {
  return (
    <div className={styles.recommendCard}>
        <div className={styles.recommendCardTitle}>{$t("global-1688-ai-app.ChatFlow.RecommendCard.qodh", "强烈推荐该市场，机会肉眼可见！")}</div>
        <div className={styles.recommendCardDescription}>{$t("global-1688-ai-app.ChatFlow.RecommendCard.dty1ojgmRmxgiyHjr", "但深挖数据发现：现有只有不到10个商品机会分高于20（满分100），推荐以下选品，建议用差异化产品或高性价比同款切入。")}</div>
    </div>
  );
};

export default RecommendCard;
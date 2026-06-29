import styles from './index.module.css';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import CopywritingSummary from '@/components/ChatFlow/CopywritingSummary';
import { EyeIcon } from '@/components/ChatFlow/EyeIcon';
import { $t } from '@/i18n';

export default function ItemComment({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.itemComment}>
      <div className={styles.itemCommentContent}>
        <div className={styles.itemCommentHeader}>
          <span className={styles.itemCommentHeaderText}>{$t("global-1688-ai-app.ChatFlow.ItemComment.productComment", "商品评论")}</span>
          <EyeIcon onClick={onClick} />
        </div>
        <div className={styles.itemCommentContent}>{$t("global-1688-ai-app.ChatFlow.ItemComment.piv", "好评点：")}</div>
        <div className={styles.itemCommentContent}>{$t("global-1688-ai-app.ChatFlow.ItemComment.niv", "差评点：")}</div>
      </div>
      <CopywritingSummary />
    </div>
  );
}
import styles from './index.module.css';
import { Markdown } from '@/components/ChatFlow/Markdown';
import { EyeIcon } from '@/components/ChatFlow/EyeIcon';
import { $t } from '@/i18n';

export default function CopywritingSummary({ summary, onClick, type }: { summary?: string; onClick?: () => void, type: string }) {
  const isMobile = type === 'mobile'
  return (
    <div className={styles.copywritingSummary}>
      <div className={styles.copywritingSummaryTitle}>
        <span className={styles.copywritingSummaryTitleText}>{$t("global-1688-ai-app.ChatFlow.CopywritingSummary.nrypj", "新品与热销品的差异总结")}</span>
        {!isMobile && <EyeIcon onClick={onClick} />}
      </div>
      <Markdown
        text={summary}
        chunkIntervalMs={50}
        streamGranularity="char"
        className="rightMardown"
      />
    </div>
  );
}
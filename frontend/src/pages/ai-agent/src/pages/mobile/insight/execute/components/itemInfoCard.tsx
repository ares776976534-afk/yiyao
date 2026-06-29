import styles from './itemInfoCard.module.scss';
import RadarChart from '@/components/ChatFlow/RadarChart';
import { $t } from '@/i18n';
interface ItemInfoCardProps {
  radarTitle: string;
  item: any;
  index: number;
  children?: React.ReactNode;
}
const ItemInfoCard = ({
  radarTitle,
  item,
  index,
  children
}: ItemInfoCardProps) => {
  const { mainImgUrl, title, onShelfDate, onShelfDays, radarVO, oppScore, oppScoreDesc } = item;
  return (
    <div className={styles.itemInfoCard}>
      <div className={styles.tabItem}>
        <span>{$t('global-1688-ai-app.studio-canvas.debug-tool.product', '商品')}{index + 1}</span>
        <div className={styles.tabHighlight} />
      </div>
      <div className={styles.itemCard}>
        <div className={styles.itemCardHeader}>
          <div className={styles.itemCardHeaderInfo}>
            <div className={styles.itemCardHeaderImg}>
              <img className={styles.itemCardHeaderImage} src={mainImgUrl} alt="" srcSet="" />
            </div>
            <div className={styles.itemCardHeaderDetails}>
              <div className={styles.itemCardHeaderTitle}>{title}</div>
              <div className={styles.itemCardHeaderDate}>
                {onShelfDate}{$t('global-1688-ai-app.ranking.ItemCard.onSale', '上架')}
                ｜{$t('global-1688-ai-app.ChatFlow.sjvalueday', `上架${onShelfDays}天`, [onShelfDays])}
              </div>
            </div>
          </div>
          <img className={styles.divider} src="https://img.alicdn.com/imgextra/i4/O1CN019Ov6oq1malxbMf8zv_!!6000000004971-55-tps-303-1.svg" alt="" />
          <div className={styles.opportunityInfo}>
            <div className={styles.opportunityDetails}>
              <div className={styles.opportunityScore}>
                <span className={styles.opportunityLabel}>{radarTitle}</span>
                <div className={styles.scoreDisplay}>
                  <span className={styles.scoreNumber}>{oppScore}</span>
                  <span className={styles.scoreUnit}>{$t('global-1688-ai-app.ChatFlow.TabCard.f', '分')}</span>
                </div>
              </div>
              <span className={styles.opportunitySubtext}>{oppScoreDesc}</span>
            </div>
            {radarVO?.propertyList?.length > 0 && (
              <div className={styles.tabContentChart}>
                <RadarChart radarDescription={radarVO?.radarDescription} radarTitle={radarTitle} oppScore={oppScore} data={radarVO?.propertyList || []} orther={{ width: '48px', height: '48px' }} />
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export default ItemInfoCard;
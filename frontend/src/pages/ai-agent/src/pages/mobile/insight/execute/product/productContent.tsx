import styles from './productContent.module.scss'
import { demandInfoPlatformMap } from '@/pages/select-product/components/RightComponents/SupplyInfo';
import CopywritingSummary from '@/components/ChatFlow/CopywritingSummary';
import { $t } from '@/i18n';

const ProductContent = ({ data, isProduct }) => {
  const { regionCn, platform, spItemCnt, spSoldCnt30d, spRatingAvg, catePath, summary } = data;
  const sections=[
    {
      title: $t('global-1688-ai-app.ChatFlow.SameInfo.productInformation', '商品信息'),
      stats: [
        [
          { label: $t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.ptgjregion', '平台/国家&地区'), value: `${demandInfoPlatformMap[platform]}/${regionCn}` },
          { label: $t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.tkproducts', '同款商品数'), value: spItemCnt },
        ],
        [
          { label: isProduct ? $t('global-1688-ai-app.select-product.ChatFlow.SameInfo.jya', '近30天SPU销量') : $t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.jys', '近30天销量'), value: spSoldCnt30d },
          { label: isProduct ? $t('global-1688-ai-app.ChatFlow.SameInfo.Srg', 'SPU平均评分') : $t('global-1688-ai-app.ChatFlow.SameInfo.rating', '评分'), value: spRatingAvg },
        ]
      ]
    }
  ]
  return (
    <div className={styles.productContent}>
      <div className={styles.contentSections}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={styles.amazonSection}>
            <div className={styles.amazonHeader}>
              <div className={styles.amazonIndicator} />
              <span className={styles.amazonTitle}>{section.title}</span>
            </div>
            {section.stats.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.amazonStats}>
                {row.map((item, itemIndex) => (
                  <div key={itemIndex} className={styles.amazonStatItem}>
                    <div className={styles.amazonStatLabel}>
                      <span>{item.label}</span>
                    </div>
                    <div className={styles.amazonStatValue}>
                      <span>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.sameInfo}>
        <div className={styles.sameInfoContentMiddleTitle}>
          <div className={styles.headerTitle}>
            <div className={styles.headerPoint} />
            <div className={styles.sameInfoContentMiddleTitleText}>{$t('global-1688-ai-app.ChatFlow.SameInfo.tlpd', '同类目销量Top5商品')}</div>
          </div>
          <div className={styles.sameInfoContentMiddleTitleTextSub}>{$t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.sslm', `所属类目：${catePath}`, [catePath])}</div>
        </div>
        <CopywritingSummary
          summary={summary}
          type='mobile'
        />
      </div>
    </div>
  )
}

export default ProductContent;
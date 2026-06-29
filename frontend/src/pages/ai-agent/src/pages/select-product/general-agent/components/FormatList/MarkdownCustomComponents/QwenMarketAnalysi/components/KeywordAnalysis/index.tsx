import { useState, useRef, useEffect } from 'react';
import styles from './index.module.css';
import Card from '../../../components/Card';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import { Tooltip, Popover } from 'antd';
import type { TypeMarketAnalysisItem } from '../../index';
import { $t } from '@/i18n';

interface TypeMetricCardProps {
  title: string;
  tooltip: string;
  value: React.ReactNode;
  tag?: string;
  tagColor?: string;
}

export const platformIconMap: Record<string, number> = {
  amazon: 21,
  tiktok: 26,
};

export const regionIconMap: Record<string, string> = {
  ID: '🇮🇩',
  VN: '🇻🇳',
  MY: '🇲🇾',
  TH: '🇹🇭',
  PH: '🇵🇭',
  US: '🇺🇸',
  SG: '🇸🇬',
  BR: '🇧🇷',
  MX: '🇲🇽',
  GB: '🇬🇧',
  ES: '🇪🇸',
  FR: '🇫🇷',
  DE: '🇩🇪',
  IT: '🇮🇹',
  JP: '🇯🇵',
};

export const colorMap = {
  BEST: '#21A84A',
  GOOD: '#0072FD',
  MEDIUM: '#FD963C',
  BAD: '#F55353'
};

const MetricCard: React.FC<TypeMetricCardProps> = ({ title, tooltip, value, tag, tagColor = '' }) => {
  const measureRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (measureRef.current) {
        // 使用隐藏的测量元素获取实际内容宽度
        const actualWidth = measureRef.current.offsetWidth;
        setIsOverflow(actualWidth > 149);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [value, tag]);

  // 内容渲染函数
  const renderContent = () => (
    <>
      <div className={styles.keywordAnalysisContentValueNumber}>{value}</div>
      {tag && (
        <div className={styles.keywordAnalysisContentValueDivider} style={{ color: colorMap[tagColor] }}>
          <span className={styles.keywordAnalysisContentValueDividerIcon}>/</span>
          <span className={styles.keywordAnalysisContentValueDividerText}>{tag}</span>
        </div>
      )}
    </>
  );

  const valueContent = (
    <div className={styles.keywordAnalysisContentValue}>
      {renderContent()}
    </div>
  );

  const popoverContent = (
    <div className={styles.popoverContent}>
      <div className={styles.keywordAnalysisContentTitle}>{title}</div>
      <div className={styles.popoverContentValue}>
        <div className={styles.keywordAnalysisContentValueNumber}>{value}</div>
        {tag && (
          <div className={styles.keywordAnalysisContentValueDividerPopover}>
            <div className={styles.keywordAnalysisContentValueDividerIcon}>/</div>
            <div className={styles.keywordAnalysisContentValueDividerTextPopover} style={{ color: colorMap[tagColor] }}>{tag}</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.keywordAnalysisContent}>
      <div className={styles.keywordAnalysisContentHeader}>
        <div className={styles.keywordAnalysisContentTitle}>{title}</div>
        {tooltip && (
          <Tooltip title={tooltip}>
            <img className={styles.infoIcon} src={imgIcon[13]} alt={$t('global-1688-ai-app.information', '信息')} />
          </Tooltip>
        )}
      </div>
      {/* 隐藏的测量元素，用于获取实际内容宽度 */}
      <div ref={measureRef} className={styles.measureContainer}>
        {renderContent()}
      </div>
      {isOverflow ? (
        <Popover content={popoverContent} rootClassName={styles.serviceCapabilityPopover}>
          {valueContent}
        </Popover>
      ) : (
        valueContent
      )}
    </div>
  );
};

const KeywordAnalysis =({ item }: { item: TypeMarketAnalysisItem }) => {

  return (
    <Card className={styles.keywordAnalysisCard}>
      <div className={styles.keywordAnalysisContainer}>
        {/* 头部：关键词 + 平台/地区图标 */}
        <div className={styles.keywordAnalysisHeader}>
          <div className={styles.keywordAnalysisHeaderLeft}>
            <div className={styles.keywordAnalysisHeaderLeftTitle}>{$t('global-1688-ai-app.keyword-analysis', '关键词分析')}</div>
            <div className={styles.keywordAnalysisHeaderLeftSubtitle}>{item.keyword}</div>
          </div>
          <div className={styles.keywordAnalysisHeaderRight}>
            <div className={styles.platformIcon}>
              <img
                className={styles.platformIconImg}
                src={imgIcon[platformIconMap[item.platform]]}
                alt={item.platform}
              />
            </div>
            <div className={styles.regionIcon}>
              {regionIconMap[item.region]}
            </div>
          </div>
        </div>

        {/* 内容：指标卡片 */}
        <div className={styles.keywordAnalysisContentContainer}>
          <div className={styles.keywordAnalysisContentContainerLeft}>
            <MetricCard
              title={$t('global-1688-ai-app.inquiry.FormatList.KeywordMarketAnalysisTable.oeu', '在线商品数')}
              tooltip={$t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.krlrsduay', '关键词（或叶子类目）搜索结果里的商品数量')}
              value={item?.activeProductCount}
              tag={item?.activeProductCountValueLevelDetail?.text}
              tagColor={item?.activeProductCountValueLevelDetail?.valueLevel}
            />
            <MetricCard
              title={$t('global-1688-ai-app.average-score-of-products', '商品平均分')}
              tooltip={$t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.krlPcRglyfrtSfk', '关键词（或叶子类目）前5页商品的平均评分，可用于了解该细分市场中商品的消费者满意情况')}
              value={item.productAverageRating}
              tag={item?.productAverageRatingValueLevelDetail?.text}
              tagColor={item?.productAverageRatingValueLevelDetail?.valueLevel}
            />
          </div>
          <div className={styles.keywordAnalysisContentContainerRight}>
            <MetricCard
              title={$t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.pjprice', '平均价格')}
              tooltip={$t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.pjprice.tooltip', '平均价格=近30天销售额/近30天销量，可用于了解该细分市场中普遍商品的价格水平')}
              value={item.sellingPrice}
              tag={item?.sellingPriceValueLevelDetail?.text}
              tagColor={item?.sellingPriceValueLevelDetail?.valueLevel}
            />
            <MetricCard
              title={$t('global-1688-ai-app.ReportDownload.soldAmt30d', '近30天销售额')}
              tooltip={$t('global-1688-ai-app.ReportDownload.soldAmt30d.tooltip', '选取部分代表性商品的销量、价格，结合市场整体规模进行计算')}
              value={item.lst30dSalesAmount}
              tag={item?.lst30dSalesAmountValueLevelDetail?.text}
              tagColor={item?.lst30dSalesAmountValueLevelDetail?.valueLevel}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default KeywordAnalysis;
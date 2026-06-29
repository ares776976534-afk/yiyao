import Card from '../../../components/Card';
import styles from './index.module.css';
import { TriangleIcon } from '@/components/Icon';
import LineAreaChart from '@/components/ChatFlow/LineAreaChart';
import type { TypeMarketAnalysisItem } from '../../index';
import { $t } from '@/i18n';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import { Tooltip } from 'antd';

interface TypeMarketAnalysisRightProps {
  item: TypeMarketAnalysisItem;
  containerHeight?: number;
}

interface TypeTrendCardProps {
  title: string;
  value: React.ReactNode;
  changeRate?: string;
  chartData: any[];
  isAmazon?: boolean;
  cardHeight?: number;
  reflect?: boolean;
  tooltip?: string;
}

const TrendCard: React.FC<TypeTrendCardProps> = ({ title, value, changeRate, chartData, isAmazon, cardHeight, reflect, tooltip }) => {
  // 截取字符串changeRate首位是不是-开头是的话TriangleIcon正常展示，不是的话旋转180度
  const isNegative = changeRate?.startsWith('-');

  const cardStyle = cardHeight ? { height: `${cardHeight}px` } : {};

  return (
    <Card className={`${styles.marketAnalysisRight} ${isAmazon ? styles.marketAnalysisRightAmazon : ''}`} style={cardStyle}>
      <div className={styles.marketAnalysisRightItem}>
        <div className={styles.marketAnalysisRightItemContent}>
          <div className={styles.marketAnalysisRightItemContentTitle}>
            {title}
            {tooltip && (
              <Tooltip title={tooltip}>
                <img className={styles.infoIcon} src={imgIcon[13]} alt={$t('global-1688-ai-app.information', '信息')} />
              </Tooltip>
            )}
          </div>
          <div className={styles.marketAnalysisRightItemContentValue}>{value}</div>
        </div>
        {changeRate && (
          <div className={isNegative ? styles.marketAnalysisRightItemValue : styles.isNegative}>
            <span className={isNegative ? '' : styles.triangleIconRotated}>
              <TriangleIcon fill={isNegative ? '' : '#6E50FF'} />
            </span>
            <div className={isNegative ? styles.marketAnalysisRightItemValueText : styles.isNegativeText}>{changeRate}</div>
          </div>
        )}
      </div>
      <div className={`${isAmazon ? styles.chartWrapper : styles.chartWrapperAmazon}`}>
        <LineAreaChart
          data={chartData}
          style={isAmazon ? {height: '84px', width: '100%'} : {height: '139px',width: '100%'}}
          height={isAmazon ? 84 : 139}
          reflect={reflect}
        />
      </div>
    </Card>
  );
};

const MarketAnalysisRight: React.FC<TypeMarketAnalysisRightProps> = ({ item, containerHeight }) => {
  const isAmazon = item.platform === 'amazon' && !!item?.keywordRank && (item?.keywordRankHisByM?.length ?? 0) > 0;
  
  // 计算每个卡片的高度：(总高度 - gap) / 卡片数量
  const gap = 10;
  const cardCount = isAmazon ? 2 : 1;
  const cardHeight = containerHeight ? (containerHeight - gap * (cardCount - 1)) / cardCount : undefined;
  
  return (
    <div className={styles.container} style={containerHeight ? { height: `${containerHeight}px` } : {}}>
      {isAmazon && <TrendCard
        title={$t('global-1688-ai-app.amazon-search-ranking-trend-in-the-past-month', "近1个月亚马逊搜索排名趋势")}
        value={item.keywordRank || '-'}
        chartData={item.keywordRankHisByM}
        isAmazon={isAmazon}
        cardHeight={cardHeight}
      />}
      <TrendCard
        title={$t('global-1688-ai-app.ReportDownload.soldCnt30d', "近30天销量")}
        tooltip='选取部分代表性商品的销量，结合市场整体规模进行计算'
        value={item.lst30dSalesVolume}
        changeRate={item.soldCntLst30dCir || '-'}
        chartData={item.lst30dSalesVolumeTrend}
        isAmazon={isAmazon}
        cardHeight={cardHeight}
        reflect={true}
      />
    </div>
  );
};

export default MarketAnalysisRight;
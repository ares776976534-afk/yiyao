import React, { useRef, useState, useEffect } from 'react';
import KeywordAnalysis from './components/KeywordAnalysis';
import MarketAnalysisRight from './components/MarketAnalysisRight';
import styles from './index.module.css';
import RingCard from './components/RingCard';
import Header from './components/Header';
import { $t } from '@/i18n';

interface TypeKeywordAnalysisProps {
  data: string;
  className?: string;
  class?: string;
}

export interface detailType {
  descL: string;
  text: string;
  valueLevel: string;
  valueLevelType: string;
}
export interface TypeMarketAnalysisItem {
  activeProductCount: string;
  activeProductCountValueLevelDetail: detailType;
  keyword: string;
  lst30dSalesAmount: string;
  lst30dSalesAmountValueLevelDetail: detailType;
  lst30dSalesVolume: number;
  lst180dNewItemSalesPt: string;
  platform: string;
  productAverageRating: string;
  productAverageRatingValueLevelDetail: detailType;
  region: string;
  sellingPrice: string;
  sellingPriceValueLevelDetail: detailType;
  soldAmtLst30dCir: string;
  soldCntLst30dCir: string;
  top5SalesProductSales: number;
  top5SalesProductTransactionRate: string;
  top3BrandMonopolyRate: string;
  chineseSellerRate: string;
  keywordRank: number;
  keywordRankHisByM: any[];
  lst30dSalesVolumeTrend: any[];
  top5SalesProductTransactionRateValueLevelDetail: detailType;
  top3BrandMonopolyRateValueLevelDetail: detailType;
  chineseSellerRateValueLevelDetail: detailType;
  lst180dNewItemSalesPtValueLevelDetail: detailType;
}
// 单个分析项组件，用于获取 KeywordAnalysis 高度
const MarketAnalysisItemWrapper: React.FC<{ item: TypeMarketAnalysisItem }> = ({ item }) => {
  const keywordRef = useRef<HTMLDivElement>(null);
  const [keywordHeight, setKeywordHeight] = useState<number>(0);

  useEffect(() => {
    if (!keywordRef.current) return;

    const updateHeight = () => {
      if (keywordRef.current) {
        setKeywordHeight(keywordRef.current.offsetHeight);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(keywordRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className={styles.marketAnalysisItem}>
      <div>
        <Header title={$t('global-1688-ai-app.market-analysis-title', '🔍 机会分析')} />
        <div className={styles.marketAnalysisItemContent}>
          <div ref={keywordRef}>
            <KeywordAnalysis item={item} />
          </div>
          <MarketAnalysisRight item={item} containerHeight={keywordHeight} />
        </div>
      </div>
      <div>
        <Header title={$t('global-1688-ai-app.supply-competition-title', '🔥 供给竞争')} />
        <RingCard item={item} />
      </div>
    </div>
  );
};

const QwenMarketAnalysis: React.FC<TypeKeywordAnalysisProps> = ({ data }) => {
  // 安全解析 JSON，避免 Safari 兼容性问题
  let parsedData: { marketAnalysisList?: TypeMarketAnalysisItem[] };
  try {
    parsedData = JSON.parse(data || '{}');
  } catch {
    return null;
  }

  const { marketAnalysisList } = parsedData;

  if (!marketAnalysisList || !Array.isArray(marketAnalysisList)) {
    return null;
  }
  return (
    <>
      {marketAnalysisList.map((item, index) => (
        <MarketAnalysisItemWrapper key={index} item={item} />
      ))}
    </>
  );
};

export default QwenMarketAnalysis;
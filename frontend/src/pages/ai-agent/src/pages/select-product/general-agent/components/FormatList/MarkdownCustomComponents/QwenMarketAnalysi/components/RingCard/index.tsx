import React, { memo, useMemo } from 'react';
import styles from './index.module.css';
import Card from '../../../components/Card';
import RingChart from '@/components/ChatFlow/RingChart';
import RingChartEmpty from './RingChartEmpty';
import { Tooltip } from 'antd';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import type { TypeMarketAnalysisItem } from '../../index';
import { $t } from '@/i18n';

interface TypeRingCardItemProps {
  title: string;
  tooltip: string;
  data: any[];
  percent: string;
  level: string;
  name: string;
}

const RingCardItem: React.FC<TypeRingCardItemProps> = memo(({ title, tooltip, data, level, percent, name }) => {
  // 判断是否有有效数据
  const hasData = percent !== undefined && percent !== null && percent !== '';

  // 使用 useMemo 稳定 data 引用
  const stableData = useMemo(() => data, [JSON.stringify(data)]);

  return (
  <Card className={styles.ringCard}>
    <div className={styles.ringCardTitle}>
      <div className={styles.ringCardTitleText}>{title}</div>
      <Tooltip title={tooltip}>
        <img className={styles.infoIcon} src={imgIcon[13]} alt={$t('global-1688-ai-app.information', '信息')}/>
      </Tooltip>
    </div>
    <div className={styles.ringChartWrapper}>
        {hasData ? (
      <RingChart data={stableData} level={level} percent={percent} name={name} />
        ) : (
          <RingChartEmpty />
        )}
    </div>
  </Card>
);
}, (prevProps, nextProps) => {
  // 只有当关键值变化时才重新渲染
  return (
    prevProps.percent === nextProps.percent &&
    prevProps.level === nextProps.level &&
    prevProps.name === nextProps.name &&
    prevProps.title === nextProps.title
  );
});

const RingCard = memo(({ item }: { item: TypeMarketAnalysisItem }) => {
  const RING_CARD_CONFIG: TypeRingCardItemProps[] = [
    {
      title: $t('global-1688-ai-app.ReportDownload.itemMonopolyCoefficient', '商品垄断系数'),
      tooltip: $t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.TartTartteyodhs', 'Top3销量商品成交占比 = Top3销量商品的月销量总和/所有动销商品的月销量总和'),
      data: [{ percent: item?.top5SalesProductTransactionRate, type: $t('global-1688-ai-app.ReportDownload.itemMonopolyCoefficient', '商品垄断系数') }],
      percent: item?.top5SalesProductTransactionRate,
      level: item?.top5SalesProductTransactionRateValueLevelDetail?.valueLevel,
      name: item?.top5SalesProductTransactionRateValueLevelDetail?.text,
    },
    {
      title: $t('global-1688-ai-app.ReportDownload.brandMonopolyCoefficient', '品牌垄断系数'),
      tooltip: $t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.TrrtTrrtteyodhs', 'Top5品牌商品成交占比 = Top5品牌商品的月销量总和/所有动销商品的月销量总和'),
      data: [{ percent: item?.top3BrandMonopolyRate, type: $t('global-1688-ai-app.ReportDownload.brandMonopolyCoefficient', '品牌垄断系数') }],
      percent: item?.top3BrandMonopolyRate,
      level: item?.top3BrandMonopolyRateValueLevelDetail?.valueLevel,
      name: item?.top3BrandMonopolyRateValueLevelDetail?.text,
    },
    {
      title: $t('global-1688-ai-app.ReportDownload.cnSellerPt', '中国卖家占比'),
      tooltip: $t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.zlzlodhsddMSz', '中国卖家占比 = 中国卖家商品的月销量总和/所有动销商品的月销量总和'),
      data: [{ percent: item.chineseSellerRate, type: $t('global-1688-ai-app.ReportDownload.cnSellerPt', '中国卖家占比') }],
      percent: item.chineseSellerRate,
      level: item?.chineseSellerRateValueLevelDetail?.valueLevel,
      name: item?.chineseSellerRateValueLevelDetail?.text,
    },
    {
      title: $t('global-1688-ai-app.ReportDownload.newProductSalesPt', '新品销量占比'),
      tooltip: $t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.nrceirtteyodhs', '新品成交占比 = 新品商品的月销量总和/所有动销商品的月销量总和'),
      data: [{ percent: item.lst180dNewItemSalesPt, type: $t('global-1688-ai-app.ReportDownload.newProductSalesPt', '新品销量占比') }],
      percent: item.lst180dNewItemSalesPt,
      level: item?.lst180dNewItemSalesPtValueLevelDetail?.valueLevel,
      name: item?.lst180dNewItemSalesPtValueLevelDetail?.text
    },
  ];
  return (
    <div className={styles.ringCardContainer}>
      {RING_CARD_CONFIG.map((config) => (
        <RingCardItem key={config.title} {...config} />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // 比较关键字段是否变化
  const prevItem = prevProps.item;
  const nextItem = nextProps.item;
  return (
    prevItem?.top5SalesProductTransactionRate === nextItem?.top5SalesProductTransactionRate &&
    prevItem?.top3BrandMonopolyRate === nextItem?.top3BrandMonopolyRate &&
    prevItem?.chineseSellerRate === nextItem?.chineseSellerRate &&
    prevItem?.lst180dNewItemSalesPt === nextItem?.lst180dNewItemSalesPt
  );
});

export default RingCard;
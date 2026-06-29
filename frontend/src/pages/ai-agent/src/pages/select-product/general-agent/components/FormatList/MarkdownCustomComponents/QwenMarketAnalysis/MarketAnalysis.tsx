import React, { useState } from 'react';
import styles from './marketAnalysis.module.css';
import { Tooltip } from 'antd';
import { $t } from '@/i18n';

interface SectionData {
  title: string;
  data: {
    [key: string]: string | number;
  };
  typeKey: string;
}

interface MarketAnalysisProps {
  data: SectionData[];
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ data }) => {

  const renderMetric = (label: string, value: string | number, tooltip: string = '') => (
    <div className={styles.metric}>
      <div className={tooltip ? styles.metricLabelWithIcon : styles.metricLabel}>
        <span className={styles.labelText}>{label}</span>
        {tooltip && (
          <Tooltip title={tooltip}>
            <img
              className={styles.infoIcon}
              src="https://img.alicdn.com/imgextra/i3/6000000001952/O1CN01wbVMIX1QI4DyIUBNS_!!6000000001952-2-gg_dtc.png"
              alt={$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.information", "信息")}
            />
          </Tooltip>
        )}
      </div>
      <div className={styles.metricValue}>
        <span className={styles.valueText}>{value}</span>
      </div>
    </div>
  );

  const renderSalesSection = (data: any) => (
    <div className={styles.salesSection}>
      <span className={styles.sectionTitle}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.xoi", "销售信息")}</span>
      <div className={styles.metricsContainer}>
        <div className={styles.metricsRow}>
          {renderMetric($t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.ptgjregion", "平台/国家&地区"), `${data.platform || '-'}/${data.region || '-'}`)}
          {renderMetric($t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.zsproducts", "在售商品数"), data.activeProductCount || '-', $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.krlrsduay", "关键词（或叶子类目）搜索结果里的商品数量"))}
          {renderMetric($t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.smprice", "售卖价格"), `${data.sellingPrice || '-'}`, $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.pctMSAalsPci", "平均价格=月销售额/月销量，可用于了解该细分市场中普遍商品的价格水平"))}
        </div>
        <div className={styles.metricsRow}>
          {renderMetric($t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.jys", "近30天销量"), `${data.lst30dSalesVolume || '-'}`)}
          {renderMetric($t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.pca", "商品平均评分"), data.productAverageRating || '-', $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.krlPcRglyfrtSfk", "关键词（或叶子类目）前5页商品的平均评分，可用于了解该细分市场中商品的消费者满意情况"))}
          {renderMetric($t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.j30dayxse", "近30天销售额"), data.lst30dSalesAmount || '-')}
        </div>
      </div>
    </div>
  );

  const renderCompetitionSection = (data: any) => (
    <div className={styles.competitionSection}>
      <span className={styles.sectionTitle}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.joi", "竞争信息")}</span>
      <div className={styles.metricsContainer}>
        <div className={styles.metricsRow}>
          {renderMetric($t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.pcs", "商品垄断系数"), data.top5SalesProductTransactionRate || '-', $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.TartTartteyodhs", "Top3销量商品成交占比 = Top3销量商品的月销量总和/所有动销商品的月销量总和"))}
          {renderMetric($t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.brandldxs", "品牌垄断系数"), `${data.top3BrandMonopolyRate || '-'}`, $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.TrrtTrrtteyodhs", "Top5品牌商品成交占比 = Top5品牌商品的月销量总和/所有动销商品的月销量总和"))}
        </div>
        <div className={styles.metricsRow}>
          {renderMetric($t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.zgsellerzb", "中国卖家占比"), `${data.chineseSellerRate || '-'}`, $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.zlzlodhsddMSz", "中国卖家占比 = 中国卖家商品的月销量总和/所有动销商品的月销量总和"))}
          {renderMetric($t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.nrSz", "新品销量占比"), `${data.lst180dNewItemSalesPt || '-'}`, $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.nrceirtteyodhs", "新品成交占比 = 新品商品的月销量总和/所有动销商品的月销量总和"))}
        </div>
      </div>
    </div>
  );
  return (
    <div className={styles.content}>
      {data.map((section, index) => (
        <React.Fragment key={section.typeKey}>
          {section.typeKey === "salesInfo" && renderSalesSection(section.data)}
          {section.typeKey === "competitiveInfo" && renderCompetitionSection(section.data)}
          {index < data.length - 1 && (
            <img
              className={styles.divider}
              src="https://img.alicdn.com/imgextra/i1/6000000002732/O1CN01czKrM51W3J9iGc8ni_!!6000000002732-2-gg_dtc.png"
              alt={$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.fgx", "分割线")}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MarketAnalysis;

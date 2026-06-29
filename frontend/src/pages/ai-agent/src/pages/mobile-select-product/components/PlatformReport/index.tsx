import React from 'react';
import { platformAgent, improveAgent, productAgent } from '../../utils';
import { Markdown } from '@/components/MobileMarkdown';
import styles from './index.module.scss';
import { $t } from '@/i18n';

function PlatformReport({ data, blocks, format }: { data: any; blocks: any; format: string }) {
  const report = format === 'platformAgent' ? platformAgent(data, blocks)
    : (format === 'productAgent' ? productAgent(data, blocks)
      : improveAgent(data, blocks));


  // console.log(report);
  const { defaultShowKeyword = '', keywordList = [] } = report;

  const currentKeyword = (keywordList || []).find(item => item.keyword === defaultShowKeyword);

  const { oppProductList = [] } = report?.comparedProductData || report?.improvedAnalysisProductData || {};


  const supplyInfoList: { name: string; value: string }[] = [];

  supplyInfoList.push(currentKeyword.supplyInfo.brandMonopolyCoefficient);
  supplyInfoList.push(currentKeyword.supplyInfo.cnSellerPct);
  supplyInfoList.push(currentKeyword.supplyInfo.itemCount);
  supplyInfoList.push(currentKeyword.supplyInfo.itemMonopolyCoefficient);
  supplyInfoList.push(currentKeyword.supplyInfo.newProductSalesPct);
  supplyInfoList.push(currentKeyword.supplyInfo.ratingAvg);

  return (
    <div className={styles.platformReportContainer}>
      <div className={styles.platformReportBubble}>
        <div className={styles.platformReportBubbleTitle}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.keywordjhf", `关键词机会分:${currentKeyword?.oppScore}`, [currentKeyword?.oppScore])}</div>
        <div className={styles.platformReportBubbleSubTitle}>{currentKeyword?.oppScoreDesc || ''}</div>
      </div>

      <div className={styles.sectionHeader}>
        <div className={styles.indicator} />
        <span className={styles.sectionTitle}>{report?.keywordSummaryData?.title}</span>
      </div>
      <div className={styles.platformReportSummary}>
        <Markdown text={report?.keywordSummaryData?.keywordSummary?.summary} />
      </div>

      <div className={styles.platformReportSummary}>
        <div className={styles.platformReportSummaryWapper}>
          <div className={styles.platformReportSummaryTitle}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.ggqk", "供给情况")}</div>
          <div className={styles.platformReportSummaryItemList}>
            {
              (supplyInfoList || []).map(item => {
                return (
                  <div key={item.name} className={styles.platformReportSummaryItem}>
                    <div className={styles.platformReportSummaryItemLabel}>{item.name}</div>
                    <div className={styles.platformReportSummaryItemValue}>{item.value}</div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>

      <div className={styles.platformReportSummary}>
        <div className={styles.platformReportSummaryWapper}>
          <div className={styles.platformReportSummaryTitle}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.pck", "商品销售情况")}</div>
          <div className={styles.platformReportSummaryItemList}>

            <div className={styles.platformReportSummaryItem}>
              <div className={styles.platformReportSummaryItemLabel}>
                {currentKeyword?.salesInfo?.soldAmt30d?.name}</div>
              <div className={styles.platformReportSummaryItemValue}>
                {currentKeyword?.salesInfo?.soldAmt30d?.value?.amountWithSymbol}
              </div>
            </div>

            <div className={styles.platformReportSummaryItem}>
              <div className={styles.platformReportSummaryItemLabel}>
                {currentKeyword?.salesInfo?.soldCnt30d?.name}</div>
              <div className={styles.platformReportSummaryItemValue}>
                {currentKeyword?.salesInfo?.soldCnt30d?.value}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <div className={styles.indicator} />
        <span className={styles.sectionTitle}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.pcA", "商品机会和AI总结")}</span>
      </div>

      <div className={styles.platformReportAiSummaryList}>
        {(oppProductList || []).map((item, index) => {
          return (
            <div className={styles.platformReportAiSummaryItem} key={index}>
              <div className={styles.platformReportAiSummaryTitle}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.product", `商品${index + 1}`, [index + 1])}</div>
              <div>
                <div className={styles.platformReportAiSummaryItemContent}>
                  <div className={styles.offerInfo}>
                    <div className={styles.offerInfoCard}>
                      <div className={styles.offerInfoCardImage}><img src={item.mainImgUrl} alt="" /></div>
                      <div className={styles.offerInfoCardContent}>
                        <div className={styles.offerInfoCardTitle}>{item.title}</div>
                        <div className={styles.offerInfoCardTime}>
                          <span>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.sj", `${item?.onShelfDate}上架`, [item?.onShelfDate])}</span>
                          <span>|</span>
                          <span>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.sjday", `上架${item?.onShelfDays}天`, [item?.onShelfDays])}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.offerSubInfo}>
                      <div className={styles.offerSubInfoLabel}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.jhzs", "机会指数")}<span className={styles.offerSubInfoLabelScore}>
                          {item.oppScore || item.improvementOppScore}</span>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.f", "分")}</div>
                      <div className={styles.offerSubInfoLabel}>{item.itemSubInfo}</div>
                    </div>
                  </div>
                  <div className={styles.offerSubInfoList}>
                    <div className={styles.platformReportAiSummaryItemContentTitle}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.tdna", `${item.platform}同款商品信息`, [item.platform])}</div>
                    <div className={styles.platformReportSummaryItemList}>
                      {
                        item.platform && item.regionCn && (
                          <div className={styles.platformReportSummaryItem}>
                            <div className={styles.platformReportSummaryItemLabel}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.ptgjregion", "平台/国家&地区")}</div>
                            <div className={styles.platformReportSummaryItemValue}>
                              {item.platform}/{item.regionCn}
                            </div>
                          </div>
                        )
                      }

                      {
                        item?.spItemCnt && (
                          <div className={styles.platformReportSummaryItem}>
                            <div className={styles.platformReportSummaryItemLabel}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.tkproducts", "同款商品数")}</div>
                            <div className={styles.platformReportSummaryItemValue}>
                              {item?.spItemCnt}
                            </div>
                          </div>
                        )
                      }

                      <div className={styles.platformReportSummaryItem}>
                        <div className={styles.platformReportSummaryItemLabel}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.pjrating", "平均评分")}</div>
                        <div className={styles.platformReportSummaryItemValue}>
                          {item?.spInfo?.spRatingMid}
                        </div>
                      </div>
                      <div className={styles.platformReportSummaryItem}>
                        <div className={styles.platformReportSummaryItemLabel}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.zae", "最近30天销量")}</div>
                        <div className={styles.platformReportSummaryItemValue}>
                          {item.soldCnt30d}
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className={styles.platformReportAiSummaryItemContentInfo}>
                    <div className={styles.platformReportAiSummaryItemContentTitle}>Ai总结</div>
                    <div className={styles.platformReportAiSummaryItemContentInfoCategory}>{$t("global-1688-ai-app.mobile-select-product.PlatformReport.sslm", `所属类目：${item.catePath}`, [item.catePath])}</div>
                    <Markdown text={item.summary || item.improvementSuggestionSummary || ''} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlatformReport;

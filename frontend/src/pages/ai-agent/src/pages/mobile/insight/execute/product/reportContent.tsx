import styles from './reportContent.module.scss';
import { Report, DemandSituation, InfoCard, ItemInfoCard } from '@/pages/mobile/insight/execute/components';
import { KeywordSummaryData } from '@/pages/select-product/components/RightComponents/KeywordSummaryData';
import { demandInfoPlatformMap, iconTitleMap } from '@/pages/select-product/components/RightComponents/SupplyInfo';
import { getValue } from '@/utils/valueExtractor';
import ProductContent from './productContent';
import { $t } from '@/i18n';

export const regionTextMap: Record<string, string> = {
  ID: '印度尼西亚',
  VN: '越南',
  MY: '马来西亚',
  TH: '泰国',
  PH: '菲律宾',
  US: '美国',
  SG: '新加坡',
  BR: '巴西',
  MX: '墨西哥',
  GB: '英国',
  ES: '西班牙',
  FR: '法国',
  DE: '德国',
  IT: '意大利',
  JP: '日本',
};

const ReportContent = (props) => {
  const { visible, onMaskClick, title, keywordList, defaultShowKeyword, keywordSummaryData, googleKeywordData, comparedProductData } = props;
  const _keywordList = keywordList?.filter((item) => item.keyword === defaultShowKeyword)
  const { demandInfo, platform = 'amazon', region, supplyInfo, salesInfo } = _keywordList[0];
  const googleKeywordList = googleKeywordData?.keywordList || [];
  const { searchVolume, trends, trendsIsBiggerHigher, trendsPointName, trendsDesc, searchVolumeDesc } = googleKeywordList[0] || {};
  return (
    <Report
      visible={visible}
      onMaskClick={onMaskClick}
      title={title}
    >
      <>
        {_keywordList?.map((ele) => (
          <div className={styles.scoreCard} key={ele.keyword}>
            <div className={styles.scoreText}>
              <span>{$t("global-1688-ai-app.select-product.format.nrj", `新品机会分：${ele.oppScore}`, [ele.oppScore || 0])}</span>
            </div>
            <div className={styles.scoreSubtext}>{ele.oppScoreDesc}</div>
          </div>
        ))}
        <div className={styles.infoDataContainer}>
          <KeywordSummaryData keywordSummaryData={keywordSummaryData} />
          <DemandSituation
            list={[
              {
                title: demandInfoPlatformMap[platform],
                subTitle: demandInfo?.searchRankDesc,
                iconTitle: iconTitleMap[platform],
                value: demandInfo?.searchRank,
                areaTitle: demandInfo?.rankTrendsDesc,
                areaData: demandInfo?.rankTrends,
                toolTipYName: demandInfo?.rankTrendsPointName,
                reflect: demandInfo?.rankTrendsIsBiggerHigher,
                searchRankLevelDesc: demandInfo?.searchRankLevelDesc
              },
              {
                title: 'Google Trends',
                subTitle: searchVolumeDesc,
                iconTitle: 'https://img.alicdn.com/imgextra/i2/O1CN01KmWtYO1D8pD3uB8w1_!!6000000000172-2-tps-24-24.png',
                value: searchVolume,
                areaTitle: trendsDesc,
                areaData: trends,
                toolTipYName: trendsPointName,
                reflect: trendsIsBiggerHigher,
              },
            ]}
          />
          <div className={styles.infoData}>
            <InfoCard
              title={$t("global-1688-ai-app.select-product.RightComponents.SupplyInfo.ggqk", "供给情况")}
              list={[
                {
                  lable: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.ptgjregion", "平台/国家&地区"),
                  value: `${demandInfoPlatformMap[platform]}/${regionTextMap[region]}`,
                  key: '1',
                },
                {
                  lable: supplyInfo?.itemCount?.name,
                  value: getValue(supplyInfo?.itemCount),
                  key: '2',
                  tip: supplyInfo?.itemCount?.desc,
                }
              ]}
            />
            <InfoCard
              title={$t("global-1688-ai-app.select-product.RightComponents.SalesInfo.pck", "商品销售情况")}
              list={[
                {
                  lable: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.jys", "近30天销量"),
                  value: getValue(salesInfo?.soldCnt30d),
                  key: '1',
                  tip: salesInfo?.soldCnt30d?.desc,
                },
                {
                  lable: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.j30dayxse", "近30天销售额"),
                  value: getValue(salesInfo?.soldAmt30d),
                  key: '2',
                  tip: salesInfo?.soldAmt30d?.desc,
                }
              ]}
            />
          </div>      
        </div>
        <div className={styles.productSection}>
          <div className={styles.productSectionHeader} >
            <div className={styles.Icon} />
            <span className={styles.productSectionTitle}>{$t("global-1688-ai-app.select-product.RightComponents.ProductReportBoard.gjscfx", "关键词市场分析")}</span>
          </div >
          {comparedProductData?.oppProductList?.map((item, index) => (
            <ItemInfoCard
              radarTitle={$t("global-1688-ai-app.select-product.RightComponents.ProductReportBoard.jhzs", "机会指数")}
              item={item}
              index={index}
              children={
                <ProductContent
                  data={item}
                  isProduct={comparedProductData?.isProduct}
                />
              }
            />
          ))}
        </div>
      </>
    </Report>
  )
}

export default ReportContent;
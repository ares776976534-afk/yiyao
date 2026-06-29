import DemandSituation from '@/components/ChatFlow/DemandSituation';
import ProductInfo from '@/components/ChatFlow/ProductInfo';
import { getValue } from '@/utils/valueExtractor';
import { Tooltip } from 'antd';
import { $t } from '@/i18n';
import { imgIcon } from '@/components/ChatFlow/imgIcon';

export const demandInfoPlatformMap = {
  'amazon': 'Amazon',
  'tiktok': 'TikTok',
}
export const iconTitleMap = {
  'amazon': 'https://img.alicdn.com/imgextra/i3/O1CN01ybyGlr1Sxra9oCFYW_!!6000000002314-2-tps-24-24.png',
  'tiktok': 'https://img.alicdn.com/imgextra/i4/O1CN0183uY301m5d0Zh3KWs_!!6000000004903-2-tps-32-32.png',
}
export const SupplyInfo = (props: any) => {
  const { keywordList, defaultActiveIndex, googleKeywordData } = props;

  const { supplyInfo, demandInfo, platform = 'amazon' } = keywordList?.[defaultActiveIndex] || {};
  const googleKeywordList = googleKeywordData?.keywordList || [];
  const { searchVolume, trends, trendsIsBiggerHigher, trendsPointName, trendsDesc, searchVolumeDesc } = googleKeywordList[0] || {};


  return (
    <div className='flex gap-[12px] mb-[12px]'>
      <DemandSituation
        styles={{
          flex: 1,
          width: 'calc(50% - 6px)',
        }}
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
          // tiktokData?.cardSubType === 'CATE_SELECT_CARD' && {
          //   title: 'Tiktok',
          //   subTitle: keywordList[0]?.demandInfo?.salesMoneyLst30dDesc,
          //   iconTitle: 'https://img.alicdn.com/imgextra/i4/O1CN0183uY301m5d0Zh3KWs_!!6000000004903-2-tps-32-32.png',
          //   value: keywordList[0]?.demandInfo?.salesMoneyLst30d,
          //   areaTitle: keywordList[0]?.demandInfo?.salesMoneyLst12mDesc,
          //   areaData: keywordList[0]?.demandInfo?.salesMoneyLst12mTrends || [],
          //   cardSubType: 'CATE_SELECT_CARD',
          //   toolTipYName: '销售额',
          // },
        ].filter(Boolean)}
      />
      <ProductInfo
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{$t("global-1688-ai-app.select-product.RightComponents.SupplyInfo.ggqk", "供给情况")}<Tooltip title={$t("global-1688-ai-app.select-product.RightComponents.SupplyInfo.wqtbdujrostyowcj", "为保证分析质量，仅选取部分代表性的商品指标计算（量级：千）。若在售商品数较少，可能因关键词较长尾、较窄或市场尚处早期阶段。")} placement="top">
              <img style={{ width: 14, height: 14, cursor: 'pointer' }} src={imgIcon[13]} alt="" />
            </Tooltip>
          </div>
        }
        className={`bg-[#FBFBFD] rounded-[12px] flex-1 p-[16px] ${platform === 'amazon' ? 'gap-[16px]' : 'gap-[24px]'}`}
        platform={platform}
        data={[
          [
            {
              title: $t("global-1688-ai-app.select-product.RightComponents.SupplyInfo.zsproducts", "在售商品数"),
              value: getValue(supplyInfo?.itemCount),
              desc: supplyInfo?.itemCount?.desc,
              text: supplyInfo?.itemCount?.valueLevelDetail?.text,
              searchRankLevel: supplyInfo?.itemCount?.valueLevelDetail?.valueLevel,
              searchRankLevelDesc: supplyInfo?.itemCount?.valueLevelDetail?.valueLevelDesc,
            },
            {
              title: $t("global-1688-ai-app.select-product.RightComponents.SupplyInfo.pcs", "商品垄断系数"),
              value: getValue(supplyInfo?.itemMonopolyCoefficient),
              desc: supplyInfo?.itemMonopolyCoefficient?.desc,
              text: supplyInfo?.itemMonopolyCoefficient?.valueLevelDetail?.text,
              searchRankLevel: supplyInfo?.itemMonopolyCoefficient?.valueLevelDetail?.valueLevel,
              searchRankLevelDesc: supplyInfo?.itemMonopolyCoefficient?.valueLevelDetail?.valueLevelDesc,
            }
          ],
          platform === 'amazon' && [
            {
              title: $t("global-1688-ai-app.select-product.RightComponents.SupplyInfo.brandldxs", "品牌垄断系数"),
              value: getValue(supplyInfo?.brandMonopolyCoefficient),
              desc: supplyInfo?.brandMonopolyCoefficient?.desc,
              text: supplyInfo?.brandMonopolyCoefficient?.valueLevelDetail?.text,
              searchRankLevel: supplyInfo?.brandMonopolyCoefficient?.valueLevelDetail?.valueLevel,
              searchRankLevelDesc: supplyInfo?.brandMonopolyCoefficient?.valueLevelDetail?.valueLevelDesc,
            },
            {
              title: $t("global-1688-ai-app.select-product.RightComponents.SupplyInfo.zgsellerzb", "中国卖家占比"),
              value: getValue(supplyInfo?.cnSellerPct),
              desc: supplyInfo?.cnSellerPct?.desc,
              text: supplyInfo?.cnSellerPct?.valueLevelDetail?.text,
              searchRankLevel: supplyInfo?.cnSellerPct?.valueLevelDetail?.valueLevel,
              searchRankLevelDesc: supplyInfo?.cnSellerPct?.valueLevelDetail?.valueLevelDesc,
            },
          ],
          [
            {
              title: $t("global-1688-ai-app.select-product.RightComponents.SupplyInfo.nrSz", "新品销量占比"),
              value: getValue(supplyInfo?.newProductSalesPct),
              desc: supplyInfo?.newProductSalesPct?.desc,
              text: supplyInfo?.newProductSalesPct?.valueLevelDetail?.text,
              searchRankLevel: supplyInfo?.newProductSalesPct?.valueLevelDetail?.valueLevel,
              searchRankLevelDesc: supplyInfo?.newProductSalesPct?.valueLevelDetail?.valueLevelDesc,
            },
            {
              title: $t("global-1688-ai-app.select-product.RightComponents.SupplyInfo.pca", "商品平均评分"),
              value: getValue(supplyInfo?.ratingAvg),
              desc: supplyInfo?.ratingAvg?.desc,
              text: supplyInfo?.ratingAvg?.valueLevelDetail?.text,
              searchRankLevel: supplyInfo?.ratingAvg?.valueLevelDetail?.valueLevel,
              searchRankLevelDesc: supplyInfo?.ratingAvg?.valueLevelDetail?.valueLevelDesc,
            },
          ],
        ].filter(Boolean)}
      />
    </div>
  );
};
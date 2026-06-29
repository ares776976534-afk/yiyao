import ProductInfo from '@/components/ChatFlow/ProductInfo';
import { getValue } from '@/utils/valueExtractor';
import { $t } from '@/i18n';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import { Tooltip } from 'antd';

export const SalesInfo = (props: any) => {
  const { keywordList, defaultActiveIndex } = props;
  const { salesInfo, profitInfo, demandInfo } = keywordList?.[defaultActiveIndex] || {};
  
  if (!salesInfo) return null;
  return (
    <div className='flex gap-[12px]'>
      <ProductInfo
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{$t("global-1688-ai-app.select-product.RightComponents.SalesInfo.pck", "商品销售情况")}<Tooltip title={$t("global-1688-ai-app.select-product.RightComponents.SalesInfo.wqtbdujrostyowcj", "为保证分析质量，仅选取部分代表性的商品指标计算（量级：千）。若在售商品数较少，可能因关键词较长尾、较窄或市场尚处早期阶段。")} placement="top">
              <img style={{ width: 14, height: 14, cursor: 'pointer' }} src={imgIcon[13]} alt="" />
            </Tooltip>
          </div>
        }
        className="bg-[#FBFBFD] rounded-[12px] flex-1 p-[16px] w-[calc(50% - 6px)] gap-[16px]"
        data={[[
          {
            title: $t("global-1688-ai-app.select-product.RightComponents.SalesInfo.jys", "近30天销量"),
            value: getValue(salesInfo?.soldCnt30d),
            direction: salesInfo?.soldCnt30d?.growthRate?.direction,
            trend: salesInfo?.soldCnt30d?.growthRate?.value,
            text: salesInfo?.soldCnt30d?.valueLevelDetail?.text,
            searchRankLevel: salesInfo?.soldCnt30d?.valueLevelDetail?.valueLevel,
            searchRankLevelDesc: salesInfo?.soldCnt30d?.valueLevelDetail?.valueLevelDesc,
          },
          {
            title: $t("global-1688-ai-app.select-product.RightComponents.SalesInfo.j30dayxse", "近30天销售额"),
            value: getValue(salesInfo?.soldAmt30d),
            direction: salesInfo?.soldAmt30d?.growthRate?.direction,
            trend: salesInfo?.soldAmt30d?.growthRate?.value,
            text: salesInfo?.soldAmt30d?.valueLevelDetail?.text,
            searchRankLevel: salesInfo?.soldAmt30d?.valueLevelDetail?.valueLevel,
            searchRankLevelDesc: salesInfo?.soldAmt30d?.valueLevelDetail?.valueLevelDesc,
          },
          {
            title: $t("global-1688-ai-app.select-product.RightComponents.SalesInfo.pjprice", "平均价格"),
            value: getValue(profitInfo?.priceAvg),
            desc: profitInfo?.priceAvg?.desc,
            text: profitInfo?.priceAvg?.valueLevelDetail?.text,
            searchRankLevel: profitInfo?.priceAvg?.valueLevelDetail?.valueLevel,
            searchRankLevelDesc: profitInfo?.priceAvg?.valueLevelDetail?.valueLevelDesc,
          },
          {
            title: $t("global-1688-ai-app.select-product.RightComponents.SalesInfo.joas", "近12个月销量趋势"),
            lineChartData: demandInfo?.salesVolumeTrends,
            toolTipYName: demandInfo?.salesVolumeTrendsPointName,
            reflect: demandInfo?.isBiggerHigherSalesVolumeTrends,
            salesVolumeTrendsDesc: demandInfo?.salesVolumeTrendsDesc
          },
        ]]}
      />
      {/* <ProductInfo
        title="利润情况"
        className="flex-1 bg-[#FBFBFD] rounded-[12px] p-[16px] gap-[16px]"
        data={[[
          {
            title: '平均价格',
            value: getValue(profitInfo?.priceAvg),
            desc: profitInfo?.priceAvg?.desc,
            searchRankLevel: demandInfo?.searchRankLevel
          },
          {
            title: '采购成本占比',
            value: getValue(profitInfo?.procurementCostRate),
            desc: profitInfo?.procurementCostRate?.desc,
            searchRankLevel: demandInfo?.searchRankLevel
          },
          {
            title: '平均采购成本',
            value: getValue(profitInfo?.procurementCostAvg),
            desc: profitInfo?.procurementCostAvg?.desc,
            searchRankLevel: demandInfo?.searchRankLevel
          },
        ]]}
      /> */}
    </div>
  );
};
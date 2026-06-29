import ItemInfoCard from '@/components/ChatFlow/ItemInfoCard';
import { CompareInfo } from './CompareInfo';
import { useSelectProductStore } from '@/stores/select-product';
import { HeaderCarouselCard } from '../RightComponents/HeaderCarouselCard';
import { LoadReport } from '../RightComponents/LoadReport';
import { KeywordSummaryData } from '../RightComponents/KeywordSummaryData';
import { SupplyInfo } from '../RightComponents/SupplyInfo';
import { SalesInfo } from '../RightComponents/SalesInfo';
import styles from '../RightComponents/productReportBoardNew.module.css'
import { $t } from '@/i18n';
import { useKeywordLevelMap } from '@/pages/select-product/hooks/useKeywordLevelMap';
import { DataUpdateTime } from '@/components/ChatFlow/DataUpdateTime';

export const PlatformReportBoard = (props: any) => {
  const { googleKeywordData, comparedProductData, keywordSummaryData,
    onActionClick, keywordList
    , defaultShowKeyword, switchKeywordLogKey } = props;
  const comparedCardList = comparedProductData?.oppProductList || [];
  const defaultActiveIndex = keywordList?.findIndex((item) => item.keyword === defaultShowKeyword);
  const { setTabHistory, tabLoadingIndex } = useSelectProductStore();
  const _keywordList = useKeywordLevelMap(keywordSummaryData, keywordList);
  return (
    <>
      {_keywordList?.length > 0 && <HeaderCarouselCard
        keywordList={_keywordList}
        defaultShowKeyword={defaultShowKeyword}
        onActionClick={onActionClick}
        setTabHistory={setTabHistory}
        defaultActiveIndex={defaultActiveIndex}
        type="platform"
        logKey={switchKeywordLogKey}
      />}
      {(tabLoadingIndex !== -1 && tabLoadingIndex === defaultActiveIndex) ? (
        <LoadReport />
      ) : (
        <>
          <KeywordSummaryData keywordSummaryData={keywordSummaryData} />
          <SupplyInfo keywordList={keywordList} defaultActiveIndex={defaultActiveIndex} googleKeywordData={googleKeywordData} />
          <SalesInfo keywordList={keywordList} defaultActiveIndex={defaultActiveIndex} />
        </>
      )}
      <div className={styles.newProductCard}>
        {comparedCardList.length > 0 && (
          <DataUpdateTime dataUpdateTime={comparedProductData?.reportTime} title={$t("global-1688-ai-app.select-product.PlatformComponents.PlatformReportBoard.scqyfx", "市场迁移分析")} />
        )}
        <div>
          {comparedCardList?.map((item, index) => (
            <>
              <ItemInfoCard
                data={item}
                index={index}
                style={{ gap: '24px'}}
                radarTitle={$t("global-1688-ai-app.select-product.PlatformComponents.PlatformReportBoard.jhzs", "机会指数")}
                content={<CompareInfo
                  data={item}
                />}
              />
               {index !== comparedCardList?.length - 1 && <div className={styles.newProductCardItemLine} />}
            </>
          ))}
        </div>
      </div>
    </>
  );
};
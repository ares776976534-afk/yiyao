import ItemInfoCard from '@/components/ChatFlow/ItemInfoCard';
import SameInfo from '@/components/ChatFlow/SameInfo';
import { observer } from 'mobx-react-lite';
import { useSelectProductStore } from '@/stores/select-product';
import styles from './productReportBoardNew.module.css';
import { HeaderCarouselCard } from './HeaderCarouselCard';
import { LoadReport } from './LoadReport';
import { KeywordSummaryData } from './KeywordSummaryData';
import { SupplyInfo } from './SupplyInfo';
import { SalesInfo } from './SalesInfo';
import { $t } from '@/i18n';
import { useKeywordLevelMap } from '../../hooks/useKeywordLevelMap';
import { LOG_KEYS } from '@/utils/logConfig';

export const ProductReportBoard = observer((props: any) => {
  const { googleKeywordData, comparedProductData, keywordSummaryData,
    onActionClick, keywordList, defaultShowKeyword, switchKeywordLogKey } = props;
  const comparedCardList = comparedProductData;
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
        type="product"
        logKey={switchKeywordLogKey}
      />}
      {(tabLoadingIndex !== -1 && tabLoadingIndex === defaultActiveIndex) ? (
        <LoadReport />
      ) : (
        <>
          <KeywordSummaryData keywordSummaryData={keywordSummaryData} />
          <SupplyInfo keywordList={keywordList} defaultActiveIndex={defaultActiveIndex} googleKeywordData={googleKeywordData} />
          <SalesInfo keywordList={keywordList} defaultActiveIndex={defaultActiveIndex} />
          <div className={styles.newProductCard}>
            {comparedCardList?.oppProductList?.length > 0 && (
              <div className={styles.newProductCardTitle} >
                <div className={styles.Icon} />
                <span className={styles.newProductCardTitleText}>{$t("global-1688-ai-app.select-product.RightComponents.ProductReportBoard.nrf", "新品分析")}</span>
              </div >
            )}
            <div>
              {comparedCardList?.oppProductList?.map((item, index) => (
                <>
                  <ItemInfoCard
                    data={item}
                    index={index}
                    style={{ gap: '24px'}}
                    radarTitle={$t("global-1688-ai-app.select-product.RightComponents.ProductReportBoard.jhzs", "机会指数")}
                    imgClickLogKey={LOG_KEYS.NEW_PRODUCT_AGENT.LP.REPORT_ITEMCARD_IMGCLICK}
                    titleClickLogKey={LOG_KEYS.NEW_PRODUCT_AGENT.LP.REPORT_ITEMCARD_TITLECLICK}
                    findSupplierLogKey={LOG_KEYS.NEW_PRODUCT_AGENT.LP.FIND_SIMILAR_SUPPLIER}
                    materialProcessLogKey={LOG_KEYS.NEW_PRODUCT_AGENT.LP.GO_DESIGN}
                    content={<SameInfo
                      data={item}
                      isProduct={comparedProductData?.isProduct}
                      onClick={() => {
                        onActionClick('COMPARED_DETAIL_MODAL', {
                          detailData: item?.detailData,
                          summary: item?.summary,
                          status: item?.status,
                        });
                      }}
                    />}
                  />
                  {index !== comparedCardList?.oppProductList?.length - 1 && <div className={styles.newProductCardItemLine} />}
                </>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
});
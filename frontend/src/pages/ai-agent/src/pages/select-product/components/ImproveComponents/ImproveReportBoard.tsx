import { Markdown } from '@/components/ChatFlow/Markdown';
import ItemInfoCard from '@/components/ChatFlow/ItemInfoCard';
import ReviewStatsTable from '../LeftComponents/ReviewStatsTable';
import { CommentInfo } from './CommentInfo';
import { useSelectProductStore } from '@/stores/select-product';
import styles from './improveReportBoard.module.css';
import { HeaderCarouselCard } from '../RightComponents/HeaderCarouselCard';
import { LoadReport } from '../RightComponents/LoadReport';
import { KeywordSummaryData } from '../RightComponents/KeywordSummaryData';
import { SupplyInfo } from '../RightComponents/SupplyInfo';
import { SalesInfo } from '../RightComponents/SalesInfo';
import { $t } from '@/i18n';
import { useKeywordLevelMap } from '@/pages/select-product/hooks/useKeywordLevelMap';
import { DataUpdateTime } from '@/components/ChatFlow/DataUpdateTime';

export const ImproveReportBoard = (props: any) => {
  const {
    googleKeywordData,
    keywordSummaryData,
    onActionClick,
    improvedAnalysisProductData,
    goodList,
    badList,
    neutralList,
    keywordList,
    defaultShowKeyword,
    summary,
    reportTime,
    switchKeywordLogKey,
  } = props;
  const comparedCardList = improvedAnalysisProductData;
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
        type="improve"
        logKey={switchKeywordLogKey}
      />}
      {(tabLoadingIndex !== -1 && tabLoadingIndex === defaultActiveIndex) ? (
        <LoadReport />
      ) : (
        <>
          <KeywordSummaryData keywordSummaryData={keywordSummaryData} />
          <SupplyInfo keywordList={keywordList} defaultActiveIndex={defaultActiveIndex} googleKeywordData={googleKeywordData} />
          <SalesInfo keywordList={keywordList} defaultActiveIndex={defaultActiveIndex} />
          {((goodList && goodList?.length > 0) ||
            (badList && badList?.length > 0) ||
            (neutralList && neutralList?.length > 0)) && (
            <div className={styles.commentAnalysisContainer}>
              <DataUpdateTime dataUpdateTime={reportTime} title={$t("global-1688-ai-app.select-product.ImproveComponents.ImproveReportBoard.reviewfx", "评价分析")} />
              <div className={styles.reviewStatsTableContainer}>
                {
                  goodList && goodList?.length > 0 && (
                    <ReviewStatsTable data={goodList} sentimentType="positive" />
                  )
                }
                {
                  badList && badList?.length > 0 && (
                    <ReviewStatsTable data={badList} sentimentType="negative" />
                  )
                }
                {/* {
                  neutralList && neutralList?.length > 0 && (
                    <ReviewStatsTable data={neutralList} sentimentTypeName="中评" />
                  )
                } */}
              </div>
            </div>
           )}
          {summary?.keywordSummary?.summary && <div className={styles.keywordImproveSuggestionContainer}>
            <div className={styles.commentTitle} >
              <div className={styles.Icon} />
              <span className={styles.commentTitleText}>{$t("global-1688-ai-app.select-product.ImproveComponents.ImproveReportBoard.krut", "关键词改进建议")}</span>
            </div >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#FBFBFD',
                gap: '8px',
              }}
            >
              <Markdown
                text={summary?.keywordSummary?.summary || ''}
                chunkIntervalMs={50} 
                streamGranularity="char"
                className='rightMardown'
              />
            </div>
          </div>}
          <div className={styles.improvedProductAnalysisContainer}>
            {comparedCardList?.oppProductList?.length > 0 && (
              <div className={styles.commentTitle} >
                <div className={styles.Icon} />
                <span className={styles.commentTitleText}>{$t("global-1688-ai-app.select-product.ImproveComponents.ImproveReportBoard.gdx", "改进商品分析")}</span>
              </div >
            )}
            <div>
              {comparedCardList?.oppProductList?.map((item, index) => (
                <>
                  <ItemInfoCard
                    key={index}
                    index={index}
                    data={{
                      ...item,
                      oppScore: item?.improvementOppScore,
                      oppScoreDesc: item?.improvementOppScoreDesc,
                    }}
                    style={{ gap: '24px'}}
                    radarTitle={$t("global-1688-ai-app.select-product.ImproveComponents.ImproveReportBoard.gjjhf", "改进机会分")}
                    content={<CommentInfo
                      data={item}
                      onClick={(type, data) => {
                        onActionClick(type,data);
                      }}
                    />}
                  />
                  {index !== comparedCardList?.oppProductList?.length - 1 && <div className={styles.improvedProductAnalysisItemLine} />}
                </>
              ))}
            </div>
          </div>
        </>
      )}

    </>
  );
};
import { Markdown } from '@/components/ChatFlow/Markdown';
import { EyeIcon } from '@/components/ChatFlow/EyeIcon';
import styles from './commentInfo.module.css';
import { $t } from '@/i18n';
import { Tabs } from 'antd';

const SENTIMENT_TYPE_MAP = {
  'positive': $t("global-1688-ai-app.select-product.ImproveComponents.CommentInfo.positiveReview", "好评"),
  'negative': $t("global-1688-ai-app.select-product.ImproveComponents.CommentInfo.negativeReview", "差评"),
};
const SENTIMENT_TYPE_TEXT_MAP = {
  'positive': '评论推荐该商品',
  'negative': '差评评论',
};
// 评论组件
export const CommentItem = ({ data, sentimentType, onClick }: { data: any; sentimentType: string; onClick: (type: string, data: any) => void }) => {
  return (
    <div className={styles.commentInfoItemContent}>
      {data?.length > 0 ? data?.map((item: any) => (
        <div
          className={styles.commentInfoItemContentItem}
          key={item?.labelId || item?.labelName}
          onClick={() => {
            onClick('COMMENT_DETAIL_MODAL', {
              productIds: item?.productIdList,
              labelCategory: item?.labelCategory,
              occupyRate: item?.percent,
              reviewCnt: item?.count,
              reviewTag: item?.labelName,
              sentimentTypeName: SENTIMENT_TYPE_MAP[sentimentType],
            });
          }}
        >
          <div className={styles.commentInfoItemContentItemLabel}>{item?.labelName}</div>
          <div className={styles.commentInfoItemContentItemPercent}>{item?.percent}%</div>
        </div>
      )) : (
        <div className={styles.commentInfoItemContentItem}>
          <div className={styles.commentInfoItemContentItemPercent}>{$t("global-1688-ai-app.select-product.ImproveComponents.CommentInfo.zw", `暂无${SENTIMENT_TYPE_MAP[sentimentType]}`, [SENTIMENT_TYPE_MAP[sentimentType]])}</div>
        </div>
      )}
    </div>
  );
};

// tab评论组件
export const CommentTab = ({ data, sentimentType, onClick }: { data: any; sentimentType: string; onClick: (type: string, data: any) => void }) => {
  const _data = data?.map((item: any) => ({
    key: item?.labelCategory,
    label: (
      <div className={styles.commentTabLabelContainer}>
        <div className={styles.commentTabLabelText}>{item?.labelCategory}</div>
        <div className={styles.commentTabLabelCount}>({item?.count}条)</div>
      </div>
    ),
    children: <CommentItem data={item?.labelList} sentimentType={sentimentType} onClick={onClick} />,
  }));
  const totalCount = data?.map((item: any) => item?.count).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className={styles.commentTabContainer}>
      <div className={styles.commentInfoItem}>
        <div className={`${styles.commentInfoItemIcon} ${sentimentType === 'positive' ? styles.positiveIcon : styles.negativeIcon}`} />
        <div className={styles.commentInfoItemText}>{$t("global-1688-ai-app.select-product.ImproveComponents.CommentInfo.d", `${SENTIMENT_TYPE_MAP[sentimentType]}点`, [SENTIMENT_TYPE_MAP[sentimentType]])}</div>
      </div>
      {totalCount > 0 ? (
        <div className={styles.cardContent}>
          <div className={styles.cardHeaderTitle}>
            <img className={styles.cardHeaderTitleIcon} src="https://img.alicdn.com/imgextra/i4/O1CN01vEbAkZ1blLKQoRX9q_!!6000000003505-2-tps-95-75.png" alt="" srcSet="" />
            已有
            <span className={styles.opsz}> {totalCount}条 </span>
            {SENTIMENT_TYPE_TEXT_MAP[sentimentType]}：
          </div>
          <div className={styles.footerContent}>
            <div className={styles.triangle} />
            <Tabs
              defaultActiveKey={_data[0]?.key}
              items={_data}
              tabBarGutter={24}
              moreIcon={null}
              className={styles.tabs}
              indicator={{
                size: (origin) => 32,
                align: 'center',
              }}
            />
          </div>
        </div>
      ) : (
        <div className={styles.noComment}>
          暂无评价
        </div>
      )}
    </div>
    
  )
}

export const CommentInfo = ({ data, onClick }: { data: any; onClick: (type: string, data: any) => void }) => {
  const { improvementSuggestionSummary, posPoint = [], negPoint = [], negCategoryTagList = [], posCategoryTagList = [] } = data;
  // 确保 negPoint 和 posPoint 始终是数组
  const safePosPoint = Array.isArray(posPoint) ? posPoint : [];
  const safeNegPoint = Array.isArray(negPoint) ? negPoint : [];

  return (
    <>
      <div className="flex items-center gap-[4px]">
        <span className="text-[rgba(0, 0, 0, 0.87)] font-medium">{$t("global-1688-ai-app.select-product.ImproveComponents.CommentInfo.productComment", "商品评论")}</span>
        {(safePosPoint.length > 0 || safeNegPoint.length > 0) && <EyeIcon onClick={() => onClick('REVIEW_DETAIL_MODAL', { productId: data?.productId })} />}
      </div> 
      <CommentTab data={posCategoryTagList} sentimentType="positive" onClick={(type, data) => onClick(type, data)} />
      <CommentTab data={negCategoryTagList} sentimentType="negative" onClick={(type, data) => onClick(type, data)} />
      <div>
        <div className={styles.headerTitle}>
          <div className={styles.titleIcon} />
          <div className={styles.commentTitle}>{$t("global-1688-ai-app.select-product.ImproveComponents.CommentInfo.pcut", "商品改进建议")}</div>
        </div>
        <Markdown
          text={improvementSuggestionSummary}
          chunkIntervalMs={50}
          streamGranularity="char"
          className='rightMardown'
        />
      </div>
    </>
  );
};
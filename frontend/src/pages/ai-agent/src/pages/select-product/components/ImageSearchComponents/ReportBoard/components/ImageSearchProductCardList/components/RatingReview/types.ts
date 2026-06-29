export interface TypeDetailTag {
  count?: number;
  /** 标签分类 */
  labelCategory?: string;
  /** 标签分类原始 */
  labelCategoryOri?: string;
  /** 标签分类百分比 */
  labelCategoryPercent?: string;
  /** 标签详情 */
  labelName?: string;
  /** 标签详情原始 */
  labelNameOri?: string;
  /** 百分比 */
  percent?: string;
  /** 商品ID列表 */
  productIdList?: string[];
  /** 情感 */
  sentiment?: string;
  /** 情感原始 */
  sentimentOri?: string;
}

export interface TypeReviewTag {
  // tag: string;
  count?: number;
  /** 标签分类 */
  labelCategory?: string;
  /** 标签分类百分比 */
  labelCategoryPercent?: string;
  /** 标签详情 */
  detailTags?: TypeDetailTag[];
}

export interface TypeRatingReviewData {
  // /** 好评个数 */
  // posReviewCnt?: number;
  posPointTagTitle?: string;
  /** 好评标签列表 */
  posCategoryTagList?: TypeReviewTag[];
  /** 好评描述 */
  posPointDesc?: string;
  // /** 差评个数 */
  // negReviewCnt?: number;
  negPointTagTitle?: string;
  /** 差评标签列表 */
  negCategoryTagList?: TypeReviewTag[];
   /** 差评描述 */
   negPointDesc?: string;

   productId?: string;

}

export interface TypeRatingReviewProps {
  componentData?: TypeRatingReviewData;
  title?: string;
  onActionClick?: (action: string, data: any) => void;
}


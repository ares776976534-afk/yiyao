export interface listDataProps {
  productId: string;
  title: string;
  imageUrl: string;
  productUrl: string;
  platform: string;
  region: string;
  sellingPrice: number;
  currency: string;
  cateLev1Name: string;
  cateLev1Ranking: number;
  cateLev3Name: string;
  cateLev3Ranking: number;
  sold30d: number;
  soldGrowthRate: {
    value: number;
    direction: string;
  };
  soldAmount30d: number;
  salesTrends: { x: string; y: number }[];
  ratingScore: number;
  reviewCnt: number;
  variantCnt: number;
  sameStyleItemCnt: number;
  launchTime: string;
  sellerCnt: number;
  aiRecommended: string;
}
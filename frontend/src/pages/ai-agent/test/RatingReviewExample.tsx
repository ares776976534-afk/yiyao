import React from 'react';
import RatingReview from '../src/pages/select-product/components/ImageSearchComponents/ReportBoard/components/ImageSearchProductCardList/components/RatingReview';

const RatingReviewExample: React.FC = () => {
  const mockData = {
    positiveCount: 345,
    positiveReviews: [
      {
        tag: '设计款式风格新颖',
        count: 286,
        detailTags: [
          { tag: '设计好看', percent: '22.22%' },
          { tag: '轻薄设计', percent: '5%' },
          { tag: '轻奢风', percent: '5%' },
          { tag: '北欧风', percent: '5%' },
        ],
      },
      {
        tag: '商品质量好',
        count: 96,
        detailTags: [
          { tag: '质量可靠', percent: '15%' },
          { tag: '做工精细', percent: '10%' },
          { tag: '材料优质', percent: '8%' },
        ],
      },
      {
        tag: '渠道热销风格',
        count: 38,
        detailTags: [
          { tag: '市场热门', percent: '12%' },
          { tag: '销量高', percent: '8%' },
        ],
      },
    ],
    negativeCount: 0,
    negativeReviews: [],
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h2 style={{ marginBottom: '20px' }}>评分组件示例 - 带Tabs切换</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        点击好评标签可以切换tab，底部有滑动下划线动画，每个tab显示不同的详细标签
      </p>
      <RatingReview componentData={mockData} />
    </div>
  );
};

export default RatingReviewExample;


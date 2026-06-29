import React from 'react';
import Collapse from '../components/Collapse';
import Review from '../QwenReview/Review';

interface TypeQwenSentimentAnalysisProps {
  data: any;
  tool_id: string;
  className?: string;
  class?: string;
}

const QwenSentimentAnalysis: React.FC<TypeQwenSentimentAnalysisProps> = ({ data, ...props }) => {
  // 处理 HTML class 属性和 React className 属性
  const combinedClassName = 'qwen-sentiment-analysis';
  return (
    <div className={combinedClassName} {...props}>
      <Collapse items={[
        {
          key: data,
          title: data,
          subTitle: '123',
          content: <Review data={data} />,
        }
      ]} />
    </div>
  );
};
export default QwenSentimentAnalysis;

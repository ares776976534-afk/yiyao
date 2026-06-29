import React from 'react';
import Collapse from '../components/Collapse';
import OfferCard, { CardHeader } from './OfferCard';
import styles from './offerCard.module.css';

interface TypeQwenMarketAnalysisProps {
  data: any;
  className?: string;
  class?: string;
}


const QwenMarketAnalysis: React.FC<TypeQwenMarketAnalysisProps> = ({ data, ...props }) => {
  // 处理 HTML class 属性和 React className 属性
  const combinedClassName = `qwen-sentiment-analysis ${styles.commonContainer}`;

  const _data = JSON.parse(data);

  const productList = _data?.productList;
  return (
    <div className={combinedClassName} {...props}>
      <Collapse items={
        productList.map((item) => {
          return {
            key: data,
            title: <CardHeader data={item} />,
            content: <OfferCard data={item} />,
          };
        })
      }
      />
    </div>
  );
};
export default QwenMarketAnalysis;

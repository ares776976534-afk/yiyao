import React from 'react';
import Collapse from '../components/Collapse';
import Trend from './Trend';
import { $t } from '@/i18n';

interface TypeAnalysisProps {
  data: any;
  tool_id: string;
  className?: string;
  class?: string;
}

const QwenSentimentAnalysis: React.FC<TypeAnalysisProps> = ({ data, ...props }) => {
  // 处理 HTML class 属性和 React className 属性
  const combinedClassName = 'qwen-analysis';

  // 调试输出：查看接收到的原始 data
  console.log('[TrendAnalysis] 接收到的 data:', data);

  const _data = JSON.parse(data);
  const trendList = _data?.trendList;

  return (
    <div className={combinedClassName} {...props}>
      <Collapse items={
        trendList?.map((item) => {
          return {
            key: item.keyword,
            title: item.keyword,
            subTitle: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.TrendAnalysis.qsfx", "趋势分析"),
            content: <Trend data={item} />,
          };
        })
      }
      />
    </div>
  );
};
export default QwenSentimentAnalysis;

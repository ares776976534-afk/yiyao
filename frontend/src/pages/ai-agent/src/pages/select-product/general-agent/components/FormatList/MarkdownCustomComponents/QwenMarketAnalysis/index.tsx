import React from 'react';
import Collapse from '../components/Collapse';
import MarketAnalysis from './MarketAnalysis';
import { $t } from '@/i18n';

interface TypeQwenMarketAnalysisProps {
  data: any;
  className?: string;
  class?: string;
}

const QwenMarketAnalysis: React.FC<TypeQwenMarketAnalysisProps> = ({ data, ...props }) => {
  // 处理 HTML class 属性和 React className 属性
  const combinedClassName = 'qwen-sentiment-analysis';

  // 安全解析 JSON，避免Safari兼容性问题
  let _data;
  try {
    _data = JSON.parse(data || '{}');
  } catch (error) {
    console.error('[QwenMarketAnalysis] JSON解析失败:', error);
    return null;
  }
  const { marketAnalysisList } = _data;

  if (!marketAnalysisList || !Array.isArray(marketAnalysisList)) {
    return null;
  }
  return (
    <div className={combinedClassName} {...props}>
      <Collapse items={marketAnalysisList.map((item) => {
        const _item = [
          {
            title: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.xoi", "销售信息"),
            data: item,
            typeKey: 'salesInfo',
          },
          {
            title: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.joi", "竞争信息"),
            data: item,
            typeKey: 'competitiveInfo',
          },
        ];
        return {
          key: item.keyword,
          title: item.keyword,
          subTitle: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.scfx", "市场分析"),
          content: <MarketAnalysis data={_item} />,
        };
      })}
      />
    </div>
  );
};
export default QwenMarketAnalysis;

import React from 'react';
import { $t } from '@/i18n';
import TitleContent from './TitleContent';

interface TypeCustomTitleProps {
  title: string;
  colorTitle: string;
  breakLogo?: boolean;
}

const CustomTitle: React.FC<TypeCustomTitleProps> = ({ title, colorTitle, breakLogo = false }) => {
  // 解析文本，支持"AI议价"、"找款"、"改图"、"经营"等特殊关键词
  const parseText = (text: string) => {
    const parts: Array<{ text: string; isEnglish: boolean }> = [];
    // 需要特殊处理的关键词列表（使用 Poppins 字体）
    const specialKeywords = [$t("global-1688-ai-app.select-product.home.CustomTitle.zk", "找款"), $t("global-1688-ai-app.select-product.home.CustomTitle.gt", "改图"), $t("global-1688-ai-app.select-product.home.CustomTitle.jy", "经营")];

    // 检查是否包含"AI议价"模式
    if (text.includes($t("global-1688-ai-app.select-product.home.CustomTitle.AIyj", "AI议价"))) {
      const aiIndex = text.indexOf($t("global-1688-ai-app.select-product.home.CustomTitle.AIyj", "AI议价"));

      // 添加"AI议价"之前的文本
      if (aiIndex > 0) {
        parts.push({ text: text.substring(0, aiIndex), isEnglish: false });
      }

      // 添加"AI"部分（英文，使用 Poppins 字体）
      parts.push({ text: 'AI', isEnglish: true });

      // 添加"议价"部分（中文，使用 FZLTHProS 字体）
      parts.push({ text: $t("global-1688-ai-app.select-product.home.CustomTitle.yj", "议价"), isEnglish: false });

      // 添加"AI议价"之后的文本
      if (aiIndex + 4 < text.length) {
        parts.push({ text: text.substring(aiIndex + 4), isEnglish: false });
      }
    } else {
      // 检查是否包含其他特殊关键词
      // 找到第一个匹配的关键词
      let firstKeyword: string | null = null;
      let firstKeywordIndex = -1;

      for (const keyword of specialKeywords) {
        const index = text.indexOf(keyword);
        if (index !== -1 && (firstKeywordIndex === -1 || index < firstKeywordIndex)) {
          firstKeyword = keyword;
          firstKeywordIndex = index;
        }
      }

      if (firstKeyword !== null && firstKeywordIndex !== -1) {
        // 添加关键词之前的文本
        if (firstKeywordIndex > 0) {
          parts.push({ text: text.substring(0, firstKeywordIndex), isEnglish: false });
        }

        // 添加关键词（使用 Poppins 字体）
        parts.push({ text: firstKeyword, isEnglish: true });

        // 添加关键词之后的文本
        const afterIndex = firstKeywordIndex + firstKeyword.length;
        if (afterIndex < text.length) {
          parts.push({ text: text.substring(afterIndex), isEnglish: false });
        }
      } else {
        // 如果没有找到特殊关键词，返回原文本
        parts.push({ text, isEnglish: false });
      }
    }

    return parts;
  };

  // 解析普通标题文本，将"咨询Agent全解答"拆分成"咨询"、"Agent"和"全解答"
  const parseTitleText = (text: string) => {
    const parts: Array<{ text: string; type: 'chinese' | 'agent' }> = [];

    // 检查是否包含"Agent"模式
    if (text.includes('Agent')) {
      const agentIndex = text.indexOf('Agent');

      // 添加"Agent"之前的文本（中文）
      if (agentIndex > 0) {
        parts.push({ text: text.substring(0, agentIndex), type: 'chinese' });
      }

      // 添加"Agent"部分（使用 Poppins 字体，500 字重，42px）
      parts.push({ text: 'Agent', type: 'agent' });

      // 添加"Agent"之后的文本（中文）
      if (agentIndex + 5 < text.length) {
        parts.push({ text: text.substring(agentIndex + 5), type: 'chinese' });
      }
    } else {
      // 如果没有"Agent"，返回原文本（中文）
      parts.push({ text, type: 'chinese' });
    }

    return parts;
  };

  // 将渐变文本按"·"分割
  const colorTitleParts = colorTitle.split('·').map((part) => part.trim());

  return (
    <TitleContent
      colorTitleParts={colorTitleParts}
      parseText={parseText}
      parseTitleText={parseTitleText}
      title={title}
    />
  );
};

export default CustomTitle;


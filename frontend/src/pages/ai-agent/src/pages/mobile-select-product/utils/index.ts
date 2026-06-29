// 从 blocks 中查找符合条件的 content 项
export const findContentItem = (
  blocks: any[],
  taskId: string,
  cardType: string,
  cardSubType?: string,
) => {
  // 如果提供了 taskId，优先按 taskId 匹配
  if (taskId) {
    for (const block of blocks) {
      // 检查 block 的 taskId
      if (
        block?.taskId === taskId &&
        block?.cardType === cardType &&
        (!cardSubType || block.cardSubType === cardSubType)
      ) {
        return block;
      }
      // 检查 accordionContent 中的 taskId
      if (block?.accordionContent) {
        const found = block.accordionContent.find(
          (item: any) =>
            item.taskId === taskId &&
            item.cardType === cardType &&
            (!cardSubType || item.cardSubType === cardSubType),
        );
        if (found) return found;
      }
    }
  }

  // 如果没有 taskId 或按 taskId 没找到，则按原来的逻辑查找
  for (const block of blocks) {
    if (
      block?.cardType === cardType &&
      (!cardSubType || block.cardSubType === cardSubType)
    ) {
      return block;
    }
    if (block?.accordionContent) {
      const found = block.accordionContent.find(
        (item: any) =>
          item.cardType === cardType &&
          (!cardSubType || item.cardSubType === cardSubType),
      );
      if (found) return found;
    }
  }
  return null;
};

export const createReportCardFormat = (data: any, blocks: any[], oppScene: string) => {
  if (data?.cardType === 'REPORT_CARD') {
    const tikTokData = findContentItem(blocks, data.taskId, 'BUTTON', 'CATE_SELECT_CARD');
    const googleKeywordData = findContentItem(blocks, data.taskId, 'BUTTON', 'KEYWORD_GOOGLE_TRENDS');
    const cateGoogleData = findContentItem(blocks, data.taskId, 'BUTTON', 'CATE_GOOGLE_TRENDS');
    const googleData = googleKeywordData || cateGoogleData;
    const comparedProductData = findContentItem(blocks, data.taskId, 'PRODUCT_LIST', 'MIGRATED_ANALYSIS_PRODUCT');
    const keywordSummaryData = findContentItem(blocks, data.taskId, 'KEYWORD_SUMMARY');
    const categoryTikTokData = findContentItem(blocks, data.taskId, 'BUTTON', 'KEYWORD_SELECT_CARD');
    const keywordList = tikTokData?.keywordList || categoryTikTokData?.keywordList || [];
    const defaultShowKeyword = tikTokData?.defaultShowKeyword || categoryTikTokData?.defaultShowKeyword || '';
    return {
      ...data,
      itemBtn: data?.reportTags.map((item: any) => {
        return {
          key: item,
          value: item,
        };
      }),
      googleKeywordData: googleData,
      comparedProductData: comparedProductData,
      keywordSummaryData: keywordSummaryData,
      tikTokData,
      keywordList,
      oppScene,
      defaultShowKeyword: defaultShowKeyword,

      // LeftComponent: ProductReport,
      // RightComponent: PlatformReportBoard,
    };
  }
};


export const platformAgent = (data: any, blocks: any[]) => {
  return createReportCardFormat(data, blocks, 'platform_market_migration');
};

export const countryAgent = (data: any, blocks: any[]) => {
  return createReportCardFormat(data, blocks, 'country_market_migration');
};

export const improveAgent = (data: any, blocks: any[]) => {
  if (data?.cardType === 'REPORT_CARD') {
    const amazonKeywordData = findContentItem(blocks, data.taskId, 'BUTTON', 'KEYWORD_SELECT_CARD');
    console.log('amazonKeywordData', amazonKeywordData);
    const googleKeywordData = findContentItem(blocks, data.taskId, 'BUTTON', 'KEYWORD_GOOGLE_TRENDS');
    const cateGoogleData = findContentItem(blocks, data.taskId, 'BUTTON', 'CATE_GOOGLE_TRENDS');
    // const categoryTikTokData = findContentItem(blocks, data.taskId, 'BUTTON', 'CATE_SELECT_CARD');
    const googleData = googleKeywordData || cateGoogleData;
    const summary = findContentItem(blocks, data.taskId, 'KEYWORD_IMPROVE_SUMMARY');
    const keywordSummaryData = findContentItem(blocks, data.taskId, 'KEYWORD_SUMMARY');
    // cardSubType: "IMPROVED_ANALYSIS_PRODUCT",
    // cardType: "PRODUCT_LIST",
    const improvedAnalysisProductData = findContentItem(blocks, data.taskId, 'PRODUCT_LIST', 'IMPROVED_ANALYSIS_PRODUCT');
    const productImproveCommentTagsData = findContentItem(blocks, data.taskId, 'PRODUCT_IMPROVE_COMMENT_TAGS')?.reviewTagAggregateVOList;
    const goodList = productImproveCommentTagsData?.filter((item: any) => item?.sentimentTypeName === '好评');
    const badList = productImproveCommentTagsData?.filter((item: any) => item?.sentimentTypeName === '差评');
    const neutralList = productImproveCommentTagsData?.filter((item: any) => item?.sentimentTypeName === '中评');
    const keywordList = amazonKeywordData?.keywordList || [];
    const defaultShowKeyword = amazonKeywordData?.defaultShowKeyword || '';
    return {
      ...data,
      itemBtn: data?.reportTags.map((item: any) => {
        return {
          key: item,
          value: item,
        };
      }),
      googleKeywordData: googleData,
      keywordSummaryData: keywordSummaryData,
      improvedAnalysisProductData: improvedAnalysisProductData,
      goodList: goodList,
      badList: badList,
      neutralList: neutralList,
      keywordList,
      summary,
      oppScene: 'product_improvement',
      defaultShowKeyword: defaultShowKeyword,

      // LeftComponent: ProductReport,
      // RightComponent: ImproveReportBoard,
    };
  }
};


export const productAgent = (data: any, blocks: any[]) => {
  if (data?.cardType === "REPORT_CARD") {
    const amazonKeywordData = findContentItem(
      blocks,
      data.taskId,
      "BUTTON",
      "KEYWORD_SELECT_CARD",
    );
    const googleKeywordData = findContentItem(
      blocks,
      data.taskId,
      "BUTTON",
      "KEYWORD_GOOGLE_TRENDS",
    );
    const cateGoogleData = findContentItem(
      blocks,
      data.taskId,
      "BUTTON",
      "CATE_GOOGLE_TRENDS",
    );

    const googleData = googleKeywordData || cateGoogleData;

    const comparedProductData = findContentItem(
      blocks,
      data.taskId,
      "PRODUCT_LIST",
      "COMPARED_PRODUCT",
    );
    const keywordSummaryData = findContentItem(
      blocks,
      data.taskId,
      "KEYWORD_SUMMARY",
    );
    const categoryTikTokData = findContentItem(
      blocks,
      data.taskId,
      "BUTTON",
      "CATE_SELECT_CARD",
    );

    const keywordList =
      amazonKeywordData?.keywordList || categoryTikTokData?.keywordList || [];
    const defaultShowKeyword =
      amazonKeywordData?.defaultShowKeyword ||
      categoryTikTokData?.defaultShowKeyword ||
      "";

    return {
      ...data,
      itemBtn: data?.reportTags?.map((item: any) => {
        return {
          key: item,
          value: item,
        };
      }),
      googleKeywordData: googleData,
      comparedProductData: comparedProductData,
      keywordSummaryData: keywordSummaryData,
      keywordList,
      defaultShowKeyword: defaultShowKeyword,
      oppScene: "new_product_discovery",
      // LeftComponent: ProductReport,
      // RightComponent: ProductReportBoard,
    };
  }
};
import { useRef } from 'react';
export const useKeywordLevelMap = (keywordSummaryData: any, keywordList: any[]) => {
  const keywordLevelMapRef = useRef(new Map());
  if (Array.isArray(keywordSummaryData)) {
    keywordSummaryData.forEach((data) => {
      const keyword = data?.keywordSummary?.keyword;
      const level = data?.keywordSummary?.keywordLevelDetail?.valueLevel;
      if (keyword && level) {
        keywordLevelMapRef.current.set(keyword, level);
      }
    });
  } else if (keywordSummaryData?.keywordSummary?.keyword) {
    const keyword = keywordSummaryData.keywordSummary.keyword;
    const level = keywordSummaryData.keywordSummary.keywordLevelDetail?.valueLevel;
    if (keyword && level) {
      keywordLevelMapRef.current.set(keyword, level);
    }
  }
  const keywordListWithLevel = keywordList?.map((e) => ({
    ...e,
    keywordLevel: keywordLevelMapRef.current.get(e.keyword)
  }));
  
  return keywordListWithLevel;
};


import styles from "./keywordsCard.module.css";
import {
  KeywordsIcon,
  DownArrowIcon,
  FastForwardDownIcon,
} from "@/components/Icon";
import { Button, Radio, Tooltip } from "antd";
import { useState, useEffect, useCallback, useRef } from "react";
import { $t } from "@/i18n";
import { MainBtn } from "@/components/ChatFlow/Btn";
import log from "@/utils/log";

export const EllipsisTooltip = ({ children, className = "" }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const element = textRef.current;
      if (element) {
        const isOverflow = element.scrollWidth > element.clientWidth;
        setIsOverflowing(isOverflow);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [children]);

  const content = (
    <div ref={textRef} className={`${className} ${styles.itemContentTitle}`}>
      {children}
    </div>
  );

  return isOverflowing ? (
    <Tooltip title={children} placement="top">
      {content}
    </Tooltip>
  ) : (
    content
  );
};

export const KeywordsCard = (props) => {
  const {
    rightSideType,
    keywordList,
    onMoreClick,
    taskId,
    cardType,
    isReload,
    isFold,
    type,
    selectedKeyword: propSelectedKeyword,
    onSelectKeyword,
    sortSelectedToFirst = false, // 是否将选中项排到第一位
    logKeys, // 埋点KEY配置 { selectKeyword, viewKeywordData }
  } = props;
  const isMobile = type === 'mobile';
  const isEmpty = rightSideType === ""; // 当 rightSideType 是否为空字符串
  const [internalSelectedKeyword, setInternalSelectedKeyword] = useState(null);
  const [cachedSortedList, setCachedSortedList] = useState(keywordList);
  
  // 支持受控和非受控模式
  const selectedKeyword = propSelectedKeyword !== undefined ? propSelectedKeyword : internalSelectedKeyword;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // 当外部选中值变化时，更新排序列表
  useEffect(() => {
    if (sortSelectedToFirst && propSelectedKeyword && keywordList?.length > 0) {
      const sorted = [...keywordList].sort((a, b) => {
        if (a.keyword === propSelectedKeyword) return -1;
        if (b.keyword === propSelectedKeyword) return 1;
        return 0;
      });
      setCachedSortedList(sorted);
      setInternalSelectedKeyword(propSelectedKeyword);
    }
  }, [sortSelectedToFirst]);

  // 当 keywordList 变化时更新缓存
  useEffect(() => {
    if (keywordList && !cachedSortedList) {
      setCachedSortedList(keywordList);
    }
  }, [keywordList]);

  const handleMoreClick = useCallback(() => {
    // 埋点：查看关键词数据
    if (logKeys?.viewKeywordData) {
      log.record(logKeys.viewKeywordData as `/${string}.${string}.${string}`, 'CLK', {
        keywordCount: keywordList?.length || 0,
      });
    }
    onMoreClick("REPORT_CARD", props);
  }, [onMoreClick, props, logKeys, keywordList]);
  
  const handleRadioChange = (keyword) => {
    setInternalSelectedKeyword(keyword);
    onSelectKeyword?.(keyword, sortSelectedToFirst);
  };
  
  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  useEffect(() => {
    setIsConfirmed(isFold);
  }, []);
  
  const handleConfirmKeywords = useCallback(() => {
    // 埋点：确认选择关键词
    if (logKeys?.selectKeyword) {
      log.record(logKeys.selectKeyword as `/${string}.${string}.${string}`, 'CLK', {
        selectedKeyword: selectedKeyword || '',
      });
    }
    setIsConfirmed(true);
    onMoreClick("SELECT_KEYWORDS", {
      extInfos: {
        executeStatus: "new",
      },
      searchMode: "KEYWORD_TEXT_ACCURATELY_SEARCH",
      searchContexts: [
        {
          contentType: "text",
          productKeyword: selectedKeyword,
        },
      ],
      isReload,
    });
  }, [onMoreClick, selectedKeyword, isConfirmed, logKeys]);

  const sortedKeywordList = sortSelectedToFirst ? cachedSortedList : keywordList;
  const displayKeywords =
    sortedKeywordList && sortedKeywordList.length > 0
      ? isMobile
        ? sortedKeywordList.slice(0, 3) // 移动端只展示3条
        : isExpanded
          ? sortedKeywordList
          : sortedKeywordList.slice(0, 5)
      : [];
  useEffect(() => {
    if (
      selectedKeyword !== null &&
      keywordList &&
      keywordList.length > 5
    ) {
      const selectedIndex = keywordList.findIndex(
        (item) => item.keyword === selectedKeyword
      );
      if (selectedIndex >= 5) {
        setIsExpanded(true);
      }
    }
  }, [selectedKeyword, keywordList]);
  return (
    <div className={styles.keywordsCard}>
      <div
        className={
          isEmpty ? styles.keywordsCardHeader : isMobile ? styles.keywordsCardHeaderMobileEmpty : styles.keywordsCardHeaderEmpty
        }
        style={isMobile ? {flexDirection: 'row'} : {}}
      >
        <div className={styles.keywordsCardHeaderTitle}>
          <KeywordsIcon fill="var(--icon-accent)" width={16} height={16} />
          <div
            className={isMobile ? styles.keywordsCardHeaderTitleTextMobile : styles.keywordsCardHeaderTitleText}
          >
            {isConfirmed
              ? $t(
                  "global-1688-ai-app.select-product.LeftComponents.KeywordsCard.ney",
                  `您已选择关键词：${
                    isMobile ? displayKeywords.find(
                      (item) => item.keyword === selectedKeyword
                    )?.showKeyword : keywordList.find(
                      (item) => item.keyword === selectedKeyword
                    )?.showKeyword
                  }`,
                  [
                    isMobile ? displayKeywords.find(
                      (item) => item.keyword === selectedKeyword
                    )?.showKeyword : keywordList.find(
                      (item) => item.keyword === selectedKeyword
                    )?.showKeyword
                  ]
                )
              : isMobile ? '请选择需要分析的关键词' : $t(
                  "global-1688-ai-app.select-product.LeftComponents.KeywordsCard.wywStdo",
                  "为你匹配到以下关键词，请选择需要分析的关键词"
                )}
          </div>
        </div>
        <div
          className={styles.keywordsCardHeaderArrow}
          onClick={handleMoreClick}
        >
          <div className={styles.keywordsCardHeaderArrowText}>
            {isMobile ? '更多关键词' : $t(
              "global-1688-ai-app.select-product.LeftComponents.KeywordsCard.viewKeywordData",
              "查看关键词数据"
            )}
          </div>
          <DownArrowIcon className={styles.rotatedArrowIcon} />
        </div>
      </div>
      {!isConfirmed && (
        <div className={styles.keywordsCardContentContainer}>
          <div className={styles.keywordsCardContent}>
            {displayKeywords.map((ele, index) => {
              const isSelected = selectedKeyword === ele.keyword;
              const itemClass = isSelected
                ? styles.keywordsCardContentItemChecked
                : styles.keywordsCardContentItem;
              return (
                <div key={ele.keyword || index} className={`${itemClass} ${ele?.hasSelected ? styles.hasSelected : ''}`}>
                  <Radio
                    className={styles.customRadio}
                    style={{ width: "100%" }}
                    value={ele.keyword}
                    checked={
                      ele?.hasSelected || selectedKeyword === ele.keyword
                    }
                    onChange={() => handleRadioChange(ele.keyword)}
                    disabled={ele.hasSelected}
                  >
                    <div
                      className={styles.itemContent}
                      style={
                        ele?.showMetrics?.length > 0 && !isEmpty
                          ? {
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                            }
                          : {}
                      }
                    >
                      <EllipsisTooltip
                        className={
                          ele.hasSelected
                            ? styles.itemContentTitleDisabled
                            : styles.itemContentTitle
                        }
                      >
                        {ele.showKeyword} {ele.keywordCn}
                      </EllipsisTooltip>
                      <div className={styles.itemContentContent}>
                        {ele?.showMetrics?.map((item) => (
                          <div className={styles.itemContentItem}>
                            <div className={styles.itemContentItemTitle}>
                              {item?.name}
                            </div>
                            <div
                              className={
                                ele.hasSelected
                                  ? styles.itemContentItemValueDisabled
                                  : styles.itemContentItemValue
                              }
                            >
                              {item?.value || "-"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Radio>
                </div>
              );
            })}
          </div>
          {!isMobile && keywordList && keywordList.length > 5 &&  (
            <div
              className={styles.keywordsCardContentAll}
              onClick={handleToggleExpanded}
            >
              {isExpanded
                ? $t(
                    "global-1688-ai-app.select-product.LeftComponents.KeywordsCard.sq",
                    "收起"
                  )
                : $t(
                    "global-1688-ai-app.select-product.LeftComponents.KeywordsCard.viewqb",
                    "查看全部"
                  )}
              <FastForwardDownIcon
                className={
                  isExpanded
                    ? styles.fastForwardIcon
                    : styles.fastForwardIconRotated
                }
              />
            </div>
          )} 
          <div className={styles.keywordsCardFooter}>
            <MainBtn
              handleBtn={handleConfirmKeywords}
              text={$t(
                "global-1688-ai-app.select-product.LeftComponents.KeywordsCard.confirmSelect",
                "确认选择"
              )}
              style={{
                height: 40,
                width: isMobile ? 128 : 200,
                fontSize: 16,
                fontWeight: 500,
                lineHeight: '24px'
              }}
              other={{
                disabled: !selectedKeyword
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { TypeReviewSectionProps } from './types';
import styles from '../../index.module.css';

function ReviewSection(props: TypeReviewSectionProps) {
  const {
    title,
    dotClassName,
    categoryTagList = [],
    statisticsText,
  } = props;

  const [activeKey, setActiveKey] = useState(() => {
    return categoryTagList?.[0]?.labelCategory || '';
  });
  const [barStyle, setBarStyle] = useState({ width: 32, left: 0 });
  const [tabLineWidth, setTabLineWidth] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [isLeftDisabled, setIsLeftDisabled] = useState(true);
  const [isRightDisabled, setIsRightDisabled] = useState(false);
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabListWrapperRef = useRef<HTMLDivElement>(null);

  // 根据 labelCategory 分组
  const categoryTagListGroup = useMemo(() => {
    const group: Record<string, any> = {};
    categoryTagList?.forEach((item) => {
      group[item.labelCategory || ''] = item;
    });
    return group;
  }, [categoryTagList]);

  // 获取当前选中tab的详细标签
  const currentDetailTags = categoryTagListGroup?.[activeKey]?.labelList || [];

  // 计算tabLine宽度和滑动条位置
  useEffect(() => {
    const updateBarPosition = () => {
      const activeTab = tabRefs.current[activeKey];
      const tabList = tabListRef.current;

      if (activeTab && tabList) {
        // 计算tabList的实际内容宽度
        const tabListWidth = tabList.scrollWidth;
        setTabLineWidth(tabListWidth);

        const tabListRect = tabList.getBoundingClientRect();
        const activeTabRect = activeTab.getBoundingClientRect();

        const barWidth = 32; // 固定宽度32px
        const centerLeft = activeTabRect.left - tabListRect.left + (activeTabRect.width - barWidth) / 2;

        setBarStyle({
          width: barWidth,
          left: centerLeft,
        });
      }
    };

    // 延迟执行，确保DOM已渲染
    setTimeout(updateBarPosition, 0);

    // 监听窗口resize
    window.addEventListener('resize', updateBarPosition);
    return () => window.removeEventListener('resize', updateBarPosition);
  }, [activeKey, categoryTagList]);

  // 监听数据变化，重置activeKey
  useEffect(() => {
    setActiveKey(categoryTagList?.[0]?.labelCategory || '');
  }, [categoryTagList]);

  // 检查滚动状态
  const checkScrollState = () => {
    const wrapper = tabListWrapperRef.current;
    if (wrapper) {
      const { scrollLeft, scrollWidth, clientWidth } = wrapper;
      // 判断是否可以滚动
      setCanScroll(scrollWidth > clientWidth);
      // 判断左按钮是否禁用（滚动到最左边）
      setIsLeftDisabled(scrollLeft <= 0);
      // 判断右按钮是否禁用（滚动到最右边）
      setIsRightDisabled(scrollLeft + clientWidth >= scrollWidth - 1);
    }
  };

  // 监听滚动和窗口大小变化
  useEffect(() => {
    checkScrollState();
    const wrapper = tabListWrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('scroll', checkScrollState);
    }
    window.addEventListener('resize', checkScrollState);
    return () => {
      if (wrapper) {
        wrapper.removeEventListener('scroll', checkScrollState);
      }
      window.removeEventListener('resize', checkScrollState);
    };
  }, [categoryTagList]);

  // 滚动处理函数
  const handleScroll = (direction: 'left' | 'right') => {
    const wrapper = tabListWrapperRef.current;
    if (wrapper) {
      const scrollAmount = 200;
      const targetScroll = direction === 'left'
        ? wrapper.scrollLeft - scrollAmount
        : wrapper.scrollLeft + scrollAmount;

      wrapper.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  // 滚动到指定tab，确保其可见
  const scrollTabIntoView = (tabKey: string) => {
    const wrapper = tabListWrapperRef.current;
    const targetTab = tabRefs.current[tabKey];

    if (wrapper && targetTab) {
      const wrapperRect = wrapper.getBoundingClientRect();
      const targetRect = targetTab.getBoundingClientRect();

      // 计算tab相对于wrapper的位置
      const tabLeft = targetRect.left - wrapperRect.left + wrapper.scrollLeft;
      const tabRight = tabLeft + targetRect.width;

      // 当前可视区域
      const visibleLeft = wrapper.scrollLeft;
      const visibleRight = visibleLeft + wrapper.clientWidth;

      // 判断是否需要滚动
      if (tabLeft < visibleLeft) {
        // tab在左侧被遮挡，滚动到左边界
        wrapper.scrollTo({
          left: tabLeft,
          behavior: 'smooth',
        });
      } else if (tabRight > visibleRight) {
        // tab在右侧被遮挡，滚动到右边界
        wrapper.scrollTo({
          left: tabRight - wrapper.clientWidth,
          behavior: 'smooth',
        });
      }
    }
  };

  // 处理tab切换
  const handleTabClick = (tabKey: string) => {
    setActiveKey(tabKey);
    scrollTabIntoView(tabKey);
  };

  if (!categoryTagList || categoryTagList.length === 0) {
    return null;
  }

  return (
    <div className={styles.positiveSection}>
      <div className={styles.titleSection}>
        <div className={dotClassName} />
        <span className={styles.titleText}>{title}</span>
      </div>

      <div className={styles.reviewCard}>
        <img
          src="https://img.alicdn.com/imgextra/i2/O1CN019XYDPj1GPGIo5yDcJ_!!6000000000614-2-tps-96-76.png"
          alt=""
          className={styles.decorationImage}
        />

        <div className={styles.cardContent}>
          <div className={styles.contentWrapper}>
            <div className={styles.headerSection}>
              <span className={styles.statisticsText}>
                {statisticsText}
              </span>
            </div>

            <div className={styles.mainContent}>
              <div className={styles.tabListContainer}>
                {canScroll && (
                  <button
                    className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
                    onClick={() => handleScroll('left')}
                    disabled={isLeftDisabled}
                    aria-label="向左滚动"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <div className={styles.tabListWrapper} ref={tabListWrapperRef}>
                  <div className={styles.tabList} ref={tabListRef}>
                    {(categoryTagList || []).map((review, index) => (
                      <div
                        key={index}
                        ref={(el) => (tabRefs.current[review.labelCategory || ''] = el)}
                        className={`${styles.tabItem} ${activeKey === review.labelCategory ? styles.active : ''}`}
                        onClick={() => handleTabClick(review.labelCategory || '')}
                      >
                        <span className={styles.tabLabel}>{review.labelCategory}</span>
                        <span className={styles.tabCount}>({review.count}条)</span>
                      </div>
                    ))}
                  </div>
                  <div
                    className={styles.tabLine}
                    style={{
                      width: tabLineWidth > 0 ? `${tabLineWidth}px` : '100%',
                    }}
                  >
                    <div
                      className={styles.tabLineBar}
                      style={{
                        width: `${barStyle.width}px`,
                        left: `${barStyle.left}px`,
                      }}
                    />
                  </div>
                </div>
                {canScroll && (
                  <button
                    className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
                    onClick={() => handleScroll('right')}
                    disabled={isRightDisabled}
                    aria-label="向右滚动"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>

              <div className={styles.detailTags}>
                {(currentDetailTags || []).map((tag: any, index: number) => (
                  <div key={index} className={styles.detailTag}>
                    <span className={styles.detailTagText}>{tag.labelName}</span>
                    <span className={styles.detailTagPercent}>{tag.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewSection;

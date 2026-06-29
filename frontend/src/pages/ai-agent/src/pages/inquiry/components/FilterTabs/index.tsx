import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import { AddWhiteIcon } from '@/components/Icon';
import { $t } from '@/i18n';
import { MainBtn } from '@/components/ChatFlow/Btn';

const FilterTabs = ({ activeFilter, onFilterChange, onNewClick }) => {
  const [isSticky, setIsSticky] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filters = [
    { key: null, label: $t("global-1688-ai-app.inquiry.FilterTabs.qb", "全部") },
    { key: 'FINISHED', label: $t("global-1688-ai-app.inquiry.FilterTabs.xpend", "询盘结束") },
    { key: 'RUNNING', label: $t("global-1688-ai-app.inquiry.FilterTabs.xrs", "询盘进行中") },
    { key: 'QUEUING', label: $t("global-1688-ai-app.inquiry.FilterTabs.ddxpstart", "等待询盘开始") },
  ];

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = wrapper.getBoundingClientRect();
          const scrollTop = document.getElementById("left-container")?.getBoundingClientRect?.()?.top || 0;

          // 当元素顶部低于外部滚动容器的顶部时，说明已经吸顶
          const isCurrentlySticky = rect.top <= scrollTop;
          setIsSticky(isCurrentlySticky);
          ticking = false;
        });
        ticking = true;
      }
    };

    // 初始化时检查一次
    handleScroll();

    // 监听 window 滚动
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 也监听可能的父容器滚动
    let scrollContainer = wrapper.parentElement;
    while (scrollContainer && scrollContainer !== document.body) {
      if (getComputedStyle(scrollContainer).overflowY === 'auto' ||
        getComputedStyle(scrollContainer).overflowY === 'scroll') {
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        break;
      }
      scrollContainer = scrollContainer.parentElement;
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollContainer && scrollContainer !== document.body) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleNewClick = () => {
    if (onNewClick) {
      onNewClick();
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={isSticky ? styles.wrapperSticky : styles.wrapper}
    >
      {isSticky && <div className={styles.wrapperStickyBlock} /> }
      <div className={styles.container}>
        <div className={styles.filtersGroup}>
          {filters.map((filter, index) => (
            <React.Fragment key={filter.key}>
              {index > 0 && <div className={styles.divider} />}
              <span
                className={`${styles.filterItem} ${
                  activeFilter === filter.key
                    ? styles.active
                    : styles.inactive
                }`}
                onClick={() => onFilterChange(filter.key)}
              >
                {filter.label}
              </span>
            </React.Fragment>
          ))}
        </div>
        {isSticky && onNewClick && ( 
          <MainBtn style={{ height: 36 }} icon={<AddWhiteIcon width={16} height={16} />} text={$t("global-1688-ai-app.inquiry.FilterTabs.cjnewTask", "创建新任务")} handleBtn={handleNewClick} />
          // <button className={styles.createButton} onClick={handleNewClick}>
          //   <AddWhiteIcon className={styles.buttonIcon} width={16} height={16} />
          //   <span className={styles.buttonText}>{$t("global-1688-ai-app.inquiry.FilterTabs.cjnewTask", "创建新任务")}</span>
          // </button>
        )}
      </div>
    </div>
  );
};

export default FilterTabs;

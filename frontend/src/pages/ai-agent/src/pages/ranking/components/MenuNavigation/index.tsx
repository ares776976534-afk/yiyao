import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import SiteCountry from '../SiteCountry';
import type { platformCountryMappingProps } from '../../interface';
import { ChevronUpIcon } from '@/components/Icon';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { Tooltip } from 'antd';
import { $t } from "@/i18n";

const TIME_RANGES = [
  { text: $t('global-1688-ai-app.ranking.MenuNavigation.today', '今日'), key: 'today' },
  { text: $t('global-1688-ai-app.ranking.MenuNavigation.last7Days', '近7天'), key: 'last7Days' },
  { text: $t('global-1688-ai-app.ranking.MenuNavigation.last30Days', '近30天'), key: 'last30Days' },
];

const RANKING_TYPES = [
  { text: $t('global-1688-ai-app.ranking.MenuNavigation.hotSalesRank/SalesRiseRank', '热销榜/销量飙升榜'), startCardIndex: 0 },
  { text: $t('global-1688-ai-app.ranking.MenuNavigation.newProductRank/InnovationOpportunityRank', '新品榜/创新机会榜'), startCardIndex: 2 },
];

// 每一级浮层的起始左偏移和宽度
const FIRST_LEVEL_LEFT = 170;
const POPOVER_WIDTH = 400;

interface MenuNavigationProps {
  activeKey: string;
  categoryData: any;
  platformCountryMapping: platformCountryMappingProps[];
  onCategoryChange?: (level: string, id: string) => void;
  onSiteCountryChange?: (platform: string, country: string) => void;
}

const MenuNavigation: React.FC<MenuNavigationProps> = ({ 
  activeKey,
  categoryData, 
  platformCountryMapping, 
  onCategoryChange,
  onSiteCountryChange,
}) => {
  const [selectedTime, setSelectedTime] = useState<string>('today');
  const [selectedRankingType, setSelectedRankingType] = useState<number>(0);
  // 存储选中类目的路径（从一级到最终选中的级别的所有cateId）
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string[]>([]);
  // 存储每一级 hover 的类目，索引0表示一级类目hover后展示的二级，索引1表示二级hover后展示的三级，以此类推
  const [hoverCategories, setHoverCategories] = useState<any[]>([]);
  // container 引用和高度
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  // 监听 container 高度变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.offsetHeight);
    };

    // 初始化高度
    updateHeight();

    // 使用 ResizeObserver 监听尺寸变化
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleSiteCountryChange = (platform: string, country: string) => {
    log.record(LOG_KEYS.RANKINGLIST.SIDEBAR.CHANNEL, 'CLK', { channel: `${platform}_${country}` });
    onSiteCountryChange?.(platform, country);
  };

  const cateExpRef = useRef(false);

  useEffect(() => {
    if (categoryData?.length > 0) {
      const firstCategory = categoryData[0];
      setSelectedCategoryPath([firstCategory?.cateId]);
      setHoverCategories([]);
      onCategoryChange?.(firstCategory?.level, firstCategory?.cateId);
      if (!cateExpRef.current) {
        cateExpRef.current = true;
        log.record(LOG_KEYS.RANKINGLIST.SIDEBAR.CATE, 'EXP');
      }
    } else {
      setSelectedCategoryPath([]);
      setHoverCategories([]);
    }
  }, [categoryData]);

  // 处理类目 hover，levelIndex 表示当前 hover 的是第几级（从0开始，0表示一级类目）
  const handleCategoryHover = (category: any, levelIndex: number) => {
    setHoverCategories(prev => {
      // 保留当前级别之前的所有项，并设置当前级别的项
      const newCategories = prev.slice(0, levelIndex);
      newCategories[levelIndex] = category;
      return newCategories;
    });
  };

  // 处理整个菜单鼠标离开
  const handleMenuLeave = () => {
    setHoverCategories([]);
  };

  // 检查类目是否在选中路径中
  const isCategorySelected = (cateId: string) => {
    return selectedCategoryPath.includes(cateId);
  };

  const handleCategoryClick = (category: any, levelIndex: number) => {
    log.record(LOG_KEYS.RANKINGLIST.SIDEBAR.CATE, 'CLK', { cate_name: category?.cateNameCn || '' });
    const newPath = hoverCategories.slice(0, levelIndex).map(cat => cat?.cateId);
    newPath.push(category?.cateId);
    setSelectedCategoryPath(newPath);
    onCategoryChange?.(category?.level, category?.cateId);
  };

  const renderCategories = () => (
    <div className={styles.siteContainer}>
      <div className={styles.title}>{$t('global-1688-ai-app.ranking.MenuNavigation.allCategories', '全部类目')}</div>
      <div className={styles.productCategoryList}>
        {categoryData?.map((item: any, index: number) => (
          <div 
            key={index}
            className={styles.productCategoryItem}
            onClick={() => handleCategoryClick(item, 0)}
            onMouseEnter={() => handleCategoryHover(item, 0)}
          >
            <Tooltip placement="top" title={`${item?.cateNameCn}${item?.cateNameCn ? item?.cateName && `（${item?.cateName}）` : item?.cateName}`}>
              <div className={`${styles.productCategoryItemContent} ${isCategorySelected(item?.cateId) ? styles.productCategoryItemContentActive : ''}`}>
                {item?.cateNameCn}{item?.cateNameCn ? item?.cateName && `（${item?.cateName}）` : item?.cateName}
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeRanges = () => (
    <div className={styles.siteContainer}>
      <div className={styles.title}>{$t('global-1688-ai-app.ranking.MenuNavigation.timeRange', '时间范围')}</div>
      <div className={styles.rowTime}>
        {TIME_RANGES.map((item, index) => (
          <div
            key={index}
            className={`${styles.item} ${selectedTime === item.text ? styles.itemActive : ''}`}
            onClick={() => {
              log.record(LOG_KEYS.RANKINGLIST.SIDEBAR.TIME, 'CLK', { time_range: item.text });
              setSelectedTime(item.key);
            }}
          >
            <div className={`${styles.text} ${selectedTime === item.text ? styles.textActive : ''}`}>
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染单个浮层，levelIndex 表示这是第几级浮层（从0开始）
  const renderPopover = (category: any, levelIndex: number) => {
    if (!category?.children?.length) return null;
    
    const left = FIRST_LEVEL_LEFT + levelIndex * POPOVER_WIDTH;
    return (
      <div 
        key={`popover-${levelIndex}-${category?.cateId}`}
        className={styles.popoverContent} 
        style={{ left: `${left}px`, height: containerHeight ? `${containerHeight}px` : 'auto' }}
      >
        <div className={styles.popoverContentTitle}>{category?.cateNameCn}{category?.cateName && `（${category?.cateName}）`}</div>
        <div className={styles.popoverContentList}>
          {category?.children?.map((subCategory: any) => (
            <div 
              key={subCategory.cateId} 
              className={styles.popoverContentItem}
              onMouseEnter={() => handleCategoryHover(subCategory, levelIndex + 1)}
              onClick={() => handleCategoryClick(subCategory, levelIndex + 1)}
            >
              <div className={`${styles.popoverContentItemTitle} ${isCategorySelected(subCategory?.cateId) ? styles.popoverContentItemTitleActive : ''}`}>
                <div className={styles.popoverContentItemTitleText}>{subCategory.cateNameCn}{subCategory?.cateName && `（${subCategory?.cateName}）`}</div>
                {subCategory?.children?.length > 0 && <ChevronUpIcon className='rotate-90' size={14} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染所有浮层
  const renderAllPopovers = () => {
    return hoverCategories.map((category, index) => renderPopover(category, index));
  };
  const handleRankingTypeClick = (index: number, startCardIndex: number) => {
    setSelectedRankingType(index);
    const cards = document.querySelectorAll('[data-ranking-card]');
    const targetCard = cards[startCardIndex] as HTMLElement;
    if (targetCard) {
      const top = targetCard.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // 榜单类型
  const renderRankingType = () => {
    return (
      <div className={styles.siteContainer}>
        <div className={styles.title}>{$t('global-1688-ai-app.ranking.MenuNavigation.rankingType', '榜单类型')}</div>
        <div className={styles.rankingTypeList}>
          {RANKING_TYPES.map((item, index) => (
            <div
              key={index}
              className={styles.productCategoryItem}
              onClick={() => handleRankingTypeClick(index, item.startCardIndex)}
            >
              <div className={`${styles.rankingTypeItem} ${selectedRankingType === index ? styles.rankingTypeItemActive : ''}`}>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // 获取container的高度给popoverContent定高
  return (
    <div 
      className={styles.menuNavigation}
      onMouseLeave={handleMenuLeave}
    >
      <div ref={containerRef} className={styles.container}>
        {activeKey === 'product' && renderRankingType()}
        {platformCountryMapping?.length > 0 && (
          <SiteCountry 
            platformCountryMapping={platformCountryMapping} 
            onChange={handleSiteCountryChange}
          />
        )}
        {renderCategories()}
        {/* 时间范围暂时隐藏 */}
        {/* {renderTimeRanges()} */}
      </div>
      {renderAllPopovers()}
    </div>
  );
};

export default MenuNavigation;

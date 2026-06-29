import React, { useState, useRef, useEffect } from 'react';
import type { TypeCompositeChartProps } from './types';
import styles from './index.module.scss';
import LineChartMulti from '@/components/ChatFlow/LineChartMulti';
import IntervalBarChart from '@/components/ChatFlow/IntervalBarChart';
import IntervalSignBarChart from '@/components/ChatFlow/IntervalSignBarChart';
import { $t } from '@/i18n';
import { Select } from 'antd';
import { Checkmark2Icon, DownArrowIcon } from '@/components/Icon';

// G2 默认色板 (Light 主题的 category10) - 来自 @antv/g2/esm/theme/light.js
const G2_DEFAULT_COLORS = [
  '#6250F9',
  '#FD963C',
  '#F55353',
  '#21A84A',
  '#2FBDFF',
  // '#60C42D',
  // '#BD8F24',
  // '#FF80CA',
  // '#2491B3',
  // '#17C76F',
];

const CompositeChart: React.FC<TypeCompositeChartProps> = (props) => {
  const { rawData } = props;
  const [activeKey, setActiveKey] = useState('1');
  const [barStyle, setBarStyle] = useState({ width: 0, left: 0 });
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [disabledLegends, setDisabledLegends] = useState<Record<string, boolean>>({});
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  const [platformSelectOpen, setPlatformSelectOpen] = useState(false);
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const tabListRef = useRef<HTMLDivElement>(null);

  // 从所有图表数据中提取实际存在的国家-平台组合生成图例项和颜色映射
  const allLegendItems = React.useMemo(() => {
    const combinationSet: Record<string, { country: string; platform: string }> = {};

    // 从销售趋势图表收集数据
    (rawData?.salesData?.salesTrendChart?.series || []).forEach((item) => {
      if (item.categoryItem1 && item.categoryItem2) {
        const key = `${item.categoryItem1}${item.categoryItem2}`;
        combinationSet[key] = {
          country: item.categoryItem1,
          platform: item.categoryItem2,
        };
      }
    });

    // 从评分范围图表收集数据
    (rawData?.salesData?.ratingRangeChart?.dataItems || []).forEach((item) => {
      if (item.categoryItem1 && item.categoryItem2) {
        const key = `${item.categoryItem1}${item.categoryItem2}`;
        combinationSet[key] = {
          country: item.categoryItem1,
          platform: item.categoryItem2,
        };
      }
    });

    // 从库存图表收集数据
    (rawData?.supplyData?.inStockChart?.dataItems || []).forEach((item) => {
      if (item.categoryItem1 && item.categoryItem2) {
        const key = `${item.categoryItem1}${item.categoryItem2}`;
        combinationSet[key] = {
          country: item.categoryItem1,
          platform: item.categoryItem2,
        };
      }
    });

    // 从价格范围图表收集数据
    (rawData?.supplyData?.priceRangeChart?.dataItems || []).forEach((item) => {
      if (item.categoryItem1 && item.categoryItem2) {
        const key = `${item.categoryItem1}${item.categoryItem2}`;
        combinationSet[key] = {
          country: item.categoryItem1,
          platform: item.categoryItem2,
        };
      }
    });

    // 生成图例项和颜色映射
    const items: Array<{
      key: string;
      label: string;
      country: string;
      platform: string;
      color: string;
      order: number;
    }> = [];

    let index = 0;
    Object.keys(combinationSet).forEach((key) => {
      const { country, platform } = combinationSet[key];
      const color = G2_DEFAULT_COLORS[index % G2_DEFAULT_COLORS.length];
      items.push({
        key,
        label: `${country}${platform}`,
        country,
        platform,
        color,
        order: index,
      });
      index++;
    });

    return items;
  }, [rawData]);

  // 根据选择的国家和平台过滤图例项
  const legendItems = React.useMemo(() => {
    return allLegendItems.filter((item) => {
      const matchCountry = selectedCountry === 'all' || item.country === selectedCountry;
      const matchPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform;
      return matchCountry && matchPlatform;
    });
  }, [allLegendItems, selectedCountry, selectedPlatform]);

  // 从 allLegendItems 生成排序索引映射（使用完整列表保持顺序一致）
  const sortOrderMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    allLegendItems.forEach((item) => {
      map[item.key] = item.order;
    });
    return map;
  }, [allLegendItems]);

  // 生成完整的 color domain（所有可能的组合）
  const colorDomain = React.useMemo(() => {
    return allLegendItems.map((item) => item.key);
  }, [allLegendItems]);

  // 数据过滤函数（只过滤国家和平台，不过滤禁用的图例）
  const filterByCategoryItems = (item: any) => {
    const matchCountry = selectedCountry === 'all' || item.categoryItem1 === selectedCountry;
    const matchPlatform = selectedPlatform === 'all' || item.categoryItem2 === selectedPlatform;
    return matchCountry && matchPlatform;
  };

  // 排序函数
  const sortByOrder = (a: any, b: any) => {
    const keyA = a.c || a.x;
    const keyB = b.c || b.x;
    const orderA = sortOrderMap[keyA] ?? 999;
    const orderB = sortOrderMap[keyB] ?? 999;
    return orderA - orderB;
  };

  // 将销售趋势数据拍平，转换为图表需要的格式
  const salesTrendData = (rawData?.salesData?.salesTrendChart?.series || [])
    .filter(filterByCategoryItems)
    .flatMap((item) => {
      return (item.dataPoints || []).map((point) => ({
        x: point.x,
        y: point.y,
        c: `${item.categoryItem1}${item.categoryItem2}`, // categoryItem1 作为分类字段
      }));
    })
    .sort(sortByOrder);

  const ratingRangeData = (rawData?.salesData?.ratingRangeChart?.dataItems || [])
    .filter(filterByCategoryItems)
    .map((item) => {
      return {
        ...item,
        start: Number(item.start) || 0,
        end: Number(item.end) || 0,
        x: `${item.categoryItem1}${item.categoryItem2}`, // categoryItem1 作为分类字段
      };
    })
    .sort(sortByOrder);

  const inStockData = (rawData?.supplyData?.inStockChart?.dataItems || [])
    .filter(filterByCategoryItems)
    .map((item) => {
      return {
        ...item,
        start: Number(item.start) || 0,
        end: undefined,
        // end: Number(item.end) || 0,
        x: `${item.categoryItem1}${item.categoryItem2}`, // categoryItem1 作为分类字段
      };
    })
    .sort(sortByOrder);

  const priceRangeData = (rawData?.supplyData?.priceRangeChart?.dataItems || [])
    .filter(filterByCategoryItems)
    .map((item) => {
      return {
        ...item,
        start: Number(item.start) || 0,
        end: Number(item.end) || 0,
        x: `${item.categoryItem1}${item.categoryItem2}`, // categoryItem1 作为分类字段
      };
    })
    .sort(sortByOrder);

  const tabItems = [
    {
      key: '1',
      label: $t('global-1688-ai-app.SelectProduct.ReportBoard.CompositeChart.salesPerformance', '销售表现'),
      children: <div className={styles.compositeChartContent}>
        <div className={styles.chartItem} >
          <div className={styles.chartTitle}>{rawData?.salesData?.salesTrendChart?.title || ''}</div>
          <LineChartMulti
            data={salesTrendData}
            colors={G2_DEFAULT_COLORS}
            colorDomain={colorDomain}
            disabledLegends={disabledLegends}
            toolTipYName={rawData?.salesData?.salesTrendChart?.series?.[0]?.YUnit}
            toolTipXName={rawData?.salesData?.salesTrendChart?.series?.[0]?.XUnit}
          />
        </div>
        <div className={styles.chartItem} >
          <div className={styles.chartTitle}>{rawData?.salesData?.ratingRangeChart?.title || ''}</div>
          <IntervalBarChart
            toolTipYName={rawData?.salesData?.ratingRangeChart?.dataItems?.[0]?.unit}
            data={ratingRangeData}
            colors={G2_DEFAULT_COLORS}
            colorDomain={colorDomain}
            disabledLegends={disabledLegends}
          />
        </div>
      </div>,
    },
    {
      key: '2',
      label: $t('global-1688-ai-app.SelectProduct.ReportBoard.CompositeChart.supplyPerformance', '供给表现'),
      children: <div className={styles.compositeChartContent}>
        <div className={styles.chartItem} >
          <div className={styles.chartTitle}>{
            rawData?.supplyData?.inStockChart?.title || ''
          }</div>
          <IntervalSignBarChart
            toolTipYName={rawData?.supplyData?.inStockChart?.dataItems?.[0]?.unit}
            data={inStockData}
            colors={G2_DEFAULT_COLORS}
            colorDomain={colorDomain}
            disabledLegends={disabledLegends}
          />
        </div>
        <div className={styles.chartItem} >
          <div className={styles.chartTitle}>{
            rawData?.supplyData?.priceRangeChart?.title || ''
          }</div>
          <IntervalBarChart
            toolTipYName={rawData?.supplyData?.priceRangeChart?.dataItems?.[0]?.unit}
            data={priceRangeData}
            colors={G2_DEFAULT_COLORS}
            colorDomain={colorDomain}
            disabledLegends={disabledLegends}
          />
        </div>
      </div>,
    },
  ];

  const countryOptions = rawData?.countryOptions?.map((item) => {
    return {
      key: item,
      value: item,
      label: item,
    };
  });
  const platformOptions = rawData?.platformOptions?.map((item) => {
    return {
      key: item,
      value: item,
      label: item,
    };
  });

  // 计算滑动条位置
  useEffect(() => {
    const updateBarPosition = () => {
      const activeTab = tabRefs.current[activeKey];
      const tabList = tabListRef.current;

      if (activeTab && tabList) {
        const tabListRect = tabList.getBoundingClientRect();
        const activeTabRect = activeTab.getBoundingClientRect();

        setBarStyle({
          width: activeTabRect.width,
          left: activeTabRect.left - tabListRect.left,
        });
      }
    };

    // 延迟执行，确保DOM已渲染
    setTimeout(updateBarPosition, 0);

    // 监听窗口resize
    window.addEventListener('resize', updateBarPosition);
    return () => window.removeEventListener('resize', updateBarPosition);
  }, [activeKey]);

  // 图例点击处理
  const handleLegendClick = (key: string) => {
    setDisabledLegends((prev) => {
      const newDisabled = { ...prev };
      if (newDisabled[key]) {
        delete newDisabled[key];
      } else {
        newDisabled[key] = true;
      }
      return newDisabled;
    });
  };

  return (
    <div className={styles.compositeChartWapper}>
      <div className={styles.compositeChartTabListWrapper}>
        <div className={styles.compositeChartTabList} ref={tabListRef}>
          {(tabItems || []).map((item) => (
            <div
              key={item.key}
              ref={(el) => (tabRefs.current[item.key] = el)}
              className={`${styles.compositeChartTabItem} ${activeKey === item.key ? styles.active : ''}`}
              onClick={() => setActiveKey(item.key)}
            >
              <div className={styles.compositeChartTabItemLabel}>{item.label}</div>
            </div>
          ))}
        </div>
        <div className={styles.compositeChartTabLine}>
          <div
            className={styles.compositeChartTabLineBar}
            style={{
              width: `${barStyle.width}px`,
              left: `${barStyle.left}px`,
            }}
          />
        </div>
        <div className={styles.compositeChartSelectWrapper}>
          <div>
            <Select
              style={{ width: '110px' }}
              value={selectedCountry}
              className={styles.compositeChartSelect}
              popupMatchSelectWidth={false}
              classNames={{
                popup: {
                  root: styles.compositeChartSelectDropdown,
                },
              }}
              suffixIcon={
                <DownArrowIcon
                  fill="#7C7F9A"
                  style={{
                    transform: countrySelectOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              }
              onOpenChange={(open) => setCountrySelectOpen(open)}
              onChange={(value) => setSelectedCountry(value)}
              options={[{ key: 'all', value: 'all', label: $t('global-1688-ai-app.SelectProduct.ReportBoard.CompositeChart.allCountries', '全部国家') }, ...(countryOptions || [])]}
              optionRender={(option) => {
                return (
                  <div className={styles.compositeChartSelectDropdownItem}>
                    <div>{option?.label}</div>
                    {selectedCountry === option?.value && (
                      <div className={styles.compositeChartSelectDropdownItemCheckmark}>
                        <Checkmark2Icon />
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
          <div>
            <Select
              style={{ width: '110px' }}
              className={styles.compositeChartSelect}
              popupMatchSelectWidth={false}
              classNames={{
                popup: {
                  root: styles.compositeChartSelectDropdown,
                },
              }}
              suffixIcon={
                <DownArrowIcon
                  fill="#7C7F9A"
                  style={{
                    transform: platformSelectOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              }
              options={[{ key: 'all', value: 'all', label: $t('global-1688-ai-app.SelectProduct.ReportBoard.CompositeChart.allPlatforms', '全部平台') }, ...(platformOptions || [])]}
              onOpenChange={(open) => setPlatformSelectOpen(open)}
              value={selectedPlatform}
              onChange={(value) => setSelectedPlatform(value)}
              optionRender={(option) => {
                return (
                  <div className={styles.compositeChartSelectDropdownItem}>
                    <div>{option?.label}</div>
                    {selectedPlatform === option?.value && (
                      <div className={styles.compositeChartSelectDropdownItemCheckmark}>
                        <Checkmark2Icon />
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>

        </div>
      </div>
      <div className={styles.compositeChartTabContent}>
        {tabItems.find((item) => item.key === activeKey)?.children}
      </div>
      <div className={styles.compositeChartFooter}>
        <div className={styles.compositeChartLegend}>
          {(legendItems || []).map((item) => {
            const isDisabled = disabledLegends[item.key];
            return (
              <div
                key={item.key}
                className={`${styles.legendItem} ${isDisabled ? styles.disabled : ''}`}
                onClick={() => handleLegendClick(item.key)}
              >
                <div
                  className={styles.legendColor}
                  style={{
                    backgroundColor: isDisabled ? '#D8D8D8' : item.color,
                  }}
                />
                <span className={styles.legendLabel}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default CompositeChart;

import { useEffect, useRef, useState } from 'react';
import { Chart } from '@antv/g2';
// import { FullscreenIcon } from '@/components/Icons';
import styles from './index.module.css';
// import LineChartModal from '../LineChartModal';
import { $t } from '@/i18n';

const LineChartMulti = ({ legend = false, data, reflect = false,
  toolTipXName, toolTipYName, title, colors, colorDomain, disabledLegends }:
  {
    legend?: boolean; data: any[]; reflect?: boolean;
    toolTipXName?: string; toolTipYName?: string; title?: string; colors?: string[];
    colorDomain?: string[]; disabledLegends?: Record<string, boolean>;
  }) => {
  const containerRef = useRef<HTMLDivElement>(null); // 使用 ref 获取容器元素
  const chartRef = useRef<any>(null); // 保存图表实例的引用
  const [open, setOpen] = useState(false);
  // const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (data?.length > 0 && containerRef.current) {
      // 清理之前的图表
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      let isInitialized = false;

      // 初始化图表
      const initChart = () => {
        if (!containerRef.current || isInitialized) return;

        // 获取容器宽度
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // 如果容器尺寸为0，延迟初始化
        if (containerWidth === 0 || containerHeight === 0) {
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
          }
          initTimeoutRef.current = setTimeout(initChart, 100);
          return;
        }

        isInitialized = true;

        // 动态计算 y 轴范围
        const yValues = data.map((item) => item.y);
        const maxY = Math.max(...yValues);

        // domainMin 固定为 0
        const domainMin = 0;
        const domainMax = Math.ceil(maxY / 5) * 5;

        const chart = new Chart({
          container: containerRef.current,
          autoFit: true,
          // padding: 0,
          marginLeft: 0,
          height: 216,
          legend: legend,
          tooltip: true,
        });

        // 过滤数据，只保留未被禁用的系列
        const filteredData = disabledLegends
          ? data.filter((item) => !disabledLegends[item.c])
          : data;

        chart
          .data(filteredData)
          .line()
          .encode('x', 'x')
          .encode('y', 'y')
          .encode('color', 'c')
          .scale('y', {
            range: reflect ? [0, 1] : [1, 0], // reflect=false时反转，y越小越高
            tickCount: 5,
            domain: [domainMin, domainMax],
          })
          .scale('color', {
            ...(colors ? { range: colors } : {}),
            ...(colorDomain ? { domain: colorDomain } : {}),
          })
          .encode('shape', 'smooth')
          .style('lineWidth', 2)
          .tooltip({
            items: [
              (datum: any, index: number, data2: any[], column: any) => {
                // 过滤掉被禁用的系列
                const isDisabled = disabledLegends && disabledLegends[datum.c];
                if (isDisabled) return null;
                return {
                  name: datum.c,
                  toolTipXName: toolTipXName || '',
                  toolTipYName: toolTipYName || '',
                  value: `${datum.y}`,
                };
              },
            ],
          })
          // .legend('color', {
          //   position: 'bottom',
          //   layout: {
          //     justifyContent: 'center',
          //     alignItems: 'center',
          //     flexDirection: 'row',
          //   },
          //   itemMarker: 'rect',
          //   itemMarkerSize: 16,
          //   itemMarkerLineWidth: 8,
          //   itemSpacing: 4,
          // });

          .axis('x', {
            title: false,
            tickStroke: '#707478',
            tickOpacity: 1,
            // gridStroke: '#D7DBE0',
            // gridStrokeOpacity: 1,
            // gridLineDash: [1, 0],
            grid: false,
            line: true,
            lineStroke: '#707478',
            lineOpacity: 1,
            lineStrokeOpacity: 1,
            lineLineWidth: 1,
            // labelFontWeight: 400,
            // size: 16,
            // labelFill: '#707478',
            // labelFillOpacity: 1,
            // labelStroke: '#707478',
            // labelStrokeOpacity: 1,
            // labelAutoEllipsis: true,
            // labelAutoWrap: true,
            // labelAutoRotate: true,
            size: 24,
            transform: [
              {
                type: 'ellipsis',
                suffix: '...', // 缩略符号
              },
            ],
          })
          .axis('y', {
            title: false,
            tick: false, // 是否 显示刻度
            // labelDx: -8, // 刻度标签文字水平偏移量
            gridStroke: '#D7DBE0',
            gridStrokeOpacity: 1,
            gridLineDash: [1, 0],
          });
        // 在 chart 上配置 tooltip 的 render
        chart.interaction('tooltip', {
          render: (event: any, { title: title2, items }: any) => {
            if (!items || items.length === 0) return '';
            return `
          <div>
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 12px; line-height: 18px;color: rgba(0, 0, 0, 0.87);">
              <span style="margin-right: 8px;">${toolTipXName || ''}</span>
              <span>${title2}</span>
              </span>
            </div>
            ${(items || []).map((item: any) => {
              return `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">
              <div>
              <span style="width: 8px; height: 8px; background-color: ${item.color}; display: inline-block; margin-right: 8px;"></span>
              <span style="color: #343A45; font-size: 13px;line-height: 18px;">${item.name}</span>
              </div>
              <div style="margin-left: 18px;">
              <span style="color: #343A45; font-size: 13px;font-weight: 500;line-height: 18px;margin-right: 8px;">${item.toolTipYName}:</span>
              <span style="color: #343A45; font-size: 13px;font-weight: 500;line-height: 18px;">${item.value}</span>
              </div>
            </div>`;
            }).join(' ')
              }
          </div>
        `;
          },
        });
        chart.render();
        chartRef.current = chart;
      };

      // 延迟初始化，确保DOM完全渲染
      // setTimeout(() => {
      initChart();
      // }, 100);

      // 添加窗口尺寸变化监听器（备用）
      const handleResize = () => {
        if (chartRef.current) {
          requestAnimationFrame(() => {
            if (chartRef.current) {
              chartRef.current.forceFit();
            }
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    }

    // 如果没有数据，也要返回一个清理函数
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, reflect, colors, colorDomain, disabledLegends]);

  const handleOpenModal = () => {
    setOpen(true);
  };

  return (
    <div className={styles.chartContainer} >
      {/* 没有数据的情况下，展示一个空div */}
      {data?.length === 0 &&
        <div className={styles.chartContainerEmpty}>
          <img src="https://gw.alicdn.com/imgextra/i2/O1CN01eWtwpP1fWvJ1RqsWE_!!6000000004015-2-tps-324-324.png" alt="" />
          <span>{$t("global-1688-ai-app.select-business.TableEmpty.noData", "暂无数据")}</span>
        </div>
      }
      <div ref={containerRef} style={{ height: '216px', width: '100%' }} />
    </div>
  );
};

export default LineChartMulti;

// import { Chart } from '@antv/g2';

// const data = [
//   { month: 3, category: '美国亚马逊', value: 5200 },
//   { month: 4, category: '美国亚马逊', value: 5800 },
//   { month: 5, category: '美国亚马逊', value: 4500 },
//   { month: 6, category: '美国亚马逊', value: 5100 },
//   { month: 7, category: '美国亚马逊', value: 6200 },
//   { month: 8, category: '美国亚马逊', value: 6500 },
//   { month: 9, category: '美国亚马逊', value: 6013 },
//   { month: 10, category: '美国亚马逊', value: 5500 },
//   { month: 11, category: '美国亚马逊', value: 4800 },
//   { month: 12, category: '美国亚马逊', value: 4200 },

//   { month: 3, category: '日本亚马逊', value: 4800 },
//   { month: 4, category: '日本亚马逊', value: 5000 },
//   { month: 5, category: '日本亚马逊', value: 5300 },
//   { month: 6, category: '日本亚马逊', value: 5600 },
//   { month: 7, category: '日本亚马逊', value: 5900 },
//   { month: 8, category: '日本亚马逊', value: 5700 },
//   { month: 9, category: '日本亚马逊', value: 5400 },
//   { month: 10, category: '日本亚马逊', value: 5100 },
//   { month: 11, category: '日本亚马逊', value: 4900 },
//   { month: 12, category: '日本亚马逊', value: 4700 },

//   { month: 3, category: '欧洲亚马逊', value: 3800 },
//   { month: 4, category: '欧洲亚马逊', value: 4000 },
//   { month: 5, category: '欧洲亚马逊', value: 4500 },
//   { month: 6, category: '欧洲亚马逊', value: 5000 },
//   { month: 7, category: '欧洲亚马逊', value: 5500 },
//   { month: 8, category: '欧洲亚马逊', value: 5300 },
//   { month: 9, category: '欧洲亚马逊', value: 5000 },
//   { month: 10, category: '欧洲亚马逊', value: 4800 },
//   { month: 11, category: '欧洲亚马逊', value: 4600 },
//   { month: 12, category: '欧洲亚马逊', value: 4400 },

//   { month: 3, category: '加拿大亚马逊', value: 3500 },
//   { month: 4, category: '加拿大亚马逊', value: 3800 },
//   { month: 5, category: '加拿大亚马逊', value: 4200 },
//   { month: 6, category: '加拿大亚马逊', value: 4600 },
//   { month: 7, category: '加拿大亚马逊', value: 5000 },
//   { month: 8, category: '加拿大亚马逊', value: 4800 },
//   { month: 9, category: '加拿大亚马逊', value: 4500 },
//   { month: 10, category: '加拿大亚马逊', value: 4300 },
//   { month: 11, category: '加拿大亚马逊', value: 4100 },
//   { month: 12, category: '加拿大亚马逊', value: 3900 },
// ];

// const chart = new Chart({
//   container: 'container',
//   autoFit: true,
//   height: 216,
//   width: 418,
//   //tooltip: false,
//   legend: false
// });

// chart
//   .data(data)
//   .line()
//   .encode('x', 'month')
//   .encode('y', 'value')
//   .encode('color', 'category')
//   .scale('x', {
//     range: [0, 1],
//     formatter: (val) => {
//       const monthMap = {
//         3: '03月',
//         4: '04月',
//         5: '05月',
//         6: '06月',
//         7: '07月',
//         8: '08月',
//         9: '09月',
//         10: '10月',
//         11: '11月',
//         12: '12月',
//       };
//       return monthMap[val] || val;
//     },
//   })
//   .scale('y', {
//     nice: false,
//     domain: [0, 8000],
//   })
//   .axis('y',{
//     title: false
//   })
//   .axis('x',{
//     title: false
//   })
//   .style('smooth', true);

// 高亮面积（初始隐藏）
// const area = chart
//   .area()
//   .encode('x', 'month')
//   .encode('y', 'value')
//   .encode('color', 'category')
//   //.style('smooth', true)
//   //.style('fillOpacity', 0.1)
//   //.style('fill', '#a689ff') // 淡紫色
//   .style('fill', 'linear-gradient(-90deg, white 0%, #a689ff 100%)')
//   .tooltip(false)
//   ;

// 高亮点（初始隐藏）
// const point = chart
//   .point()
//   .encode('x', 'month')
//   .encode('y', 'value')
//   .encode('color', 'category')
//   .style('size', 6)
//   .style('fill', '#fff')
//   .style('stroke', 'color') // 使用系列颜色描边
//   .tooltip(false)
//   ;
// .attr('visible', false);

// 悬停交互 —— 修正版
// chart.on('plot:mousemove', (evt) => {
//   const picked = chart.pick('line', evt);
//   if (!picked || !picked.item) {
//     area.attr('visible', false);
//     point.attr('visible', false);
//     return;
//   }

//   const current = picked.item;
//   const category = current.category;

//   // 过滤当前系列数据
//   const seriesData = data.filter(d => d.category === category);

//   // 更新高亮图层数据
//   area.data(seriesData);
//   point.data([current]);

//   // 显示高亮
//   area.attr('visible', true);
//   point.attr('visible', true);

//   // 自定义 Tooltip 内容
//   const tooltipContent = `
//     <div style="padding:8px;background:white;border:1px solid #ccc;border-radius:4px;">
//       <div style="display:flex;align-items:center;margin-bottom:4px;">
//         <span style="display:inline-block;width:10px;height:10px;background:${current.color};margin-right:8px;"></span>
//         <span>${category}</span>
//       </div>
//       <div>时间：2025/${String(current.month).padStart(2, '0')}</div>
//       <div>销量：${current.value}</div>
//     </div>
//   `;

//   // 手动显示 Tooltip（位置在鼠标处）
//   chart.emit('tooltip:show', {
//     position: [evt.x, evt.y],
//     content: tooltipContent,
//   });
// });

// // 鼠标离开时隐藏
// chart.on('plot:mouseleave', () => {
//   area.attr('visible', false);
//   point.attr('visible', false);
//   chart.emit('tooltip:hide');
// });

// chart.render();
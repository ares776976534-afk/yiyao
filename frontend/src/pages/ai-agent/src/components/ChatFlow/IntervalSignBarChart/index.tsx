import { useEffect, useRef, useState } from 'react';
import { Chart } from '@antv/g2';
// import { FullscreenIcon } from '@/components/Icons';
import styles from './index.module.css';
// import LineChartModal from '../LineChartModal';
import { $t } from '@/i18n';

const IntervalBarChart = ({ legend = false, data, reflect = false, toolTipYName,
  title, colors, colorDomain, disabledLegends }:
  {
    legend?: boolean; data: any[]; reflect?: boolean;
    toolTipYName?: string; title?: string; colors?: string[];
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
        const yStartValues = data.map((item) => item.start);
        const maxY = Math.max(...yStartValues);
        // domainMin 固定为 0
        const domainMin = 0;
        const domainMax = Math.ceil(maxY / 5) * 5;

        const chart = new Chart({
          container: containerRef.current,
          autoFit: true,
          height: 216,
          // padding: 0,
          marginLeft: 0,
          legend: legend,
        });

        // 根据 disabledLegends 计算选中的值
        const selectedValues = colorDomain
          ? colorDomain.filter((d) => !disabledLegends || !disabledLegends[d])
          : undefined;

        const transforms = selectedValues
          ? [{ type: 'filter', x: { value: selectedValues } }]
          : [];

        chart
          .interval()
          .data(data)
          .transform(transforms as any)
          .encode('x', 'x')
          .encode('y', 'start')
          .encode('color', 'x')
          .scale('color', {
            ...(colors ? { range: colors } : {}),
            ...(colorDomain ? { domain: colorDomain } : {}),
          })
          .style('lineWidth', 2)
          // .encode('size', 35)
          .style('columnWidthRatio', 0.5)
          .tooltip({
            title: (d: any) => d.x,
            items: [
              (d: any) => ({
                name: toolTipYName || '评分范围',
                value: `${d.start}`,
              }),
            ],
          });

        // 在 chart 上配置 tooltip 的 render
        chart.interaction('tooltip', {
          render: (event: any, { title: title2, items }: any) => {
            if (!items || items.length === 0) return '';

            const item = items[0];

            return `
              <div>
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="width: 8px; height: 8px; background-color: ${item.color}; display: inline-block; margin-right: 8px;"></span>
                  <span style="font-size: 12px; line-height: 18px;color: rgba(0, 0, 0, 0.87);">${title2}</span>
                </div>
                <div style="color: #343A45; font-size: 13px;font-weight: 500;line-height: 18px;">
                  ${item.name} ${item.value}
                </div>
              </div>
            `;
          },
        });
        // .transform({
        //   type: 'sample',
        //   thresholds: 200,
        //   strategy: 'max',
        // });

        chart.axis('x', {
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
          labelFontSize: 12,
          labelLineHeight: 16,
          lineLineWidth: 1,
          // labelFontWeight: 400,
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
        });
        chart.axis('y', {
          title: false,
          tick: false, // 是否 显示刻度
          // labelDx: -8, // 刻度标签文字水平偏移量
          gridStroke: '#D7DBE0',
          gridStrokeOpacity: 1,
          gridLineDash: [1, 0],
        });

        // console.log('domainMin', [domainMin, domainMax]);
        // 设置y轴scale
        chart.scale('y', {
          range: reflect ? [0, 1] : [1, 0], // reflect=false时反转，y越小越高
          tickCount: 5,
          domain: [domainMin, domainMax],
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
      {data?.length === 0 &&
        <div className={styles.chartContainerEmpty}>
          <img src="https://gw.alicdn.com/imgextra/i2/O1CN01eWtwpP1fWvJ1RqsWE_!!6000000004015-2-tps-324-324.png" alt="" />
          <span>{$t("global-1688-ai-app.select-business.TableEmpty.noData", "暂无数据")}</span>
        </div>}
      <div ref={containerRef} style={{ height: '216px', width: '100%' }} />
    </div>
  );
};

export default IntervalBarChart;
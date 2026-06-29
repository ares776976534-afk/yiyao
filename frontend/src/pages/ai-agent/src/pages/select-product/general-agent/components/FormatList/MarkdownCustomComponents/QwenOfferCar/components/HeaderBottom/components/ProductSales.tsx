import { useEffect, useRef, useState } from 'react';
import { Chart } from '@antv/g2';
import styles from './productSales.module.css';

const ProductSales = ({
  data,
  reflect = false,
  toolTipYName,
  style = { height: '140px', width: '100%' },
  height = 140,
}: { data: any[]; reflect?: boolean, toolTipYName?: string, style?: any, height?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null); // 使用 ref 获取容器元素
  const chartRef = useRef<any>(null); // 保存图表实例
  const [open, setOpen] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
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

        const chart = new Chart({
          container: containerRef.current,
          autoFit: true,
          height,
          // paddingLeft: 40,
          // paddingBottom: 20,
          // paddingRight: 10,
          // paddingTop: 10,
        });

        chart.options({
          type: 'view',
          data: data,
          axis: {
            x: {
              tick: false,
              title: false,
              label: {
                style: {
                  fontSize: 10,
                  fill: '#86909C',
                },
              },
              line: false,
            },
            y: {
              tick: false,
              title: false,
              label: {
                style: {
                  fontSize: 10,
                  fill: '#86909C',
                },
              },
              grid: {
                stroke: '#E5E6EB',
                lineDash: [4, 4],
              },
            },
          },
          children: [
            {
              type: 'area',
              encode: { x: 'x', y: 'y', shape: 'smooth' },
              style: {
                fill: 'l(270) 0:#ffffff 0.9:7D8AFF 1:#866CFF',
                fillOpacity: 0.2,
              },
              tooltip: false,
            },
            {
              type: 'line',
              encode: { x: 'x', y: 'y', shape: 'smooth' },
              interaction: {
                tooltip: false
              },
              style: {
                lineWidth: 1.5,
                stroke: '#6E50FF',
              },
            },
          ],
        });

        chart.render();
        chartRef.current = chart;

        // 多次调用 forceFit 确保图表完整显示
        setTimeout(() => {
          if (chartRef.current) {
            chartRef.current.forceFit();
          }
        }, 50);

        setTimeout(() => {
          if (chartRef.current) {
            chartRef.current.forceFit();
          }
        }, 200);
      };

      // 使用 ResizeObserver 监听容器尺寸变化
      if (containerRef.current) {
        resizeObserverRef.current = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.target === containerRef.current) {
              const { width } = entry.contentRect;
              if (width > 0 && !isInitialized) {
                // 容器有宽度时初始化图表
                initChart();
              } else if (chartRef.current && isInitialized) {
                // 容器尺寸变化时更新图表
                requestAnimationFrame(() => {
                  if (chartRef.current) {
                    chartRef.current.forceFit();
                  }
                });
              }
            }
          }
        });

        resizeObserverRef.current.observe(containerRef.current);
      }

      // 延迟初始化，确保DOM完全渲染
      setTimeout(() => {
        initChart();
      }, 100);

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
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current = null;
        }
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
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);
  return (
    data?.length > 0 ? (<div ref={containerRef} style={style} />) : <div className={styles.chartContainerEmpty}>-</div>
  );
};

export default ProductSales;

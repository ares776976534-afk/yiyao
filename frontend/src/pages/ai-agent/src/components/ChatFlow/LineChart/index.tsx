import { useEffect, useRef, useState } from 'react';
import { Chart } from '@antv/g2';
import { FullscreenIcon } from '@/components/Icons';
import styles from './index.module.css';
import LineChartModal from '../LineChartModal';
import { $t } from '@/i18n';

const LineChart = ({ data, reflect = false, toolTipYName, title }:
  { data: any[]; reflect?: boolean; toolTipYName?: string; title?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null); // 使用 ref 获取容器元素
  const chartRef = useRef<any>(null); // 保存图表实例的引用
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
          height: 40,
          padding: 5,
          margin: 0,
        });

        chart
          .line()
          .data(data)
          .encode('x', 'x')
          .encode('y', 'y')
          .tooltip(false)
          .encode('shape', 'smooth')
          .style({
            stroke: '#6150FF',
            lineWidth: 2,
          })
          .transform({
            type: 'sample',
            thresholds: 200,
            strategy: 'max',
          });

        // 隐藏x轴和y轴
        chart.axis('x', false);
        chart.axis('y', false);

        // 设置y轴scale
        chart.scale('y', {
          range: reflect ? [1, 0] : [0, 1], // reflect=false时反转，y越小越高
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
  }, [data, reflect]);
  const handleOpenModal = () => {
    setOpen(true);
  };
  return (
    data?.length > 0 ? (
      <div className={styles.chartContainer} >
        <div ref={containerRef} style={{ height: '40px', width: '100%' }} />
        <div className={styles.closeIcon} onClick={handleOpenModal} >
          <FullscreenIcon size={16} />
        </div>
        <LineChartModal
          open={open}
          onClose={() => { setOpen(false); }}
          data={data}
          title={title || $t("global-1688-ai-app.ChatFlow.LineChart.viewqs", "查看趋势")}
          isReflect={reflect}
          toolTipYName={toolTipYName}
        />
      </div>
    ) : <div className={styles.chartContainerEmpty}>-</div>
  );
};

export default LineChart;

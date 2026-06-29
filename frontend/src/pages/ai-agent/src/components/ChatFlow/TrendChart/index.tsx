import { useEffect, useRef, useState } from 'react';
import { Chart } from '@antv/g2';

interface TypeTrendData {
  date: string;
  amazon: number;
  tiktok: number;
}

interface TypeTrendChartProps {
  data: TypeTrendData[];
}

const TrendChart: React.FC<TypeTrendChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 200 });

  // 监听容器大小变化
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setContainerSize({ width, height: 200 });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!data?.length || !containerRef.current) return;

    // 转换数据格式
    const chartData = data.map((item) => [
      { x: item.date, y: item.amazon, type: 'Amazon' },
      { x: item.date, y: item.tiktok, type: 'TikTok' },
    ]).flat();

    // 销毁之前的图表
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      height: 200,
    });

    chartRef.current = chart;

    chart
      .line()
      .data(chartData)
      .encode('x', 'x')
      .encode('y', 'y')
      .encode('color', 'type')
      .encode('shape', 'smooth')
      .tooltip(false)
      .style('strokeWidth', 2);

    // 禁用图例
    chart.legend(false);

    // 设置颜色
    chart.scale('color', {
      range: ['#6150FF', '#1D2129'], // Amazon: 蓝色, TikTok: 深灰色
    });

    // 设置Y轴
    chart.scale('y', {
      nice: true,
      tickCount: 4,
      formatter: (value) => (value === 0 ? '0' : `${value}k`),
    });

    // 设置X轴
    chart.scale('x', {
      nice: true,
      tickCount: data.length,
      formatter: (value) => {
        // 格式化日期显示，将 202409 转换为 2024-09
        if (typeof value === 'string' && value.length === 6) {
          return `${value.slice(0, 4)}-${value.slice(4, 6)}`;
        }
        return value;
      },
    });

    // 设置X轴标签旋转
    chart.axis('x', {
      line: { stroke: '#F3F3F6' },
      tickLine: { stroke: '#F3F3F6' },
      label: {
        fill: '#666',
        fontSize: 12,
        rotate: 0,
        textAlign: 'center',
      },
      labelAutoRotate: false,
      title: false, // 隐藏 x 轴标题
      grid: false, // 隐藏 x 轴网格线
    });

    // 设置Y轴样式
    chart.axis('y', {
      line: { stroke: '#F3F3F6' },
      tickLine: { stroke: '#F3F3F6' },
      label: {
        fill: '#666',
        fontSize: 12,
        formatter: (value) => (value === 0 ? '0' : `${value}k`),
      },
      title: false, // 隐藏 y 轴标题
      grid: false, // 隐藏 y 轴网格线
    });


    chart.render();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, containerSize.width]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '200px',
        minWidth: 0, // 确保容器可以收缩
      }}
    />
  );
};

export default TrendChart;

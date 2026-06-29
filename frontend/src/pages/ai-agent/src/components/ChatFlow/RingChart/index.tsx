import React, { useEffect, useRef, memo } from 'react';
import { Chart } from '@antv/g2';
import { colorMap } from '@/pages/select-product/general-agent/components/FormatList/MarkdownCustomComponents/QwenMarketAnalysi/components/KeywordAnalysis';

interface TypeRingChartProps {  
  data: any[];
  level: string;
  percent: string;
  name: string;
}

// 解析百分比值，统一转换为数字
const parsePercent = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // 移除 % 符号并转换为数字
  const numStr = String(value).replace('%', '').trim();
  const num = parseFloat(numStr);
  // 如果是小数形式（如 0.564），转换为百分比形式（56.4）
  if (num > 0 && num < 1) {
    return num * 100;
  }
  return isNaN(num) ? 0 : num;
};

// 格式化百分比显示
const formatPercent = (value: string | number): string => {
  const num = parsePercent(value);
  return `${num.toFixed(1)}%`;
};

const RingChart = memo(({ data, level, percent, name }: TypeRingChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const hasRenderedRef = useRef(false);
  const displayPercent = formatPercent(percent);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // 处理数据，确保 percent 是数字
    const chartData = data.map(item => ({
      ...item,
      percent: parsePercent(item.percent),
    }));

    // 如果已经渲染过，只更新数据不重新创建图表
    if (hasRenderedRef.current && chartRef.current) {
      return;
    }

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      inset: 0,
      padding: 0,
      margin: 0,
    });

    chartRef.current = chart;

    // 禁用 tooltip
    chart.interaction('tooltip', false);
    
    const facetRect = chart
      .facetRect()
      .data(chartData)
      .encode('x', 'type')
      .axis(false)
      .legend(false)
      .view()
      .attr('frame', false)
      .coordinate({ type: 'theta', innerRadius: 0.7, outerRadius: 1 });
    
    facetRect
      .interval()
      .encode('y', 100)
      .scale('y', { zero: true })
      .style('fill', '#e8e8e8')
      .tooltip(false)
      .animate(false);
    
    facetRect
      .interval()
      .encode('y', 'percent')
      .encode('color', 'color')
      .style('fill', colorMap[level])
      .scale('color', { type: 'identity' })
      .tooltip(false)
      .animate('enter', { type: 'waveIn', duration: 1000 });
    
    facetRect
      .text()
      .encode('text', displayPercent)
      .style('textAlign', 'center')
      .style('textBaseline', 'middle')
      .style('fontSize', 18)
      .style('fontWeight', '600')
      .style('fill', '#1D2129')
      .style('x', '50%')
      .style('y', '50%')
      .tooltip(false)
      .style('dy', -10);
    
    facetRect
      .text()
      .encode('text', name)
      .style('textAlign', 'center')
      .style('textBaseline', 'middle')
      .style('fontSize', 12)
      .style('fill', colorMap[level])
      .style('x', '50%')
      .style('y', '50%')
      .tooltip(false)
      .style('dy', 10);
    
    chart.render();
    hasRenderedRef.current = true;

    return () => {
      chart.destroy();
      chartRef.current = null;
      hasRenderedRef.current = false;
    };
  }, [data, level, displayPercent, name]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数：只有当关键值真正变化时才重新渲染
  return (
    prevProps.percent === nextProps.percent &&
    prevProps.level === nextProps.level &&
    prevProps.name === nextProps.name
  );
});

export default RingChart;

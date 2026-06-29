import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';

const RadarChartChart = ({ data = [] }: { data: any[] }) => {
  const containerRef = useRef(null); // 使用 ref 获取容器元素
  useEffect(() => {
    if (!containerRef.current) return;
    const values = (data || []).map(item => item.value || 0);
    const maxValue = Math.max(...values);
    const domainMax = Math.max(100, Math.ceil(maxValue * 1.2));

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      width: 290,
      height: 220,
      clip: true,
      inset: 15,
    });

    chart.coordinate({ type: 'polar' });

    chart
      .data(data)
      .scale('x', { padding: 0.5, align: 0 })
      .scale('y', { tickCount: 5, domainMax: domainMax })
      .axis('y', {
        zIndex: 1,
        title: false,
        label: false,
        tick: false,
        gridConnect: 'line',
        gridLineWidth: 1,
      })
      .axis('x', {
        tick: false,
        labelSpacing: 10,
        labelAlign: 'horizontal',
        labelFormatter: (datum, index, array) => {
          const matchedItem = data.find(item => item.name === datum);
          // 如果没有匹配到数据项，返回原始值
          return `${matchedItem.name}\n   ${matchedItem.value}`;
          // return `<div
          //   style="display: flex; flex-direction: column; gap: 4px; transform: translateX(-50%); cursor: pointer;"
          //   onmouseenter="if(window.radarChartMouseEnter) window.radarChartMouseEnter('${matchedItem.name}', event)"
          //   onmouseleave="if(window.radarChartMouseLeave) window.radarChartMouseLeave()"
          // >
          //   <div>${matchedItem.name}</div>
          //   <div>${matchedItem.value}</div>
          // </div>`;
        },
      });

    chart
      .area()
      .encode('x', 'name')
      .encode('y', 'value')
      .style({
        fill: 'rgba(83, 99, 245, 0.12)', // 区域背景色
        fillOpacity: 1,
      });

    chart
      .line()
      .encode('x', 'name')
      .encode('y', 'value')
      .style({
        strokeOpacity: 1,
        stroke: '#6150FF', // 雷达链颜色
        lineWidth: 1,
      });

    chart
      .point()
      .encode('x', 'name')
      .encode('y', 'value')
      .encode('color', 'type')
      .encode('shape', 'point')
      .tooltip(null);

    chart.interaction('tooltip', false);

    chart.render();

    return () => {
      chart.destroy();
    };
  }, [data]);

  return (
    <div ref={containerRef} />
  );
};

export default RadarChartChart;

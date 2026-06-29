import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';

const RingChartEmpty = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      inset: 0,
      padding: 0,
      margin: 0,
    });

    // 禁用 tooltip
    chart.interaction('tooltip', false);
    
    // 空状态数据
    const emptyData = [{ type: 'empty', value: 100 }];
    
    const facetRect = chart
      .facetRect()
      .data(emptyData)
      .encode('x', 'type')
      .axis(false)
      .legend(false)
      .view()
      .attr('frame', false)
      .coordinate({ type: 'theta', innerRadius: 0.7, outerRadius: 1 });
    
    // 灰色空心圆环
    facetRect
      .interval()
      .encode('y', 'value')
      .scale('y', { zero: true })
      .style('fill', '#e8e8e8')
      .tooltip(false)
      .animate(false);
    
    // 中间显示"暂无数据"
    facetRect
      .text()
      .encode('text', '暂无数据')
      .style('textAlign', 'center')
      .style('textBaseline', 'middle')
      .style('fontSize', 12)
      .style('fill', '#86909C')
      .style('x', '50%')
      .style('y', '50%')
      .tooltip(false);
    
    chart.render();

    return () => {
      chart.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default RingChartEmpty;

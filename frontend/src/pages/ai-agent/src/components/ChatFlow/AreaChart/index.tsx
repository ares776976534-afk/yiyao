import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';

interface TypeAreaChartProps {
  data?: any[];
}

const AreaChart = ({ data }: TypeAreaChartProps) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    const chart = new Chart({
      container: containerRef.current,
      width: 200,
      height: 58,
      padding: 0,
      margin: 0,
    });

    chart.data(data);

    chart
      .area()
      .encode('x', 'x')
      .encode('y', 'y')
      .encode('shape', 'smooth')
      .style('opacity', 0.2)
      .axis('y', false)
      .axis('x', { title: false, label: false, tick: false })
      .style('fill', 'linear-gradient(180deg, rgba(83, 99, 245, 0.4) 0%, rgba(216, 216, 216, 0) 100%)');

    chart
      .line()
      .encode('x', 'x')
      .encode('y', 'y')
      .encode('shape', 'smooth')
      .style('stroke', '#6150FF');


    chart.render();

    return () => {
      chart.destroy();
    };
  }, [data]);

  return (
    <div ref={containerRef} style={{ width: '200px', height: '58px' }} />
  );
};

export default AreaChart;

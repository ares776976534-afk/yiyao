import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';
import { Popover } from 'antd';
import RadarChartChart from './RadarChartChart';
import styles from './index.module.css';
import { $t } from '@/i18n';

const RadarChart = ({ data, orther, radarTitle = '', oppScore = 0, radarDescription = '' }: { data: any[]; orther: any; radarTitle?: string; oppScore?: number; radarDescription?: string }) => {
  const containerRef = useRef(null); // 使用 ref 获取容器元素
  useEffect(() => {
    if (!containerRef.current) return;
    const values = (data || []).map(item => item.value || 0);
    const maxValue = Math.max(...values);
    const domainMax = Math.max(100, Math.ceil(maxValue * 1.2));
    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      inset: 0,
      padding: 0,
      margin: 0,
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
        title: false,
        tick: false,
        label: false,
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
    <Popover
      // overlayInnerStyle={{
      //   padding: 0,
      // }}
      classNames={{
        root: styles.popoverRoot,
      }}
      align={{
        offset: [-20, 0],
      }}
      styles={{ body: { padding: 0 } }}
      placement="bottom"
      trigger="hover"
      content={
        <div className={styles.popoverContent}>
          <div className={styles.popoverContentTitle}>
            <div className={styles.popoverContentTitleText}>{$t("global-1688-ai-app.ChatFlow.RadarChart.f", `${radarTitle}:${oppScore}分`, [radarTitle, oppScore])}</div>
            <div className={styles.popoverContentTitleTextDesc}>{radarDescription}</div>
          </div>
          <RadarChartChart data={data || []} />
        </div>
      }
    >
      <div ref={containerRef} style={{ cursor: 'pointer', ...orther }} />
    </Popover>
  );
};

export default RadarChart;

import React, { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { Chart } from '@antv/g2';
import styles from './index.module.css';

interface LineChartModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
  title: string;
  isReflect?: boolean;
  toolTipYName?: string;
}

const LineChartModal: React.FC<LineChartModalProps> = ({ open, onClose, data, title, isReflect, toolTipYName }) => {
  const containerRef = useRef(null); // 使用 ref 获取容器元素
  useEffect(() => {
    let chart: Chart | null = null;

    // 确保模态框打开且有数据才创建图表
    if (open && data?.length > 0 && containerRef.current) {
      chart = new Chart({
        container: containerRef.current,
        autoFit: true,
        width: 760, // 设置固定宽度
        height: 427, // 设置固定高度
      });

      chart
        .line()
        .data(data)
        .encode('x', 'x')
        .encode('y', 'y')
        .tooltip({
          items: [
            {
              field: 'y',
              name: toolTipYName,
            },
          ],
        })
        .encode('shape', 'smooth')
        .style('stroke', '#6150FF')
        .scale('y', {
          nice: true,
          range: isReflect ? [1, 0] : [0, 1], // reflect=false时反转，y越小越高
        })
        .transform({
          type: 'sample',
          thresholds: 200,
          strategy: 'max',
        });
      chart.axis('x', {
        title: null,
        position: 'top', // 将x轴显示在顶部
        line: {
          style: {
            stroke: '#86909C', // x轴线颜色与刻度线颜色一致
            lineWidth: 1,
            lineDash: null, // 实线
          }
        },
      });
      chart.axis('y', {
        title: null,
      });
      chart.render();
    }

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [open, data]); // 依赖open和data
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={false}
      className={styles.modal}
      width={800}
    >
      <div ref={containerRef} style={{ width: '100%', height: '427px' }} />
    </Modal>
  );
};

export default LineChartModal;
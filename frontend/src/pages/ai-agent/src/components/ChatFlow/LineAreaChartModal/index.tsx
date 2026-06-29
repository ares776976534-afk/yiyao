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
  const containerRef = useRef<HTMLDivElement>(null); // 使用 ref 获取容器元素
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // 确保模态框打开且有数据才创建图表
    if (!open || !data?.length || !containerRef.current) {
      return;
    }

    // 清理之前的图表
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    // 延迟初始化，等待 Modal 完全渲染
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const MAX_VALUE = Math.max(...data.map(item => item.y));
      const Y_AXIS_MAX = Math.ceil(MAX_VALUE / 10000) * 10000;
      const chart = new Chart({
        container: containerRef.current,
        autoFit: true,
      });

      chart.options({
        type: 'view',
        autoFit: true,
        paddingRight: 10,
        data: data,
        scale: {
          y: {
            nice: true,
            min: 0,
          },
        },
        axis: {
          x: {
            position: 'top',
          },
          y: {
            labelFormatter: (d) => (isReflect ? d > 0 ? d : 0 : `${Y_AXIS_MAX - d > 0 ? Y_AXIS_MAX - d : 0}`),
          },
        },
        children: [
          {
            type: 'area',
            encode: { x: (d) => d.x, y: (d) => isReflect ? d.y : Y_AXIS_MAX - d.y, shape: 'smooth' },
            style: {
              fill: 'l(270) 0:#ffffff 0.9:#866CFF 1:#866CFF',
              fillOpacity: 0.2,
            },
            tooltip: false,
          },
          {
            type: 'line',
            encode: { x: (d) => d.x, y: (d) => isReflect ? d.y : Y_AXIS_MAX - d.y, shape: 'smooth' },
            interaction: {
              tooltip: {
                render: (event, { title, items }) => `
                    <div>
                        <div style="color: #999; font-size: 12px">${title}</div>
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #6E50FF; margin-right: 6px;"></div>
                                <span style="font-size: 14px; color: #999;">${toolTipYName || 'y'}:</span>
                            </div>
                            <div style="margin-left: 16px; font-size: 14px; line-height: 22px; font-weight: 500; color: #333;">
                                ${typeof items?.[0]?.value === 'number' ? isReflect ? items[0].value : Y_AXIS_MAX - items[0].value : ''}
                            </div>
                        </div>
                    </div>
                  `,
              },
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
    }, 100);

    return () => {
      clearTimeout(timer);
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [open, data, isReflect, toolTipYName]);
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
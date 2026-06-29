import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from '@alifd/next';
import { Chart } from '@antv/g2';
import { queryItemExposureData } from '../api';

const ChartModal = (props) => {
  const {
    visible, onClose, itemId } = props;

  const [ranking, setRanking] = useState([]);

  const dialogRef = React.createRef();
  const containerRef = useRef(null); // 使用 ref 获取容器元素

  useEffect(() => {
    if (!visible || !itemId) return;
    let isMounted = true;
    queryItemExposureData({
      itemId,
    })
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res?.content?.list)) {
          setRanking(res.content.list);
        } else {
          setRanking([]);
        }
      })
      .catch(() => {
        if (isMounted) setRanking([]);
      });

    return () => {
      isMounted = false;
    };
  }, [visible, itemId]);

  // 关闭弹窗时清空数据，避免上次数据短暂闪现
  useEffect(() => {
    if (!visible) {
      setRanking([]);
    }
  }, [visible]);

  useEffect(() => {
    if (!containerRef.current) return;
    // 在组件挂载后初始化图表
    const chart = new Chart({
      container: containerRef.current, // 直接指向 ref.current
      autoFit: true,
      height: 434, // 显式设置高度，避免布局问题
      marginBottom: 0,
      marginTop: 30,
      marginLeft: 20,
      marginRight: 20,
    });
    chart.data(ranking);
    chart.scale('y', {
      nice: true,
      // domainMin: 1, // 关键：设置y轴起始为1
      range: [0, 1],
      // tickMethod: (min, max, count) => {
      //   const ticks = [];
      //   let current = 0;
      //   while (current <= max) {
      //     ticks.push(current);
      //     current += 5; // 每 5 单位一个刻度
      //   }
      //   ticks.map((ele) => {
      //     return ele === 0 ? 1 : ele;
      //   });
      //   ticks[0] = 1;
      //   ticks.push(max);
      //   return ticks;
      // },
    });
    // 配置折线
    chart
      .line()
      .encode('x', 'bizdate')
      .encode('y', 'performance')
      .encode('shape', 'smooth')
      .interaction('tooltip', {
        render: (event, { title, items }) => {
          const performance = ranking?.filter((ele) => ele.bizdate === title)[0]?.performance;
          if (performance >= 0) {
            return `<div style="color: #999; font-size: 14px; line-height: 14px">
            ${title}: 
            <span style="color: #333; font-size: 28px; line-height: 28px; font-weight: 600">${performance}</span>
           </div>`;
          } else {
            return `<div style="color: #999; font-size: 14px; line-height: 14px">
              ${title}: 暂无数据
            </div>`;
          }
        },
      });
    chart.axis('y', {
      title: false,
      tick: false,
    });
    chart.axis('x', {
      title: false,
      tick: false,
      labelAutoHide: true,
      labelSpacing: 15,
      labelTransform: 'rotate(0)',
    });
    // 根据最大值决定是否设置 Y 轴范围
    const hasPerformanceGreaterThanZero = (arr) => {
      return arr.some((item) => 'performance' in item && item.performance > 0);
    };
    if (!hasPerformanceGreaterThanZero(ranking)) {
      chart
        .scale('y', {
          domain: [1, 200],
          range: [0, 1],
          tickMethod: () => {
            return [1, 50, 100, 150];
          },
        });
    }
    chart.render();

    // 组件卸载时清理图表
    return () => {
      chart.destroy();
    };
  }, [ranking]);

  return (
    <Dialog
      ref={dialogRef}
      title="15日商品曝光数据"
      visible={visible}
      footer={false}
      onClose={() => {
        onClose();
      }}
      style={{
        minWidth: '1000px',
        minHeight: '600px',
      }}
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: '434px' }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
        fontSize: '14px',
        color: '#666',
      }}
      >
        <div style={{
          width: '16px',
          height: '16px',
          backgroundColor: '#1890ff',
          borderRadius: '2px',
          marginRight: '8px',
        }}
        />
        曝光量
      </div>
    </Dialog >
  );
};

export default ChartModal;

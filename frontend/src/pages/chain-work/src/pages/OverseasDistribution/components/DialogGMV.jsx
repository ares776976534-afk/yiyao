import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Dialog, Icon, Balloon } from '@alifd/next';
import { Chart } from '@antv/g2';

const container = document.createElement('div');
const { Tooltip } = Balloon;
function DialogGmv({ props = {} }) {
  const { ranking = [] } = props;
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();
  const containerRef = useRef(null); // 使用 ref 获取容器元素
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
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
    // 配置面积图
    // chart
    //   .area()
    //   .encode('x', 'bizdate') // 使用字段名称而非箭头函数
    //   .encode('y', 'performance')
    //   .encode('shape', 'smooth')
    //   .style({
    //     opacity: 0.2,
    //     fill: 'linear-gradient(90deg, rgba(0, 119, 255, 0.49) 0%, rgba(95, 147, 241, 0) 87%)', // 直接设置颜色（可替换为渐变）
    //   })
    //   .axis('y', {
    //     labelFormatter: (datum, index, d) => {
    //       return `${d[d.length - 1] - datum === 0 ? 1 : d[d.length - 1] - datum}`;
    //     },
    //     title: false,
    //   });
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
            <span style="color: #333; font-size: 28px; line-height: 28px; font-weight: 600">${performance}</span>名
           </div>`;
          } else {
            return `<div style="color: #999; font-size: 14px; line-height: 14px">
              ${title}: 暂无排名
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
      return arr.some(item => 'performance' in item && item.performance > 0);
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
  }, [ranking]); // 依赖数组包含 data，数据变化时重新渲染图表
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={
        <div className="dialogGmv-icon">
          <span className="mr-[4px]">海外分销GMV排名</span>
          <Tooltip
            v2
            trigger={<Icon type="d-help" size="small" className="text-[#BBB]" />}
            align="t"
            arrowPointToCenter
            popupStyle={{ backgroundColor: '#333' }}
            popupClassName="products-business-tooltips"
          >
            指您的海外分销交易额在主营类目所有商家中的排名
          </Tooltip>
        </div>
      }
      onClose={onClose}
      visible={visible}
      footerAlign="center"
      footer={
        <div className="flex items-center justify-center mt-[14px] mb-[7px]">
          <div className="w-[12px] h-[12px] bg-[#0077FF] mr-[4px] rounded-[2px]" />
          <div className="text-[#666] text-[12px] leading-[14px]">排名</div>
        </div>
      }
      width={800}
      noPadding
    >
      {props?.cateLv1 ? (
        <div className="text-[#666] text-[14px] leading-[14px] ml-[20px] mt-[4px]">当前在{props?.cateLv1}类目排名</div>
      ) : (
        <div>店铺有主营类目后可统计海外分销排名</div>
      ) }
      <div
        ref={containerRef}
        style={{ width: '100%', height: '434px' }} // 显式高度确保图表渲染
      />
    </Dialog>
  );
}

DialogGmv.open = (props) => {
  ReactDOM.render(<DialogGmv props={props} />, container);
};

export default DialogGmv;

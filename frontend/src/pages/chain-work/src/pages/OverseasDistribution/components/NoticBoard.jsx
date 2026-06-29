import React, { useRef, useEffect } from 'react';
import { Chart } from '@antv/g2';
import DialogGmv from './DialogGMV';

function NoticBoard({ gmvData = {} }) {
  const { ranking = [] } = gmvData;
  const containerRef = useRef(null); // 使用 ref 获取容器元素
  const min = ranking[0]?.bizdate;
  const max = ranking[ranking.length - 1]?.bizdate;
  useEffect(() => {
    if (!containerRef.current) return;
    // 在组件挂载后初始化图表
    const chart = new Chart({
      container: containerRef.current, // 直接指向 ref.current
      autoFit: true,
      height: 80, // 显式设置高度，避免布局问题
      marginBottom: 0,
      marginTop: 14,
      marginLeft: 20,
      marginRight: 20,
    });
    chart.data(ranking);
    // 配置面积图
    // chart
    //   .area()
    //   .encode('x', 'bizdate') // 使用字段名称而非箭头函数
    //   .encode('y', 'performance')
    //   .encode('shape', 'smooth')
    //   .scale('y', {
    //     domain: [0, 400],
    //   })
    //   .style({
    //     opacity: 0.2,
    //     fill: 'linear-gradient(90deg, rgba(0, 119, 255, 0.64) 0%, rgba(95, 147, 241, 0) 100%)', // 直接设置颜色（可替换为渐变）
    //   });
    // 配置折线
    chart
      .line()
      .encode('x', 'bizdate')
      .encode('y', 'performance')
      .encode('shape', 'smooth')
      .scale('y', {
        // domain: [0, 400],
        range: [0, 1],
      })
      .interaction('tooltip', false);
    chart.axis('y', false);
    chart.axis('x', false);
    // chart.axis('x', {
    //   title: false,
    //   tick: false,
    //   labelTransform: 'rotate(0)',
    //   tickMethod: () => {
    //     const min = ranking[0]?.bizdate;
    //     const max = ranking[ranking.length - 1]?.bizdate;
    //     return [min, max];
    //   },
    // });
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
  }, [ranking]); // 依赖数组包含 data，数据变化时重新渲染图表

  return (
    <div className="py-[20px] bg-[#fff] rounded-[6px] h-[196px] mb-[12px] cursor-pointer" onClick={() => DialogGmv.open(gmvData)}>
      <div className="text-[#333] text-[16px] font-medium leading-[19px] ml-[20px] flex items-center">
        <span>海外分销GMV排名</span>
        <img className="ml-[4px] w-[16px] h-[16px]" src="https://img.alicdn.com/imgextra/i1/O1CN015QDDef1fK6AxYuhEp_!!6000000003987-2-tps-32-32.png" alt="" srcSet="" />
      </div>
      <div className="flex items-end justify-between text-[#999] text-[14px] leading-[17px] ml-[20px] mr-[20px] mb-[14px]">
        {gmvData?.cateLv1 ? <div className={`${ranking[ranking?.length - 1]?.performance ? '' : 'mt-[8px]'}`}>当前在{gmvData?.cateLv1}类目中排名：</div> : <div className="mt-[8px]">店铺有主营类目后可统计海外分销排名</div>}
        {ranking[ranking?.length - 1]?.performance && (
          <div>
            <span className="text-[#333] text-[28px] font-bold leading-[28px]">{ranking[ranking?.length - 1]?.performance}</span>
            <span>名</span>
          </div>
        )}
      </div>
      <div
        ref={containerRef}
        className="w-full h-[83px]" // 显式高度确保图表渲染
      />
      <div className="text-[12px] text-[#999] leading-[14px] flex justify-between items-center ml-[20px] mr-[20px]">
        <div>{min}</div>
        <div>{max}</div>
      </div>
    </div>
  );
}

export default NoticBoard;

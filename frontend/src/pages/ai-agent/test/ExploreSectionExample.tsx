import React from 'react';
import ExploreSection from '@/pages/mobile-agent-home/components/ExploreSection';

/**
 * ExploreSection 组件示例
 * 
 * 功能说明：
 * - 探索精选案例的标题组件
 * - 包含左右装饰线和中间标题文字
 * - 适用于移动端页面
 */
const ExploreSectionExample: React.FC = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <ExploreSection id="explore-section-demo" />
    </div>
  );
};

export default ExploreSectionExample;


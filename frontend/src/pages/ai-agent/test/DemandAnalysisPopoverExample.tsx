import React from 'react';
import DemandAnalysisPopover from '../src/pages/select-product/select-business/components/ProductSearchTable/DemandAnalysisPopover';
import { ConfigProvider, Popover, Button } from 'antd';
import theme from '../src/theme/default.json';

/**
 * DemandAnalysisPopover 组件使用示例
 * 展示了需求分析 Popover 的效果
 */
const DemandAnalysisPopoverExample: React.FC = () => {
  return (
    <ConfigProvider theme={theme}>
      <div style={{ padding: '100px', display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
        <Popover
          content={<DemandAnalysisPopover />}
          trigger="hover"
          placement="bottomLeft"
        >
          <Button type="primary">
            鼠标悬停查看需求分析详情
          </Button>
        </Popover>
      </div>
    </ConfigProvider>
  );
};

export default DemandAnalysisPopoverExample;


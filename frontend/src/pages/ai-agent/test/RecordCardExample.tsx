import React from 'react';
import RecordCard from '../src/pages/inquiry/components/inquiry-progress/components/RecordCard';
import { ConfigProvider } from 'antd';
import theme from '../src/theme/default.json';

/**
 * RecordCard 组件使用示例
 * 展示了一个询盘记录卡片，包含聊天记录和AI总结
 * 鼠标悬停在右下角的进度区域会显示询盘进展的 Popover
 */
const RecordCardExample: React.FC = () => {
  return (
    <ConfigProvider theme={theme}>
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        {/* <RecordCard /> */}
      </div>
    </ConfigProvider>
  );
};

export default RecordCardExample;


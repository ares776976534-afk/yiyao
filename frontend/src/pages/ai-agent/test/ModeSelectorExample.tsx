/**
 * 模式选择器组件 - 使用示例
 */

import React, { useState } from 'react';
import ModeSelector from '../src/pages/select-business/components/ModeSelector';
import { EnumSearchMode } from '../src/pages/select-business/enum';

const ModeSelectorExample: React.FC = () => {
  const [mode, setMode] = useState<EnumSearchMode>(EnumSearchMode.SMART);

  const handleModeChange = (newMode: EnumSearchMode) => {
    console.log('模式切换为:', newMode);
    setMode(newMode);
  };

  const getModeText = (modeValue: EnumSearchMode): string => {
    const modeMap = {
      [EnumSearchMode.SMART]: '智能模式',
      [EnumSearchMode.PRODUCT_TO_SUPPLIER]: '以品找商',
      [EnumSearchMode.DIRECT_SUPPLIER]: '直搜商家',
    };
    return modeMap[modeValue];
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>模式选择器示例</h1>

      {/* 基础使用 */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>基础使用（非受控）</h2>
        <ModeSelector />
      </div>

      {/* 受控模式 */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>受控模式</h2>
        <ModeSelector value={mode} onChange={handleModeChange} />
        <div style={{ marginTop: '16px', color: '#666' }}>
          当前选中的模式: <strong>{getModeText(mode)}</strong>
        </div>
      </div>

      {/* 禁用状态 */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>禁用状态</h2>
        <ModeSelector disabled />
      </div>

      {/* 多个实例 */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>多个实例</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <ModeSelector value={EnumSearchMode.SMART} />
          <ModeSelector value={EnumSearchMode.PRODUCT_TO_SUPPLIER} />
          <ModeSelector value={EnumSearchMode.DIRECT_SUPPLIER} />
        </div>
      </div>
    </div>
  );
};

export default ModeSelectorExample;


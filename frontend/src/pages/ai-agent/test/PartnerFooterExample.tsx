import React from 'react';
import PartnerFooter from '@/pages/mobile-agent-home/components/PartnerFooter';

/**
 * PartnerFooter 组件示例
 * 
 * 这是一个合作伙伴页脚组件，包含：
 * 1. 合作伙伴 logo 展示区域
 * 2. 法律信息区域（浙公网安备、备案号等）
 * 
 * 使用方式：
 * <PartnerFooter id="partner-footer" />
 */
const PartnerFooterExample: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <PartnerFooter id='partner-footer-example' />
    </div>
  );
};

export default PartnerFooterExample;


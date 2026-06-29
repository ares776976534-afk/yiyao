import React from 'react';
import InquiryReport from '../src/pages/mobile-inquiry/components/InquiryReport';
import Title from '../src/pages/mobile-inquiry/components/Title';
import case1 from '../src/pages/mobile-inquiry/usercase/case1';

const InquiryReportExample: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', maxWidth: '375px', margin: '0 auto' }}>
      <Title title="询盘报告" />
      <div style={{ marginTop: '20px' }}>
        <InquiryReport data={case1} />
      </div>
    </div>
  );
};

export default InquiryReportExample;


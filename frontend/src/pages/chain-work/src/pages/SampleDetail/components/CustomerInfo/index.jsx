import React from 'react';
import { Grid } from '@alifd/next';
import SampleBasicLayout from '@/layouts/SampleBasicLayout';

import './index.scss';

const { Row, Col } = Grid;

function CustomerInfo(props) {
  const { clientName = '速卖通平台' } = props;
  return (
    <SampleBasicLayout className="customer-info-container">
      <div className="title">客户信息</div>
      <Row className="customer-content">
        <Col span="8" className="customer-content-item">
          <span>客户名称：</span>
          <span className="customer-content-bold">{clientName}</span>
        </Col>
        {/* <Col span="8" className="customer-content-item">
          <span>1688年采购额：</span>
          <span className="customer-content-bold">300万</span>
        </Col>
        <Col span="8" className="customer-content-item">
          <span>验样成功下单率：</span>
          <span className="customer-content-bold">95%</span>
        </Col> */}
      </Row>
    </SampleBasicLayout>
  );
}

export default CustomerInfo;

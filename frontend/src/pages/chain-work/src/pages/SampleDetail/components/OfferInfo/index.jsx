import React from 'react';
import { Grid } from '@alifd/next';
import SampleBasicLayout from '@/layouts/SampleBasicLayout';
import { DEFAULTCHAR } from '@/constant';
import './index.scss';

const { Row, Col } = Grid;

function OfferInfo(props) {
  const { offerId } = props.sampleInfo || {};
  const { title, skuId, skuName, mainPic } = props.offerInfo || {};
  return (
    <SampleBasicLayout className="offer-info-container">
      <div className="title">商品信息</div>
      <Row className="offer-content">
        <Col span="16" className="offer-content-item">
          <img src={mainPic} />
          <div className="offer-name-id">
            <div className="offer-name" title={title}>{title || DEFAULTCHAR}</div>
            <div className="offer-id">商品ID：{offerId || DEFAULTCHAR}</div>
          </div>
        </Col>
        <Col span="8" className="offer-content-item">
          <div className="offer-spec">
            <div className="offer-spec-item">
              <span>规格：</span>
              <span className="offer-spec-bold">{skuName || DEFAULTCHAR}</span>
            </div>
            <div className="offer-spec-item">
              <span>规格ID：</span>
              <span className="offer-spec-bold">{skuId || DEFAULTCHAR}</span>
            </div>
          </div>
        </Col>
      </Row>
    </SampleBasicLayout>
  );
}

export default OfferInfo;

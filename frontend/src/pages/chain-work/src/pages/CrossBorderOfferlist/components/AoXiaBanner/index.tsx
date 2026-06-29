import React from 'react';
import './index.scss';

export default function AoXiaBanner() {
  return (
    <div
      className="banner-container"
      onClick={() => {
        window.open('https://www.alphashop.cn?amug_biz=growth&amug_fl_src=aoxia_cuscross', '_blank');
      }}
    >
      <div className="content-container">
        <div className="main-content">
          <img className="logo-image" src="https://img.alicdn.com/imgextra/i4/O1CN01ZL9bW025S36cwxacx_!!6000000007524-2-tps-158-46.png" alt="" srcSet="" />
          <div className="separator-line" />
          <div className="content-group">
            <div className="gradient-text">爆品 · 改款</div>
            <div className="normal-text">洞察下游市场需求</div>
          </div>
          <div className="separator-line" />
          <div className="content-group">
            <div className="gradient-text">做图 · 改图</div>
            <div className="normal-text">商品素材全搞定</div>
          </div>
        </div>
        <div className="cta-button">
          <div className="cta-text">
            立即免费体验
          </div>
          <img className="cta-icon" src="https://img.alicdn.com/imgextra/i4/O1CN019CuAQC1SXIdCah5Jc_!!6000000002256-2-tps-27-27.png" alt="" srcSet="" />
        </div>
      </div>
    </div>
  );
}
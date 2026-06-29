import React from 'react';

function ShippingInfo({ sendAddress, publishLink }) {
  return (
    <div className="shipping-info-container">
      <div className="shipping-info-title">发货信息</div>
      <div className="shipping-info-content">
        <div className="shipping-info-item">
          <span>上门揽发货地址：</span>
          <span>
            {sendAddress && (
              <span className="address-info">
                {sendAddress?.province} {sendAddress?.city} {sendAddress?.area} {sendAddress?.address}
              </span>
            )}
            <span className="change-address">
              <span onClick={() => window.open(publishLink)}>去修改</span>
              <img src="https://img.alicdn.com/imgextra/i2/O1CN01HizpNy1uj1sQysrOM_!!6000000006072-2-tps-16-24.png" />
            </span>
          </span>
        </div>
        <div className="shipping-info-item">
          <span>承诺可发货时间：</span>
          <span>补货单下发48h内</span>
        </div>
      </div>
    </div>
  );
}

export default ShippingInfo;

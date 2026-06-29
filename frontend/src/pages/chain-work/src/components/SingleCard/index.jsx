import React, { useState } from 'react';
import './index.scss';
import { Button, Balloon, Message } from '@alifd/next';
import { CountDown } from './components/CountDown';

export default ({
  item,
  index,
  onClickCard,
  DesSlot,
  labelMap = { itemId: 'itemId', itemName: 'itemName', img_url: 'img_url', itemStatus: 'status', endTime: 'endTime' },
  expLogger = '',
  showMap = { subTitle: { label: 'ID:', valueKey: labelMap.itemId }, btn: { label: '去提报' } },
}) => {
  const [isEnded, setIsEnded] = useState([]);

  const { keyId, itemId, itemName, img_url, itemStatus, endTime } = labelMap;

  const hasImage = !!item?.[img_url]; // 是否有图片
  return (
    <div
      className="products-card-content"
      key={item?.[keyId]}
      data-report-primary-key={item?.[itemId]}
      data-report-attribute-exp={expLogger}
    >
      <div className="products-card-top">
        {hasImage && (
          <a
            href={`https://detail.1688.com/offer/${item?.[itemId]}.html`}
            target="_blank"
            rel="noreferrer"
            style={{ cursor: 'pointer' }}
          >
            <div className="products-card-top-left">
              <img src={item?.[img_url]} alt="img_url" className="products-card-img" />
            </div>
          </a>
        )}
        <div className="products-card-top-right">
          <div className="products-card-center-title">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {item?.[itemName]?.length < 32 ? (
                <div className="products-card-title">
                  <span className="products-card-text"> {item?.[itemName]}</span>
                </div>
              ) : (
                <Balloon.Tooltip
                  trigger={
                    <div className="products-card-title">
                      <span className="products-card-text"> {`${item?.[itemName]?.slice(0, 32)}...`}</span>
                    </div>
                  }
                  align="t"
                  popupStyle={{ backgroundColor: '#333' }}
                  popupClassName="products-business-tooltips"
                >
                  {item?.[itemName]}
                </Balloon.Tooltip>
              )}
              <div className="products-card-describe-content">
                {/* <div className="products-card-describe-id">ID：</div>
                <div style={{ color: '#999' }}>{item?.[itemId]}</div> */}
                <div className="products-card-describe-id">{showMap.subTitle.label}</div>
                <div style={{ color: '#999' }}>{item?.[showMap.subTitle.valueKey] || '-'}</div>
              </div>
            </div>

            <div className="products-card-describe-content">
              {/* <div className="products-card-describe" style={{color: '#333'}}>结算价:</div>
                    <div style={{color: '#FF7300'}}>{item?.quotePrice} × 成本价</div> */}
              <DesSlot item={item} />
            </div>
          </div>
          <div className="flex flex-col justify-between h-full items-end">
            <CountDown
              endTime={item?.[endTime] / 1000}
              countDownEnd={() => {
                setIsEnded((isEndArray) => {
                  isEndArray[index] = true;
                  return Object.assign([], isEndArray);
                });
              }}
            />
            <Button
              type="primary"
              disabled={isEnded[index]}
              onClick={() => {
                // setBiddingEditData(item);
                onClickCard(item);
              }}
              className="products-card-submit"
            >
              {showMap.btn.label || '去提报'}
            </Button>
          </div>
        </div>
      </div>
      {/* <div className="products-card-dashed" /> */}
      {/* <div className="products-card-bottom">
              <div style={{ display: 'flex' }}>
                <div className="products-card-describe-title">
                  <div className="products-card-describe-bottom">预计采购量：</div>
                  <div className="products-business-describe-div">{item?.target_product_counts}</div>
                </div>
                <div className="products-card-describe-title">
                  <div className="products-card-describe-bottom">竞价不高于：</div>
                  <div className="products-business-describe-div">
                    ¥{item?.goal_price ? (item?.goal_price / 100).toFixed(2) : ''}
                  </div>
                </div>
                <div className="products-card-describe-title">
                  <div className="products-card-describe-bottom">
                    平台发货
                    <span className="products-card-line" />
                    平台上门揽
                  </div>
                </div>
              </div>
              <div>
              </div>
            </div> */}
    </div>
  );
};

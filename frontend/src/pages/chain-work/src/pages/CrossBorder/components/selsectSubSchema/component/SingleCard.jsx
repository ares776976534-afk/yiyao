import React from 'react';
import { formatNumberRange } from '@/pages/Select/utlis';
import { Button, Balloon } from '@alifd/next';

function DesSlotRender({
  label,
  value,
}) {
  return (
    <div className="flex items-center space-x-[2px]">
      <p className="text-[#999999] text-[14px] leading-[17px] mr-[2px]">
        {label}
      </p>
      <p className="text-[#333333] text-[14px] leading-[17px]">
        {value}
      </p>
    </div>
  );
}
function SingleCard({ item, onClickButton, subText, style }) {
  const hasImage = !!item?.imgUrl; // 是否有图片
  return (
    <div
      className="flex h-[108px] space-x-[24px] p-[12px] rounded-[6px] bg-[#fff] mb-[12px]"
      key={item?.itemId}
      data-report-primary-key={item?.itemId}
      // data-report-attribute-exp={'1商机曝光@funnel_提报商机'}
      style={{ border: '1px solid rgba(229, 229, 229, 0.6)' }}
    >
      <div className="flex space-x-[8px] w-[366px] h-[84px]">
        <div className="flex flex-row space-x-[8px] items-start">
          {hasImage && (
            <a
              href={`https://detail.1688.com/offer/${item?.itemId}.html`}
              target="_blank"
              rel="noreferrer"
              style={{ cursor: 'pointer' }}
            >
              <img src={item?.imgUrl} alt="img_url" className="w-[80px] h-[80px] rounded-[6px]" />
            </a>
          )}
          <div className="flex flex-col space-y-[6px] w-[278px] h-[84px]">
            <p className="text-[#333333] text-[14px] leading-[17px] truncate w-[278px] -mb-[4px]">
              {item?.itemName}
            </p>
            <p className="text-[#BBBBBB] text-[14px] leading-[17px]">
              ID：{item?.itemId}
            </p>
            <DesSlotRender label="价格:" value={`¥${formatNumberRange(item?.price)}`} />
            <DesSlotRender label="库存:" value={item?.quantity} />
          </div>
        </div>
      </div>
      <div className="flex flex-row items-end space-y-[12px] w-[50px] h-[84px]">
        <Balloon
          v2
          trigger={
            <div>
              <Button
                type="primary"
                style={{ ...style, width: '48px', height: 24, padding: 0 }}
                onClick={() => onClickButton()}
                disabled={item?.disabled}
              >
                <span>{subText}</span>
              </Button>
            </div>
          }
          align="t"
          triggerType={(subText === '提报' && item?.disabled) ? 'hover' : ''}
          closable={false}
          className="bg-[#333] text-[#FFF] text-[14px] p-[12px] w-[201px]"
          popupClassName="products-business-tooltips"
          offset={[0, 18]}
        >
          {`商品提报数已达上限（${item?.toSubmitItemNumber}个）`}
        </Balloon>
      </div>
    </div>
  );
}

export default SingleCard;

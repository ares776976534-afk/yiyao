import '../index.scss';
import React, { useState, useEffect } from 'react';
import { Balloon } from '@alifd/next';

const Tooltip = Balloon.Tooltip;

export const NewCountCard = ({ data, onSameClick, onDeliverClick }) => {
  const { oppId, imageUrl, title, extraInfo, price, matchItemCnt, oppType, priceLabel, priceTips } = data;
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    try {
      const arr = JSON.parse(extraInfo);
      const obj = arr.find((item) => item.isHomeDisplay === true);
      setLabel(obj.label);
      setValue(obj.value);
    } catch (error) {
      console.log(error);
    }
  }, [extraInfo]);

  return (
    <div className="card" >
      <div className="w-[180px] h-[180px] rounded-[4px] overflow-hidden flex items-center justify-center bg-[#fff]">
        <img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      <Balloon
        trigger={<p className="title">{title}</p>}
        closable={false}
        triggerType="hover"
        align="t"
      >
        {title}
      </Balloon>
      <div className="info" style={{ marginTop: 2, marginBottom: 2 }}>
        {priceTips ? (
          <Balloon.Tooltip
            trigger={<div className="text-[#333]"><span>{priceLabel} </span>¥ {price}</div>}
            align="t"
            popupStyle={{ backgroundColor: '#333' }}
            popupClassName="products-business-tooltips"
          >
            {priceTips}
          </Balloon.Tooltip>
        ) : (
          <div className="text-[#333]">
            <span>{priceLabel} </span>
            ¥ {price}
          </div>
        )}
        <span className="text-[12px] text-[#666666]">{oppType}</span>
      </div>

      <div className="info">
        <p >
          <span style={{ fontSize: '12px', color: '#666666' }}>站内同款</span>
          <span
            className={`font-medium text-[12px] cursor-pointer ml-[4px] ${matchItemCnt > 0 ? 'text-[#07f]' : 'text-[#ccc]'}`}
            onClick={onSameClick}
          >
            {matchItemCnt}
          </span>
        </p>

        <p>
          <span style={{ color: '#666666' }}>{label}</span>
          <span style={{ fontWeight: 500, marginLeft: 2 }}>{value}</span>
        </p>
      </div>

      <div
        className="btn"
        onClick={onDeliverClick}
      >
        发同款
      </div>
    </div>
  );
};

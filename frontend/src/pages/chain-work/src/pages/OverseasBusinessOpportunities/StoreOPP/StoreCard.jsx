import '../index.scss';
import React, { useState, useEffect } from 'react';
import { Checkbox, Balloon } from '@alifd/next';

export const StoreCard = ({ data, checked, onCheck, onEnroll }) => {
  const { imageUrl, title, extraInfo, price, itemId } = data;
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
    <div className="card" style={{ position: 'relative' }}>
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
      <Checkbox
        checked={checked}
        onChange={onCheck}
        style={{
          position: 'absolute',
          top: '14px',
          right: '16px',
          zIndex: 1,
        }}
      />
      <Balloon
        trigger={<p className="title">{title}</p>}
        closable={false}
        triggerType="hover"
        align="t"
      >
        {title}
      </Balloon>
      <p className="price">¥{price}</p>

      <div className="info">
        <p className="id-text">ID:{itemId}</p>

        <p>
          <span style={{ color: '#666666' }}>{label}</span>
          <span style={{ fontWeight: 500, marginLeft: 2 }}>{value}</span>
        </p>
      </div>

      <div
        className="btn"
        onClick={onEnroll}
      >
        报名
      </div>
    </div>
  );
};

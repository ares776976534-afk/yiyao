import React from 'react';

export const ItemCard = ({ data }) => {
  const {
    imageUrl, title, price, shopName } = data;

  return (
    <div style={{
      width: 268,
      height: 84,
      padding: 12,
      gap: 8,
      borderRadius: 6,
      background: '#FFFFFF',
      boxSizing: 'border-box',
      border: '1px solid rgba(229, 229, 229, 0.6)',
      display: 'flex',
    }}
    >
      <img
        style={{ width: 60, height: 60, borderRadius: 6 }}
        src={imageUrl}
        alt="item"
      />

      <div style={{
        fontSize: 12,
        color: '#333',
        minWidth: 0,
        flex: 1,
      }}
      >
        <p style={{
          fontSize: 13,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '180px',
        }}
        >
          {title}
        </p>
        <p style={{ color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={shopName}>
          店铺：{shopName}
        </p>
        <p>
          ¥{price}
        </p>
        <div />
      </div>
    </div>);
};

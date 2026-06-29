import React, { useState, useEffect } from 'react';
import { Table, Pagination } from '@alifd/next';
import './index.scss';
import TableSearch from './TableSearch';

const NotJoinedOfferTable = () => {
  const [list, setList] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    getData();
  }, [pageNo]);
  const getData = () => {
    const _result = [
      {
        imgUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01jI2mGd1HYhruB6796_!!6000000000770-2-tps-194-200.png',
        name: '亚马逊-雅马哈-卡马亚马逊-雅马哈-卡马亚马逊-雅马哈-卡马亚马逊-雅马哈-卡马亚马逊-雅马哈-卡马亚马逊-雅马哈-卡马',
        id: '65873978739',
        price: '¥46.8',
        offerId: '613518282073',
      },
    ];
    setList(_result);
    setTotal(999);
  };


  const toDetail = (targetUrl) => {
    if (targetUrl) {
      window.open(targetUrl);
    }
  };
  const onPaginationChange = (v) => {
    setPageNo(v);
  };
  const baseInfoCell = (v, i, record) => {
    const { imgUrl, name, id, price, offerId } = record;
    const od = `https://detail.1688.com/offer/${offerId}.html`;
    return (
      <div className="baseInfo-cell" onClick={() => toDetail(od)}>
        <img src={imgUrl} />
        <div className="offer-info">
          <div className="info-item">
            <span className="label">商品名称</span>
            <span className="value name">{name}</span>
          </div>
          <div className="info-item">
            <span className="label">商品编号</span>
            <span className="value">{id}</span>
          </div>
          <div className="info-item">
            <span className="label">商品价格</span>
            <span className="value">{price}</span>
          </div>
        </div>
      </div>
    );
  };

  const actionCell = (v, i, record) => {
    const { offerId } = record;
    const URL = `https://detail.1688.com/offer/${offerId}.html`;
    return <a href={URL} target="_blank" rel="noreferrer">编辑商品</a>;
  };

  const columnConfigs = [
    {
      title: '商品信息',
      align: 'left',
      cell: baseInfoCell,
    },
    {
      title: '操作',
      align: 'center',
      cell: actionCell,
    },
  ];
  const searchOnChange = (value) => {
    console.log(value);
  };
  return (
    <div className="joined-offer-table">
      <div className="table-top">
        <div className="title">商品列表</div>
        <div className="filter"> <TableSearch searchOnChange={searchOnChange} /></div>
      </div>
      <Table dataSource={list} hasBorder={false} primaryKey="id" columns={columnConfigs} />
      <div className="pagination-content">
        <Pagination
          pageSizeSelector="dropdown"
          defaultCurrent={1}
          current={pageNo}
          onChange={onPaginationChange}
          total={total}
          pageSize={10}
        />
      </div>
    </div>
  );
};


export default NotJoinedOfferTable;

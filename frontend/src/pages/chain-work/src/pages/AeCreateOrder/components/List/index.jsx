import React, { useState } from 'react';
import { Table, Form, Field, NumberPicker, Button, Message, Dialog } from '@alifd/next';
import Clipboard from '@/components/ClipBoard';
import { IconCopy } from '@/components/Icons';
import './index.scss';

export default (props) => {
  const { createdStatus, list, mode } = props;
  const unCreated = createdStatus === null;

  const orderNoRender = (value) => {
    return (
      <div className="orderNo-container">
        {value}
        <span className="copy">
          <Clipboard text={value}>
            <IconCopy />
          </Clipboard>
        </span>
      </div>
    );
  };

  const opearationRender = (_, index, data) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {
          mode === 'merge' && list.length >= 3 &&
          <span
            style={{ color: '#07f', marginRight: 12, cursor: 'pointer' }}
            onClick={() => {
              Dialog.confirm({
                title: '您确认删除该订单吗？',
                onOk: () => props?.removeItem(data.id),
              });
            }}
          >
            删除
          </span>
        }
        <a href={`https://trade.1688.com/order/new_step_order_detail.htm?orderId=${data.id}`} target="_blank" rel="noreferrer">
          查看详情
        </a>
      </div>
    );
  };

  return (
    <div className="order-info-list">
      <Table
        dataSource={list}
        hasBorder={false}
        style={{
          border: '1px solid rgb(230, 231, 235)',
          borderBottom: 0,
        }}
      >
        <Table.Column title="订单编号" dataIndex="id" cell={orderNoRender} />
        <Table.Column title="操作" align="center" cell={opearationRender} />
      </Table>
    </div>
  );
};

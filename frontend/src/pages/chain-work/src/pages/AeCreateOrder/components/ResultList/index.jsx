import React, { useState } from 'react';
import { Table, Message } from '@alifd/next';
import Clipboard from '@/components/ClipBoard';
import { IconCopy } from '@/components/Icons';
import { cancelPickUpOrder } from '../../api';
import './index.scss';

export default (props) => {
  const { list } = props;
  const [closedList, setClosedList] = useState([]);

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

  const closeOrder = (orderId) => {
    Message.loading('关单中');
    cancelPickUpOrder({ orderId }).then((res) => {
      Message.hide();

      if (res?.content?.success) {
        setClosedList([...closedList, orderId]);
        Message.success('关单成功');
      } else {
        Message.error(res?.data?.msg || '关单失败');
      }
    }).catch((e) => {
      Message.hide();
      Message.error(e?.data?.msg || '网络错误，请点击重试');
    });
  };

  const opearationRender = (isSuccess, index, info) => {
    if (!isSuccess) {
      const { orderId } = info;
      if (closedList.includes(orderId)) {
        return (
          <span style={{ color: '#999', cursor: 'pointer' }}>
            已关单
          </span>
        );
      }

      return (
        <span
          onClick={() => {
            closeOrder(info.orderId);
          }}
          style={{ color: '#0077FF', cursor: 'pointer' }}
        >
          发起关单
        </span>
      );
    }

    return (
      <span
        onClick={() => {
          props.printWayBill(info.pickUpOrderNo);
        }}
        style={{ color: '#0077FF', cursor: 'pointer' }}
      >
        打印揽收单
      </span>
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
        <Table.Column title="订单编号" dataIndex="orderId" cell={orderNoRender} />
        <Table.Column
          title="创建状态"
          dataIndex="success"
          cell={(data) => {
            return `${data}` === 'true' ? <span style={{ color: '#333' }}>创建成功</span> : <span style={{ color: '#FF0000' }}>创建失败</span>;
          }}
        />
        <Table.Column title="操作" dataIndex="success" align="center" cell={opearationRender} />
      </Table>
    </div>
  );
};

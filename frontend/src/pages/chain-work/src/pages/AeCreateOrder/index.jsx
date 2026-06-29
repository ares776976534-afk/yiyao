import React, { useState, useEffect } from 'react';
// import { Loading, Message } from '@alifd/next';
// import localforage from 'localforage';
import queryString from 'query-string';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import AddressInfo from './components/AddressInfo';
import OrderInfo from './components/OrderInfo';
import CreatedComplete from './components/CreatedComplete';
import { getSendAndReceiveInfo, querySendGoodsAddressList } from './api';
import './index.scss';
import { getQueryParams } from '@/utlis';

const query = queryString.parse(window.location.search);
// batch 批量（包含单个）
// merge 合并
const { type = 'batch' } = query;

const AeCreateOrder = () => {
  const [createdStatus, setCreatedStatus] = useState('create'); // create result
  const [title, setTitle] = useState(type === 'merge' ? '合并创建揽收单' : ''); // create result
  const [result, setResult] = useState({});
  const [orderList, setOrderList] = useState([]);
  const [addressList, setAddressList] = useState([]);
  const [address, setAddress] = useState({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const list = getQueryParams('id').split(',') || [];
    setOrderList(list?.map((ele) => ({ id: ele })));
    if (getQueryParams('type') === 'batch') {
      if (list.length > 1) {
        document.title = '批量创建揽收单';
      } else {
        document.title = '创建揽收单';
      }

      setTitle(document.title);
    }
    // const data = await localforage.getItem(`aroder_${query.id}`);
    // const list = data?.list || [];

    // setOrderList(list);

    // if (type === 'batch') {
    //   if (list.length > 1) {
    //     document.title = '批量创建揽收单';
    //   } else {
    //     document.title = '创建揽收单';
    //   }

    //   setTitle(document.title);
    // }

    getSendAndReceiveInfo({
      orderId: list[0],
    }).then((res) => {
      const _data = res?.content?.data || {};

      setAddress(_data);
    });
    querySendGoodsAddressList().then((res) => {
      const _data = res?.content?.model || [];
      setAddressList(_data);
    });
  }, []);

  const mode = (() => {
    if (type === 'merge') {
      return type;
    }

    if (orderList.length > 1) {
      return 'batch';
    }

    return 'single';
  })();

  const removeItem = (id) => {
    const newList = orderList.filter((item) => item.id !== id);
    setOrderList(newList);
  };
  const onChange = (sendInfo) => {
    setAddress({
      ...address,
      sendInfo,
    });
  };
  return (
    <div className="ae-order-create-container">
      <nav id="nav" />
      {
        createdStatus === 'create' && (
          <NewWorkLayout
            title={title}
            width="1152px"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <AddressInfo address={address} onChange={onChange} addressList={addressList} />
            <OrderInfo mode={mode} setCreatedStatus={setCreatedStatus} setResult={setResult} list={orderList} removeItem={removeItem} addressId={address?.sendInfo?.addressId} />
          </NewWorkLayout>
        )
      }
      {
        createdStatus === 'result' && (
          <NewWorkLayout
            width="1152px"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <CreatedComplete mode={mode} createdStatus={createdStatus} result={result} />
          </NewWorkLayout>
        )
      }
    </div>
  );
};

const appendScript = (src, cb) => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  script.onload = () => {
    cb && cb();
  };
  document.body.appendChild(script);
};

appendScript('https://g.alicdn.com/odt/web-based/2.3.2/??fmd.js,legacy.js', () => {
  appendScript('https://g.alicdn.com/tf/merchant-skin/index.js');
});

export default AeCreateOrder;

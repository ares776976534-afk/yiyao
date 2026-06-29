import React from 'react';
import localforage from 'localforage';
import { Message } from '@alifd/next';
import { checkSendInfo, checkSendAndReceiveInfo } from './api';
import { querySignAgreement } from '@/pages/CrossBorderOfferlist/api';
import AeManufacturerDialog from './components/AeManufacturerDialog';
import logger from '@alife/channel-uni-event-logger';

// 清楚过期的缓存数据
(() => {
  const now = new Date().getTime();
  localforage.iterate((value, key, iterationNumber) => {
    // Resulting key/value pair -- this callback
    // will be executed for every item in the
    // database.
    if (key.indexOf('aroder_') > -1) {
      const t = value.t;
      if (!t) {
        // 脏数据
        localforage.removeItem(key);
      }
      if (now - t > 86400 * 1000) {
        localforage.removeItem(key);
      }
    }
  });
})();
// 从列表中提取主子订单id
export const getOrderIdList = (list) => {
  return list.reduce((arr, item) => {
    const orderEntries = item.orderEntries || [{
      entryId: item.id,
    }];

    orderEntries.forEach((entry) => {
      arr.push({ orderId: item.id, orderEntryId: entry.entryId });
    });
    return arr;
  }, []);
};
// export const genRandomId = (length) => {
//   let result = '';
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   const charactersLength = characters.length;
//   let counter = 0;
//   while (counter < length) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     counter += 1;
//   }
//   return result;
// };
export const gotoCreateOrder = (list, type = 'batch') => {
  const id = list?.map((ele) => ele.id).join(',');
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('id', id);
  currentUrl.searchParams.set('type', type);
  const { origin, search } = currentUrl;
  window.open(`${origin}/app/channel-fe/chain-work/aecreateorder.html${search}`, '_blank');
  // const randomId = genRandomId(10);
  // localforage.setItem(`aroder_${randomId}`, {
  //   list,
  //   t: new Date().getTime(),
  // }).then(res => {
  //   let qs = `id=${randomId}&type=${type}`;
  //   if (search?.indexOf('__mtop_subdomain__=wapa') > -1) {
  //     qs += '&__mtop_subdomain__=wapa';
  //   }
  //   window.open(`//${location.hostname}/app/channel-fe/chain-work/aecreateorder.html?${qs}`);
  // });
};
function oldLink(list) {
  const formData = {
    orderParam: JSON.stringify(list),
    source: 'TRADE',
    isCod: false,
  };
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://x56.1688.com/order/announce_consign.htm';
  form.target = '_blank';
  form.style.display = 'none';
  document.body.appendChild(form);
  Object.keys(formData).forEach((k) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = formData[k];
    form.appendChild(input);
  });
  form.submit();
  setTimeout(() => {
    form.remove();
  }, 500);
}
function newLink(list) {
  if (list.length === 1) {
    gotoCreateOrder(list);
  } else {
    // 校验收获和发货地址
    checkSendInfo(list).then((res) => {
      if (!res?.success || !res?.content?.data) {
        Message.error({
          title: '批量创建揽收单失败',
          content: '所选订单的商品发货地址不同，无法批量创建揽收单。',
        });
        return Promise.reject();
      }
      gotoCreateOrder(list);
    });
  }
}
// 订单列表操作按钮
export const orderTableactionMap = {
  createWayBill: {
    text: '创建揽收单',
    action(orderInfo, dom, record, isGrayBtn) {
      // 卡下是否签署AE协议
      AeManufacturerDialog.open({
        isCloseIcon: true,
        onOk: () => {
          orderTableactionMap?.createWayBillList?.action([record], isGrayBtn);
        } });
    },
  },
  createWayBillList: {
    text: '批量创建揽收单',
    action(list, isGrayBtn) {
      isGrayBtn ? newLink(list) : oldLink(getOrderIdList(list));
    },
  },
  createMergeWayBillList: {
    text: '合并创建揽收单',
    action(list) {
      checkSendAndReceiveInfo(list).then((res) => {
        if (!res?.success || !res?.content?.data) {
          Message.error({
            title: '合并创建揽收单失败',
            content: res?.content?.msg,
            duration: 5000,
          });
          return Promise.resolve();
        }
        gotoCreateOrder(list, 'merge');
      }).catch(e => {
        Message.error('网络错误，请刷新页面重试');
      });
    },
  },
  orderDetail: {
    text: '订单详情',
    action({ orderId }) {
      window.open(`https://trade.1688.com/order/new_step_order_detail.htm?orderId=${orderId}`);
    },
  },
  printWayBill: {
    text: '打印揽收单',
    action({ pickupOrderNumber, orderEntries }, printDialog) {
      printDialog.onOpen({
        type: 'printWayBill',
        pickupOrderNumber,
        orderEntries,
      });
    },
  },
  printMark: {
    text: '打印箱唛',
    action({ orderId, orderEntries }, printDialog) {
      printDialog.onOpen({
        type: 'printMark',
        orderId,
        orderEntries,
      });
    },
  },
  printLabel: {
    text: '打印货品标签',
    action({ orderId, orderEntries }, printDialog) {
      printDialog.onOpen({
        type: 'printLabel',
        orderId,
        orderEntries,
      });
    },
  },
  logisticsDetail: {
    text: '物流详情',
    action({ orderId }) {
      window.open(`https://trade.1688.com/order/new_step_order_detail.htm?orderId=${orderId}#logisticsTabTitle`);
    },
  },
  delivery: {
    text: '立即发货',
    action({ orderId, orderEntries }) {
      // const orderParam = orderEntries.map((item) => ({ orderId, entryId: item.entryId }))
      // window.open(
      //   `https://x56.1688.com/order/announce_consign.htm?orderParam=${encodeURIComponent(JSON.stringify(orderParam))}&source=TRADE&isCod=false`,
      // );
      // window.open(
      //   `https://trade.1688.com/order/trade_flow.htm?alipayAction=announce_send_goods&orderId=${orderId}&fromType=fromOrderList&tradeType=50060&userType=seller`,
      // );
      const form = document.createElement('form');
      form.method = 'post';
      form.action = 'https://x56.1688.com/order/announce_consign.htm';
      form.target = '_blank';
      const orderParam_input = document.createElement('input');
      orderParam_input.type = 'hidden';
      orderParam_input.name = 'orderParam';
      const _orderValue = orderEntries.map((s) => ({ orderId, orderEntryId: s.entryId }));
      orderParam_input.value = JSON.stringify(_orderValue);
      form.appendChild(orderParam_input);
      const source_input = document.createElement('input');
      source_input.type = 'hidden';
      source_input.name = 'source';
      source_input.value = 'TRADE';
      form.appendChild(source_input);
      const isCod_input = document.createElement('input');
      isCod_input.type = 'hidden';
      isCod_input.name = 'isCod';
      isCod_input.value = 'false';
      form.appendChild(isCod_input);
      document.body.appendChild(form);
      form.submit();
    },
  },
};

/* eslint-disable max-lines */
import React from 'react';
import { Dialog } from '@alifd/next';

let socket = null;

const getEvtData = (event) => {
  const { data } = event || {};
  const newData = JSON.parse(data) || {};
  return newData;
};

const getCmd = (event) => {
  const data = getEvtData(event);
  return data.cmd;
};

// 检查打印组件是否安装
const isEquipPrint = () => {
  return new Promise((resolve) => {
    if (window.webSocket && window.webSocket.readyState === WebSocket.OPEN) {
      resolve(true);
    } else {
      connect()
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    }
  });
};

// 刷新打印组件
export const refreshPrintDriver = () => {
  isEquipPrint()
    .then((isEquip) => {
      if (isEquip) {
        location.reload();
      }
    });
};

// 下载打印组件提示
export const downloadPrintDriver = () => {
  const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  const downloadUrl = isMac
    ? 'https://cainiao-oss-sh-read.oss-cn-shanghai.aliyuncs.com/waybill-print/cainiao-x-print/prod/macos/cainiao-x-print-mac-64.dmg'
    : 'https://cloudprint.cainiao.com/cloudprint/client/CNPrintSetup.exe';

  Dialog.warning({
    v2: true,
    title: '未检测到菜鸟打印组件',
    content: (
      <div>
        <p className="content">
          已安装菜鸟打印，请检查软件是否打开。
        </p>
        <p className="content">
          未安装菜鸟打印，<a href={downloadUrl} className="btn" download>前往安装</a>
        </p>
      </div>
    ),
  });
};

// 连接打印机
export const connect = () => {
  if (!socket) {
    return new Promise((resolve, reject) => {
      let timeoutId;

      // https 页面需使用 wss://13529，http 页面使用 ws://13528
      const wsUrl = location.protocol === 'https:' ? 'wss://localhost:13529' : 'ws://localhost:13528';
      window.webSocket = new WebSocket(wsUrl);
      socket = window.webSocket;

      const hanleOpen = () => {
        clearTimeout(timeoutId);
        resolve(socket);
      };

      const handleError = () => {
        clearTimeout(timeoutId);
        window.webSocket = null;
        socket = null;
        // 提示检查打印组件
        downloadPrintDriver();
        reject();
      };

      const handleClose = () => {
        clearTimeout(timeoutId);
        window.webSocket = null;
        socket = null;
        reject();
      };

      // 连接成功
      socket.addEventListener('open', hanleOpen);
      // 连接不上
      socket.addEventListener('error', handleError);
      // 连接断开
      socket.addEventListener('close', handleClose);

      /** 设置连接超时提示检查打印组件
       * mac系统几十毫秒内连接不上就会进入error，windows系统默认200多秒后才会连接超时
       */
      timeoutId = setTimeout(() => {
        // 移除 - 连接成功
        socket.removeEventListener('open', hanleOpen);
        // 移除 - 连接不上
        socket.removeEventListener('error', handleError);
        // 移除 - 连接断开
        socket.removeEventListener('close', handleClose);

        // 执行连接不上的方法
        handleError();
      }, 2000);
    });
  }

  return Promise.resolve(socket);
};

// 获取打印机列表
export const getPrintNameList = () => {
  return new Promise((resolve) => {
    const params = {
      cmd: 'getPrinters',
      requestID: `${new Date().getTime()}`,
      version: '1.0',
    };
    window.webSocket.send(JSON.stringify(params));

    const handle = (event) => {
      const newData = getEvtData(event);
      const cmd = getCmd(event);
      if (cmd === 'getPrinters') {
        if (newData.printers && newData.printers.length > 0) {
          const printNameList = newData.printers.map((item) => {
            return {
              value: item.name,
              label: item.name,
            };
          });
          resolve(printNameList);
        } else {
          resolve([]);
        }
      } else {
        resolve([]);
      }
      socket.removeEventListener('message', handle);
    };
    socket.addEventListener('message', handle);
  });
};

// 打印任务
export const printTask = (_tasks, noTasksCount = false) => {
  const getTask = () => {
    if (_tasks) {
      if (Array.isArray(_tasks)) {
        return _tasks;
      } else {
        return [_tasks];
      }
    } else {
      return [];
    }
  };
  const tasks = getTask();

  return new Promise((resolve, reject) => {
    const len = tasks.length;

    const taskCount = {
      success: [],
      fail: [],
    };

    if (len === 0) {
      reject();
    }

    socket = window.webSocket;

    if (!socket || socket.readyState === WebSocket.CLOSED) {
      connect();
      return;
    }
    if (socket.readyState !== WebSocket.OPEN) {
      reject();
      return;
    }

    const previewResult = [];

    const handlePrintTaskCount = (event) => {
      const newData = getEvtData(event);
      const cmd = getCmd(event);

      if (cmd === 'print') {
        if (newData.status !== 'success') {
          resolve(taskCount);
        }
      } else if (cmd === 'notifyPrintResult') {
        if (newData.taskStatus === 'printed') {
          taskCount.success.push(newData.taskID);
        } else if (newData.taskStatus === 'failed') {
          taskCount.fail.push(newData.taskID);
        }
        if ((taskCount.success.length + taskCount.fail.length) === len) {
          resolve(taskCount);
          socket.removeEventListener('message', handle);
        }
      }
    };
    const handlePrintNoCount = (event) => {
      const newData = getEvtData(event);
      const cmd = getCmd(event);

      if (cmd === 'print') {
        /** 菜鸟打印组件windows和mac兼容不同
         * windows，status=='success'时就返回了结果，会结束本次动作
         * mac系统，先返回结果，然后在status=='completeSuccess'阶段结束本次动作
         */

        if (newData.status !== 'success') {
          socket.removeEventListener('message', handle);
          return reject(newData.msg);
        }

        let hasResult;
        if (newData.responses) {
          // 兼容旧版自定义格式：responses[].urls
          hasResult = true;
          (newData.responses || []).map((item) => previewResult.push(...(item?.urls || [])));
        } else if (newData.urls?.length > 0) {
          // 1.x 版本：顶层 urls 数组
          hasResult = true;
          previewResult.push(...newData.urls);
        } else if (newData.previewURL) {
          // 0.x 版本：previewURL 单个 pdf 地址
          hasResult = true;
          previewResult.push(newData.previewURL);
        } else if (newData.previewImage?.length > 0) {
          // 0.x image 模式：previewImage 图片数组
          hasResult = true;
          previewResult.push(...newData.previewImage);
        }

        if (hasResult && newData.status === 'success') {
          socket.removeEventListener('message', handle);
          resolve(previewResult);
        }
      } else if (cmd === 'notifyTaskResult' && newData.status === 'completeSuccess') {
        socket.removeEventListener('message', handle);
        resolve(previewResult);
      }
    };

    const handle = noTasksCount ? handlePrintNoCount : handlePrintTaskCount;

    socket.addEventListener('message', handle);

    tasks.forEach((task) => {
      const param = JSON.stringify(task);
      socket.send(param);
    });
  });
};


/** ******************** 控制台调用调试 ********************* */

const test = () => {
  window.printTask = printTask;
  window.preview1 = (previewType = 'pdf') => {
    return printTask([
      {
        orderNo: 'GF0024032786341',
        task: {
          taskID: 'GF0024032786341',
          preview: true,
          previewType,
          documents: [
            {
              contents: [
                {
                  encrypted: 'false',
                  data: {
                    orderType: '2.0-JIT',
                    featureMap: {},
                    gmtModified: '1711540310000',
                    bizType: '2558000',
                    expectPickupTime: '1711587600000',
                    pickupOrderCode: 'GF0024032786341',
                    toResCode: 'CSC207',
                    packageNumList: [
                      'GF0024032786341001',
                    ],
                    toResName: '货通B2测试仓',
                    receiverInfo: {
                      address: '余杭雷震子大厦1幢888室',
                      phone: '16888888888',
                      name: '坚持爱好87',
                    },
                    orderStatus: '10',
                    orderCnt: '1',
                    tenantCode: 'CSFBAE',
                    gmtCreate: '1711540310000',
                    productInfo: 'JIT模式-多SKU测试商品A，请不要拍+规格 小 颜色 浅灰色 +1件\n',
                    packageNumFull: 'GF0024032786341001',
                    totalPackage: '1',
                    relatedOrderList: [
                      'PONX2403272293479652',
                    ],
                    packageNum: '1',
                  },
                  templateURL: 'https://cloudprint.cainiao.com/template/standard/730234/4',
                },
                {
                  encrypted: 'false',
                  data: {
                    orderType: '2.0-JIT',
                    featureMap: {},
                    gmtModified: '1711540310000',
                    bizType: '2558000',
                    expectPickupTime: '1711587600000',
                    pickupOrderCode: 'GF0024032786341a',
                    toResCode: 'CSC207',
                    packageNumList: [
                      'GF0024032786341002',
                    ],
                    toResName: '货通B2测试仓',
                    receiverInfo: {
                      address: 'ttt余杭雷震子大厦1幢888室',
                      phone: '16888888888',
                      name: '坚持爱好87',
                    },
                    orderStatus: '10',
                    orderCnt: '1',
                    tenantCode: 'CSFBAE',
                    gmtCreate: '1711540310000',
                    productInfo: 'JIT模式-多SKU测试商品A，请不要拍+规格 小 颜色 浅灰色 +1件\n',
                    packageNumFull: 'GF0024032786341002',
                    totalPackage: '1',
                    relatedOrderList: [
                      'PONX2403272293479652',
                    ],
                    packageNum: '1',
                  },
                  templateURL: 'https://cloudprint.cainiao.com/template/standard/730234/4',
                },
              ],
              documentID: 'GF0024032786341',
            },
          ],
        },
        requestID: '1712049190473_GF0024032786341',
        cmd: 'print',
      },
    ], true);
  };
  window.preview2 = (previewType = 'pdf') => {
    return printTask([
      {
        orderNo: 'GF0024032786341',
        task: {
          taskID: 'GF0024032786341',
          previewType,
          preview: 'true',
          documents: [
            {
              contents: [
                {
                  encrypted: 'false',
                  data: {
                    orderType: '2.0-JIT',
                    featureMap: {},
                    gmtModified: '1711540310000',
                    bizType: '2558000',
                    expectPickupTime: '1711587600000',
                    pickupOrderCode: 'GF0024032786341',
                    toResCode: 'CSC207',
                    packageNumList: [
                      'GF0024032786341001',
                    ],
                    toResName: '货通B2测试仓',
                    receiverInfo: {
                      address: '余杭雷震子大厦1幢888室',
                      phone: '16888888888',
                      name: '坚持爱好87',
                    },
                    orderStatus: '10',
                    orderCnt: '1',
                    tenantCode: 'CSFBAE',
                    gmtCreate: '1711540310000',
                    productInfo: 'JIT模式-多SKU测试商品A，请不要拍+规格 小 颜色 浅灰色 +1件\n',
                    packageNumFull: 'GF0024032786341001',
                    totalPackage: '1',
                    relatedOrderList: [
                      'PONX2403272293479652',
                    ],
                    packageNum: '1',
                  },
                  templateURL: 'https://cloudprint.cainiao.com/template/standard/730234/4',
                },
              ],
              documentID: 'GF0024032786341',
            },
            {
              contents: [
                {
                  encrypted: 'false',
                  data: {
                    orderType: '2.0-JIT',
                    featureMap: {},
                    gmtModified: '1711540310000',
                    bizType: '2558000',
                    expectPickupTime: '1711587600000',
                    pickupOrderCode: 'GF0024032786341a',
                    toResCode: 'CSC207',
                    packageNumList: [
                      'GF0024032786341002',
                    ],
                    toResName: '货通B2测试仓',
                    receiverInfo: {
                      address: '11余杭雷震子大厦1幢888室',
                      phone: '16888888888',
                      name: '坚持爱好87',
                    },
                    orderStatus: '10',
                    orderCnt: '1',
                    tenantCode: 'CSFBAE',
                    gmtCreate: '1711540310000',
                    productInfo: 'JIT模式-多SKU测试商品A，请不要拍+规格 小 颜色 浅灰色 +1件\n',
                    packageNumFull: 'GF0024032786341002',
                    totalPackage: '1',
                    relatedOrderList: [
                      'PONX2403272293479652',
                    ],
                    packageNum: '1',
                  },
                  templateURL: 'https://cloudprint.cainiao.com/template/standard/730234/4',
                },
              ],
              documentID: 'GF0024032786341a',
            },
          ],
        },
        requestID: '1712049190473_GF0024032786341',
        cmd: 'print',
      },
    ], true);
  };

  // https://sc-print-label.oss-cn-hangzhou.aliyuncs.com/sclabel/2024-04-08/%E6%A0%87%E7%AD%BE%E4%BF%A1%E6%81%AF-1712565188879.pdf?Expires=1712651589&OSSAccessKeyId=LTAI5tN1aH8fd4vRtiyDZDDx&Signature=8rBqMErPyNMwFV%2FgDdIWNvAqRWA%3D
  window.print1 = () => {
    return printTask([
      {
        orderNo: 'GF0024032786341',
        task: {
          preview: 'false',
          printType: 'dirctPrint',
          printer: 'HPRT N41',
          previewType: 'pdf',
          documents: [
            {
              contents: [
                {
                  encrypted: 'false',
                  data: {
                    orderType: '2.0-JIT',
                    featureMap: {},
                    gmtModified: '1711540310000',
                    bizType: '2558000',
                    expectPickupTime: '1711587600000',
                    pickupOrderCode: 'GF0024032786341',
                    toResCode: 'CSC207',
                    packageNumList: [
                      'GF0024032786341001',
                    ],
                    toResName: '货通B2测试仓',
                    receiverInfo: {
                      address: '余杭雷震子大厦1幢888室',
                      phone: '16888888888',
                      name: '坚持爱好87',
                    },
                    orderStatus: '10',
                    orderCnt: '1',
                    tenantCode: 'CSFBAE',
                    gmtCreate: '1711540310000',
                    productInfo: 'JIT模式-多SKU测试商品A，请不要拍+规格 小 颜色 浅灰色 +1件\n',
                    packageNumFull: 'GF0024032786341001',
                    totalPackage: '1',
                    relatedOrderList: [
                      'PONX2403272293479652',
                    ],
                    packageNum: '1',
                  },
                  templateURL: 'https://cloudprint.cainiao.com/template/standard/730234/4',
                },
              ],
              documentID: 'GF0024032786341',
            },
            {
              contents: [
                {
                  encrypted: 'false',
                  data: {
                    orderType: '2.0-JIT',
                    featureMap: {},
                    gmtModified: '1711540310000',
                    bizType: '2558000',
                    expectPickupTime: '1711587600000',
                    pickupOrderCode: 'GF0024032786341a',
                    toResCode: 'CSC207',
                    packageNumList: [
                      'GF0024032786341002',
                    ],
                    toResName: '货通B2测试仓',
                    receiverInfo: {
                      address: '11余杭雷震子大厦1幢888室',
                      phone: '16888888888',
                      name: '坚持爱好87',
                    },
                    orderStatus: '10',
                    orderCnt: '1',
                    tenantCode: 'CSFBAE',
                    gmtCreate: '1711540310000',
                    productInfo: 'JIT模式-多SKU测试商品A，请不要拍+规格 小 颜色 浅灰色 +1件\n',
                    packageNumFull: 'GF0024032786341002',
                    totalPackage: '1',
                    relatedOrderList: [
                      'PONX2403272293479652',
                    ],
                    packageNum: '1',
                  },
                  templateURL: 'https://cloudprint.cainiao.com/template/standard/730234/4',
                },
              ],
              documentID: 'GF0024032786341a',
            },
          ],
          taskID: 'GF0024032786341',
        },
        requestID: '1712049190473_GF0024032786341',
        cmd: 'print',
      },
    ], true);
  };
  window.print2 = () => {
    return printTask([
      {
        orderNo: 'GF0024032786341',
        task: {
          preview: false,
          previewType: 'pdf',
          printType: 'dirctPrint',
          printer: 'HPRT N41',
          documents: [
            {
              contents: [
                {
                  encrypted: 'false',
                  data: {
                    orderType: '2.0-JIT',
                    featureMap: {},
                    gmtModified: '1711540310000',
                    bizType: '2558000',
                    expectPickupTime: '1711587600000',
                    pickupOrderCode: 'GF0024032786341',
                    toResCode: 'CSC207',
                    packageNumList: [
                      'GF0024032786341001',
                    ],
                    toResName: '货通B2测试仓',
                    receiverInfo: {
                      address: '余杭雷震子大厦1幢888室',
                      phone: '16888888888',
                      name: '坚持爱好87',
                    },
                    orderStatus: '10',
                    orderCnt: '1',
                    tenantCode: 'CSFBAE',
                    gmtCreate: '1711540310000',
                    productInfo: 'JIT模式-多SKU测试商品A，请不要拍+规格 小 颜色 浅灰色 +1件\n',
                    packageNumFull: 'GF0024032786341001',
                    totalPackage: '1',
                    relatedOrderList: [
                      'PONX2403272293479652',
                    ],
                    packageNum: '1',
                  },

                  // 箱唛 - 预览
                  templateURL: 'https://dchain-ae-inbound-s-bucket.aliexpress.com/ae1688_2_jit/po_box_202404/PONX2404012308335229_1712576541685.pdf?Expires=1712662944&OSSAccessKeyId=LTAI5tDuLXo6tPfXwowiaMEM&Signature=jMZhmCi6CLtADJrSXJ3cUAWry5g%3D',
                  // 货品标签 - 预览
                  // templateURL: 'https://dchain-ae-inbound-s-bucket.aliexpress.com/ae1688_2_jit/item_tag_202404/PONX2404012308335229_1712577513090.pdf?Expires=1712663913&OSSAccessKeyId=LTAI5tDuLXo6tPfXwowiaMEM&Signature=9II8uWY4x1GM39iNheVSUJeVT6E%3D',
                  // 箱唛 - 下载
                  // templateURL: 'https://sc-print-label.oss-cn-hangzhou.aliyuncs.com/boxmark/2024-04-08/%E7%AE%B1%E5%94%9B-1712575626695.pdf?Expires=1712662026&OSSAccessKeyId=LTAI5tN1aH8fd4vRtiyDZDDx&Signature=rvXnl8auTODKx66dDLegwjOMveU%3D',
                  // 揽收单 - 预览
                  // "templateURL": "https://cloudprint.cainiao.com/template/standard/730234/4"
                },
              ],
              documentID: 'GF0024032786341',
            },
          ],
          taskID: 'GF0024032786341',
        },
        requestID: '1712049190473_GF0024032786341',
        cmd: 'print',
      },
    ], true);
  };
};

test();

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Dialog, Select, Message } from '@alifd/next';
// import Clipboard from '@/components/ClipBoard';
// import { IconCopy } from '@/components/Icons';
// import ProgressiveImage from '@/components/ProgressiveImage';
import actions from '@/service/actions';
import { connect, getPrintNameList, printTask } from '@/pages/PrintWayBill/printServices';
import './index.scss';
import { print } from '../../api';

export default forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({});
  const [printList, setPrintList] = useState([]);
  // const [currentPrint, setCurrentPrint] = useState(localStorage.getItem('currentPrint') || '');
  const [currentPrint, setCurrentPrint] = useState('');
  const [imagePreviewList, setImagePreviewList] = useState([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');

  const { type } = data || {};
  const getPrintData = async (pickUpOrderNoList) => {
    const res = await print({
      req: {
        preview: true,
        pickUpOrderNoList,
        printType: 'EXPRESS_ORDER_1688',
      },
    })
    const model = (res?.content?.data || []).reduce((a, b) => {
      if (!a) {
        return b;
      }

      if (!a.task.documents) {
        a.task.documents = [{ contents: [] }];
      }

      if (!a.task.documents[0].contents) {
        a.task.documents[0].contents = [];
      }

      a.task.documents[0].contents.push(...(b.task.documents?.[0].contents || []));
      return a;
    }, null);

    if (!model || !model.task) {
      return;
    }

    if (!data.preview) {
      model.task.printer = data.printer;
    } else {
      // windows系统必须是boolean类型的true才能识别为预览
      model.task.preview = true;
    }

    // taskID不能重复
    model.task.taskID = model.requestID || new Date().getTime();
    return model;
  }
  const typesMap = {
    // 打印揽收单
    printWayBill: {
      title: '打印揽收单',
      init: async ({ pickupOrderNumber, orderEntries }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: 'wayBill',
            data: {
              orderIds: pickupOrderNumber, // 揽收单号，多个逗号隔开
              preview: true,
              orderEntries,
            },
          },
        });

        // 连接菜鸟打印软件把原始数据转成pdf
        await connect();
        const result = await printTask(model, true);
        setPdfPreviewUrl(result?.[0]);
      },
      downloadAction: () => { },
      printAction: async ({ pickupOrderNumber, orderEntries }) => {
        try {
          // 获取预览原始数据
          const model = await actions({
            group: 'aeOrder',
            name: 'queryPrintData',
            params: {
              type: 'wayBill',
              data: {
                orderIds: pickupOrderNumber, // 揽收单号，多个逗号隔开
                preview: false,
                printer: currentPrint,
                orderEntries,
              },
            },
          });

          await connect();
          // 调用菜鸟软件执行打印命令
          printTask(model);
        } catch (e) {
          // downloadPrintDriver();
        }
      },
    },
    printMark: {
      title: '打印箱唛',
      init: async ({ orderId: _orderId, orderEntries }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: 'mark',
            data: {
              orderId: _orderId, // 揽收单号，多个逗号隔开
              preview: true,
              orderEntries,
            },
          },
        });

        // 箱唛直接返回pdf图片
        setPdfPreviewUrl(model?.task?.documents?.[0]?.contents?.[0]?.templateURL);
      },
      downloadAction: async () => {
      },
      printAction: async ({ orderId: _orderId, orderEntries }) => {
        // 检查是否选择了打印机
        if (!currentPrint) {
          Message.warning('请选择打印机');
          return;
        }

        try {
          // 获取打印的原始数据
          const model = await actions({
            group: 'aeOrder',
            name: 'queryPrintData',
            params: {
              type: 'mark',
              data: {
                orderId: _orderId,
                preview: false,
                printer: currentPrint,
                orderEntries,
              },
            },
          });

          await connect();
          // 调用菜鸟软件执行打印命令
          printTask(model);
        } catch (e) {
          // downloadPrintDriver();
        }
      },
    },
    printLabel: {
      title: '打印货品标签',
      init: async ({ orderId: _orderId, orderEntries }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: 'label',
            data: {
              orderId: _orderId, // 揽收单号，多个逗号隔开
              preview: true,
              orderEntries,
            },
          },
        });

        // 货品标签直接返回pdf图片
        setPdfPreviewUrl(model?.task?.documents?.[0]?.contents?.[0]?.templateURL);
      },
      downloadAction: () => { },
      printAction: async ({ orderId: _orderId, orderEntries }) => {
        // 检查是否选择了打印机
        if (!currentPrint) {
          Message.warning('请选择打印机');
          return;
        }

        try {
          // 获取打印的原始数据
          const model = await actions({
            group: 'aeOrder',
            name: 'queryPrintData',
            params: {
              type: 'label',
              data: {
                orderId: _orderId, // 揽收单号，多个逗号隔开
                preview: false,
                printer: currentPrint,
                orderEntries,
              },
            },
          });

          await connect();
          // 调用菜鸟软件执行打印命令
          printTask(model);
        } catch (e) {
          // downloadPrintDriver();
        }
      },
    },
    // 打印送货单
    printDelivery: {
      title: '打印送货单',
      init: async ({ orderId: _orderId, orderEntries }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: 'printDelivery',
            data: {
              preview: true,
              fulfilmentOrderCode: _orderId,
              data: orderEntries,
            },
          },
        });
        // 连接菜鸟打印软件把原始数据转成pdf
        await connect();
        const result = await printTask(model, true);
        setPdfPreviewUrl(result?.[0]);
        // 货品标签直接返回pdf图片
        // setPdfPreviewUrl(model?.task?.documents?.[0]?.contents?.[0]?.templateURL);
      },
      downloadAction: () => { },
      printAction: async ({ orderId: _orderId, orderEntries }) => {
        // 检查是否选择了打印机
        if (!currentPrint) {
          Message.warning('请选择打印机');
          return;
        }

        try {
          // 获取打印的原始数据
          const model = await actions({
            group: 'aeOrder',
            name: 'queryPrintData',
            params: {
              type: 'printDelivery',
              data: {
                preview: false,
                fulfilmentOrderCode: _orderId,
                data: orderEntries,
              },
            },
          });

          await connect();
          // 调用菜鸟软件执行打印命令
          printTask(model);
        } catch (e) {
          // downloadPrintDriver();
        }
      },
    },
    // 预约管理打印箱唛
    printBoxLabel: {
      title: '打印箱唛',
      init: async ({ orderId: _orderId, orderEntries }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: 'printBoxLabel',
            data: {
              preview: true,
              goodsId: _orderId,
              data: orderEntries,
            },
          },
        });
        await connect();
        const result = await printTask(model, true);
        setPdfPreviewUrl(result?.[0]);
        // 货品标签直接返回pdf图片
        // setPdfPreviewUrl(model?.task?.documents?.[0]?.contents?.[0]?.templateURL);
      },
      downloadAction: () => { },
      printAction: async ({ orderId: _orderId, orderEntries }) => {
        // 检查是否选择了打印机
        if (!currentPrint) {
          Message.warning('请选择打印机');
          return;
        }

        try {
          // 获取打印的原始数据
          const model = await actions({
            group: 'aeOrder',
            name: 'queryPrintData',
            params: {
              type: 'printBoxLabel',
              data: {
                preview: false,
                goodsId: _orderId,
                data: orderEntries,
              },
            },
          });

          await connect();
          // 调用菜鸟软件执行打印命令
          printTask(model);
        } catch (e) {
          // downloadPrintDriver();
        }
      },
    },
    // 打印条码
    printBarCode: {
      title: '打印条码',
      init: async ({ orderId: _orderId, orderEntries }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: 'printBarCode',
            data: {
              preview: true,
              goodsId: _orderId,
              data: orderEntries,
            },
          },
        });
        await connect();
        const result = await printTask(model, true);
        setPdfPreviewUrl(result?.[0]);
        // 货品标签直接返回pdf图片
        // setPdfPreviewUrl(model?.task?.documents?.[0]?.contents?.[0]?.templateURL);
      },
      downloadAction: () => { },
      printAction: async ({ orderId: _orderId, orderEntries }) => {
        // 检查是否选择了打印机
        if (!currentPrint) {
          Message.warning('请选择打印机');
          return;
        }

        try {
          // 获取打印的原始数据
          const model = await actions({
            group: 'aeOrder',
            name: 'queryPrintData',
            params: {
              type: 'printBarCode',
              data: {
                preview: false,
                goodsId: _orderId,
                data: orderEntries,
              },
            },
          });

          await connect();
          // 调用菜鸟软件执行打印命令
          printTask(model);
        } catch (e) {
          // downloadPrintDriver();
        }
      },
    },
    // JIT打印揽收单
    jitPrintWayBill: {
      title: '打印揽收单',
      init: async ({ pickupOrderNumber, orderEntries }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: 'jitPrintWayBill',
            data: {
              orderIds: pickupOrderNumber, // 揽收单号，多个逗号隔开
              preview: true,
              orderEntries,
            },
          },
        });

        // 连接菜鸟打印软件把原始数据转成pdf
        await connect();
        const result = await printTask(model, true);
        setPdfPreviewUrl(result?.[0]);
      },
      downloadAction: () => { },
      printAction: async ({ pickupOrderNumber, orderEntries }) => {
        try {
          // 获取预览原始数据
          const model = await actions({
            group: 'aeOrder',
            name: 'queryPrintData',
            params: {
              type: 'jitPrintWayBill',
              data: {
                orderIds: pickupOrderNumber, // 揽收单号，多个逗号隔开
                preview: false,
                printer: currentPrint,
                orderEntries,
              },
            },
          });

          await connect();
          // 调用菜鸟软件执行打印命令
          printTask(model);
        } catch (e) {
          // downloadPrintDriver();
        }
      },
    },
    // 创建页面打印揽收单
    printWayBillCreate: {
      title: '打印揽收单',
      init: async ({ pickupOrderNumber, orderEntries }) => {
        // 获取预览原始数据
        const model = await getPrintData(pickupOrderNumber);
        // 连接菜鸟打印软件把原始数据转成pdf
        await connect();
        const result = await printTask(model, true);
        setPdfPreviewUrl(result?.[0]);
      },
      downloadAction: () => { },
      printAction: async ({ pickupOrderNumber, orderEntries }) => {
        try {
          // 获取预览原始数据
          const model = await getPrintData(pickupOrderNumber);

          await connect();
          // 调用菜鸟软件执行打印命令
          printTask(model);
        } catch (e) {
          // downloadPrintDriver();
        }
      },
    },
  };

  const onOpen = (_data) => {
    setData(_data);
    setVisible(true);

    connect().then(() => {
      getPrintList();
      typesMap[_data?.type]?.init?.(_data);
    });
  };

  useImperativeHandle(ref, () => ({
    onOpen,
  }));

  const getPrintList = () => {
    getPrintNameList().then((res) => {
      setPrintList(res);
      if (!currentPrint && res[0].value) {
        localStorage.setItem('currentPrint', res[0].value);
        setCurrentPrint(res[0].value);
      }
    });
  };

  // const downloadPrintDriver = () => {
  //   const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  //   const downloadUrl = isMac
  //     ? 'https://cainiao-oss-sh-read.oss-cn-shanghai.aliyuncs.com/waybill-print/cainiao-x-print/prod/macos/cainiao-x-print-mac-64.dmg'
  //     : 'https://cloudprint.cainiao.com/cloudprint/client/CNPrintSetup.exe';

  //   Dialog.warning({
  //     v2: true,
  //     title: '未检测到菜鸟打印组件',
  //     content: (
  //       <div>
  //         <p className="content">
  //           已安装菜鸟打印，请检查软件是否打开。
  //         </p>
  //         <p className="content">
  //           未安装菜鸟打印，<a href={downloadUrl} className="btn" download>前往安装</a>
  //         </p>
  //       </div>
  //     ),
  //   });
  // };

  const onPrint = () => {
    typesMap[type].printAction(data);
    // setVisible(false);
  };
  // const onDownLoad = () => {
  //   typesMap[type].downloadAction();
  //   // setVisible(false);
  // };

  const onClose = () => {
    setVisible(false);
    setData({});
    setImagePreviewList([]);
    setPdfPreviewUrl('');
  };

  return (
    <Dialog
      className="ae-print-preview-container"
      v2
      centered
      width={1000}
      title={typesMap[type]?.title}
      visible={visible}
      onOk={onPrint}
      onCancel={onClose}
      onClose={onClose}
      footerAlign="center"
      okProps={{ children: '直接打印' }}
      cancelProps={{ children: '关闭' }}
    >
      <div className="ae-print-preview-content">
        {/* <div className="content-item">
          <span className="title">订单号：</span>
          <span>{orderId}</span>
          <span className="copy">
            <Clipboard text={orderId}>
              <IconCopy />
            </Clipboard>
          </span>
        </div> */}
        <div className="content-item">
          <span className="title">打印机：</span>
          <Select
            dataSource={printList}
            value={currentPrint}
            onChange={(value) => {
              localStorage.setItem('currentPrint', value);
              setCurrentPrint(value);
            }}
            style={{ width: 200 }}
          />
        </div>
        {props?.type === 'jitText' && (
          <div>打印前请下载和安装最新版本的菜鸟打印组件，如未安装，可以
            <span className="cursor-pointer text-[#0077ff]" onClick={() => window.open('https://page.cainiao.com/waybill/cloud_printing/home.html', '_blank')}>点击这里</span>
            下载。建议使用尺寸为100mm*150mm的热敏纸进行打印。
          </div>
        )}
        <div className="preview-content">
          {
            !!pdfPreviewUrl && (
              <embed src={pdfPreviewUrl} />
            )
          }

          {
            !!imagePreviewList.length && (
              <div className="preview-image">
                {
                  imagePreviewList.map((url) => (
                    <img src={url} />
                  ))
                }
              </div>
            )
          }
        </div>
      </div>
    </Dialog>
  );
});

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Dialog, Select, Message } from '@alifd/next';
// import Clipboard from '@/components/ClipBoard';
// import { IconCopy } from '@/components/Icons';
// import ProgressiveImage from '@/components/ProgressiveImage';
import actions from '@/service/actions';
import { connect, getPrintNameList, printTask } from '@/pages/PrintWayBill/printServices';
import './index.scss';

export default forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({});
  const [printSize, setPrintSize] = useState(null);
  const [printList, setPrintList] = useState([]);
  // const [currentPrint, setCurrentPrint] = useState(localStorage.getItem('currentPrint') || '');
  const [currentPrint, setCurrentPrint] = useState('');
  const [imagePreviewList, setImagePreviewList] = useState([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState([]);

  // const { type, orderId, ...otherData } = data || {};
  const { type } = data || {};
  const typesMap = {
    // 打印揽收单
    printWayBill: {
      title: '打印揽收单',
      init: async ({ pickupOrderNumber }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: 'wayBill',
            data: {
              orderIds: pickupOrderNumber, // 揽收单号，多个逗号隔开
              preview: true,
            },
          },
        });

        // 连接菜鸟打印软件把原始数据转成pdf
        await connect();
        const result = await printTask(model, true);
        setPdfPreviewUrl([result?.[0]]);
      },
      downloadAction: () => { },
      printAction: async ({ pickupOrderNumber }) => {
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
      init: async ({ orderId: _orderId }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: 'mark',
            data: {
              orderId: _orderId, // 揽收单号，多个逗号隔开
              preview: true,
            },
          },
        });

        // 箱唛直接返回pdf图片
        setPdfPreviewUrl([model?.task?.documents?.[0]?.contents?.[0]?.templateURL]);
      },
      downloadAction: async () => { },
      printAction: async ({ orderId: _orderId }) => {
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
      init: async ({ params, serviceMap_name = 'label' }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: serviceMap_name,
            data: {
              ...params,
              preview: true,
            },
          },
        });

        // 货品标签直接返回pdf图片
        setPdfPreviewUrl([model?.task?.documents?.[0]?.contents?.[0]?.templateURL]);
      },
      downloadAction: () => { },
      printAction: async ({ params, serviceMap_name = 'label' }) => {
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
              type: serviceMap_name,
              data: {
                ...params,
                preview: false,
                printer: currentPrint,
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
    printPwsLabel: {
      title: '打印寄样标签',
      init: async ({ params, serviceMap_name = 'label_pws' }) => {
        // 获取预览原始数据
        const model = await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: serviceMap_name,
            data: {
              ...params,
              preview: true,
            },
          },
        });

        // 货品标签直接返回pdf图片
        setPdfPreviewUrl(model?.task?.documents?.[0]?.contents?.map((item) => item?.templateURL));
      },
      downloadAction: () => { },
      printAction: async ({ params, serviceMap_name = 'label' }) => {
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
              type: serviceMap_name,
              data: {
                ...params,
                preview: false,
                printer: currentPrint,
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
  };

  const onOpen = (_data) => {
    setData(_data);
    setVisible(true);
    setPrintSize(_data?.params?.printTemplateSize);
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
  //         <p className="content">已安装菜鸟打印，请检查软件是否打开。</p>
  //         <p className="content">
  //           未安装菜鸟打印，
  //           <a href={downloadUrl} className="btn" download>
  //             前往安装
  //           </a>
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
    setPdfPreviewUrl([]);
  };

  const dealPrintSize = (_printSize) => {
    const result = _printSize.split('_').map((size) => `${size}mm`);
    return result.join('*');
  };
  const renderContent = () => {
    return (
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
        {printSize && (
          <div className="content-item">
            <span className="title">打印尺寸：</span>
            <span className="text-[#333] font-normal">{dealPrintSize(printSize)}</span>
          </div>
        )}
        <div className="preview-content">
          {!!pdfPreviewUrl.length && (
            pdfPreviewUrl.map((url) => (
              <embed src={url} />
            ))
          )}

          {!!imagePreviewList.length && (
            <div className="preview-image">
              {imagePreviewList.map((url) => (
                <img src={url} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  // const DialogComponent = () => {
  //   const dialog = Dialog.show({
  //     className:"ae-print-preview-container",
  //     v2: true,
  //     width: 1000,
  //     centered: true,
  //     title: typesMap[type]?.title,
  //     visible: visible,
  //     onOk: onPrint,
  //     onCancel: onClose,
  //     onClose: onClose,
  //     footerAlign: "center",
  //     okProps: { children: '直接打印' },
  //     cancelProps: { children: '关闭' },
  //     content: renderContent()
  //   })
  //   return dialog;
  // }
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
      {renderContent()}
    </Dialog>
  );
});

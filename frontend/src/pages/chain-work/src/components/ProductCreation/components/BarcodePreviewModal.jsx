import React, { useEffect } from 'react';
import { Message, Button, Balloon } from '@alifd/next';
import './BarcodeGenerator.scss';
import ClipboardJS from 'clipboard';

function BarcodePreviewModal({ barcodeValue, visible, onClose, imageUrl }) {
  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    const clipboard = new ClipboardJS('.copy');
    clipboard.on('success', (e) => {
      e.clearSelection();
      Message.success('复制成功');
    });

    clipboard.on('error', () => {
      Message.error('复制失败');
    });
  }, []);
  return (
    <Balloon
      visible={visible}
      onClose={handleClose}
      footer={false}
      title={<div className="text-[16px]">预览条形码</div>}
      align="t"
      v2
      triggerType="click"
      className="balloon-wrapper"
    >
      <div>
        条形码内容：<span>{barcodeValue}</span>
      </div>
      <div className="w-[300px] flex flex-col items-center">
        <img src={imageUrl} alt="Barcode Preview" />
        <div className="flex ">
          <Button
            type="primary"
            component="a"
            href={imageUrl}
            download
            className="mr-[12px]"
            style={{ cursor: 'pointer' }}
          >
            下载条形码
          </Button>
          <Button className="copy" data-clipboard-text={barcodeValue} style={{ cursor: 'pointer' }}>
            复制条形码
          </Button>
        </div>
      </div>
    </Balloon>
  );
}

export default BarcodePreviewModal;

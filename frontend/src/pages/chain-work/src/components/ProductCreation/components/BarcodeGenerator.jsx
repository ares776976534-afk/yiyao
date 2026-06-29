import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Balloon, Field, Message, Icon } from '@alifd/next';
import BarcodePreviewModal from './BarcodePreviewModal';
import JsBarcode from 'jsbarcode';
import './BarcodeGenerator.scss';

const BarcodeGenerator = (props) => {
  const [barcodeImageUrl, setBarcodeImageUrl] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState('');

  function textToBase64Barcode(text) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, { format: 'CODE128' });
    return canvas.toDataURL('image/png');
  }

  const generateBarcodeImage = async () => {
    try {
      const barcodeDataUrl = await textToBase64Barcode(props?.value);
      const barcodeImg = new Image();
      barcodeImg.src = barcodeDataUrl;
      setBarcodeImageUrl(barcodeImg.src);
      setBarcodeValue(props?.value);
      setShowBarcodeModal(true);
    } catch (error) {
      console.error('Error generating barcode image:', error);
    }
  };

  return (
    <div>
      <div className="text-[#999] text-[14px] mb-[20px]">
        <span className="text-[#d23c26] ml-[4px] mr-[4px]">*</span>
        <span className="mr-[12px]">条形码</span>
        <span className="text-[#333]">
          请输入13位以内（建议11-13位）字母+数字或纯数字，如有字母，只能全部大写或全部小写
        </span>
      </div>
      <div className="flex ml-[69px]">
        <Form.Item>
          <Input {...props} placeholder="请输入1-13位数字" style={{ width: '200px' }} />
        </Form.Item>
        <Button onClick={generateBarcodeImage} className="mx-[8px]">
          生成条码图片
        </Button>
        <Balloon.Tooltip
          trigger={<Icon type="help" size="small" style={{ color: '#999' }} className="h-[30px] leading-[30px]" />}
          align="t"
          title={<div className="text-[#000] text-[16px]">推荐条码大小</div>}
          popupStyle={{ color: '#666', backgroundColor: '#fff', boxShadow: '0px 1px 6px 0px rgba(0, 0, 0, 0.08)' }}
          popupClassName="tooltips"
        >
          <div>1.条码本身尺寸：长度不低于 20mm，宽度不低于 10mm </div>
          <div>2.条码纸张尺寸：长度不低于 25mm，宽度不低于 15mm </div>
          <div className="mt-[12px]">推荐条码制式：Code 128（推荐）</div>
        </Balloon.Tooltip>
        <BarcodePreviewModal
          barcodeValue={barcodeValue}
          visible={showBarcodeModal}
          imageUrl={barcodeImageUrl}
          onClose={() => setShowBarcodeModal(false)}
        />
      </div>
    </div>
  );
};

export default BarcodeGenerator;

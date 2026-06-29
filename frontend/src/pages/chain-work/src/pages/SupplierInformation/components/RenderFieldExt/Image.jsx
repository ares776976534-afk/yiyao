import React from 'react';
import { Button, Balloon } from '@alifd/next';
import './index.scss';

const ImageGrid = ({ images }) => {
  return (
    <div className="image-grid">
      {images.map((imageUrl, index) => (
        <div key={imageUrl.src} className="image-item">
          <img src={imageUrl.src} alt={`Image ${index}`} className="w-[80px] h-[80px] rounded-[6px]" />
        </div>
      ))}
    </div>
  );
};
export default ({ data = [], modifyLink = '', valid = true, disabled, type }) => {
  const handleOk = () => {
    window.open(modifyLink);
  };

  const datalist = () => {
    if (type === 'text') {
      data.map((item) => {
        return <div>{item.src}</div>;
      });
    } else {
      data.slice(0, 3).map((item) => {
        return <img className="w-[80px] h-[80px] rounded-[6px]" src={item.src} />;
      });
    }
  };
  return (
    <div className="flex flex-col items-start">
      <div className="flex flex-row gap-x-[12px]">
        {datalist()}
      </div>
      <div className="flex flex-row mt-[8px] text-[12px] items-center">
        {/* {
          !valid && <span className="text-[#999] mr-[8px]">信息已失效</span>
        } */}
        {!disabled && (
          <Button type="primary" onClick={handleOk} text style={{ height: '14px', fontSize: '12px' }}>
            去修改
          </Button>
        )}
      </div>
      {disabled && data?.length > 3 && type !== 'text' && (
        <Balloon
          v2
          trigger={<Button type="primary" text style={{ height: '14px', fontSize: '12px' }}>查看更多图片</Button>}
          triggerType="hover"
          closable={false}
        >
          <ImageGrid images={data} />
        </Balloon>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Balloon, Icon } from '@alifd/next';
import { tabData } from './enums';
import { queryOrderNumsDashBoardService } from './service';

const defaultStyle = {
  background: '#fff',
  border: '1px solid #CCC',
};
const activeStyle = {
  background: 'linear-gradient(101deg, rgba(230, 242, 255, 0.8) 1%, rgba(230, 242, 255, 0) 100%)',
  borderWidth: '3px 1px 1px 1px',
  borderStyle: 'solid',
  borderColor: '#0077FF',
};
const submitReport = (url) => {
  window.open(url, '_blank');
};
function TabBanner() {
  const [active, setActive] = useState('waitConfirmNum');
  const [data, setData] = useState({});
  useEffect(() => {
    queryOrderNumsDashBoardService().then((res) => {
      setData(res?.model || {});
    });
  }, []);
  return (
    <div className="flex gap-[12px] px-[16px] pt-[20px]">
      {tabData?.map((ele) => (
        <div
          className="p-[12px] rounded-[6px] flex-1 items-center flex h-[60px]"
          style={active === ele?.key ? activeStyle : defaultStyle}
          key={ele?.key}
          onClick={() => {
            setActive(ele?.key);
            ele?.url && submitReport(ele?.url);
          }}
        >
          <div className="text-[#333] text-[16px] font-semibold leading-[16px]">
            {ele?.title}
            （{data[ele?.key]}）
          </div>
          {ele?.tip && (
            <Balloon
              v2
              trigger={<Icon type="help" className="text-[#BBB] ml-[4px] cursor-pointer" size="medium" />}
              triggerType="hover"
              align="tl"
              closable={false}
              className="text-[14px] px-[12px] py-[11.5px] max-w-[325px]"
            >
              {ele?.tip}
            </Balloon>
          )}
        </div>
      ))}
    </div>
  );
}

export default TabBanner;

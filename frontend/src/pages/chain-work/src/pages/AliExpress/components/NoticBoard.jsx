import React, { useState, useEffect } from 'react';
import { getResourceById } from '@/utlis';
import { Balloon, Button } from '@alifd/next';

const { Tooltip } = Balloon;

export default ({
  id,
  notic,
}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getResourceById(id)
      .then((res) => {
        setData(res);
      });
  }, []);
  return (
    <div className="p-[16px] bg-[#FFF] rounded-[6px] flex-1">
      {notic && (
        <div className="flex items-center gap-x-[4px] mb-[12px]">
          <img className="w-[16px] h-[16px]" src="https://img.alicdn.com/imgextra/i1/O1CN01f6V9qW2ANXDZ7xPc3_!!6000000008191-2-tps-32-32.png" alt="" srcSet="" />
          <span className="text-[#333] text-[16px] font-[500] h-[19px] flex items-center">公告</span>
        </div>
      )}
      <div className="flex flex-col gap-y-[8px]">
        {
          data.map((item, index) => {
            const isLink = item.link;
            const textStyle = isLink ? 'w-[165px]' : 'line-clamp-2 whitespace-normal';

            return (
              <div key={item.id ?? index} className="flex flex-row gap-x-[8px] leading-[17px]">
                <span className="text-[14px] text-[#BBB]">{item.date}</span>
                <div className="flex flex-row items-center">
                  <Tooltip
                    v2
                    trigger={
                      <p className={`text-[14px] leading-[17px] text-[#333] truncate line-clamp-1 whitespace-normal w-full ${!notic ? '' : textStyle}`}>
                        {item.content}
                      </p>
                    }
                    align="b"
                    arrowPointToCenter
                    popupClassName="notic-borad-tooltip bg-[#333] text-[14px] leading-[22px] p-[12px]"
                  >
                    {item.content}
                  </Tooltip>
                  {isLink && <Button type="primary" style={{ height: 17 }} text onClick={() => { window.open(item.link, '_blank'); }}>查看详情</Button>}
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

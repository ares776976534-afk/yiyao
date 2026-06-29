import React, { useState, useEffect } from 'react';
import { getResourceById } from '@/utlis';
import { Balloon } from '@alifd/next';
import './NoticBoard.scss';

const { Tooltip } = Balloon;

export default () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getResourceById(35225275)
      .then((res) => {
        setData(res);
      });
  }, []);
  return (
    <div className="py-[12px] px-[20px] bg-[#FFF] rounded-[6px] flex-1">
      {/* <div className="text-[16px] font-[500] text-[#333] mb-[16px]">
        公告
      </div> */}
      <div className="flex flex-col gap-y-[8px]">
        {
          data.map((item) => {
            const isLink = item.link;
            return (
              <div className="flex flex-row gap-x-[8px]" key={isLink}>
                <span className="text-[14px] text-[#BBB]">{item.date}</span>
                <div className="flex flex-row items-center">
                  <Tooltip
                    v2
                    trigger={
                      <p className={'text-[14px] text-[#333] truncate line-clamp-1 whitespace-normal w-full'}>
                        {item.content}
                      </p>
                    }
                    align="b"
                    arrowPointToCenter
                    popupClassName="notic-borad-tooltip bg-[#333] text-[14px] leading-[22px] p-[12px]"
                  >
                    {item.content}
                  </Tooltip>
                  {isLink && <a className="w-[62px] text-[14px] text-[#0077FF] active:text-[#0077FF] visited:text-[#0077FF]" href={item.link} target="_blank" rel="noreferrer">查看详情</a>}
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

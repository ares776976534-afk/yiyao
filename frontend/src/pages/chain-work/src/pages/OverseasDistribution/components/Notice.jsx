import React from 'react';
import { Balloon } from '@alifd/next';
import Block from '@/layouts/Block';

const dataList = [
  { content: '1.全球商机一键触达！商家们请注意，1688海外分销业务重磅上线啦！！！', link: 'https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/mExel2BLV54XZP33ubA4LLyoWgk9rpMq', btnText: '查看详情' },
  { content: '2.跨境新引擎！一文了解1688海外分销如何助您获取更多跨境分销店主', link: 'https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/QOG9lyrgJP3OoX66TBkMyNGrVzN67Mw4', btnText: '查看详情' },
  { content: '3.【1688海外分销】商家圈品、配置全流程', link: 'https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/QOG9lyrgJP3OoX66TBkMyr7OVzN67Mw4', btnText: '操作指南' },
];
function Notice() {
  return (
    <Block
      title={
        <div className="text-[16px] text-[#333] font-medium flex items-center leading-[19px]">
          <img className="w-[13.3px] h-[14.5px]" src="https://img.alicdn.com/imgextra/i2/O1CN01sSfbVY1jWhXOM3sK8_!!6000000004556-2-tps-32-32.png" alt="" srcSet="" />
          <span className="text-[16px] text-[#333] font-medium leading-[19px] ml-[4px]">公告</span>
        </div>
      }
      className="mb-[12px]"
    >
      <div className="mt-[12px]">
        {dataList?.map((ele, i) => {
          const isLink = ele.link;
          return (
            <div key={i} className={`flex justify-between items-center leading-[17px] text-[#333] ${dataList.length - 1 === i ? '' : 'mb-[8px]'}`}>
              {ele.title?.length < 32 ? (
                <span className="text-[14px] text-[#333] text-ellipsis line-clamp-1">{ele.content}</span>
              ) : (
                <Balloon.Tooltip
                  trigger={<div className="text-[14px] text-ellipsis line-clamp-1">{ele.content}</div>}
                  align="t"
                  popupStyle={{ backgroundColor: '#333' }}
                  popupClassName="products-business-tooltips"
                >
                  {ele.content}
                </Balloon.Tooltip>
              )}
              {isLink && <a className="w-[56px] text-[14px] text-[#0077FF] active:text-[#0077FF] visited:text-[#0077FF]" href={ele.link} target="_blank" rel="noreferrer">{ele.btnText}</a>}
            </div>
          );
        })}
      </div>
    </Block>
  );
}

export default Notice;

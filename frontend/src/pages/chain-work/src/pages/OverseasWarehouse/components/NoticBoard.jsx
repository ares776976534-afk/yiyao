import React, { useState, useEffect } from 'react';
import { Balloon } from '@alifd/next';
import './NoticBoard.scss';
import MarginDeposit from '@/pages/CrossBorderOfferlist/components/MarginDeposit';
import { getOwBusinessBacklog } from '@/pages/OverseasWarehouse/services';
import { getResourceById } from '@/utlis';
import Message from '@/components/UI/Message';

const { Tooltip } = Balloon;

export default ({ callback }) => {
  const [businessBacklog, setBusinessBacklog] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    getResourceById(48017355)
      .then((res) => {
        setData(res);
      });
    getOwBusinessBacklog().then((res) => {
      const { model = [], success = false, msg = '系统异常' } = res;
      if (success) {
        setBusinessBacklog(model);
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    });
  }, []);
  const onClick = (actionCode) => {

    switch (actionCode) {
      case 'OW_BOND_PAY': // 去缴纳or去缴纳
        return window.open('https://work.1688.com/?_path_=sellerPro/lvyue/protectionService', '_blank');
      case 'OW_OFFER_EDIT': // 去修改
        return callback();
      default:
        return null;
    }
  };
  return (
    <div className="flex">
      <div className="py-[12px] px-[20px] bg-[#FFF] rounded-[6px] flex-1">
        <div className="text-[16px] font-[500] text-[#333] mb-[16px]">
          公告
        </div>
        <div className="flex flex-col gap-y-[8px]">
          <div className="text-[14px] text-[#333] truncate line-clamp-1 whitespace-normal w-full">
            商家您好，请您在本页面完成入驻流程，入驻成功后即可发布海外仓商品，有任何疑问可
            <span className="text-[#07f] cursor-pointer text-[13px]" onClick={() => window.open('https://qr.dingtalk.com/action/joingroup?code=v1,k1,GJvKXhYGULa/epzAbyLkYsXsn2wf710V91G4oeA/x4Q=&_dt_no_comment=1&origin=11?', '_blank')}>点击加入</span>
            官方钉钉群。
          </div>
          {/* {
            data.map((item) => {
              const isLink = item.link;
              return (
                <div className="flex flex-row gap-x-[8px]" key={isLink}>
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
          } */}
        </div>
      </div>
      {businessBacklog.length > 0 && <MarginDeposit list={businessBacklog} onClick={onClick} />}
    </div>
  );
};

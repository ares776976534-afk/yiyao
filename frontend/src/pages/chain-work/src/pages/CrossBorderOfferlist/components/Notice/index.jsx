import React, { useEffect, useState } from 'react';
import { getTextList, getBusinessBacklog } from '../../api';
import './index.scss';
import { Button, Balloon } from '@alifd/next';
import Message from '@/components/UI/Message';

const { Tooltip } = Balloon;

export default () => {
  const [data, setData] = useState([]);
  const [businessBacklog, setBusinessBacklog] = useState([]);

  useEffect(() => {
    getTextList().then((res) => {
      setData(res.data);
    });
    getBusinessBacklog().then((res) => {
      const { model = [], success = false, msg = '系统异常' } = res;
      if (success) {
        setBusinessBacklog(model);
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.msg || '系统异常', type: 'error' });
    });
  }, []);
  const jumpAddress = (param) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('type', 'qqyx');
    const { origin, search } = currentUrl;
    window.open(`${origin}/app/channel-fe/chain-work/${param}.html${search}`, '_blank');
  };
  const onClick = (actionCode) => {
    switch (actionCode) {
      case 'PWS_ALERT_CONFIRM':
        return jumpAddress('weightwaring');
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center mt-[16px]">
      <div className="notice-content flex-1 rounded-[6px]">
        {
          data.map((item, index) => {
            const num = index + 1;
            return (
              <div key={index} className="flex items-center">
                {num}、
                <Tooltip
                  trigger={<div className="text-ellipsis line-clamp-1 mr-[8px] flex-1">{item.text}</div>}
                  align="b"
                  popupStyle={{ backgroundColor: '#333' }}
                  popupClassName="products-business-tooltips"
                >
                  <div className="">{item.text}</div>
                </Tooltip>
                <div className="text-[#07f] cursor-pointer w-[184px]" onClick={() => { window.open(item.link, '_blank'); }}>{item.linkText}</div>
              </div>
            );
          })
        }
      </div>
      {/* {businessBacklog.length > 0 ? businessBacklog?.map(({ title, backlogFormat, effect, backlog, action, actionCode }) => {
        const [beforeValue, afterValue] = backlog.split('{value}');
        const valueElement = <span className="text-[#333] text-[18px] leading-[22px] mr-[4px] font-medium">{backlogFormat}</span>;
        return (
          <div className="py-[12px] px-[20px] w-[372px] ml-[16px] bg-[#fff] rounded-[6px] relative overflow-hidden">
            <div className="flex items-center mb-[14px] mt-[8.5px]">
              <div className="text-[#333] text-[16px] font-medium leading-[19px] mr-[8px]">{title}</div>
            </div>
            <div className="flex items-center justify-between mb-[8px]">
              <div>
                {beforeValue}
                {valueElement}
                <span className="text-[#666] text-[14px]">{afterValue}</span>
              </div>
              <div>
                <Button type="primary" style={{ zIndex: 1000, borderRadius: '6px', width: '74px', height: '32px' }} onClick={() => onClick(actionCode)}>{action}</Button>
              </div>
              <img className="absolute right-[40px] top-[-14px] w-[123px] h-[114px]" src="https://img.alicdn.com/imgextra/i2/O1CN01mmRouT1rC6g6l0bnG_!!6000000005594-2-tps-246-228.png" alt="" srcSet="" />
            </div>
          </div>
        );
      }) : (
        <div className="py-[12px] px-[20px] w-[372px] ml-[16px] bg-[#fff] rounded-[6px] relative overflow-hidden">
          <div className="flex items-center justify-center h-[82px]">
            <div className="text-[#999] text-[14px]">暂无需优化内容</div>
          </div>
        </div>
      )} */}
    </div>
  );
};

import React from 'react';
import { Icon } from '@alifd/next';
import './index.scss';

function ImportantReminder() {
  return (
    <div className="h-[84px] rounded-[3px] opacity-100 flex flex-col p-[12px] self-stretch bg-[#E6F2FF] text-[#666] text-[13px] mt-[16px]">
      <div className="important-reminder-icon mb-[8px]" style={{ lineHeight: 'normal' }}>
        <Icon type="ic_info1" className="mr-[8px]" style={{ color: '#0077FF', fontWeight: 600 }} />
        <span className="text-[#333] text-[15px]">
          重要提醒：
        </span>
      </div>
      <div style={{ lineHeight: 'normal' }}>
        您需要遵守相关规则：
        <a href="https://www.yuque.com/docs/share/b0b0d0f3-d0d3-4f0d-a0d3-d0c0b0d0d0d0" target="_blank">商家准入条件</a> ｜
        <a href="https://www.yuque.com/docs/share/b0b0d0f3-d0d3-4f0d-a0d3-d0c0b0d0d0d0" target="_blank">商品准入条件</a> ｜
        <a href="https://www.yuque.com/docs/share/b0b0d0f3-d0d3-4f0d-a0d3-d0c0b0d0d0d0" target="_blank">跨境专供默认规则</a> ｜
        <a href="https://www.yuque.com/docs/share/b0b0d0f3-d0d3-4f0d-a0d3-d0c0b0d0d0d0" target="_blank">禁限售规则</a>
      </div>
      <div style={{ lineHeight: 'normal' }}>
        ERP渠道要求：48小时发货、至少一张白底图、少货必配、一件起批、价格力商品。英文版渠道要求：商品主图干净整洁无文字、至少一张白底图。
      </div>
    </div>
  );
}

export default ImportantReminder;

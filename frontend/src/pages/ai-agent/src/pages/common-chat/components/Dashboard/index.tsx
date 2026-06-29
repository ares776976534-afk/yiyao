import React from 'react';
import ChatInput from '@/pages/select-product/components/ChatInput';
import { StatusEnum } from '@/pages/select-product/config';
import DemoList from '@/pages/agent-home/components/DemoList';
import { Scence } from '@/pages/select-product/components/ChatHistory/HistoryList';
import { $t } from '@/i18n';

interface DashboardProps {
  onSubmit: (formData: any) => void;
  status?: StatusEnum;
  defaultValue?: any;
}

export default ({ onSubmit, status, defaultValue }: DashboardProps) => {
  return (
    <>
      <ChatInput
        onSubmit={onSubmit}
        placeholder={$t("global-1688-ai-app.common-chat.Dashboard.qtdysFehVgr", "请输入您在跨境电商运营中遇到的问题，例如：FBA费用怎么算？如何避免侵权？VAT注册流程？")}
        defaultValue={defaultValue}
      />
      <div className="mt-[100px]">
        <DemoList scene={Scence.CONSULT} />
      </div>
    </>
  );
};
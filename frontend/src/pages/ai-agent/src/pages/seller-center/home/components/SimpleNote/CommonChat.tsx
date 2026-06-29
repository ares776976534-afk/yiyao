import React from 'react';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import ChatInput from '@/pages/select-product/components/ChatInput';
import { $t } from '@/i18n';
import SendButton from '../SendButton';

export default ({ defaultValue, ...props }: { defaultValue?: any }) => {
  const { navigateByCache } = useChatQuery();

  const handleSubmit = (data: any) => {
    navigateByCache({ chatInput: data, url: '/chat' });
  };

  const handleInputFocus = () => {
    // 发送自定义事件，通知输入框已激活
    const event = new CustomEvent('chatInputFocus', {
      detail: {},
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="w-[800px]">
      <ChatInput
        onSubmit={handleSubmit}
        fancy
        placeholder={$t("global-1688-ai-app.common-chat.Dashboard.qtdysFehVgr", "请输入您在跨境电商运营中遇到的问题，例如：FBA费用怎么算？如何避免侵权？VAT注册流程？")}
        defaultValue={defaultValue}
        sendButton={<SendButton />}
        onFocus={handleInputFocus}
      />
    </div>
  );
};
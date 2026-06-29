import React from 'react';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { CustomChatInput } from '@/pages/select-product/general-agent/components/ReqComponent';
import SendButton from '../SendButton';

export default () => {
  const { navigateByCache } = useChatQuery();

  const handleSubmit = async (data: any) => {
    navigateByCache({ chatInput: data, url: '/select-product/general-agent' });
  };

  return (
    <div
      className="flex flex-col gap-6 w-[var(--agentsContainer-width)]"
    >
      <CustomChatInput
        onSubmit={handleSubmit}
        sendButton={<SendButton />}
      />
    </div>
  );
};
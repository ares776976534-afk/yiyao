import React from 'react';
import NewHomeContent from '@/pages/inquiry/components/NewHomeContent';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';

export default () => {
  const { navigateByCache } = useChatQuery();

  return (
    <div className="w-[800px]">
      <NewHomeContent
        onNewClick={() => {
          navigateByCache({ chatInput: {}, url: '/inquiry' });
        }}
      />
    </div>
  );
};
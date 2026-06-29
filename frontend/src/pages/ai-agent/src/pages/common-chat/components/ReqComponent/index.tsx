import React, { useState, useEffect } from 'react';
import { StatusEnum } from '@/pages/select-product/config';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { AgentHomeContent } from '@/pages/agent-home';
import Dashboard from '../Dashboard';
import CustomTitle from '@/pages/select-product/home/components/CustomTitle';
import styles from './index.module.css';
import { $t } from '@/i18n';
import { isGlobal } from "@/utils/env";

interface ReqComponentProps {
  onSubmit: (formattedPayload: any) => void;
  status: StatusEnum;
}

const ReqComponent: React.FC<ReqComponentProps> = ({ onSubmit, status }) => {
  const { chatInput, isMakeSimilar } = useChatQuery();

  useEffect(() => {
    if (chatInput && !isMakeSimilar) {
      handleSubmit(chatInput);
    }
  }, [chatInput]);

  const handleSubmit = (formData) => {
    onSubmit?.({
      // ...formData,
      query: formData.inputValue,
      __submit_type__: 'user_input',
    });
  };

  return status === StatusEnum.RUNNING ? null : (
    <AgentHomeContent>
      <CustomTitle
        title={isGlobal ? $t("global-1688-ai-app.common-chat.ReqComponent.clonsGlobal", "政策 · 经营 · 百科 咨询Agent全解答") : $t("global-1688-ai-app.common-chat.ReqComponent.clons", "咨询Agent全解答")}
        colorTitle={$t("global-1688-ai-app.common-chat.ReqComponent.zcjybk", "政策·经营·百科")}
      />
      <div className={styles.container}>
        <Dashboard onSubmit={handleSubmit} status={status} defaultValue={chatInput} />
      </div>
    </AgentHomeContent>
  );
};

export default ReqComponent;

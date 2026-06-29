import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'ice';
import styles from './index.module.css';
import { StatusEnum } from '@/pages/select-product/config';
import CustomChatInput from '../CustomChatInput';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { AgentHomeContent } from '@/pages/agent-home';
import DemoList from '@/pages/agent-home/components/DemoList';
import CustomTitle from '@/pages/select-product/home/components/CustomTitle';
import { $t } from '@/i18n';
import { googleRecord } from '@/utils/log';

interface ReqComponentProps {
  onSubmit: (formattedPayload: any) => void;
  status: StatusEnum;
}

const ReqComponent: React.FC<ReqComponentProps> = ({ onSubmit, status }) => {
  const { chatInput, isMakeSimilar } = useChatQuery();
  const [searchParams] = useSearchParams();
  // 检查是否是自动提交模式（从其他页面跳转过来）
  const isAutoSubmit = useMemo(() => {
    return searchParams.get('__auto_submit__') === 'true';
  }, [searchParams]);
  useEffect(() => {
    if (chatInput && !isMakeSimilar) {
      handleSubmit(chatInput);
    }
  }, [chatInput]);

  const handleSubmit = (formData) => {
    googleRecord('sourcing_submit', {}, '/');
    onSubmit?.({
      ...formData,
      __submit_type__: 'user_input',
    });
  };
  // 运行中或自动提交模式下不显示初始界面
  if (status === StatusEnum.RUNNING || isAutoSubmit) {
    return null;
  }
  return (
    <AgentHomeContent>
      <CustomTitle
        title={$t("global-1688-ai-app.select-business.ReqComponent.z8o", "直达1688源头好商")}
        colorTitle={$t("global-1688-ai-app.select-business.ReqComponent.stzzcs", "识图 · 找款 · 搜厂")}
      />
      <div className={styles.container}>
        <CustomChatInput
          onSubmit={handleSubmit}
          defaultValue={chatInput}
        />
        <div className="mt-[120px]">
          <DemoList scene="FIND_PROVIDER" />
        </div>
      </div>
    </AgentHomeContent>
  );
};

export default ReqComponent;

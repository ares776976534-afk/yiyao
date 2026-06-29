import React, { useEffect, useRef } from 'react';
import { StatusEnum } from '@/pages/select-product/config';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { AgentHomeContent } from '@/pages/agent-home';
import Dashborad from '../Dashborad';
import { useChatHistory } from '@/pages/select-product/components/ChatHistory/useChatHistory';
import CustomTitle from '@/pages/select-product/home/components/CustomTitle';
import { useSearchParams } from 'ice';
import { $t } from '@/i18n';
import { isGlobal } from "@/utils/env";
interface ReqComponentProps {
  onSubmit: (formattedPayload: any) => void;
  status: StatusEnum;
}

const ReqComponent: React.FC<ReqComponentProps> = ({ onSubmit, status }) => {
  const { chatInput } = useChatQuery();
  const { chatHistorySessionId } = useChatHistory();
  const [searchParams] = useSearchParams();
  const fromPage = searchParams.get('fromPage');
  const offerIds = searchParams.get('offerIds');
  const memberIds = searchParams.get('memberIds');
  const taskId = searchParams.get('taskId'); // 复制任务时的任务ID
  const urlImageUrl = searchParams.get('imageUrl');
  const hasAutoTriggeredRef = useRef(false); // 防止重复触发

  const handleSubmit = React.useCallback((formData?: any) => {
    onSubmit?.({
      ...formData || {},
    });
  }, [onSubmit]);

  useEffect(() => {
    if (chatInput) {
      handleSubmit(chatInput);
    }
  }, [chatInput]);

  useEffect(() => {
    if (chatHistorySessionId) {
      handleSubmit({
        sessionId: chatHistorySessionId,
      });
    }
  }, [chatHistorySessionId]);

  // 检测URL参数，如果有fromPage和(offerIds或memberIds)，或有taskId，自动触发创建新任务
  useEffect(() => {
    // 只在非运行状态且未触发过的情况下执行
    if (status !== StatusEnum.RUNNING && !hasAutoTriggeredRef.current) {
      // 如果有fromPage和(offerIds或memberIds)参数，自动触发创建新任务
      if (fromPage && (offerIds || memberIds || urlImageUrl || taskId)) {
        hasAutoTriggeredRef.current = true;
        // 延迟一下，确保页面已经渲染完成
        setTimeout(() => {
          handleSubmit({
            fromPage,
            offerIds,
            memberIds,
            imageUrl: urlImageUrl,
            taskId,
          });
        }, 300);
      }
    }
  }, [status, searchParams, handleSubmit, taskId]);

  return (status === StatusEnum.RUNNING || chatInput || chatHistorySessionId || fromPage || taskId) ? null : (
    <AgentHomeContent>
      <CustomTitle
        title={isGlobal ? $t("global-1688-ai-app.inquiry.ReqComponent.hbmuchjbflGlobal", "智能询盘 · AI议价 货比多家不费力") : $t("global-1688-ai-app.inquiry.ReqComponent.hbmuchjbfl", "货比多家不费力")}
        colorTitle={$t("global-1688-ai-app.inquiry.ReqComponent.znxpAIyj", "智能询盘 · AI议价")}
      />
      <Dashborad
        onNewClick={handleSubmit}
      />
    </AgentHomeContent>
  );
};

export default ReqComponent;

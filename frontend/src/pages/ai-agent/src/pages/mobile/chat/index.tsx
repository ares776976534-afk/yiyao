import { useSearchParams, definePageConfig } from 'ice';
import AgentHeader from '../components/AgentHeader';
import { MOBILE_AGENT_CONFIG } from '../config/agentConfig';
import Framework from '../components/framework';
import Agents from '@/pages/mobile-agent-home/components/Agents';
import { AgentType } from '@/pages/mobile-agent-home/enum';
import { $t } from '@/i18n';
import MobileCommonChat from '@/pages/mobile-common-chat';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.mobile.chat.astg", "遨虾-咨询Agent"),
  spm: {
    spmB: 'mobile-common-chat-page',
  },
});

export default function Chat() {
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get('__share_code__') || '';

  if (shareCode) {
    return <MobileCommonChat />;
  }

  return (
    <Framework
      children={
        <AgentHeader
          {...MOBILE_AGENT_CONFIG.chat}
          children={
            <div>
              <Agents type={AgentType.COMMON_CHAT} />
            </div>
          }
        />
      }
    />
  );
}
import { useSearchParams, definePageConfig } from 'ice';
import AgentHeader from '../components/AgentHeader';
import { MOBILE_AGENT_CONFIG } from '../config/agentConfig';
import Framework from '../components/framework';
import Agents from '@/pages/mobile-agent-home/components/Agents';
import { AgentType } from '@/pages/mobile-agent-home/enum';
import { $t } from '@/i18n';
import MobileSelectBusiness from '@/pages/mobile-select-business';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.mobile.sourcing.axxsAgent", "遨虾-选商Agent"),
  spm: {
    spmB: 'mobile-select-business-page',
  },
});

export default function Sourcing() {
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get('__share_code__') || '';

  if (shareCode) {
    return <MobileSelectBusiness />;
  }

  return (
    <Framework
      children={
        <AgentHeader
          {...MOBILE_AGENT_CONFIG.sourcing}
          children={
            <div>
              <Agents type={AgentType.SELECT_SELLER} />
            </div>
          }
        />
      }
    />
  );
}
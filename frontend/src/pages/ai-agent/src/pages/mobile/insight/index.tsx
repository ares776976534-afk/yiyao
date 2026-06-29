import { useSearchParams, definePageConfig } from 'ice';
import AgentHeader from '../components/AgentHeader';
import { MOBILE_AGENT_CONFIG } from '../config/agentConfig';
import Framework from '../components/framework';
import Agents from '@/pages/mobile-agent-home/components/Agents';
import { AgentType } from '@/pages/mobile-agent-home/enum';
import { $t } from '@/i18n';
import MobileSelectProduct from '@/pages/mobile-select-product';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.mobile.insight.axxpAgent", "遨虾-选品Agent"),
  spm: {
    spmB: 'mobile-select-product-page',
  },
});

export default function Insight() {
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get('__share_code__') || '';

  if (shareCode) {
    return <MobileSelectProduct />;
  }
  return (
    <Framework
      children={
        <AgentHeader
          {...MOBILE_AGENT_CONFIG.insight}
          children={
            <div>
              <Agents type={AgentType.SELECT_PRODUCT} />
            </div>
          }
        />
      }
    />
  );
}
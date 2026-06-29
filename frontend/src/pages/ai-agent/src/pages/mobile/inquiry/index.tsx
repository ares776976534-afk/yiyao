import { definePageConfig, useSearchParams } from 'ice';
import AgentHeader from '../components/AgentHeader';
import { MOBILE_AGENT_CONFIG } from '../config/agentConfig';
import Framework from '../components/framework';
// import { Task } from './components/task';
// import AgentFooter from "@/pages/mobile/components/AgentFooter";
// import styles from './index.module.scss';
import { $t } from '@/i18n';
import MobileInquiry from '@/pages/mobile-inquiry';
import Agents from '@/pages/mobile-agent-home/components/Agents';
import { AgentType } from '@/pages/mobile-agent-home/enum';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.mobile.inquiry.axxpAgent", "遨虾-询盘Agent"),
  spm: {
    spmB: 'mobile-inquiry-list-page',
  },
});

export default function Inquiry() {
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get('__share_code__') || '';

  if (shareCode) {
    return <MobileInquiry />;
  }

  return (
    <Framework
      type="supplier"
      children={
        <AgentHeader
          {...MOBILE_AGENT_CONFIG.inquiry}
          children={
            // <div className={styles.inquiryPage}>
            //   <Task />
            //   <AgentFooter />
            // </div>
            <Agents type={AgentType.INQUIRY} />
          }
        />
      }
    />
  );
}
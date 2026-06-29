import MobileAgentHome from '@/pages/mobile-agent-home';
import { definePageConfig } from 'ice';
import { $t } from '@/i18n';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.mobile.home.ase", "遨虾-跨境电商生意Agent"),
  spm: {
    spmB: 'mobile-agent-home-page',
  },
});

export default function Home() {
  return (
    <MobileAgentHome />
    // <Framework children={<MobileAgentHome />} type='home' />
  );
}
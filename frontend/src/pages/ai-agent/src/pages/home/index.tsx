import React from "react";
import { definePageConfig } from 'ice';
import AgentHome from '../agent-home';
import { $t } from '@/i18n';

export default function Home() {
  return <AgentHome />;
}

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.home.ase", "遨虾-跨境电商生意Agent"),
  spm: {
    spmB: 'agent-home-page',
  },
});
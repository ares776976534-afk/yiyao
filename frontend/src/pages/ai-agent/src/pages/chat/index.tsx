import React from 'react';
import CommonChat from '../common-chat';
import { definePageConfig } from 'ice';
import { $t } from '@/i18n';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.chat.astg", "遨虾-咨询Agent"),
  spm: {
    spmB: 'common-chat-page',
  },
});

export default function Chat() {
  return <CommonChat />;
}
import React from 'react';
import SelectProductHome from '../select-product/home';
import { definePageConfig } from 'ice';
import { $t } from '@/i18n';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.insight.axxpAgent", "遨虾-选品Agent"),
  spm: {
    spmB: 'select-product-home-page',
  },
});

export default function Insight() {
  return <SelectProductHome />;
}
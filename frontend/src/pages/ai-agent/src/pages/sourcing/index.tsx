import React from 'react';
import { definePageConfig } from 'ice';
import SelectBusiness from '../select-business';
import { $t } from '@/i18n';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.sourcing.axxsAgent", "遨虾-选商Agent"),
  spm: {
    spmB: 'select-business-page',
  },
});

export default function Sourcing() {
  return <SelectBusiness />;
}

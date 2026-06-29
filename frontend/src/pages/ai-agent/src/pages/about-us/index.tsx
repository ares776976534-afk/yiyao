import React from 'react';
import SellerCenterHome from '../seller-center/home';
import { definePageConfig } from 'ice';
import { $t } from '@/i18n';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.about-us.ajA", "遨虾-AI跨境电商运营Agent"),
  spm: {
    spmB: 'seller-center-home',
  },
});


export default function AboutUs() {
  return <SellerCenterHome />;
}
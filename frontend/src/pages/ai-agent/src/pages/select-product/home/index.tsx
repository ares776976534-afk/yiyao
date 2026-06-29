import React from 'react';
import Layout from '../components/Layout';
import Content from './components/Content';
import { AgentHomeContent } from '@/pages/agent-home';
import ChatHistory from '../components/ChatHistory';
import { Scence } from '../components/ChatHistory/HistoryList';
import { definePageConfig } from 'ice';
import { $t } from '@/i18n';
import CustomTitle from './components/CustomTitle';
import { LOG_KEYS } from '@/utils/logConfig';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.select-product.home.xpfx", "选品发现"),
  spm: {
    spmB: 'select-product-home-page',
  },
});

export default () => {
  return (
    <Layout showBanner>
      <AgentHomeContent>
        <CustomTitle
          title={$t("global-1688-ai-app.select-product.home.zczjxp", "直出专家选品")}
          colorTitle={$t("global-1688-ai-app.select-product.home.lhhotdgk", "蓝海·热点·改款")}
        />
        <Content
          logKeys={{
            INSIGHT_CLICK: LOG_KEYS.SELECT_PRODUCT_HOME.CHATBOX.INSIGHT_CLICK,
            INSIGHT_CHANNEL: LOG_KEYS.SELECT_PRODUCT_HOME.CHATBOX.INSIGHT_CHANNEL,
            INSIGHT_COUNTRY: LOG_KEYS.SELECT_PRODUCT_HOME.CHATBOX.INSIGHT_COUNTRY,
          }}
          cardLogKeys={{
            IMG_SEARCH: LOG_KEYS.SELECT_PRODUCT_HOME.CARD.IMG_SEARCH,
            INSIGHT_NEW: LOG_KEYS.SELECT_PRODUCT_HOME.CARD.INSIGHT_NEW,
            INSIGHT_IMPROVE: LOG_KEYS.SELECT_PRODUCT_HOME.CARD.INSIGHT_IMPROVE,
            INSIGHT_PLATFORM: LOG_KEYS.SELECT_PRODUCT_HOME.CARD.INSIGHT_PLATFORM,
            INSIGHT_COUNTRY: LOG_KEYS.SELECT_PRODUCT_HOME.CARD.INSIGHT_COUNTRY,
          }}
          showcaseLogKeys={{
            VIEW: LOG_KEYS.SELECT_PRODUCT_HOME.SHOWCASE.INSIGHT_VIEW,
            SAME: LOG_KEYS.SELECT_PRODUCT_HOME.SHOWCASE.INSIGHT_SAME,
          }}
        />
        <div className="absolute top-[20px] left-[24px] z-[2]">
          <ChatHistory
            scence={[Scence.ALGO, Scence.NEW_PRODUCT_DISCOVERY, Scence.PRODUCT_IMPROVEMENT, Scence.PLATFORM_MARKET_MIGRATION, Scence.COUNTRY_MARKET_MIGRATION, Scence.GENERAL_IMAGE_SEARCH, Scence.API_NEW_PRODUCT_DISCOVERY]}
            btnText={$t("global-1688-ai-app.select-product.home.xpls", "选品历史")}
            titleText={$t("global-1688-ai-app.select-product.home.xplsjl", "选品历史记录")}
            historyLogKey={LOG_KEYS.SELECT_PRODUCT_HOME.HISTORY}
          />
        </div>
      </AgentHomeContent>
    </Layout>
  );
};

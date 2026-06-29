import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { definePageConfig } from 'ice';
import { ConfigProvider, App } from 'antd';
import { StoreProvider } from '@/stores/context';
import { SelectProductProvider, useSelectProductStore } from '@/stores/select-product';
import { storeServices } from '@/services/studio/storeServices';
import { injectAllCSSVars } from '@/utils/cssVariables';
import theme from '@/theme/default.json';
import SelectContainer from '../components/SelectContainer';
import { StatusEnum } from '@/pages/select-product/config';
import FormatList from './components/FormatList';
import { selApiBaseUrl, isBeta } from '@/utils/env';
import { postAgentLayoutEvent } from '@/components/AgentLayout';
import ReqComponent from './components/ReqComponent';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import { $t } from '@/i18n';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';


export const CONFIRM_PLAN_FETCH_URL = isBeta ? `${selApiBaseUrl}/api/product-selection` : `${selApiBaseUrl}/opp/sel/api/algo/execute`;

// 通用选品
const SelectProductContent = observer(() => {
  const selectProductStore = useSelectProductStore();
  const navigator = useNavigateWithScroll();
  return (
    <SelectContainer
      title={selectProductStore.status === StatusEnum.RUNNING ? $t("global-1688-ai-app.select-product.general-agent.tyxp", "通用选品") : ''}
      fetchUrl={CONFIRM_PLAN_FETCH_URL}
      reqComponent={<ReqComponent
        status={selectProductStore.status}
        onSubmit={(formattedPayload) => {
          log.record(LOG_KEYS.GENERAL_AGENT.LP.CONFIRM, 'CLK', { query: formattedPayload?.query || '' });
          selectProductStore.setFormattedPayload(formattedPayload);
          selectProductStore.setFormSubmitted(true);
          selectProductStore.setStatus(StatusEnum.RUNNING);
          postAgentLayoutEvent({
            key: 'closeCollapse',
          });
        }}
      />}
      formatFnList={FormatList}
      showChatInput={selectProductStore.status === StatusEnum.RUNNING}
      contentStyle={{ overflow: 'hidden' }}
      showTaskProgress={false}
      showUserInfo={selectProductStore.isFormSubmitted ? false : true}
      showMakeSimilar={false}
      onBack={() => navigator('/insight', { replace: true })}
    />
  );
});

const SelectProductPage = observer(() => {
  // 注入所有CSS变量
  useEffect(() => {
    injectAllCSSVars();
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <App>
        <StoreProvider services={storeServices}>
          <SelectProductProvider>
            <SelectProductContent />
          </SelectProductProvider>
        </StoreProvider>
      </App>
    </ConfigProvider>
  );
});

export default SelectProductPage;

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.select-product.general-agent.tyxp", "遨虾-选品Agent"),
  spm: {
    spmB: 'general-agent-page',
  },
});
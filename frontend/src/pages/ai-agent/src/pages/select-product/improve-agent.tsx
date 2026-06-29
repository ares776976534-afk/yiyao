import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { definePageConfig } from 'ice';
import { ConfigProvider, App } from 'antd';
import { StoreProvider } from '@/stores/context';
import { SelectProductProvider, useSelectProductStore } from '@/stores/select-product';
import { storeServices } from '@/services/studio/storeServices';
import { injectAllCSSVars } from '@/utils/cssVariables';
import theme from '@/theme/default.json';
import SelectContainer from './components/SelectContainer';
import { StatusEnum } from '@/pages/select-product/config';
import { improveFormatList, ImproveRequirement } from './components/ImproveComponents';
import { selApiBaseUrl } from '@/utils/env';
import { postAgentLayoutEvent } from '@/components/AgentLayout';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import log, { commonRecord } from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { $t } from '@/i18n';

// 改进助手
const SelectProductContent = observer(() => {
  const selectProductStore = useSelectProductStore();
  const navigator = useNavigateWithScroll();
  return (
    <SelectContainer
      title={$t("global-1688-ai-app.select-product.improve-agent.pcp", "商品改进选品发现")}
      fetchUrl={`${selApiBaseUrl}/opp/sel/api/product-improve/execute`}
      reqComponent={<ImproveRequirement
        status={selectProductStore.status}
        userRequest={selectProductStore.userRequest}
        onSubmit={(formattedPayload) => {
          log.record(LOG_KEYS.IMPROVE_AGENT.LP.CONFIRM, 'CLK', { query: formattedPayload?.query || '' });
          selectProductStore.setFormattedPayload(formattedPayload);
          commonRecord('确定需求');
          selectProductStore.setFormSubmitted(true);
          selectProductStore.setStatus(StatusEnum.RUNNING);
          postAgentLayoutEvent({
            key: 'closeCollapse',
          });
        }}
      />}
      formatFnList={improveFormatList}
      showUserInfo={false}
      onBack={() => navigator('/insight', { replace: true })}
      containerStyle={"!bg-[#F9F9FC]"}
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
  title: $t("global-1688-ai-app.select-product.improve-agent.pcp", "商品改进选品发现"),
  spm: {
    spmB: 'improve-agent-page',
  },
});
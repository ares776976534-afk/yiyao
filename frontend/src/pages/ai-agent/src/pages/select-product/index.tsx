import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { definePageConfig } from 'ice';
import { ConfigProvider, App } from 'antd';
import { SelectProductProvider, useSelectProductStore } from '@/stores/select-product';
import { StoreProvider } from '@/stores/context';
import { storeServices } from '@/services/studio/storeServices';
import { injectAllCSSVars } from '@/utils/cssVariables';
import theme from '@/theme/default.json';
import SelectContainer from './components/SelectContainer';
import { Requirement } from './components/LeftComponents';
import { StatusEnum } from '@/pages/select-product/config';
import { productFormatList } from './components/format';
import { selApiBaseUrl } from '@/utils/env';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import { $t } from '@/i18n';
import log, { commonRecord } from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

const SelectProductContent = observer(() => {
  const selectProductStore = useSelectProductStore();
  const navigator = useNavigateWithScroll();

  return (
    <SelectContainer
      title={$t("global-1688-ai-app.select-product.jaa", "机会新品选品")}
      fetchUrl={`${selApiBaseUrl}/opp/sel/api/new-product/execute`}
      reqComponent={<Requirement
        status={selectProductStore.status}
        userRequest={selectProductStore.userRequest}
        onSubmit={(formattedPayload) => {
          log.record(LOG_KEYS.NEW_PRODUCT_AGENT.LP.CONFIRM, 'CLK', { query: formattedPayload?.query || '' });
          selectProductStore.setFormattedPayload(formattedPayload);
          commonRecord('确定需求');
          selectProductStore.setFormSubmitted(true);
          selectProductStore.setStatus(StatusEnum.RUNNING);
        }}
      />}
      formatFnList={productFormatList}
      showUserInfo={false}
      chatHistoryOptions={{
        titleText: $t("global-1688-ai-app.select-product.xplsjl", "选品历史记录"),
        btnText: $t("global-1688-ai-app.select-product.xpls", "选品历史"),
      }}
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
  title: $t("global-1688-ai-app.select-product.jaa", "遨虾-机会新品选品"),
  spm: {
    spmB: 'opportunity-new-product-agent-page',
  },
});
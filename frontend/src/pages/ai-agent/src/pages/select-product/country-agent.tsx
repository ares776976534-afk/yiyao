import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { definePageConfig } from 'ice';
import { ConfigProvider, App } from 'antd';
import { StoreProvider } from '@/stores/context';
import { SelectProductProvider, useSelectProductStore } from '@/stores/select-product';
import { storeServices } from '@/services/studio/storeServices';
import { injectAllCSSVars } from '@/utils/cssVariables';
import theme from '@/theme/default.json';
import SelectContainer from './components/SelectContainer';
import { selApiBaseUrl } from '@/utils/env';
import { countryFormatList } from './components/PlatformComponents';
import { CountryRequirement } from './components/CountryComponents';
import { postAgentLayoutEvent } from '@/components/AgentLayout';
import { useSearchParams } from 'ice';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import { $t } from '@/i18n';
import log, { commonRecord } from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

// 国家迁移助手
const Content = observer(() => {
  const selectProductStore = useSelectProductStore();
  const [searchParams] = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');
  const [values, setValues] = useState<any>({});
  const navigator = useNavigateWithScroll();

  return (
    <SelectContainer
      title={$t("global-1688-ai-app.select-product.country-agent.gjqyxpfx", "国家迁移选品发现")}
      fetchUrl={`${selApiBaseUrl}/opp/sel/api/market-migration/execute`}
      reqComponent={<CountryRequirement
        status={selectProductStore.status}
        userRequest={selectProductStore.userRequest}
        imageUrl={imageUrl || undefined}
        values={values}
        onSubmit={(formattedPayload) => {
          log.record(LOG_KEYS.COUNTRY_AGENT.LP.CONFIRM, 'CLK', { query: formattedPayload?.query || '' });
          commonRecord('确定需求');
          const imageUrlFromPayload = formattedPayload?.searchContexts?.find((item: any) => item.contentType === 'image_url')?.imageUrl;
          setValues({
            ...formattedPayload,
            searchImageReq: {
              imageUrl: imageUrlFromPayload || imageUrl,
            },
            preferenceReq: {
              providerPreferenceList: formattedPayload?.providerPreferenceList || []
            },
          });
          selectProductStore.setFormattedPayload(formattedPayload);
          // 标记表单已提交
          selectProductStore.setFormSubmitted(true);
          postAgentLayoutEvent({
            key: 'closeCollapse',
          });
        }}
      />}
      formatFnList={countryFormatList}
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
            <Content />
          </SelectProductProvider>
        </StoreProvider>
      </App>
    </ConfigProvider>
  );
});

export default SelectProductPage;

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.select-product.country-agent.gjqyxpfx", "国家迁移选品发现"),
  spm: {
    spmB: 'country-agent-page',
  },
});
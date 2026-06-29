import { useEffect, useRef, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { definePageConfig, useSearchParams } from 'ice';
import { ConfigProvider, App } from 'antd';
import { StoreProvider } from '@/stores/context';
import { SelectProductProvider, useSelectProductStore } from '@/stores/select-product';
import { storeServices } from '@/services/studio/storeServices';
import { injectAllCSSVars } from '@/utils/cssVariables';
import theme from '@/theme/default.json';
import SelectContainer from './components/SelectContainer';
import { StatusEnum } from '@/pages/select-product/config';
import { ImageSearchRequirement, imageSearchFormatList } from './components/ImageSearchComponents';
import { selApiBaseUrl } from '@/utils/env';
import { postAgentLayoutEvent } from '@/components/AgentLayout';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import { commonRecord } from '@/utils/log';
import { $t } from '@/i18n';

const SelectProductContent = observer(() => {
  const selectProductStore = useSelectProductStore();
  const navigator = useNavigateWithScroll();
  const [searchParams] = useSearchParams();
  const actionType = searchParams.get('actionType');
  const productIdList = searchParams.get('productIdList');
  const platform = searchParams.get('platform');
  const region = searchParams.get('region');
  const biId = searchParams.get('biId');
  const isOdDirectFlow = Boolean(biId?.trim());
  const fetchUrl = useMemo(
    () =>
      isOdDirectFlow
        ? `${selApiBaseUrl}/opp/sel/api/od/execute`
        : `${selApiBaseUrl}/opp/sel/api/image-search/execute`,
    [isOdDirectFlow],
  );
  const odAutoSubmitRef = useRef(false);
  useEffect(() => {
    if (!isOdDirectFlow || odAutoSubmitRef.current) return;
    odAutoSubmitRef.current = true;
    selectProductStore.setFormattedPayload({
      actionType: actionType?.trim() ?? '',
      actionContext: {
        productIdList: productIdList
          ? productIdList.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        platform: platform?.trim() ?? '',
        region: region?.trim() ?? '',
        biId: biId!.trim(),
      },
      __submit_type__: 'user_input',
    });
    commonRecord('确定需求');
    selectProductStore.setFormSubmitted(true);
    selectProductStore.setStatus(StatusEnum.RUNNING);
    postAgentLayoutEvent({
      key: 'closeCollapse',
    });
  }, [isOdDirectFlow, actionType, productIdList, biId, selectProductStore, platform, region]);
  return (
    <SelectContainer
      title={$t('global-1688-ai-app.select-product.image-search-agent.title', '图搜全球商机')}
      fetchUrl={fetchUrl}
      showTaskProgress={!actionType}
      reqComponent={<ImageSearchRequirement
        status={selectProductStore.status}
        userRequest={selectProductStore.userRequest}
        onSubmit={(formattedPayload) => {
          selectProductStore.setFormattedPayload(formattedPayload);
          commonRecord('确定需求');
          // 标记表单已提交
          selectProductStore.setFormSubmitted(true);
          selectProductStore.setStatus(StatusEnum.RUNNING);
          postAgentLayoutEvent({
            key: 'closeCollapse',
          });
        }}
      />}
      formatFnList={imageSearchFormatList}
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
            {/* <IconPreview /> */}
          </SelectProductProvider>
        </StoreProvider>
      </App>
    </ConfigProvider>
  );
});

export default SelectProductPage;

export const pageConfig = definePageConfig({
  title: '图搜全球商机',
  spm: {
    spmB: 'improve-agent-page',
  },
});
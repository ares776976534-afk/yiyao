import { useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { definePageConfig, useSearchParams } from 'ice';
import { ConfigProvider, App } from 'antd';
import { StoreProvider } from '@/stores/context';
import { SelectProductProvider, useSelectProductStore } from '@/stores/select-product';
import { storeServices } from '@/services/studio/storeServices';
import { injectAllCSSVars } from '@/utils/cssVariables';
import theme from '@/theme/default.json';
import SelectContainer from '../select-product/components/SelectContainer';
import { StatusEnum } from '@/pages/select-product/config';
import FormatList from './components/FormatList';
import { postAgentLayoutEvent } from '@/components/AgentLayout';
import ReqComponent from './components/ReqComponent';
import CustomChatInput from './components/CustomChatInput';
import { Scence } from '../select-product/components/ChatHistory/HistoryList';
// import ProductSearchTable from './components/ProductSearchTable';
// import { IconPreview } from '@/components/icon-preview';
import PreSelectBusiness from './components/PerSelectBusiness';
import { SELECT_PROVIDER_FETCH_URL } from './constants';
// import SupplierSearchTable from './components/SupplierSearchTable';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import { $t } from '@/i18n';
import { LOG_KEYS } from '@/utils/logConfig';

// 通用选品
const SelectProductContent = observer(() => {
  const selectProductStore = useSelectProductStore();
  const [searchParams] = useSearchParams();
  /** 不允许删除 开始 （这里有一个奇怪的现象，如果不执行这段代码，CustomChatInput组件，不会触发出现渲染） */
  const formattedPayload1 = selectProductStore.getFormattedPayload();
  const navigator = useNavigateWithScroll();
  /** 不允许删除 结束 */

  const searchImageUrl = searchParams.get('searchImageUrl');
  const keyword = searchParams.get('keyword');

  // 检查是否是自动提交模式（从其他页面跳转过来）
  const isAutoSubmit = useMemo(() => {
    return searchParams.get('__auto_submit__') === 'true';
  }, [searchParams]);

  // URL 带有 searchImageUrl 或 keyword 时，自动提交并回显
  useEffect(() => {
    if (!searchImageUrl && !keyword) return;

    const autoPayload = { intention: 'AUTO', __submit_type__: 'user_input' };
    selectProductStore.setFormattedPayload(
      searchImageUrl ? { ...autoPayload, searchImageUrl } : { ...autoPayload, query: keyword },
    );
    selectProductStore.setFormSubmitted(true);
    selectProductStore.setStatus(StatusEnum.RUNNING);
    postAgentLayoutEvent({ key: 'closeCollapse' });
  }, [searchImageUrl, keyword]);

  // useEffect(() => {
  //   document.title = '选商';
  // }, []);
  return (
    <SelectContainer
      showBanner
      title={selectProductStore.status === StatusEnum.RUNNING ? $t("global-1688-ai-app.select-business.xs", "选商") : ''}
      fetchUrl={SELECT_PROVIDER_FETCH_URL}
      reqComponent={<ReqComponent
        status={selectProductStore.status}
        onSubmit={(formattedPayload) => {
          selectProductStore.setFormattedPayload(formattedPayload);
          // 标记表单已提交
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
      leftPannelOpenStyle={selectProductStore.status !== StatusEnum.RUNNING ? 'w-full h-full' : ''}
      chatInput={CustomChatInput}
      chatHistory={selectProductStore.status !== StatusEnum.RUNNING ? [Scence.FIND_PROVIDER] : false}
      showUserInfo={!selectProductStore.isFormSubmitted && !isAutoSubmit}
      chatHistoryOptions={{
        titleText: $t("global-1688-ai-app.select-business.zslsjl", "找商历史记录"),
        btnText: $t("global-1688-ai-app.select-business.zsls", "找商历史"),
        historyLogKey: LOG_KEYS.SELECT_BUSINESS.HISTORY.BUTTON,
      }}
      onBack={() => navigator('/sourcing', { replace: true })}
      showLeftBottomMask={false}
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
            {/* <IconPreview /> */}
            <SelectProductContent />
            {/* <SupplierSearchTable /> */}
            {/* <ProductSearchTable /> */}
            {/* <PreSelectBusiness /> */}
          </SelectProductProvider>
        </StoreProvider>
      </App>
    </ConfigProvider>
  );
});

export default SelectProductPage;

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.select-business.axxsAgent", "遨虾-选商Agent"),
  spm: {
    spmB: 'select-business-page',
  },
});
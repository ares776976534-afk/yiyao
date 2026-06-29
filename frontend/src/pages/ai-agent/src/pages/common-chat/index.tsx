import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { definePageConfig } from 'ice';
import { ConfigProvider, App } from 'antd';
import { StoreProvider } from '@/stores/context';
import { SelectProductProvider, useSelectProductStore } from '@/stores/select-product';
import { storeServices } from '@/services/studio/storeServices';
import { injectAllCSSVars } from '@/utils/cssVariables';
import theme from '@/theme/default.json';
import SelectContainer from '@/pages/select-product/components/SelectContainer';
import { StatusEnum } from '@/pages/select-product/config';
import FormatList from './components/FormatList';
import { baseUrl } from '@/utils/env';
import { postAgentLayoutEvent } from '@/components/AgentLayout';
import ReqComponent from './components/ReqComponent';
import { Scence } from '@/pages/select-product/components/ChatHistory/HistoryList';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import { $t } from '@/i18n';
import { LOG_KEYS } from '@/utils/logConfig';


export const CONFIRM_PLAN_FETCH_URL = `${baseUrl}/algo/consult/execute`;

// 通用选品
const CommonChatContent = observer(() => {
  const navigator = useNavigateWithScroll();
  const selectProductStore = useSelectProductStore();
  return (
    <SelectContainer
      showBanner
      title={selectProductStore.status === StatusEnum.RUNNING ? $t("global-1688-ai-app.common-chat.consultation", "咨询") : ''}
      fetchUrl={CONFIRM_PLAN_FETCH_URL}
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
      leftPannelOpenStyle={selectProductStore.status !== StatusEnum.RUNNING ? 'w-full h-full' : ''}
      contentStyle={{ overflow: 'hidden' }}
      showTaskProgress={false}
      showUserInfo={selectProductStore.isFormSubmitted ? false : true}
      chatHistory={selectProductStore.status !== StatusEnum.RUNNING ? [Scence.CONSULT] : false}
      chatHistoryOptions={{
        titleText: $t("global-1688-ai-app.common-chat.clol", "咨询历史记录"),
        btnText: $t("global-1688-ai-app.common-chat.clo", "咨询历史"),
        historyLogKey: LOG_KEYS.COMMON_CHAT.HISTORY.BUTTON,
      }}
      onBack={() => {
        navigator('/chat', { replace: true });
      }}
    />
  );
});

const CommonChatPage = observer(() => {
  // 注入所有CSS变量
  useEffect(() => {
    injectAllCSSVars();
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <App>
        <StoreProvider services={storeServices}>
          <SelectProductProvider>
            <CommonChatContent />
          </SelectProductProvider>
        </StoreProvider>
      </App>
    </ConfigProvider>
  );
});

export default CommonChatPage;

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.common-chat.clo.2", "遨虾-咨询Agent"),
  spm: {
    spmB: 'common-chat-page',
  },
});
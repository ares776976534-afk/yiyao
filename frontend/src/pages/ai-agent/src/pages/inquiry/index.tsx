import { observer } from 'mobx-react-lite';
import { definePageConfig } from 'ice';
import { ConfigProvider, App } from 'antd';
import theme from '@/theme/default.json';
import { StoreProvider } from '@/stores/context';
import { storeServices } from '@/services/studio/storeServices';
import { SelectProductProvider, useSelectProductStore } from '@/stores/select-product';
import SelectContainer from '../select-product/components/SelectContainer';
import { StatusEnum } from '../select-product/config';
import { inquiryApiBaseUrl } from '@/utils/env';
import { postAgentLayoutEvent } from '@/components/AgentLayout';
import ReqComponent from './components/ReqComponent';
import FormatList from './components/FormatList';
import { InquiryAccordionItem } from './components/FormatList/LeftComponents';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import ConsultSupplierButton from './components/ConsultSupplierButton';
import { $t } from '@/i18n';


export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.inquiry.axxpAgent", "遨虾-询盘Agent"),
  spm: {
    spmB: 'inquiry-home',
  },
});

export const InquiryContainer = observer(() => {
  const selectProductStore = useSelectProductStore();
  const navigator = useNavigateWithScroll();
  return (
    <SelectContainer
      disableChatHistory
      title={selectProductStore.status === StatusEnum.RUNNING ? $t("global-1688-ai-app.inquiry.xpzs", "询盘助手") : ''}
      fetchUrl={`${inquiryApiBaseUrl}/api/inquiry/task/stream`}
      reqComponent={<ReqComponent
        status={selectProductStore.status}
        onSubmit={(formattedPayload) => {
          selectProductStore.setStatus(StatusEnum.RUNNING);
          selectProductStore.setFormattedPayload(formattedPayload || {});
          // 标记表单已提交
          selectProductStore.setFormSubmitted(true);
          postAgentLayoutEvent({
            key: 'closeCollapse',
          });
        }}
      />}
      formatFnList={FormatList}
      showChatInput={false}
      contentStyle={{ overflow: 'hidden' }}
      showTaskProgress={false}
      leftPannelOpenStyle={selectProductStore.status !== StatusEnum.RUNNING ? 'w-full h-full' : 'w-[384px] pl-[16px]'}
      showUserInfo={selectProductStore.isFormSubmitted ? false : true}
      showBanner
      AccordionItemComponent={InquiryAccordionItem}
      showMakeSimilar={false}
      keepLeftAlignedWhenNoRight
      gap="18px"
      onBack={() => {
        navigator('/inquiry', { replace: true });
      }}
      shareDescription={$t("global-1688-ai-app.inquiry.cihhkfeazvet", "复制链接并分享后，获得链接的人均可访问，页面包含聊天记录，请注意隐私安全。")}
    />
  );
});


export default observer(() => {
  return (
    <ConfigProvider theme={theme}>
      <App>
        <StoreProvider services={storeServices}>
          <SelectProductProvider>
            <ConsultSupplierButton />
            <InquiryContainer/>
            {/* <InquiryProgress /> */}
          </SelectProductProvider>
        </StoreProvider>
      </App>
    </ConfigProvider>
  );
});

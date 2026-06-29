import React from 'react';
import CustomChatInput from '@/pages/select-business/components/CustomChatInput';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { observer } from 'mobx-react-lite';

import { useSelectProductStore, SelectProductProvider } from '@/stores/select-product';
import { $t } from '@/i18n';
import SendButton from '../SendButton';
import styles from './index.module.scss';

export const SelectSeller = observer(() => {
  const { navigateByCache } = useChatQuery();

  /** 不允许删除 开始 （这里有一个奇怪的现象，如果不执行这段代码，CustomChatInput组件，不会触发出现渲染） */
  const selectProductStore = useSelectProductStore();
  const formattedPayload1 = selectProductStore.getFormattedPayload();
  console.log('formattedPayload111', formattedPayload1);
  /** 不允许删除 结束 */

  const handleSubmit = (data: any) => {
    navigateByCache({ chatInput: data, url: '/sourcing' });
  };

  const handleInputFocus = () => {
    // 发送自定义事件，通知输入框已激活
    const event = new CustomEvent('chatInputFocus', {
      detail: {},
    });
    window.dispatchEvent(event);
  };

  return (
    <div className={styles.container}>
      <CustomChatInput
        placeholder={$t("global-1688-ai-app.agent-home.Agents.SelectSeller.qtduenpwmc", "请输入你想要找的商品或商家，如：支持外贸定制的毛绒玩具工厂")}
        onSubmit={handleSubmit}
        sendButton={<SendButton />}
        onFocus={handleInputFocus}
      />
    </div>
  );
});

export default observer(() => {
  return (
    <SelectProductProvider>
      <SelectSeller />
    </SelectProductProvider>
  );
});
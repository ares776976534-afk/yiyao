import React from 'react';
import CustomChatInput from '@/pages/select-business/components/CustomChatInput';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { observer } from 'mobx-react-lite';
import DemoList from '@/pages/agent-home/components/DemoList';

import styles from './index.module.css';
import { useSelectProductStore, SelectProductProvider } from '@/stores/select-product';
import { $t } from '@/i18n';
import log, { googleRecord } from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

export const SelectSeller = observer(() => {
  const { navigateByCache } = useChatQuery();

  /** 不允许删除 开始 （这里有一个奇怪的现象，如果不执行这段代码，CustomChatInput组件，不会触发出现渲染） */
  const selectProductStore = useSelectProductStore();
  const formattedPayload1 = selectProductStore.getFormattedPayload();
  console.log('formattedPayload111', formattedPayload1);
  /** 不允许删除 结束 */

  const handleSubmit = (data: any) => {
    log.record(LOG_KEYS.AGENT_HOME.CHATBOX.SOURCING_CLICK, 'CLK', { query: data?.query || '' });
    googleRecord('sourcing_submit', {}, '/');
    navigateByCache({ chatInput: data, url: '/sourcing' });
  };

  return (
    <div className={styles.selectSeller}>
      <CustomChatInput
        placeholder={$t("global-1688-ai-app.agent-home.Agents.SelectSeller.qtduenpwmc", "请输入你想要找的1688商品或商家，如：支持外贸定制的毛绒玩具工厂")}
        onSubmit={handleSubmit}
        sourcingModeLogKey={LOG_KEYS.AGENT_HOME.CHATBOX.SOURCING_MODE}
        sourcingImgLogKey={LOG_KEYS.AGENT_HOME.CHATBOX.SOURCING_IMG}
      />
    </div>
  );
});

export default observer(() => {
  return (
    <SelectProductProvider>
      <SelectSeller />
      <div style={{ marginTop: '100px' }}>
        <DemoList
          scene="FIND_PROVIDER"
          showcaseLogKeys={{
            VIEW: LOG_KEYS.AGENT_HOME.SHOWCASE.SOURCING_VIEW,
            SAME: LOG_KEYS.AGENT_HOME.SHOWCASE.SOURCING_SAME,
          }}
        />
      </div>
    </SelectProductProvider>
  );
});
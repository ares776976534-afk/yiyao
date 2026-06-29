import React from 'react';
import ChatInput from '../../ChatInput';
import showTaskLinkModal from '@/components/TaskLinkModel';
import ExploreSection from '../../ExploreSection';
import CommonChatCard from './CommonChatCard';
import { createLink } from '../index';
import { AgentType } from '../../../enum';
import styles from './index.module.scss';
import { $t } from '@/i18n';

const list = [
  {
    id: "fd6e58782c",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.CommonChat.crknis", "从0开始做TikTok，东南亚物流全攻略"),
    image: "https://img.alicdn.com/imgextra/i3/O1CN01YNdQWX1sAYyi1atr1_!!6000000005726-0-tps-3024-2268.jpg",
  },
  {
    id: "69950bcb01",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.CommonChat.xmrtd", "虾皮开店保姆级攻略：从注册到出单"),
    image: "https://img.alicdn.com/imgextra/i3/O1CN01kKCGQT1qIgm1HAddp_!!6000000005473-0-tps-3024-2268.jpg",
  },
  {
    id: "471d4086d9",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.CommonChat.segeC", "深度解析Temu全托管：卖家权责与成本"),
    image: "https://img.alicdn.com/imgextra/i4/O1CN01kKYBbJ1Qk0O05IhzN_!!6000000002013-0-tps-3024-2268.jpg",
  },
  {
    id: "650fa4c6d1",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.CommonChat.Smazx", "SHEIN卖软糖到日韩，避开这些合规红线"),
    image: "https://img.alicdn.com/imgextra/i4/O1CN01yqFk7i2A9L0Dr2AYU_!!6000000008160-0-tps-3024-2268.jpg",
  },
  {
    id: "741f90c5c6",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.CommonChat.Fgsb", "FBA标签贴错被拒收？如何补救保IPI？"),
    image: "https://img.alicdn.com/imgextra/i2/O1CN01hEvwBl1t5M5a0HQF3_!!6000000005850-0-tps-3024-2268.jpg",
  },
  {
    id: "cb2034a683",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.CommonChat.Tknpd", "TikTok预提税，国内如何申请税收抵免？"),
    image: "https://img.alicdn.com/imgextra/i2/O1CN01lI7OEZ22ta48PJN89_!!6000000007178-0-tps-3024-2268.jpg",
  },
];

const CommonChat = () => {
  return (
    <div className={styles.commonChat}>
      <ChatInput
        placeholder={$t("global-1688-ai-app.mobile-agent-home.Agents.CommonChat.qtdysFehVgr", "请输入您在跨境电商运营中遇到的问题，例如：FBA费用怎么算？如何避免侵权？VAT注册流程？")}
        onSubmit={(value) => {
          createLink(AgentType.COMMON_CHAT, value).then(link => {
            const handler = showTaskLinkModal({
              onClose: () => {
                handler.close();
              },
              url: link,
            });
          });
        }}
      />

      <div className={styles.exploreSectionContainer}>
        <ExploreSection title={$t("global-1688-ai-app.mobile-agent-home.Agents.CommonChat.tsjxal", "探索精选案例")} />
        <div className={styles.commonChatCardList}>
          {
            (list || []).map((item) => {
              return (
                <CommonChatCard
                  onClick={() => {
                    location.href = `/mobile/chat?__share_code__=${item.id}`;
                  }}
                  key={item.id}
                  data={item}
                />
              );
            })
          }
        </div>
        {/* <ExploreSection title="到底了" /> */}
      </div>
    </div>
  );
};

export default CommonChat;

import React from 'react';
import styles from './index.module.scss';
import ExploreSection from '../../ExploreSection';
import { AddIcon } from '@/components/Icon';
import InquiryCard from './components/InquiryCard';
import { createLink } from '../index';
import { AgentType } from '../../../enum';
import showTaskLinkModal from '@/components/TaskLinkModel';
import { InputContainer } from '@/pages/mobile/inquiry/components/inputContainer';

import { $t } from '@/i18n';
interface TypeInquiryProps {
  // id?: string;
}

const list = [
  {
    id: '5c5f193bbc',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.Inquiry.Alc", "AI谈判不露怯，智能决策选最优！"),
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01sNC7PP1Iye7Y9XDnw_!!6000000000962-2-tps-3024-2268.png',
  },
  {
    id: '5659edfb06',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.Inquiry.bjzy", "批量询价自动跑，躺着也能找货源！"),
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01CCk6mC26GQfiQ2wLM_!!6000000007634-2-tps-3024-2268.png',
  },
  {
    id: 'e8813a1b63',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.Inquiry.xziz", "询盘策略全自动，智能筛选真供给！"),
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01qVEpCW1Tia05qow6D_!!6000000002416-2-tps-3024-2268.png',
  },
];

const Inquiry: React.FC<TypeInquiryProps> = (props) => {
  // const handleClick = () => {
  //   createLink(AgentType.INQUIRY, {}).then(link => {
  //     const handler = showTaskLinkModal({
  //       onClose: () => {
  //         handler.close();
  //       },
  //       url: link,
  //     });
  //   });
  // };

  return (
    <div className={styles.inquiry}>
      {/* <div className={styles.inputContainer} onClick={handleClick}>
        <div className={styles.boxShadow} />
        <img
          className={styles.mainImage}
          src="https://gw.alicdn.com/imgextra/i4/O1CN01gdAYgc1Ug7UOmymou_!!6000000002546-2-tps-864-331.png"
          alt={$t("global-1688-ai-app.mobile-agent-home.Agents.Inquiry.zt", "主图")}
        />
      </div> */}
      <InputContainer type={AgentType.INQUIRY} />
      {/* <div className={styles.tips}>建议前往电脑端访问：批量发起询盘 | 大屏多窗口管理进展  | AI分析报告，让采购决策更高效！</div> */}

      <div className={styles.exploreSectionContainer}>
        <ExploreSection title={$t("global-1688-ai-app.mobile-agent-home.Agents.Inquiry.tsjxal", "探索精选案例")} />
        {/* <div /> */}
        <div className={styles.inquiryCardList}>
          {list.map((item) => (
            <InquiryCard
              key={item.id}
              data={item}
              onClick={() => {
                // navigateTo(`/mobile-inquiry?__share_code__=${item.id}`);
                location.href = `/mobile/inquiry?__share_code__=${item.id}`;
              }}
            />
          ))}
        </div>
        {/* <ExploreSection title="到底了" /> */}
      </div>
    </div>
  );
};

export default Inquiry;

import React from 'react';
import { definePageConfig } from 'ice';
import Layout from '@/pages/select-product/components/Layout';
import StudioRoot from "@/components/studio/root";
import { $t } from '@/i18n';
import ChatInterface from '@/pages/claw/components/ChatInterface';
import styles from './index.module.scss';

export const pageConfig = definePageConfig({
  title: 'Alphashop 电商智能运营伙伴',
  spm: {
    spmB: 'clawchat',
  },
});


export { default } from '@/pages/claw';

// 不做独立的对话页面，和claw首页共用一个页面
// export default () => {
//   return (
//     <Layout showUserInfo={false}>
//       <StudioRoot theme="light" className={styles.root}>
//         <ChatInterface />
//       </StudioRoot>
//     </Layout>
//   );
// };

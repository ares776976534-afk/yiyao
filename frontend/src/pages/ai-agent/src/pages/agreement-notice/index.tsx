import React from 'react';
import styles from './index.module.css';
import Layout from '@/pages/select-product/components/Layout';

const AgreementNotice = () => {
  return (
    <Layout>
      <div className={styles.agreementNotice}>
        <iframe className={styles.agreementNoticeIframe} src="https://pages-fast.1688.com/wow/cbu/default/defaultv1/alphashop_agreement_list?wh_pid=4189150&x-ssr=true&__existtitle__=1&__removesafearea__=1&__hideLoading__=1&x-fcc=snapshot&skeleton=true&__immersive__=1&x-prefetch=true" />
      </div>
    </Layout>
  );
};

export default AgreementNotice;
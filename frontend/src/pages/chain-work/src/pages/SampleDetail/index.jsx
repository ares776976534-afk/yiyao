import React, { useState, useEffect } from 'react';
import { Loading, Message } from '@alifd/next';
import queryString from 'query-string';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import SampleInfo from './components/SampleInfo';
import CustomerInfo from './components/CustomerInfo';
import OfferInfo from './components/OfferInfo';
import SampleHistory from './components/SampleHistory';
import { queryUserSampleList } from '@/pages/SampleCenter/services';
import './index.scss';

const SampleDetail = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const query = queryString.parse(window.location.search);
  const { offerId = '', sampleId = '' } = query;
  const handleGetData = () => {
    const data = {
      channel: 'ae',
      pageIndex: 1,
      pageSize: 10,
    };
    if (offerId) {
      data.offerId = offerId;
    }

    if (sampleId) {
      data.sampleId = sampleId;
    }

    setLoading(true);
    queryUserSampleList({
      data,
    }).then((res) => {
      setDataSource(res.data?.[0] || {});
    }).catch((err) => {
      Message.error(err.errorMessage);
    }).finally(() => {
      setLoading(false);
    });
  };
  useEffect(() => {
    handleGetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NewWorkLayout title="寄样单明细">
      <div>
        <Loading visible={loading} style={{ width: '100%' }}>
          <SampleInfo {...(dataSource.sampleInfo || {})} />
          <CustomerInfo {...(dataSource.sampleInfo || {})} />
          <OfferInfo {...(dataSource || {})} />
          <SampleHistory />
        </Loading>
      </div>
    </NewWorkLayout>
  );
};

SampleDetail.pageConfig = {
  title: '寄样单明细',
};

export default SampleDetail;

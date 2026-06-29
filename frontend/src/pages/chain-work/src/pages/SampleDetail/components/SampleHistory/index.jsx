import React, { useEffect, useState } from 'react';
import { Message, Loading } from '@alifd/next';
import queryString from 'query-string';
import SampleList from '../SampleList';
import { queryUserSampleList } from '@/pages/SampleCenter/services';

import './index.scss';


function SampleHistory(props) {
  const query = queryString.parse(window.location.search);
  const [dataSource, setDataSource] = useState([]);
  const { offerId = '', sampleId = '', skuId = '' } = query;
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const handleGetData = () => {
    const data = {
      channel: 'ae',
      pageIndex: current,
      pageSize: 10,
      excludeIdStr: sampleId,
    };
    if (offerId) {
      data.offerId = offerId;
    }

    if (skuId) {
      data.skuId = skuId;
    }

    if (sampleId) {
      // data.sampleId = sampleId;
    }
    setLoading(true);
    queryUserSampleList({
      data,
    }).then((res) => {
      setTotal(res.total);
      setDataSource(res.data);
    }).catch((err) => {
      Message.error(err.errorMessage);
    }).finally(() => {
      setLoading(false);
    });
  };
  useEffect(() => {
    handleGetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  return (
    skuId &&
    <div className="sample-history">
      <div className="history-title">历史寄样信息</div>
      <div className="history-table">
        <Loading visible={loading} style={{ width: '100%' }}>
          <SampleList type="history" dataSource={dataSource} current={current} total={total} setCurrent={setCurrent} />
        </Loading>
      </div>
    </div>
  );
}

export default SampleHistory;

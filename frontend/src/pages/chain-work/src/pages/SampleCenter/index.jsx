import React, { useState, useEffect } from 'react';
import { Loading, Message } from '@alifd/next';
import queryString from 'query-string';
import NewWorkLayout from '@/layouts/NewWorkLayout';
// import SampleTab from './components/SampleTab';
import SampleSearch from './components/SampleSearch';
import SampleList from './components/SampleList';
import { queryUserSampleList } from './services';
import { ALL } from './constant';
import './index.scss';

const SampleCenter = () => {
  const query = queryString.parse(window.location.search);
  const urlStatus = query.status;
  const [dataSource, setDataSource] = useState([]);
  const [status, setStatus] = useState(urlStatus || ALL);
  const [offerId, setOfferId] = useState(query.offerId || '');
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const handleGetData = () => {
    const data = {
      channel: 'ae',
      pageIndex: current,
      pageSize: 10,
    };
    if (status && status !== ALL) {
      data.status = status;
    }
    if (offerId) {
      data.offerId = offerId;
    }

    setLoading(true);
    queryUserSampleList({
      data,
    })
      .then((res) => {
        const _data = res.data.map((item) => {
          return {
            ...item,
            id: item?.sampleInfo?.sampleId,
          };
        });
        setDataSource(_data);
        setCurrent(res.pageNum);
        setTotal(res.total);
      })
      .catch((err) => {
        Message.error(err.errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    handleGetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, current, offerId]);
  return (
    <NewWorkLayout title="寄样中心">
      <div>
        {/* <SampleTab status={status} setStatus={setStatus} /> */}
        <SampleSearch
          offerId={offerId}
          status={status}
          setOfferId={setOfferId}
          setCurrent={setCurrent}
          setStatus={setStatus}
        />
        <Loading visible={loading} style={{ width: '100%' }}>
          <SampleList dataSource={dataSource} current={current} total={total} setCurrent={setCurrent} />
        </Loading>
      </div>
    </NewWorkLayout>
  );
};

SampleCenter.pageConfig = {
  title: '寄样中心',
};

export default SampleCenter;

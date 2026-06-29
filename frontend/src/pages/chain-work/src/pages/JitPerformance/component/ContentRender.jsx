import React, { useEffect, useState } from 'react';
import { Button, Pagination } from '@alifd/next';
import JitSearchFilter from './JitSearchFilter';
import filterSchema from './filterSchema';
import JitTable from './JitTable';
import { queryFcOrder } from '../services';

function ContentRender({ type = '' }) {
  const [loading, setLoading] = useState(false);
  const [pageStart, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(100);
  const [params, setParams] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const getData = () => {
    setLoading(true);
    queryFcOrder({
      ...params,
      pageStart,
      pageSize,
      // eslint-disable-next-line no-nested-ternary
      statusSet: type === 'WAIT_DELIVERY' ? ['WAIT_DELIVERY'] : params?.statusSet ? params.statusSet === 'CONFIRMED' ? ['CONFIRMED', 'SUCCESS'] : [params.statusSet] : undefined,
      createOrderTime: params?.createOrderTime ? `${params.createOrderTime[0].startOf('day').valueOf()},${params.createOrderTime[1].endOf('day').valueOf()}` : undefined, // 创单时间，时间戳逗号拼接
      // eslint-disable-next-line no-nested-ternary
      sendTypeEnum: type === 'all' ? undefined : type === 'WAIT_DELIVERY' ? undefined : type, // 发货类型
    }).then((res) => {
      setTotal(res.total || 1);
      setLoading(false);
      const _d = (res.model || []).map((item) => {
        const _orderEntries = (item.childOrderList || []).map((it) => {
          return {
            ...item,
            ...it,
            childCount: item.childOrderList?.length || 1,
          };
        });
        return {
          ...item,
          children: _orderEntries,
        };
      });
      setDataSource(_d);
    });
  };
  useEffect(() => {
    getData();
  }, [pageStart, params, type]);
  const handlePageNoChange = (_current) => {
    setPageNo(_current);
  };
  const hanldeSetParams = (_params) => {
    setParams(_params);
    setPageNo(1);
  };
  const handleSelectChange = (_selectedRowKeys) => {
    setSelectedRowKeys(_selectedRowKeys);
  };
  const extractedObjects = selectedRowKeys?.flatMap((subArray) => {
    // 检查子数组是否包含对象
    if (subArray.some((item) => typeof item === 'object' && item !== null)) {
      return subArray;
    }
    return [];
  });
  const navigateWithQueryParams = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('type', 'shipmentshb');
    currentUrl.searchParams.set('add', JSON.stringify(extractedObjects.flat()[0].receiveAddress));
    currentUrl.searchParams.set('offer', JSON.stringify(extractedObjects.flat()?.map((ele) => ele.offer)));
    currentUrl.searchParams.set('fcId', JSON.stringify(extractedObjects.flat()[0].fcId));
    currentUrl.searchParams.set('id', JSON.stringify(extractedObjects.flat()?.map((ele) => ({
      [ele.fcId]: {
        [ele.id]: ele.offer.quantity,
      },
    }))));
    currentUrl.searchParams.set('gmtCreate', JSON.stringify(extractedObjects.flat()[0].gmtCreate));
    const { origin, search } = currentUrl;
    window.open(`https://air.1688.com/app/channel-fe/chain-work/jitconsignment.html${search}`, '_blank');
  };
  function getFirstNonEmptyLength(arr) {
    // 遍历二维数组
    for (const subArray of arr) {
      if (subArray.length > 0) {
        // 返回第一个非空子数组的长度
        return subArray.length;
      }
    }
    // 如果所有子数组都为空，返回 0
    return 0;
  }
  return (
    <div className="bg-[#fff] rounded-[6px] p-[20px]">
      <JitSearchFilter filters={filterSchema(type)} setParams={hanldeSetParams} />
      <div className="flex items-center mt-[32px] mb-[16px]">
        <Button
          type="primary"
          onClick={navigateWithQueryParams}
          style={{ borderRadius: '6px' }}
          disabled={getFirstNonEmptyLength(selectedRowKeys) < 2}
        >
          合并发货
        </Button>
        <span className="ml-[12px] text-[#999] text-[14px]">仅支持同一订单下的商品进行合并发货</span>
      </div>
      <JitTable dataSource={dataSource} loading={loading} handleSelectChange={handleSelectChange} getData={getData} />
      <div className="mt-[32px] flex justify-end">
        <Pagination
          current={pageStart}
          pageSize={pageSize}
          total={total}
          onChange={handlePageNoChange}
        />
      </div>
    </div>
  );
}

export default ContentRender;

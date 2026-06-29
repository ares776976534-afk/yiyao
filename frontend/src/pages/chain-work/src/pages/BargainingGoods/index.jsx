import React, { useRef, useState } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import CommonTable from '@/components/CommonTable';
import schema from './schema';
import './index.scss';
import { pageBargainOpp, acceptBargainOpp } from './services';
import Message from '@/components/UI/Message';
import { Logger } from '@/utlis';

Logger.init({ a: '待优化商品', b: '待优化商品' }, { pageKey: '待优化商品' });

function BargainingGoods() {
  const currentCheckedRef = useRef([]);
  const checked = useRef(null);
  const filter = useRef([]); // 存被删除的数据
  const [checkedRef, setCheckedRef] = useState([]); // 存勾选数据
  const [checkedAll, setCheckedAll] = useState(false); // 是否勾全选
  const [filterItemIds, setFilterItemIds] = useState([]); // 存被删除的数据
  const [indeterminate, setIndeterminate] = useState(false); // 不足全选为true
  const listQueryFn = (values) => {
    return new Promise((resolve) => {
      const _values = {
        ...values,
        pageNum: values?.pageNo,
      };
      pageBargainOpp({
        request: _values,
      }).then((res) => {
        setIndeterminate(false);
        if (checked.current) {
          setCheckedRef((prve) => [...new Set([...prve, ...res?.model?.map((item) => item.itemId)])]);
        }
        currentCheckedRef.current = [...new Set([...currentCheckedRef?.current, ...res?.model?.map((item) => item.itemId)])];
        resolve(res);
      });
    });
  };
  const faceAcceptBargainOpp = (itemId, fn) => {
    const value = {
      itemIds: itemId ? [itemId] : checkedRef,
      isSelectAll: checkedAll,
      filterItemIds: checkedAll ? filterItemIds : [],
    };
    acceptBargainOpp({
      request: value,
    }).then((res) => {
      const { success, msg = '系统异常' } = res;
      if (success) {
        Message._show({ type: 'success', content: '接受议价成功' });
        fn();
      } else {
        Message._show({ type: 'error', content: msg });
      }
    });
  };
  const handleActionClick = ({ type, record }, fn) => {
    switch (type) {
      case 'all':
        if (record) {
          filter.current = [];
          checked.current = !checkedAll;
          setCheckedAll(!checkedAll);
          setCheckedRef(record);
          setIndeterminate(false);
          setFilterItemIds([]);
        }
        break;
      case 'bargining':
        faceAcceptBargainOpp(record?.itemId, fn);
        break;
      default:
        break;
    }
  };
  const newSchema = {
    ...schema,
    batchActionSchema: () => {
      return schema.batchActionSchema({ currentCheckedRef, checkedAll, indeterminate, filterItemIds, checkedRef });
    },
  };
  return (
    <NewWorkLayout title="待优化商品">
      <CommonTable
        schema={newSchema}
        listQueryFn={listQueryFn}
        pageSize={10}
        SlotOrShowStatusFilter={false}
        onActionComplete={handleActionClick}
        tableProps={{
          rowSelection: {
            onChange: (selectedRowKeys, selectedRows) => {
              const set2 = new Set(selectedRowKeys);
              filter.current = currentCheckedRef.current.filter(item => !set2.has(item));
              setFilterItemIds(filter.current);
              setIndeterminate(selectedRowKeys.length > 0 && selectedRowKeys.length < currentCheckedRef.current.length);
              setCheckedRef(selectedRowKeys);
            },
            selectedRowKeys: checkedRef.filter(item => !new Set(filter.current).has(item)),
          },
        }}
      />
    </NewWorkLayout>
  );
}

export default BargainingGoods;

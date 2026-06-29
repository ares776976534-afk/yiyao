import React, { useEffect, useState, useRef } from 'react';
import { Table, Checkbox, Pagination } from '@alifd/next';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import schema from './schema';
import SearchFilter from './components/SearchFilter';
import filterSchema from './filterSchema';
import Button from '@/components/UI/Button';
import { pagePwsAlertItem, operatePwsSuggest } from './services';
import Message from '@/components/UI/Message';
import BatchOperation from './components/BatchOperation';
import './index.scss';
import { getQueryParams } from '@/utlis';

const notice = {
  title: '您编辑后的件重尺数据会同时在商品和托管产品上生效，托管产品即报名Choice后进行供货SKU和供货价格维护的产品主体',
  title2: '您编辑后的件重尺数据会在商品上生效，买家购买决策及运费计算都需要使用此数据，请务必保证准确性。',
}
export default () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [params, setParams] = useState({});
  const currentCheckedRef = useRef([]);
  const filter = useRef([]); // 存被删除的数据
  const [checkedRef, setCheckedRef] = useState([]); // 存勾选数据
  const [checkedAll, setCheckedAll] = useState(false); // 是否勾全选
  const [filterItemIds, setFilterItemIds] = useState([]); // 存被删除的数据
  const [indeterminate, setIndeterminate] = useState(false); // 不足全选为true
  const [total, setTotal] = useState(0);
  const [totalSku, setTotalSku] = useState(0);
  const checked = useRef(null);
  const getData = () => {
    setLoading(true);
    pagePwsAlertItem({
      request: {
        pageNum: pageNo,
        pageSize: 10,
        ...params,
      },
    }).then((res) => {
      const { list = [], msg = '数据异常，请稍后重试', success = false } = res || {};
      setLoading(false);
      if (success) {
        const newList = list.flatMap((item) => {
          return item?.skuPwsModels?.map((model) => ({
            ...model,
            ...item,
            children: model?.skuPwsModels,
          }));
        });
        // const listData = newList.map((ele) => {
        //   if (ele?.actionList?.filter((item) => item?.actionCode === 'ACCEPT_SUGGEST')?.length === 0) {
        //     return null;
        //   }
        //   return ele;
        // }).filter(Boolean);
        const allSkuIds = flattenDataSource(newList);
        setTotal(res?.total);
        setTotalSku(res?.totalSku);
        setDataSource(processChildren(newList));
        setIndeterminate(false);
        if (checked.current) {
          setCheckedRef((prve) => [...new Set([...prve, ...allSkuIds])]);
        }
        currentCheckedRef.current = [...new Set([...currentCheckedRef?.current, ...allSkuIds])];
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      setLoading(false);
      Message._show({ content: err.errorMessage || '请求失败', type: 'error' });
    });
  };
  useEffect(() => {
    getData();
  }, [pageNo, params]);
  // 扁平化数据源的函数
  const flattenDataSource = (data) => {
    return data.reduce((acc, item) => {
      acc.push(item.skuId);
      if (item.children && item.children.length > 0) {
        acc.push(...flattenDataSource(item.children));
      }
      return acc;
    }, []);
  };
  const processChildren = (children) => {
    const rowSpanMap = new Map();
    // 计算每一行的 rowSpan
    children.forEach((child) => {
      const id = child?.itemId;
      if (!id) return; // 如果 id 不存在，跳过该子项
      if (!rowSpanMap.has(id)) {
        rowSpanMap.set(id, 1);
      } else {
        rowSpanMap.set(id, rowSpanMap.get(id) + 1);
      }
    });
    // 添加 rowSpan 属性到每个子项
    return children.map((child) => {
      const id = child?.itemId;
      return {
        ...child,
        rowSpan: id ? rowSpanMap.get(id) : 1, // 如果 id 不存在，默认 rowSpan 为 1
      };
    });
  };
  const cellProps = (rowIndex, colIndex, dataIndex, record) => {
    if (colIndex === 1 && record.rowSpan) {
      return {
        rowSpan: record.rowSpan,
      };
    }
    return {};
  };
  const hanldeSetParams = (_params) => {
    setParams(_params);
    setPageNo(1);
  };
  const getOperatePwsSuggest = (request, type = '') => {
    operatePwsSuggest({
      request,
    }).then((res) => {
      const { model = false, success = false, msg = '请求异常，请稍后重试' } = res || {};
      if (success) {
        if (model) {
          if (model && type === 'batchOperation') {
            BatchOperation.open({
              content: model,
              text: request?.operateType === 'accept' ? '批量接受建议' : '批量忽略建议',
              onOK: () => {
                getData();
                setCheckedRef([]);
              } });
          } else {
            Message._show({ content: '操作成功', type: 'success' });
            getData();
            setCheckedRef([]);
          }
        } else {
          Message._show({ content: '操作失败', type: 'error' });
        }
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.errorMessage || '系统异常', type: 'error' });
    });
  };
  const handleActionClick = ({ type, record }) => {
    switch (type) {
      case 'reload':
        getData();
        break;
      default:
        getOperatePwsSuggest({
          operateType: type,
          skuIds: [record.skuId],
          isSelectAll: false,
        });
        break;
    }
  };
  const handlePageNoChange = (_currentPage) => {
    setPageNo(_currentPage);
  };
  const renderColumns = (columns) => {
    return columns.map((col) => {
      const __col = {
        ...col,
        cell: (value, index, record) => {
          return col.cell(value, index, record, {
            onActionClick: handleActionClick,
          });
        },
      };
      if (col.children) {
        return (
          <Table.ColumnGroup key={__col.title} {...__col}>
            {renderColumns(col.children)}
          </Table.ColumnGroup>
        );
      }
      return <Table.Column key={__col.title} {...__col} />;
    });
  };
  const batchOperation = (operateType) => {
    getOperatePwsSuggest({
      operateType,
      skuIds: checkedAll ? [] : checkedRef,
      isSelectAll: checkedAll,
      filterSkuIds: checkedAll ? filterItemIds : [],
      datasource: params?.datasource,
    }, 'batchOperation');
  };
  return (
    <NewWorkLayout title="件重尺预警">
      <div className="mb-[12px] py-[9px] px-[12px] rounded-[6px] bg-[#fff] text-[#666] leading-[22px] text-[14px] flex items-center">
        <img src="https://img.alicdn.com/imgextra/i2/O1CN01iWdkRO25KGI433Uin_!!6000000007507-2-tps-16-15.png" alt="" srcSet="" />
        <span className="ml-[8px]">
          {notice[getQueryParams('type') === 'qqyx' ? 'title2' : 'title']}
        </span>
      </div>
      <div className="p-[20px] bg-[#fff] rounded-[6px] welgth-table">
        <SearchFilter filters={filterSchema()} setParams={hanldeSetParams} />
        <div className="flex items-center mb-[20px] mt-[20px]">
          <Checkbox
            indeterminate={indeterminate}
            checked={checkedAll}
            // 全选按钮的 onChange 处理
            onChange={(v) => {
              checked.current = !checkedAll;
              setIndeterminate(false);
              setFilterItemIds([]);
              filter.current = []; // 同步清空 ref
              setCheckedAll(v);
              setCheckedRef(v ? currentCheckedRef.current : []);
            }}
          >
            全选
          </Checkbox>
          <div className="mr-[20px] text-[14px] text-[#999] ml-[12px]">
            <span>已选</span>
            <span className="text-[#333] text-[14px] font-medium ml-[4px] mr-[4px]">{checkedAll ? totalSku - filterItemIds?.length : checkedRef?.length}/{totalSku || 0}</span>
            <span>个SKU</span>
          </div>
          <Button
            onClick={() => batchOperation('accept')}
            type="normal:primary-ghost"
            style={{ borderRadius: '6px', fontSize: '14px' }}
            disabled={!checkedAll && !checkedRef?.length}
          >
            批量接受建议
          </Button>
          <Button
            onClick={() => batchOperation('ignore')}
            type="normal:primary-ghost"
            style={{ borderRadius: '6px', fontSize: '14px', marginLeft: '12px' }}
            disabled={!checkedAll && !checkedRef?.length}
          >
            批量忽略建议
          </Button>
        </div>
        <Table.StickyLock
          type="primary"
          dataSource={dataSource}
          cellProps={cellProps}
          primaryKey="skuId"
          loading={loading}
          rowSelection={{
            onChange: (selectedRowKeys, selectedRows) => {
              const set2 = new Set(selectedRowKeys);
              filter.current = currentCheckedRef.current.filter(item => !set2.has(item));
              setFilterItemIds(filter.current);
              setIndeterminate(selectedRowKeys.length > 0 && selectedRowKeys.length < currentCheckedRef.current.length);
              setCheckedRef(selectedRowKeys);
            },
            selectedRowKeys: checkedRef.filter((item) => !new Set(filterItemIds).has(item)),
            // getProps: (record) => ({
            //   disabled: record?.actionList?.filter((item) => item?.actionCode === 'ACCEPT_SUGGEST')?.length === 0,
            // }),
          }}
        >
          {renderColumns(schema())}
        </Table.StickyLock>
        <div className="mt-[32px] flex justify-end">
          <Pagination
            current={pageNo}
            pageSize={10}
            total={total}
            onChange={handlePageNoChange}
          />
        </div>
      </div>
    </NewWorkLayout>
  );
};


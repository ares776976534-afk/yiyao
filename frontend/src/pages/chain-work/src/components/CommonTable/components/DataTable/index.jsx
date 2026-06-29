import React, { useEffect, useState, useRef } from 'react';
import { Table, Pagination, Button, Checkbox, Loading } from '@alifd/next';
import './index.scss';
import { useDebounceFn } from 'ahooks';

/**
 *
 * @param {object} query 提交给接口查询的入参，需包含pageSize
 * @param {function} listQueryFn table数据的查询接口，入参是query，返回值需包含{ model, total }
 * @param {function} [onActionComplete=() => { }] 用于接收点击事件的回调，会有两个入参，一个是type代表当前点击事件的类型。另一个是reloadFn，用于reload整个table数据
 * @param {string} currentStatus 当前的表头组合
 * @param {string} type 分页组件类型
 *
 */

function DataTable({
  query,
  listQueryFn,
  onActionComplete,
  currentStatus,
  schema,
  tableStyle,
  tabStyle,
  tableProps,
  pageSizeSelector,
  otherAttributes,
  showPagination = true,
  otherPagination,
  reloadTable,
  tableCellProps,
}) {
  const [dataSource, setDataSource] = useState([]);
  const [pageTotal, setPageTotal] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [currentChecked, setCurrentChecked] = useState([]);
  const currentCheckedRef = useRef([]);

  const [actionParams, setActionParams] = useState({});
  const preStatus = useRef(null);
  const [tableLoading, setTableLoading] = useState(false); // 加载
  const [openRowKeys, setOpenRowKeys] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const { rowSelection: tableRowSelection, ...otherTableProps } = tableProps;
  const componentInfo = useRef({ componentType: 'default', componentListQueryFn: listQueryFn });
  const allSelectedData = useRef({});
  const column = schema['colSchema'] ? schema['colSchema'](currentStatus) : []; // 根据status去columns里选择表头组合
  const batchActions = schema['colSchema'] ? schema['batchActionSchema'](currentStatus) : {}; // 根据status去选择批量操作btns
  const {
    hasRowSelection,
    leftAction,
    rightAction,
    primaryKey,
    expandedRowRender,
    expandedRowIndent,
    isExpandedDefault = false,
    cellProps,
    showSelectTip = true,
  } = batchActions; // primaryKey用于hasRowSelection, expandedRowRender功能
  const emptySlot = schema['emptySchema'] ? schema['emptySchema'](currentStatus, query) : null; // 根据status去选择批量操作btns

  const getData = (params, clearChecked = true) => {
    setTableLoading(true);
    return new Promise((resolve) => {
      componentInfo.current
        .componentListQueryFn(params)
        .then(({ model, total }) => {
          if (model) {
            setDataSource(model || []);
            // 设置默认展开
            expandedRowRender && isExpandedDefault && setOpenRowKeys([model?.[0]?.[primaryKey]]);
          } else {
            setDataSource([]);
          }
          setPageNo(params.pageNo);
          setPageTotal(total);

          if (clearChecked) {
            currentCheckedRef.current = [];
            setCurrentChecked([])
            allSelectedData.current = {}
          }
          resolve({ model, total });
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setTableLoading(false);
        });
    });
  };
  const { run } = useDebounceFn(
    (params, clearChecked) => {
      getData(params, clearChecked);
    },
    {
      wait: 300,
    },
  );

  useEffect(() => {
    if (query.pageSize && query.pageSize !== pageSize) {
      setPageSize(query.pageSize);
    }
  }, [query.pageSize]);

  const onPaginationChange = (current) => {
    run({ ...query, pageNo: current, pageSize }, false);
  };
  const onPageSizeChange = (_pageSize) => {
    setPageSize(_pageSize);
  };
  // 点击动作的callback，提交给父组件，由父组件控制是否reload
  const handleActionClick = (typeAndData) => {
    onActionComplete(typeAndData, () => run({ pageNo, ...query, pageSize }), setDataSource);
  };

  const handleRightChange = (data) => {
    setActionParams(data);
    run({ pageNo: 1, ...query, ...data, pageSize });
  };

  const onRowSelectionChange = (selectedRowKeys, records) => {
    // rselectedRowKeys为选中的[primaryKey] records为[该primaryKey的具体行信息](仅当下分页数据)
    allSelectedData.current[Number(pageNo)] = records;
    // 如果没有selectedRowKeys，认为是自定义组件主动传入了完整的records
    if (!selectedRowKeys) {
      setCurrentChecked(records);
      currentCheckedRef.current = records;
    } else {
      // 根据selectedRowKeys去allDataSource获取所有checked
      const resFlat = Object.values(allSelectedData.current).flat();
      setCurrentChecked(resFlat);
      currentCheckedRef.current = resFlat;
    }
  };
  const onRowClick = (record) => {
    setOpenRowKeys((keys) => {
      const crtKey = record[primaryKey];
      const index = keys.indexOf(crtKey);
      if (index > -1) {
        keys.splice(index, 1);
      } else {
        keys.push(crtKey);
      }
      return Object.assign([], keys);
    });
  };

  useEffect(() => {
    setDataSource([]);
    // 根据status去component里选择
    if (
      schema['componentSchema'] &&
      schema['componentSchema'](currentStatus) &&
      schema['componentSchema'](currentStatus)['dataTable']
    ) {
      const crt = schema['componentSchema'](currentStatus)['dataTable'];
      const componentType = crt.type || 'default';
      const componentListQueryFn = crt.listQueryFn || listQueryFn;
      componentInfo.current = { componentType, componentListQueryFn, render: crt.render, wrapStyle: crt.wrapStyle };
    }

    if (currentStatus) {
      let otherParmas = {};
      if (currentStatus === preStatus.current) {
        otherParmas = {
          ...actionParams,
        };
      } else {
        setActionParams({});
      }
      run({ pageNo, ...query, ...otherParmas, pageSize });
    }
    reloadTable((reloadQuery = {}, clearChecked) => run({ ...query, pageNo, pageSize, ...reloadQuery }, clearChecked));
    preStatus.current = currentStatus;
  }, [query, currentStatus, pageSize]);

  const dealExpanedRow = (record, index) => {
    if (!expandedRowRender && typeof expandedRowRender !== 'function') return;
    return expandedRowRender(record, index, { onActionClick: handleActionClick });
  };

  const emptyRender = () => {
    return (
      <div className="empty-state">
        {emptySlot || (
          <>
            <div>
              <img
                src="https://img.alicdn.com/imgextra/i3/O1CN01b5Rg6K1nabGTflgZf_!!6000000005106-55-tps-180-162.svg"
                alt="img"
              />
            </div>
            <div className="empty-state-title">暂无商机！</div>
          </>
        )}
      </div>
    );
  };
  const isLoading = (slot) => {
    if (tableLoading) {
      return <div className="empty-state" />;
    }
    return slot;
  };
  return (
    <Loading tip="加载中..." visible={tableLoading} className="dataTable">
      {hasRowSelection || leftAction || rightAction ? (
        <div className="dataTable-header">
          <div className="dataTable-header-items">
            {hasRowSelection && showSelectTip ? (
              <div className="dataTable-header-rowSelect">
                已选<span className="dataTable-header-rowSelect-num">{currentChecked.length || 0}</span>个商品
              </div>
            ) : null}
            {leftAction ? (
              <div key={currentStatus} className="dataTable-header-left-action">
                {leftAction({
                  checked: currentChecked,
                  onActionClick: handleActionClick,
                  isDisabled: currentCheckedRef.current.length === 0,
                  dataSource,
                  total: pageTotal,
                })}
              </div>
            ) : null}
          </div>
          {rightAction ? (
            <div key={currentStatus} className="dataTable-header-items">
              <div className="dataTable-header-right-action">{rightAction({ onChange: handleRightChange, onActionClick: handleActionClick, checked: currentChecked })}</div>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="dataTable-content">
        {componentInfo.current.render && componentInfo.current.componentType === 'slot' ? isLoading(
          <div style={componentInfo.current.wrapStyle || {}} className="products-list-content">
            {dataSource && dataSource.length > 0
              ? dataSource.map((dataItem, index) => componentInfo.current.render(dataItem, index, handleActionClick, {
                onRowSelectionChange,
                currentCheckedRef,
                currentChecked,
              }))
              : emptyRender()}
          </div>,
        ) : (
          <Table
            {...otherAttributes}
            size="small"
            dataSource={dataSource}
            rowSelection={
              hasRowSelection
                ? {
                  onChange: onRowSelectionChange,
                  selectedRowKeys: currentCheckedRef.current.map((item) => item[primaryKey]),
                  ...tableRowSelection,
                }
                : null
            }
            hasBorder={false}
            primaryKey={primaryKey}
            // loading={tableLoading} // 会双loading暂注
            expandedRowRender={dealExpanedRow} // 把onActionClick传给expandedRow
            expandedRowIndent={expandedRowIndent}
            openRowKeys={expandedRowRender ? openRowKeys : []}
            hasExpandedRowCtrl={false}
            cellProps={tableCellProps || cellProps}
            style={tableStyle}
            className={tabStyle ? 'dataTable-content-table' : ''}
            {...otherTableProps}
          >
            {column.map((col) => {
              let _col = col;
              if (typeof col === 'function') {
                _col = col();
              }
              const __col = {
                ...col,
                cell: (value, index, record) => {
                  return _col.cell(value, index, record, {
                    onActionClick: handleActionClick,
                    onRowClick,
                    openRowKeys,
                  });
                },
              };
              return <Table.Column key={__col.title} {...__col} />;
            })}
          </Table>
        )}
      </div>
      {
        showPagination ? (
          <div className={`dataTable-content-page dataTable-content-page-${otherPagination?.shape}`}>
            <Pagination
              total={pageTotal}
              current={pageNo}
              pageSize={pageSize}
              onChange={onPaginationChange}
              pageSizeList={[5, 10, 20]}
              pageSizeSelector={pageSizeSelector}
              pageSizePosition="start"
              onPageSizeChange={onPageSizeChange}
              {...otherPagination}
            />
          </div>
        ) : null
      }
    </Loading>
  );
}

export default DataTable;

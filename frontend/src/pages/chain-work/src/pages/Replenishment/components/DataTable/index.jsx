import React, { useEffect, useState, useRef } from 'react';
import { Table, Pagination, Button, Checkbox, Message, Dialog } from '@alifd/next';
import colSchema from './colSchema';
import batchActionSchema from './batchActionSchema';
import { listQuery } from '../../services/search';
import {
  ACTION_RLENISHMENT_PALN_CONFIRM_MSG,
  ACTION_BATCH_CONSIGNMENT_SUBMIT_MSG,
  ACTION_BATCH_RLENISHMENT_PALN_CONFIRM_MSG,
  ACTION_CONSIGNMENT_SUBMIT_MSG,
  ACTION_BATCH_RESERVATION_ORDER_SUBMIT_MSG,
  ACTION_RESERVATION_ORDER_SUBMIT_MSG,
} from '@/constant';
import './index.scss';

const PAGE_SIZE = 20;

function DataTable({ query, onActionComplete = () => {} }) {
  const [dataSource, setDataSource] = useState([]);
  const [pageTotal, setPageTotal] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [currentChecked, setCurrentChecked] = useState([]);
  const [actionParams, setActionParams] = useState({});
  const preStatus = useRef(null);
  const { currentStatus: status } = query;
  const [tableLoading, setTableLoading] = useState(false);

  const onRowSelectionChange = (record, checked) => {
    setCurrentChecked(checked);
  };

  const onPaginationChange = (current) => {
    getData({ ...query, pageNo: current });
  };

  const column = colSchema(status);
  const batchActions = batchActionSchema(status);
  const { hasRowSelection, leftAction, rightAction } = batchActions;

  const handleActionClick = (type) => {
    switch (type) {
      case ACTION_RLENISHMENT_PALN_CONFIRM_MSG:
      case ACTION_BATCH_CONSIGNMENT_SUBMIT_MSG:
      case ACTION_BATCH_RLENISHMENT_PALN_CONFIRM_MSG:
      case ACTION_CONSIGNMENT_SUBMIT_MSG:
      case ACTION_BATCH_RESERVATION_ORDER_SUBMIT_MSG:
      case ACTION_RESERVATION_ORDER_SUBMIT_MSG:
        getData({ ...query, pageNo }).then(() => {
          onActionComplete(type);
        });
        break;
      default:
        break;
    }
  };

  const handleRightChange = (data) => {
    setActionParams(data);
    getData({ pageNo: 1, ...query, ...data });
  };

  const getData = (params) => {
    return new Promise((resolve) => {
      setTableLoading(true);
      const { currentStatus, ...otherParams } = params;
      const _params = {
        subModuleCode: currentStatus,
        ...otherParams,
        pageSize: PAGE_SIZE,
      };
      listQuery(_params)
        .then(({ model, total }) => {
          if (model) {
            setDataSource(model || []);
          } else {
            setDataSource([]);
          }
          setPageNo(otherParams.pageNo);
          setPageTotal(total);
          setCurrentChecked([]);
          resolve();
        })
        .finally(() => {
          setTableLoading(false);
        });
    });
  };

  useEffect(() => {
    if (query.currentStatus) {
      let otherParmas = {};
      if (query.currentStatus === preStatus.current) {
        otherParmas = {
          ...actionParams,
        };
      } else {
        setActionParams({});
      }
      getData({ pageNo, ...query, ...otherParmas });
    }
    preStatus.current = query.currentStatus;
  }, [query]);

  return (
    <div className="dataTable">
      {hasRowSelection || leftAction || rightAction ? (
        <div className="dataTable-header">
          <div className="dataTable-header-items">
            {hasRowSelection ? (
              <div className="dataTable-header-rowSelect">
                已选<span className="dataTable-header-rowSelect-num">{currentChecked.length || 0}</span>个商品
              </div>
            ) : null}
            {leftAction ? (
              <div key={query.currentStatus} className="dataTable-header-left-action">
                {leftAction({
                  checked: currentChecked,
                  onActionClick: handleActionClick,
                  isDisabled: currentChecked.length === 0,
                })}
              </div>
            ) : null}
          </div>
          {rightAction ? (
            <div key={query.currentStatus} className="dataTable-header-items">
              <div className="dataTable-header-right-action">{rightAction({ onChange: handleRightChange })}</div>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="dataTable-content">
        <Table
          size="small"
          dataSource={dataSource}
          rowSelection={
            hasRowSelection
              ? {
                onChange: onRowSelectionChange,
                selectedRowKeys: currentChecked.map((item) => item.billId),
              }
              : null
          }
          hasBorder={false}
          primaryKey="billId"
          loading={tableLoading}
        >
          {column.map((col) => {
            let _col = col;
            if (typeof col === 'function') {
              _col = col();
            }
            const __col = {
              ...col,
              cell: (value, index, record) => {
                return _col.cell(value, index, record, { onActionClick: handleActionClick });
              },
            };
            return <Table.Column key={__col.title} {...__col} />;
          })}
        </Table>
        <div className="dataTable-content-page">
          <Pagination total={pageTotal} current={pageNo} pageSize={PAGE_SIZE} onChange={onPaginationChange} />
        </div>
      </div>
    </div>
  );
}

export default DataTable;

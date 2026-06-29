import React from 'react';
import { Button, Table } from '@alifd/next';
import colSchema from './colSchema';
import { exportAppointOrders } from '../service';
import { MessageError, MessageSuccess } from '@/utlis';

export default () => {
  return {
    hasRowSelection: true,
    primaryKey: 'appointOrderCode',
    showSelectTip: false,
    rightAction: () => {
      return <Button type="primary" style={{ borderRadius: 6 }} onClick={() => window.open('https://web.cbbs.tmall.com/pages/babadchain/logistics_config_create_appoint_order', '_blank')} >预约发货</Button>
    },
    leftAction: (data) => {
      const { checked, total } = data;
      // 导出
      const getExportAppointOrders = () => {
        const appointOrderCodes = checked?.map((ele) => (ele?.appointOrderCode));
        exportAppointOrders({
          appointOrderCodes,
        }).then((res) => {
          if (res?.success) {
            MessageSuccess('导出成功');
            window.open(res?.model?.downloadUrl);
          } else {
            MessageError(res?.errorCode || '导出失败');
          }
        });
      };
      return (
        <div className="h-[60px] w-full flex items-center">
          <div className="flex h-[24px] leading-[24px]">
            <div className="mr-[20px] text-[14px] text-[#999]">
              <span>已选</span>
              <span className="text-[#333] text-[14px] font-medium ml-[4px] mr-[4px]">{checked?.length || 0}/{total || 0}</span>
              <span>个商品</span>
            </div>
            <Button disabled={data?.checked?.length === 0} onClick={getExportAppointOrders} style={{ height: '24px', width: 50, padding: 0, borderRadius: 4, fontSize: 12 }}>
              导出
            </Button>
          </div>
        </div>
      );
    },
    // expandedRowRender的入参来自Table组件的传参
    expandedRowRender: (record, index, options) => {
      const { itemInfoList, appointOrderCode, fulfilmentOrderCode, ...res } = record;
      const column = colSchema('SON');
      return (
        <div style={{ position: 'relative', top: '-11px' }}>
          <Table
            size="small"
            hasBorder={false}
            expandedRowRender={false}
            dataSource={itemInfoList?.map((ele) => ({ appointOrderCode, fulfilmentOrderCode, ...ele }))}
            className="expanded-table"
            style={{ width: '840px', marginLeft: '183px', marginTop: '16px', marginRight: '679px', borderRadius: '6px', border: '1px solid #E3E4E7' }}
          >
            {column.map((col) => {
              let _col = col;
              if (typeof col === 'function') {
                _col = col();
              }
              const __col = {
                ...col,
                cell: (value, _index, _record) => {
                  return _col.cell(value, _index, _record, { res, ...options });
                },
              };
              return <Table.Column key={__col.title} {...__col} />;
            })}
          </Table>
        </div>
      );
    },
  };
};

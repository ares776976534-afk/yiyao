import React from 'react';
import CommonTable from '@/components/CommonTable';
import './ItemCommonTable.scss';

function ItemCommonTable({ field, listQueryFn, schema }) {
  const newSchema = {
    ...schema,
    colSchema: () => {
      return schema.colSchema(field);
    },
  };
  return (
    <CommonTable
      showPagination={false}
      schema={newSchema}
      SlotOrShowStatusFilter={false}
      SlotOrShowMsgBar={false}
      listQueryFn={listQueryFn}
      blockBorder={false}
      tableProps={{
        fixedHeader: true,
        stickyHeader: true,
      }}
      tableStyle={{
        '--table-size-s-cell-padding-top': '16px',
        '--table-size-s-cell-padding-bottom': '12px',
      }}
    />
  );
}

export default ItemCommonTable;

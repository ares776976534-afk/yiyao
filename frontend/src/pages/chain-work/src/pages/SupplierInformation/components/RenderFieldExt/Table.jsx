import React from 'react';
import { Table } from '@alifd/next';
import './index.scss';

export default ({ column = [], data = [] }) => {
  return (
    <Table dataSource={data} className="rounded-table rounded-[6px]" hasBorder>
      {
        column.map((item) => (
          <Table.Column {...item} />
        ))
      }
    </Table>
  );
};

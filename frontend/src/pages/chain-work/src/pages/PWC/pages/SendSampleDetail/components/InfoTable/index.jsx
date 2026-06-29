import React, { useCallback } from 'react';
import { Table } from '@alifd/next';

import './index.scss';

export default (props) => {
  const { data, column, onCellAction, ...otherProps } = props;
  const { rowSelection } = otherProps;
  const cellProps = (rowIndex, colIndex) => {
    const colLength = column.length;
    const dataLength = data.length;
    if ((rowSelection && (rowIndex === 0 && colIndex === 1)) || (!rowSelection && (rowIndex === 0 && colIndex === 0))) {
      return {
        colSpan: colLength + 1,
      };
    }

    if (rowSelection && colIndex === 0) {
      const selectColStyle = {
        padding: 0,
        paddingTop: 13.5,
      };

      if (rowIndex === dataLength - 1) {
        selectColStyle.borderBottom = 0;
      }

      return {
        colSpan: 0,
        style: selectColStyle,
      };
    }

    if (rowIndex === dataLength - 1) {
      return {
        style: { borderBottom: 0 },
      };
    }

    return {
      style: { borderRight: 0 },
    };
  };
  const handleCellAction = (type, cellData) => {
    onCellAction && onCellAction(type, cellData);
  };

  const transformColumns = useCallback((_columns = []) => {
    return _columns && _columns.map((item) => {
      let { cell } = item;
      if (item.cell) {
        const _cell = cell;
        const __cell = (value, index, record) => {
          const actionFn = (type) => handleCellAction(type, { value, index, record });
          return _cell(value, index, record, actionFn);
        };
        cell = __cell;
      }
      return {
        ...item,
        cell,
      };
    });
  });

  const _colunms = transformColumns(column);

  return (
    <div className="pwc-home-infotable border-solid border-[1px] border-[#E5E5E5] rounded-[6px] overflow-hidden mb-[12px] mb-0">
      <Table
        dataSource={data}
        cellProps={cellProps}
        {...otherProps}
        hasBorder={false}
        rowSelection={rowSelection ? {
          // onChange: onChange,
          columnProps: () => {
            return {
              colSpan: 0,
              style: { padding: 0 },
              width: 32,
            };
          },
          titleProps: () => {
            return {
              // remove the select all button
              style: { display: 'none' },
            };
          },
          ...rowSelection,
        } : false}
      >
        {_colunms.map((col) => {
          if (col?.children?.length > 0) {
            return (
              <Table.ColumnGroup title={col.title}>
                {col.children.map((_col) => {
                  return <Table.Column key={_col.title} {..._col} />;
                })}
              </Table.ColumnGroup>
            );
          }
          let _col = col;
          if (typeof col === 'function') {
            _col = col();
          }
          const __col = {
            ...col,
            cell: (value, index, record) => {
              return _col.cell(value, index, record, {
                // onActionClick: handleActionClick,
                // onRowClick,
                // openRowKeys,
              });
            },
          };
          return <Table.Column key={__col.title} {...__col} />;
        })}
      </Table>
    </div>
  );
};

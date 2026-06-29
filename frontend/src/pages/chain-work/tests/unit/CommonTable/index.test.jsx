import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import CommonTable from '@/components/CommonTable';

describe('CommonTable Component', () => {
  const defaultProps = {
    pageSize: 10,
    listQueryFn: jest.fn().mockResolvedValue({ model: [], total: 0 }),  // 模拟返回一个解决的 Promise
    schema: { componentSchema: jest.fn(() => ({})), filterSchema: jest.fn(() => ({})), batchActionSchema: jest.fn(() => ({})) },
    tableChange: jest.fn(),
    onActionComplete: jest.fn(),
    getStatusFnOrStatusList: [
      { name: '待提报商机', code: '1' },
      { name: '我的提报', code: '2' },
    ],
    statusReload: false,
    SlotOrShowStatusFilter: true,
    SlotOrShowMsgBar: false,
    ShowDataTable: true,
    statusFilterType: { shape: 'pure', type: 1 },
    statusFilterLabelMap: { name: 'name', code: 'code', subStatusList: 'subStatusList', quantity: 'quantity' },
    searchFilterType: '1',
    tableStyle: {},
    tabStyle: false,
    searchChangeFn: jest.fn(),
    tableProps: {},
    showSearchAction: true,
    statusFilterExtra: null,
    pageSizeSelector: 'dropdown',
    otherAttributes: {},
    otherPagination: {},
  };

  it('默认渲染', async () => {
    await act(async () => {
      const { asFragment } = render(<CommonTable {...defaultProps} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('空列表', async () => {
    await act(async () => {
      const { getByText } = render(<CommonTable {...defaultProps} />);
      expect(getByText('没有数据')).toBeInTheDocument();
    });
  });

  it('有数据', async () => {
    await act(async () => {
      defaultProps.schema.colSchema = jest.fn(() => ([
        {
          title: '货品信息',
          width: 324,
          dataIndex: 'itemInfo',
          cell: jest.fn((value) => (<div>{value}</div>)),
        },
        {
          title: '状态',
          width: 120,
          dataIndex: 'status',
          cell: jest.fn((value) => (<div>{value}</div>)),
        },
      ]));
      defaultProps.listQueryFn = jest.fn().mockResolvedValue({ model: [{ itemInfo: '货品信息1', status: '状态1' }, { itemInfo: '货品信息2', status: '状态2' }], total: 2 })
      const { getByText } = render(<CommonTable {...defaultProps} />);
      await waitFor(() => expect(getByText('货品信息1')).toBeInTheDocument());
    });
  });
});

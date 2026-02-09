import { useState, useMemo } from 'react';
import { Table, Input, Empty } from 'antd';

const defaultPagination = {
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total) => `共 ${total} 条`
};

export default function TableSearch({ data = [], columns, searchFields = [], rowKey = 'id', placeholder = '搜索', pagination = true, ...rest }) {
  const [keyword, setKeyword] = useState('');
  const filtered = useMemo(() => {
    if (!keyword.trim() || !searchFields.length) return data;
    const k = keyword.toLowerCase();
    return data.filter(row =>
      searchFields.some(f => String(row[f] ?? '').toLowerCase().includes(k))
    );
  }, [data, keyword, searchFields]);

  if (!data.length) return <Empty description="暂无数据" />;

  const paginationConfig = pagination === false ? false : { ...defaultPagination, ...(typeof pagination === 'object' ? pagination : {}) };

  return (
    <>
      <Input.Search placeholder={placeholder} allowClear value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 220, marginBottom: 16 }} />
      <Table columns={columns} dataSource={filtered} rowKey={rowKey} pagination={paginationConfig} locale={{ emptyText: '暂无数据' }} {...rest} />
    </>
  );
}

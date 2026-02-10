import { useState } from 'react';
import { Button, message, Popconfirm } from 'antd';
import DynamicTable from '../components/DynamicTable';
import { put } from '../api/request';

export default function WithdrawManage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStatus = async (id, status) => {
    await put(`/withdrawals/${id}`, { status });
    message.success(status === 'approved' ? '已通过' : '已拒绝');
    setRefreshKey(k => k + 1);
  };

  return (
    <DynamicTable
      module="withdrawals"
      dataApi="/withdrawals"
      refreshKey={refreshKey}
      pagination={{ pageSize: 15 }}
      renderActions={(_, r) => r.status === 'pending' ? (
        <>
          <Popconfirm title="确认通过？" onConfirm={() => handleStatus(r.id, 'approved')}>
            <Button type="link" size="small">通过</Button>
          </Popconfirm>
          <Popconfirm title="确认拒绝？" onConfirm={() => handleStatus(r.id, 'rejected')}>
            <Button type="link" size="small" danger>拒绝</Button>
          </Popconfirm>
        </>
      ) : null}
    />
  );
}

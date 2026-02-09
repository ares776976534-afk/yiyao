import DynamicTable from '../components/DynamicTable';

export default function WithdrawManage() {
  return <DynamicTable module="withdrawals" dataApi="/withdrawals" pagination={{ pageSize: 15 }} />;
}

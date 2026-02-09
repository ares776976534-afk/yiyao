import DynamicTable from '../components/DynamicTable';

export default function StockQuery() {
  return <DynamicTable module="stock" dataApi="/stock" pagination={{ pageSize: 20 }} />;
}

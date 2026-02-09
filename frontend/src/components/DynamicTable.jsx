import { useState, useEffect, useMemo, useRef } from 'react';
import { Spin, Select, DatePicker } from 'antd';
import { get } from '../api/request';
import TableSearch from './TableSearch';

const defaultPagination = { pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (t) => `共 ${t} 条` };

const fallbackSchema = {
  drugs: { columns: [{ title: 'ID', dataIndex: 'id', width: 60 }, { title: '名称', dataIndex: 'name' }, { title: '编码', dataIndex: 'code' }, { title: '规格', dataIndex: 'specification' }, { title: '单位', dataIndex: 'unit', width: 80 }], searchFields: ['name', 'code', 'specification'] },
  stock: { columns: [{ title: '药品', dataIndex: 'name' }, { title: '编码', dataIndex: 'code' }, { title: '规格', dataIndex: 'specification' }, { title: '库存', dataIndex: 'stock', width: 100 }, { title: '单位', dataIndex: 'unit', width: 60 }], searchFields: ['name', 'code', 'specification'] },
  records: { columns: [{ title: '日期', dataIndex: 'record_date', width: 110 }, { title: '类型', dataIndex: 'type', width: 80, render: { type: 'map', map: { in: '入库', out: '出库' } } }, { title: '药品', dataIndex: 'drug_name' }, { title: '数量', dataIndex: 'quantity', width: 80 }, { title: '单位', dataIndex: 'unit', width: 60 }, { title: '批号', dataIndex: 'batch_no' }, { title: '经手人', dataIndex: 'personnel_name' }, { title: '备注', dataIndex: 'note' }], searchFields: ['drug_name', 'batch_no', 'personnel_name', 'note'], filters: [{ key: 'type', label: '类型', type: 'select', options: [{ value: 'in', label: '入库' }, { value: 'out', label: '出库' }] }, { key: 'drug_id', label: '药品', type: 'select', optionsApi: '/drugs', optionsKey: 'id', optionsLabel: 'name' }, { key: 'personnel_id', label: '经手人', type: 'select', optionsApi: '/personnel', optionsKey: 'id', optionsLabel: 'name' }, { key: 'dateRange', label: '日期', type: 'dateRange', startKey: 'start_date', endKey: 'end_date' }] },
  personnel: { columns: [{ title: 'ID', dataIndex: 'id', width: 60 }, { title: '姓名', dataIndex: 'name' }, { title: '电话', dataIndex: 'phone' }], searchFields: ['name', 'phone'] },
  'sales-by-personnel': { columns: [{ title: '日期', dataIndex: 'record_date', width: 110 }, { title: '人员', dataIndex: 'personnel_name' }, { title: '药品', dataIndex: 'drug_name' }, { title: '销售数量', dataIndex: 'total_quantity', width: 100 }, { title: '单位', dataIndex: 'unit', width: 60 }], searchFields: ['personnel_name', 'drug_name'] },
  users: { columns: [{ title: 'ID', dataIndex: 'id', width: 60 }, { title: '用户名', dataIndex: 'username' }, { title: '电话', dataIndex: 'phone' }], searchFields: ['username', 'phone'] },
  merchants: { columns: [{ title: 'ID', dataIndex: 'id', width: 60 }, { title: '商家名称', dataIndex: 'name' }, { title: '联系人', dataIndex: 'contact' }, { title: '电话', dataIndex: 'phone' }], searchFields: ['name', 'contact', 'phone'] },
  franchisees: { columns: [{ title: 'ID', dataIndex: 'id', width: 60 }, { title: '加盟商名称', dataIndex: 'name' }, { title: '联系人', dataIndex: 'contact' }, { title: '电话', dataIndex: 'phone' }], searchFields: ['name', 'contact', 'phone'] },
  riders: { columns: [{ title: 'ID', dataIndex: 'id', width: 60 }, { title: '姓名', dataIndex: 'name' }, { title: '电话', dataIndex: 'phone' }], searchFields: ['name', 'phone'] },
  news: { columns: [{ title: 'ID', dataIndex: 'id', width: 60 }, { title: '标题', dataIndex: 'title' }], searchFields: ['title', 'content'] },
  lottery: { columns: [{ title: 'ID', dataIndex: 'id', width: 60 }, { title: '活动名称', dataIndex: 'name' }], searchFields: ['name'] },
  carousel: { columns: [{ title: 'ID', dataIndex: 'id', width: 60 }, { title: '标题', dataIndex: 'title' }, { title: '图片链接', dataIndex: 'image_url' }, { title: '排序', dataIndex: 'sort', width: 80 }], searchFields: ['title', 'image_url'] },
  'purchase-orders': { columns: [{ title: '订单号', dataIndex: 'order_no' }, { title: '药品', dataIndex: 'drug_name' }, { title: '供应商', dataIndex: 'merchant_name' }, { title: '数量', dataIndex: 'quantity', width: 80 }, { title: '日期', dataIndex: 'order_date', width: 110 }], searchFields: ['order_no', 'drug_name', 'merchant_name'] },
  orders: { columns: [{ title: '订单号', dataIndex: 'order_no' }, { title: '药品', dataIndex: 'drug_name' }, { title: '数量', dataIndex: 'quantity', width: 80 }, { title: '经手人', dataIndex: 'personnel_name' }, { title: '日期', dataIndex: 'order_date', width: 110 }], searchFields: ['order_no', 'drug_name', 'personnel_name'] },
  'coupon-orders': { columns: [{ title: '订单号', dataIndex: 'order_no' }, { title: '用户', dataIndex: 'username' }, { title: '积分券', dataIndex: 'coupon_name' }, { title: '数量', dataIndex: 'quantity', width: 80 }, { title: '日期', dataIndex: 'created_at', width: 180 }], searchFields: ['order_no', 'username', 'coupon_name'] },
  withdrawals: { columns: [{ title: 'ID', dataIndex: 'id', width: 60 }, { title: '申请人', dataIndex: 'username' }, { title: '金额', dataIndex: 'amount', width: 100 }, { title: '状态', dataIndex: 'status', width: 80, render: { type: 'map', map: { approved: '已通过', rejected: '已拒绝', pending: '待审核' } } }, { title: '申请时间', dataIndex: 'created_at', width: 180 }], searchFields: ['username', 'amount'] },
  transactions: { columns: [{ title: '流水号', dataIndex: 'trans_no' }, { title: '类型', dataIndex: 'type', width: 80 }, { title: '金额', dataIndex: 'amount', width: 100 }, { title: '备注', dataIndex: 'note' }, { title: '时间', dataIndex: 'created_at', width: 180 }], searchFields: ['trans_no', 'type', 'note'] }
};

function buildColumns(schemaCols, renderActions) {
  if (!schemaCols) return [];
  const cols = schemaCols.map(c => {
    const col = { title: c.title, dataIndex: c.dataIndex, width: c.width };
    if (c.render?.type === 'map') col.render = (v) => c.render.map[v] ?? v;
    return col;
  });
  if (renderActions) cols.push({ title: '操作', width: 150, render: renderActions });
  return cols;
}

export default function DynamicTable({ module, dataApi, data: propData, params: propParams, children, renderActions, rowKey = 'id', pagination = true, refreshKey }) {
  const [schema, setSchema] = useState(null);
  const [data, setData] = useState(propData ?? []);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({});
  const lastFetchKeyRef = useRef('');

  useEffect(() => {
    get(`/schema/${module}`).then(setSchema).catch(() => setSchema(fallbackSchema[module] || null));
  }, [module]);

  useEffect(() => {
    if (propData !== undefined || !schema) return;
    const p = { ...(propParams || {}), ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== '')) };
    const key = `${module}:${dataApi || module}:${refreshKey ?? 0}:${JSON.stringify(p)}`;
    if (lastFetchKeyRef.current === key) return;
    lastFetchKeyRef.current = key;
    get(dataApi || `/${module}`, p).then(setData).catch(() => setData([]));
  }, [module, dataApi, schema, refreshKey, propData, propParams, filters]);

  useEffect(() => {
    if (propData !== undefined) setData(propData);
  }, [propData]);

  useEffect(() => {
    if (!schema?.filters) return;
    for (const f of schema.filters) {
      if (f.optionsApi) get(f.optionsApi).then(list => setOptions(o => ({ ...o, [f.key]: list })));
    }
  }, [schema?.filters]);

  const columns = useMemo(() => buildColumns(schema?.columns, renderActions), [schema?.columns, renderActions]);

  if (!schema) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  const filterEls = schema.filters?.map(f => {
    if (f.type === 'select') {
      const opts = f.options ?? options[f.key] ?? [];
      const k = f.optionsKey ?? 'value';
      const l = f.optionsLabel ?? 'label';
      return (
        <Select key={f.key} placeholder={f.label} allowClear style={{ width: f.key === 'type' ? 100 : 150 }} onChange={v => setFilters(x => ({ ...x, [f.key]: v ?? undefined }))}>
          {opts.map(o => <Select.Option key={o[k]} value={o[k]}>{o[l]}</Select.Option>)}
        </Select>
      );
    }
    if (f.type === 'dateRange') {
      return (
        <DatePicker.RangePicker key={f.key} onChange={(_, s) => setFilters(x => ({ ...x, [f.startKey]: s?.[0], [f.endKey]: s?.[1] }))} />
      );
    }
    return null;
  });

  return (
    <>
      {(filterEls?.length || children) && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {filterEls}
          {children}
        </div>
      )}
      <TableSearch
        data={data}
        columns={columns}
        searchFields={schema.searchFields}
        rowKey={rowKey}
        pagination={pagination === false ? false : { ...defaultPagination, ...(typeof pagination === 'object' ? pagination : {}) }}
      />
    </>
  );
}

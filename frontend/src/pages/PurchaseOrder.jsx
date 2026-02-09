import { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { get, post } from '../api/request';
import DynamicTable from '../components/DynamicTable';

export default function PurchaseOrder() {
  const [drugs, setDrugs] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    get('/drugs').then(setDrugs);
    get('/merchants').then(setMerchants).catch(() => setMerchants([]));
  }, []);

  const handleSubmit = async () => {
    const v = await form.validateFields();
    try {
      await post('/purchase-orders', { ...v, order_date: v.order_date?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD') });
      message.success('添加成功');
      setModalOpen(false);
      form.resetFields();
      setRefreshKey(k => k + 1);
    } catch (e) { message.error('操作失败'); }
  };

  return (
    <>
      <DynamicTable
        module="purchase-orders"
        dataApi="/purchase-orders"
        refreshKey={refreshKey}
        children={<Button type="primary" onClick={() => { form.resetFields(); form.setFieldsValue({ order_date: dayjs() }); setModalOpen(true); }}>新增进货订单</Button>}
      />
      <Modal title="新增进货订单" open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ order_date: dayjs() }}>
          <Form.Item name="drug_id" label="药品" rules={[{ required: true }]}>
            <Select placeholder="选择药品">{drugs.map(d => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="merchant_id" label="供应商">
            <Select placeholder="选择供应商">{merchants.map(m => <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="order_date" label="日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

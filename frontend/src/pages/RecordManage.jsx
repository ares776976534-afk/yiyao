import { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { get, post } from '../api/request';
import DynamicTable from '../components/DynamicTable';

export default function RecordManage() {
  const [drugs, setDrugs] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    get('/drugs').then(setDrugs);
    get('/personnel').then(setPersonnel);
  }, []);

  const handleSubmit = async () => {
    const v = await form.validateFields();
    const body = {
      drug_id: v.drug_id,
      type: v.type,
      quantity: v.quantity,
      batch_no: v.batch_no,
      record_date: v.record_date?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
      personnel_id: v.type === 'out' ? v.personnel_id : null,
      city: v.city,
      note: v.note
    };
    await post('/records', body);
    message.success('添加成功');
    setModalOpen(false);
    form.resetFields();
    setRefreshKey(k => k + 1);
  };

  return (
    <>
      <DynamicTable
        module="records"
        dataApi="/records"
        refreshKey={refreshKey}
        children={<Button type="primary" onClick={() => { form.resetFields(); form.setFieldsValue({ record_date: dayjs(), type: 'in' }); setModalOpen(true); }}>新增记录</Button>}
      />
      <Modal title="新增出入库记录" open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ type: 'in', record_date: dayjs() }}>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select><Select.Option value="in">入库</Select.Option><Select.Option value="out">出库</Select.Option></Select>
          </Form.Item>
          <Form.Item name="drug_id" label="药品" rules={[{ required: true }]}>
            <Select placeholder="选择药品">{drugs.map(d => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="batch_no" label="批号"><Input /></Form.Item>
          <Form.Item name="record_date" label="日期" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item noStyle shouldUpdate={(p, n) => p.type !== n.type}>
            {({ getFieldValue }) => getFieldValue('type') === 'out' && (
              <Form.Item name="personnel_id" label="经手人" rules={[{ required: true }]}>
                <Select placeholder="选择人员">{personnel.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}</Select>
              </Form.Item>
            )}
          </Form.Item>
          <Form.Item name="city" label="城市"><Input placeholder="如：广州市" /></Form.Item>
          <Form.Item name="note" label="备注"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

import { useState } from 'react';
import { Button, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import DynamicTable from '../components/DynamicTable';
import { post, put, del } from '../api/request';

export default function FranchiseeManage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const v = await form.validateFields();
    try {
      editing ? await put(`/franchisees/${editing.id}`, v) : await post('/franchisees', v);
      message.success(editing ? '更新成功' : '添加成功');
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      setRefreshKey(k => k + 1);
    } catch (e) { message.error('操作失败'); }
  };

  return (
    <>
      <DynamicTable
        module="franchisees"
        dataApi="/franchisees"
        refreshKey={refreshKey}
        children={<Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增加盟商</Button>}
        renderActions={(_, r) => (
          <>
            <Button type="link" size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
            <Button type="link" size="small" danger onClick={async () => { await del(`/franchisees/${r.id}`); message.success('删除成功'); setRefreshKey(k => k + 1); }}>删除</Button>
          </>
        )}
      />
      <Modal title={editing ? '编辑加盟商' : '新增加盟商'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} width={520}>
        <Form form={form} layout="vertical" initialValues={{ dist_type: '本地管家' }}>
          <Form.Item name="name" label="加盟商名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="contact" label="联系人"><Input /></Form.Item>
          <Form.Item name="phone" label="电话"><Input /></Form.Item>
          <Form.Item name="address" label="地址"><Input /></Form.Item>
          <Form.Item name="dist_type" label="分销类型">
            <Select>
              <Select.Option value="本地管家">本地管家</Select.Option>
              <Select.Option value="导游管家">导游管家</Select.Option>
              <Select.Option value="分销管家">分销管家</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="sub_count" label="下级成员数"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="order_count" label="分销订单数"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="total_amount" label="累计金额"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="settled_amount" label="已结算金额"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

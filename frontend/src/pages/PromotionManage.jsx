import { useState } from 'react';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import DynamicTable from '../components/DynamicTable';
import { post, put, del } from '../api/request';

export default function PromotionManage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const v = await form.validateFields();
    try {
      editing ? await put(`/promotions/${editing.id}`, v) : await post('/promotions', v);
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
        module="promotions"
        dataApi="/promotions"
        refreshKey={refreshKey}
        children={<Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增推广计划</Button>}
        renderActions={(_, r) => (
          <>
            <Button type="link" size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
            <Button type="link" size="small" danger onClick={async () => { await del(`/promotions/${r.id}`); message.success('删除成功'); setRefreshKey(k => k + 1); }}>删除</Button>
          </>
        )}
      />
      <Modal title={editing ? '编辑推广计划' : '新增推广计划'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }}>
        <Form form={form} layout="vertical" initialValues={{ status: 'active', type: 'CPM' }}>
          <Form.Item name="name" label="计划名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="推广类型">
            <Select>
              <Select.Option value="CPM">CPM</Select.Option>
              <Select.Option value="CPS">CPS</Select.Option>
              <Select.Option value="CPA">CPA</Select.Option>
              <Select.Option value="CPC">CPC</Select.Option>
              <Select.Option value="CPD">CPD</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="input" label="投入金额" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="output" label="产出金额" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="month" label="月份"><Input placeholder="2026-02" /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value="active">进行中</Select.Option>
              <Select.Option value="paused">暂停</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

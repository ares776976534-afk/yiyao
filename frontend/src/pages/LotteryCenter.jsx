import { useState } from 'react';
import { Button, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import DynamicTable from '../components/DynamicTable';
import { post, put, del } from '../api/request';

export default function LotteryCenter() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const v = await form.validateFields();
    const body = {
      ...v,
      start_date: v.start_date?.format('YYYY-MM-DD') || '',
      end_date: v.end_date?.format('YYYY-MM-DD') || ''
    };
    try {
      editing ? await put(`/lottery/${editing.id}`, body) : await post('/lottery', body);
      message.success(editing ? '更新成功' : '添加成功');
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      setRefreshKey(k => k + 1);
    } catch (e) { message.error('操作失败'); }
  };

  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({
      ...r,
      start_date: r.start_date ? dayjs(r.start_date) : null,
      end_date: r.end_date ? dayjs(r.end_date) : null
    });
    setModalOpen(true);
  };

  return (
    <>
      <DynamicTable
        module="lottery"
        dataApi="/lottery"
        refreshKey={refreshKey}
        children={<Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增抽奖</Button>}
        renderActions={(_, r) => (
          <>
            <Button type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>
            <Button type="link" size="small" danger onClick={async () => { await del(`/lottery/${r.id}`); message.success('删除成功'); setRefreshKey(k => k + 1); }}>删除</Button>
          </>
        )}
      />
      <Modal title={editing ? '编辑抽奖' : '新增抽奖'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} width={600}>
        <Form form={form} layout="vertical" initialValues={{ status: 'upcoming' }}>
          <Form.Item name="name" label="活动名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value="upcoming">待开始</Select.Option>
              <Select.Option value="active">进行中</Select.Option>
              <Select.Option value="ended">已结束</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="start_date" label="开始日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="end_date" label="结束日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="prize" label="奖品设置"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

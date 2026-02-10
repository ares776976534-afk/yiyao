import { useState } from 'react';
import { Button, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import DynamicTable from '../components/DynamicTable';
import { post, put, del } from '../api/request';

export default function UserManage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const v = await form.validateFields();
    try {
      editing ? await put(`/users/${editing.id}`, v) : await post('/users', v);
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
        module="users"
        dataApi="/users"
        refreshKey={refreshKey}
        children={<Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增用户</Button>}
        renderActions={(_, r) => (
          <>
            <Button type="link" size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
            <Button type="link" size="small" danger onClick={async () => { await del(`/users/${r.id}`); message.success('删除成功'); setRefreshKey(k => k + 1); }}>删除</Button>
          </>
        )}
      />
      <Modal title={editing ? '编辑用户' : '新增用户'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} width={520}>
        <Form form={form} layout="vertical" initialValues={{ role: 'member', status: 'active', gender: 'male' }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="电话"><Input /></Form.Item>
          {!editing && <Form.Item name="password" label="密码"><Input.Password /></Form.Item>}
          <Form.Item name="role" label="角色">
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="manager">经理</Select.Option>
              <Select.Option value="staff">员工</Select.Option>
              <Select.Option value="member">会员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">停用</Select.Option>
              <Select.Option value="banned">封禁</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="channel" label="注册渠道">
            <Select>
              <Select.Option value="抖音">抖音</Select.Option>
              <Select.Option value="小红书">小红书</Select.Option>
              <Select.Option value="微信">微信</Select.Option>
              <Select.Option value="朋友介绍">朋友介绍</Select.Option>
              <Select.Option value="百度搜索">百度搜索</Select.Option>
              <Select.Option value="线下推广">线下推广</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select>
              <Select.Option value="male">男</Select.Option>
              <Select.Option value="female">女</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="age" label="年龄"><InputNumber min={1} max={120} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="city" label="城市"><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

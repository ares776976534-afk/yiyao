import { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';

const api = path => fetch(`/api${path}`).then(r => r.json());

export default function Settings() {
  const [form] = Form.useForm();

  useEffect(() => {
    api('/settings').then(d => form.setFieldsValue(d || {})).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    const v = await form.validateFields();
    try {
      await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) });
      message.success('保存成功');
    } catch (e) { message.error('保存失败'); }
  };

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 400 }}>
      <Form.Item name="site_name" label="站点名称"><Input /></Form.Item>
      <Form.Item name="site_logo" label="Logo地址"><Input /></Form.Item>
      <Button type="primary" onClick={handleSubmit}>保存设置</Button>
    </Form>
  );
}

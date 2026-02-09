import { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';

const api = path => fetch(`/api${path}`).then(r => r.json());

export default function LotterySetting() {
  const [form] = Form.useForm();

  useEffect(() => {
    api('/lottery-settings').then(d => form.setFieldsValue(d || {})).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    const v = await form.validateFields();
    try {
      await fetch('/api/lottery-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) });
      message.success('保存成功');
    } catch (e) { message.error('保存失败'); }
  };

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 400 }}>
      <Form.Item name="daily_limit" label="每日抽奖次数"><Input type="number" /></Form.Item>
      <Form.Item name="points_cost" label="每次消耗积分"><Input type="number" /></Form.Item>
      <Button type="primary" onClick={handleSubmit}>保存设置</Button>
    </Form>
  );
}

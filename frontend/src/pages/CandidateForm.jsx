import { useState } from 'react';
import {
  Form, Input, Button, Card, Typography, Space, Checkbox, message,
  InputNumber, Select, Result
} from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { post } from '../api';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EDUCATION_OPTIONS = ['初中及以下', '高中/中专', '大专', '本科', '硕士', '博士'];

export default function CandidateForm() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (values) => {
    if (!agreed) {
      message.warning('请阅读并同意授权声明');
      return;
    }
    setSubmitting(true);
    try {
      await post('/candidates', values);
      setSubmitted(true);
    } catch (e) {
      message.error(e.message || '提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: 24 }}>
        <Card style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="提交成功"
            subTitle="感谢您的投递，招聘方会尽快与您联系。"
          />
          <Button type="primary" onClick={() => { setSubmitted(false); form.resetFields(); setAgreed(false); }}>
            继续填写
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px 16px' }}>
      <Card style={{ maxWidth: 640, margin: '0 auto', borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 8 }}>应聘者信息登记表</Title>
          <Paragraph type="secondary">请填写真实信息，方便招聘方与您沟通</Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入真实姓名" size="large" />
          </Form.Item>

          <Space style={{ width: '100%' }} wrap>
            <Form.Item name="age" label="年龄" style={{ width: 120 }}>
              <InputNumber placeholder="年龄" min={16} max={80} style={{ width: '100%' }} size="large" />
            </Form.Item>
            <Form.Item name="education" label="学历" style={{ width: 160 }}>
              <Select placeholder="请选择" size="large" allowClear>
                {EDUCATION_OPTIONS.map(e => <Option key={e} value={e}>{e}</Option>)}
              </Select>
            </Form.Item>
          </Space>

          <Form.Item name="experience" label="工作年限">
            <Input placeholder="如 3年、5-10年" size="large" />
          </Form.Item>

          <Form.Item name="active_at" label="最近活跃时间">
            <Input placeholder="如 刚刚、3天前、1周内" size="large" />
          </Form.Item>

          <Form.Item name="expected_salary" label="期望薪资">
            <Input placeholder="如 15k-20k" size="large" />
          </Form.Item>

          <Form.Item name="available_at" label="可到岗时间">
            <Input placeholder="如 随时、1个月内、协商" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入手机号" size="large" />
          </Form.Item>

          <Form.Item name="wechat" label="微信号">
            <Input placeholder="方便招聘方添加您的微信" size="large" />
          </Form.Item>

          <Form.Item name="note" label="备注">
            <TextArea rows={3} placeholder="其他想补充的信息" />
          </Form.Item>

          <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, padding: 12, marginBottom: 16 }}>
            <Text strong style={{ color: '#389e0d' }}>授权声明</Text>
            <Paragraph style={{ marginBottom: 8, color: '#595959', fontSize: 13 }}>
              本人确认以上信息真实有效，并同意招聘方基于招聘目的收集、存储和使用上述个人信息。招聘方承诺对信息严格保密，仅用于招聘沟通。
            </Paragraph>
            <Checkbox checked={agreed} onChange={e => setAgreed(e.target.checked)}>
              我已阅读并同意上述授权声明
            </Checkbox>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
              提交报名信息
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

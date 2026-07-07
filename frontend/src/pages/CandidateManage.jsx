import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, message,
  Popconfirm, Card, Typography, InputNumber, Image
} from 'antd';
import { PlusOutlined, SearchOutlined, QrcodeOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';
import { get, post, put, del } from '../api';
import { ROUTES } from '../router/routes';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const STATUS_OPTIONS = ['待沟通', '已联系', '面试中', '已通过', '已拒绝', '已入职'];
const EDUCATION_OPTIONS = ['初中及以下', '高中/中专', '大专', '本科', '硕士', '博士'];

const initialForm = {
  name: '',
  experience: '',
  age: '',
  education: '',
  active_at: '',
  expected_salary: '',
  available_at: '',
  phone: '',
  wechat: '',
  note: '',
  status: '待沟通'
};

export default function CandidateManage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [form] = Form.useForm();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get('/candidates', { keyword });
      setList(data);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const refreshQr = (url) => {
    QRCode.toDataURL(url, { width: 240, margin: 2 }).then(setQrUrl);
  };

  const isLocalhost = (url) => /localhost|127\.0\.0\.1|::1/.test(url);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const raw = `${window.location.origin}${ROUTES.CANDIDATE_FORM}`;
    setFormUrl(raw);
    refreshQr(raw);
  }, []);

  const handleAdd = () => {
    setEditing(null);
    form.setFieldsValue(initialForm);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({ ...initialForm, ...record });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await put(`/candidates/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await post('/candidates', values);
        message.success('添加成功');
      }
      setModalOpen(false);
      fetchList();
    } catch (e) {
      message.error(e.message || '保存失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await del(`/candidates/${id}`);
      message.success('删除成功');
      fetchList();
    } catch (e) {
      message.error(e.message || '删除失败');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(formUrl).then(() => message.success('链接已复制'));
  };

  const onUrlChange = (e) => {
    const url = e.target.value.trim();
    setFormUrl(url);
    refreshQr(url || `${window.location.origin}${ROUTES.CANDIDATE_FORM}`);
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 90 },
    { title: '工作年限', dataIndex: 'experience', width: 90 },
    { title: '年龄', dataIndex: 'age', width: 70 },
    { title: '学历', dataIndex: 'education', width: 100 },
    { title: '最近活跃', dataIndex: 'active_at', width: 110 },
    { title: '期望薪资', dataIndex: 'expected_salary', width: 110 },
    { title: '到岗时间', dataIndex: 'available_at', width: 110 },
    { title: '电话', dataIndex: 'phone', width: 120 },
    { title: '微信', dataIndex: 'wechat', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => {
        const color =
          v === '已通过' || v === '已入职' ? 'green' :
          v === '已拒绝' ? 'red' :
          v === '面试中' ? 'blue' :
          v === '已联系' ? 'cyan' : 'default';
        return <span style={{ color }}>{v}</span>;
      }
    },
    { title: '备注', dataIndex: 'note', ellipsis: true },
    { title: '创建时间', dataIndex: 'created_at', width: 170 },
    {
      title: '操作',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={4}>候选人管理</Title>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索姓名/电话/职位/备注"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={fetchList}
            style={{ width: 260 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增候选人</Button>
          <Button icon={<QrcodeOutlined />} onClick={() => setQrOpen(true)}>生成报名二维码</Button>
        </Space>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editing ? '编辑候选人' : '新增候选人'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={initialForm}>
          <Space style={{ width: '100%' }} direction="vertical" size="middle">
            <Space wrap style={{ width: '100%' }}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]} style={{ width: 180 }}>
                <Input placeholder="姓名" />
              </Form.Item>
              <Form.Item name="age" label="年龄" style={{ width: 120 }}>
                <InputNumber placeholder="年龄" min={16} max={80} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="education" label="学历" style={{ width: 140 }}>
                <Select placeholder="学历" allowClear>
                  {EDUCATION_OPTIONS.map(e => <Option key={e} value={e}>{e}</Option>)}
                </Select>
              </Form.Item>
            </Space>
            <Space wrap style={{ width: '100%' }}>
              <Form.Item name="experience" label="工作年限" style={{ width: 160 }}>
                <Input placeholder="如 3年、5-10年" />
              </Form.Item>
              <Form.Item name="active_at" label="最近活跃" style={{ width: 180 }}>
                <Input placeholder="如 刚刚、3天前" />
              </Form.Item>
              <Form.Item name="available_at" label="到岗时间" style={{ width: 180 }}>
                <Input placeholder="如 随时、1个月内" />
              </Form.Item>
            </Space>
            <Space wrap style={{ width: '100%' }}>
              <Form.Item name="expected_salary" label="期望薪资" style={{ width: 180 }}>
                <Input placeholder="如 15k-20k" />
              </Form.Item>
              <Form.Item name="phone" label="联系电话" style={{ width: 180 }}>
                <Input placeholder="手机号" />
              </Form.Item>
              <Form.Item name="wechat" label="微信号" style={{ width: 180 }}>
                <Input placeholder="微信号" />
              </Form.Item>
            </Space>
            <Form.Item name="status" label="面试状态" style={{ width: 160 }}>
              <Select>
                {STATUS_OPTIONS.map(s => <Option key={s} value={s}>{s}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="note" label="备注" style={{ marginBottom: 0 }}>
              <TextArea rows={3} placeholder="备注信息" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      <Modal
        title="应聘者报名表二维码"
        open={qrOpen}
        onCancel={() => setQrOpen(false)}
        footer={null}
        centered
        width={420}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666' }}>应聘者扫码填写后信息会自动进入本系统</p>
          {isLocalhost(formUrl) && (
            <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4, padding: 10, marginBottom: 12, textAlign: 'left' }}>
              <div style={{ color: '#d46b08', fontWeight: 500, marginBottom: 4 }}>⚠ 当前链接是 localhost</div>
              <div style={{ color: '#595959', fontSize: 13 }}>
                微信扫码无法访问本机 localhost。请把下方链接中的 localhost 替换为电脑局域网 IP（如 192.168.x.x），并确保手机与电脑在同一 WiFi。
              </div>
            </div>
          )}
          <Input
            value={formUrl}
            onChange={onUrlChange}
            style={{ marginBottom: 16, textAlign: 'center' }}
          />
          {qrUrl && <Image src={qrUrl} alt="报名二维码" style={{ width: 240, height: 240 }} preview={false} />}
          <div style={{ marginTop: 12, wordBreak: 'break-all', color: '#888', fontSize: 12 }}>{formUrl}</div>
          <Button icon={<CopyOutlined />} onClick={copyUrl} style={{ marginTop: 12 }}>复制报名链接</Button>
        </div>
      </Modal>
    </div>
  );
}

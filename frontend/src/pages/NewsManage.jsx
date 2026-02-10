import { useState } from 'react';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import DynamicTable from '../components/DynamicTable';
import { post, put, del } from '../api/request';

export default function NewsManage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const v = await form.validateFields();
    try {
      editing ? await put(`/news/${editing.id}`, v) : await post('/news', v);
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
        module="news"
        dataApi="/news"
        refreshKey={refreshKey}
        children={<Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增新闻</Button>}
        renderActions={(_, r) => (
          <>
            <Button type="link" size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
            <Button type="link" size="small" danger onClick={async () => { await del(`/news/${r.id}`); message.success('删除成功'); setRefreshKey(k => k + 1); }}>删除</Button>
          </>
        )}
      />
      <Modal title={editing ? '编辑新闻' : '新增新闻'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} width={600}>
        <Form form={form} layout="vertical" initialValues={{ status: 'draft', category: '公司动态' }}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="author" label="作者"><Input /></Form.Item>
          <Form.Item name="category" label="分类">
            <Select>
              <Select.Option value="公司动态">公司动态</Select.Option>
              <Select.Option value="行业新闻">行业新闻</Select.Option>
              <Select.Option value="政策法规">政策法规</Select.Option>
              <Select.Option value="健康知识">健康知识</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value="published">已发布</Select.Option>
              <Select.Option value="draft">草稿</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="content" label="内容"><Input.TextArea rows={6} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

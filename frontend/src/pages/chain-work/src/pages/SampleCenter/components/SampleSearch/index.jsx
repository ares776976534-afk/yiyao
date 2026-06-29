import React, { useState } from 'react';
import { Form, Input, Select, Button } from '@alifd/next';
import SampleBasicLayout from '@/layouts/SampleBasicLayout';
import { ALL, SAMPLE_PENDING, SENT, QUALIFIED, UNQUALIFIED, INVALID } from '../../constant';
import './index.scss';

const dataSource = [
  { label: '全部', value: ALL },
  { label: '待寄样', value: SAMPLE_PENDING },
  { label: '已寄样', value: SENT },
  { label: '验样合格', value: QUALIFIED },
  { label: '验样失败', value: UNQUALIFIED },
  { label: '已作废', value: INVALID },
];

function SampleSearch(props) {
  const { offerId, status, setStatus, setOfferId, setCurrent } = props;
  const [id, setId] = useState(offerId);
  const handleSearch = () => {
    setCurrent(1);
    setOfferId(id);
  };
  const handleReset = () => {
    setCurrent(1);
    setId('');
    setOfferId('');
    setStatus(ALL);
  };
  return (
    <SampleBasicLayout className="search-container basic-layout">
      <Form inline className="search-form">
        <Form.Item label="商品ID" name="id">
          <Input
            style={{ width: 200 }}
            placeholder="请输入"
            hasClear
            value={id}
            onChange={(value) => setId(value)}
            onPressEnter={handleSearch}
          />
        </Form.Item>
        <Form.Item label="寄样状态" name="id">
          <Select
            dataSource={dataSource}
            style={{ width: 200 }}
            placeholder="请输入"
            value={status}
            onChange={(_status) => {
              setCurrent(1);
              setStatus(_status);
            }}
          />
        </Form.Item>
        <Form.Item className="btn-container">
          <Button type="primary" className="search-btn" onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Form.Item>
      </Form>
    </SampleBasicLayout>
  );
}

export default SampleSearch;

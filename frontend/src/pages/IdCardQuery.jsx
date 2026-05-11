import { useState } from 'react';
import { Card, Input, Button, Descriptions, message, Spin, Empty } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import { get } from '../api/request';

export default function IdCardQuery() {
  const [idCard, setIdCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleQuery = () => {
    const v = idCard.trim();
    if (!/^\d{17}[\dXx]$/.test(v)) return message.error('请输入正确的18位身份证号码');
    setLoading(true);
    get('/idcard', { id: v })
      .then(r => {
        if (r.code === 200) setResult(r.data);
        else { message.error(r.msg || '查询失败'); setResult(null); }
      })
      .catch(() => { message.error('查询失败'); setResult(null); })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>身份证查询</h2>
      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <Input
            prefix={<IdcardOutlined />}
            placeholder="请输入18位身份证号码"
            value={idCard}
            onChange={e => setIdCard(e.target.value)}
            onPressEnter={handleQuery}
            maxLength={18}
            style={{ maxWidth: 400 }}
            allowClear
          />
          <Button type="primary" onClick={handleQuery} loading={loading}>查询</Button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : result ? (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="身份证号码">{result.idCardNum}</Descriptions.Item>
            <Descriptions.Item label="性别">{result.gender}</Descriptions.Item>
            <Descriptions.Item label="出生日期">{result.birthday}</Descriptions.Item>
            <Descriptions.Item label="年龄">{result.age}</Descriptions.Item>
            <Descriptions.Item label="生肖">{result.zodiac}</Descriptions.Item>
            <Descriptions.Item label="星座">{result.constellation}</Descriptions.Item>
            <Descriptions.Item label="归属地" span={2}>{result.address}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="请输入身份证号码查询" />
        )}
      </Card>
    </div>
  );
}

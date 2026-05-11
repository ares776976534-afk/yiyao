import { useEffect, useState } from 'react';
import { Card, Input, Button, Descriptions, message, Spin, Empty, QRCode, Alert, Tag } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import { get, post } from '../api/request';

export default function IdCardQuery() {
  const [idCard, setIdCard] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [auth, setAuth] = useState(null);
  const [authResult, setAuthResult] = useState(null);
  const [faceConfig, setFaceConfig] = useState(null);

  useEffect(() => {
    get('/idcard/face-config').then(r => setFaceConfig(r.data)).catch(() => {});
  }, []);

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

  const handleFaceAuth = () => {
    const v = idCard.trim();
    if (!/^\d{17}[\dXx]$/.test(v)) return message.error('请输入正确的18位身份证号码');
    if (!name.trim()) return message.error('请输入姓名');
    setAuthLoading(true);
    post('/idcard/face-auth', { id: v, name: name.trim() })
      .then(r => {
        if (r.code === 200) { setAuth(r.data); setAuthResult(null); }
        else message.error(r.msg || '生成核身二维码失败');
      })
      .catch(() => message.error('生成核身二维码失败'))
      .finally(() => setAuthLoading(false));
  };

  const handleFaceResult = () => {
    if (!auth?.bizToken) return;
    setAuthLoading(true);
    get('/idcard/face-result', { bizToken: auth.bizToken })
      .then(r => {
        if (r.code === 200) setAuthResult(r.data);
        else message.error(r.msg || '获取核身结果失败');
      })
      .catch(() => message.error('获取核身结果失败'))
      .finally(() => setAuthLoading(false));
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
      <Card title="微信扫码人脸核身" style={{ marginTop: 16 }}>
        {faceConfig && !faceConfig.configured && (
          <Alert
            style={{ marginBottom: 16 }}
            type="warning"
            showIcon
            message={`实名核身未配置：${faceConfig.missing.join('、')}`}
          />
        )}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Input placeholder="请输入姓名" value={name} onChange={e => setName(e.target.value)} style={{ maxWidth: 220 }} />
          <Button type="primary" onClick={handleFaceAuth} loading={authLoading}>生成核身二维码</Button>
          <Button onClick={handleFaceResult} disabled={!auth?.bizToken} loading={authLoading}>获取核身结果</Button>
        </div>
        {auth?.url ? (
          <div>
            <QRCode value={auth.url} size={220} />
            <Alert style={{ marginTop: 16 }} type="info" showIcon message="请使用微信扫码完成人脸识别，完成后点击获取核身结果" />
          </div>
        ) : <Empty description="请先生成核身二维码" />}
        {authResult && (
          <Descriptions bordered column={2} style={{ marginTop: 16 }}>
            <Descriptions.Item label="核身结果">
              {authResult.verified ? <Tag color="success">通过</Tag> : <Tag color="error">未通过</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="相似度">{authResult.sim}</Descriptions.Item>
            <Descriptions.Item label="姓名">{authResult.name}</Descriptions.Item>
            <Descriptions.Item label="身份证号">{authResult.idCard}</Descriptions.Item>
            <Descriptions.Item label="活体结果">{authResult.liveMsg}</Descriptions.Item>
            <Descriptions.Item label="比对结果">{authResult.compareMsg || authResult.errMsg}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
}

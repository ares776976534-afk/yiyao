import { useState } from 'react';
import {
  Card, Input, Button, Tabs, Table, Tag, Typography, Space,
  Statistic, Alert, Image, message
} from 'antd';
import { SearchOutlined, DownloadOutlined, LinkOutlined, PictureOutlined, PlayCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { post } from '../api';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(rows, filename) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const v = String(r[h] ?? '').replace(/"/g, '""');
      return `"${v}"`;
    }).join(','))
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function WebCrawler() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCrawl = async () => {
    if (!url.trim()) {
      message.warning('请输入 URL');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await post('/crawl', { url: url.trim() });
      if (res.code !== 0) throw new Error(res.msg || '抓取失败');
      setResult(res.data);
      message.success('抓取成功');
    } catch (e) {
      setError(e.message || '抓取失败');
      message.error(e.message || '抓取失败');
    } finally {
      setLoading(false);
    }
  };

  const linkColumns = [
    {
      title: '链接',
      dataIndex: 'url',
      render: (v) => (
        <a href={v} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all' }}>
          <LinkOutlined style={{ marginRight: 4 }} />{v}
        </a>
      )
    },
    { title: '文本', dataIndex: 'text', width: 240 }
  ];

  const imageColumns = [
    {
      title: '预览',
      dataIndex: 'url',
      width: 120,
      render: (v) => <Image src={v} alt="" style={{ maxWidth: 100, maxHeight: 80 }} fallback="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
    },
    {
      title: '地址',
      dataIndex: 'url',
      render: (v) => (
        <a href={v} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all' }}>
          {v}
        </a>
      )
    },
    { title: 'Alt', dataIndex: 'alt', width: 200 }
  ];

  return (
    <div>
      <Title level={4}>网页抓取工具</Title>
      <Card style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="输入网址，例如 https://example.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onPressEnter={handleCrawl}
            size="large"
          />
          <Button type="primary" icon={<SearchOutlined />} size="large" loading={loading} onClick={handleCrawl}>
            抓取
          </Button>
        </Space.Compact>
        <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>
          提示：请输入公开可访问的网页地址。工具会提取页面标题、描述、链接、图片、视频地址和正文预览。
        </Paragraph>
      </Card>

      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}

      {result && (
        <Card>
          <Space wrap style={{ marginBottom: 16 }}>
            <Statistic title="标题" value={result.title || '-'} valueStyle={{ fontSize: 16, width: 280 }} />
            <Statistic title="状态码" value={result.statusCode} valueStyle={{ fontSize: 16 }} />
            <Statistic title="链接数" value={result.linkCount} valueStyle={{ fontSize: 16, color: '#1890ff' }} />
            <Statistic title="图片数" value={result.imageCount} valueStyle={{ fontSize: 16, color: '#52c41a' }} />
            <Statistic title="视频数" value={result.videoCount} valueStyle={{ fontSize: 16, color: '#fa8c16' }} />
            <Button icon={<DownloadOutlined />} onClick={() => downloadJSON(result, 'crawl_result.json')}>导出 JSON</Button>
            {result.links?.length > 0 && (
              <Button icon={<DownloadOutlined />} onClick={() => downloadCSV(result.links, 'links.csv')}>导出链接 CSV</Button>
            )}
          </Space>

          {(result.description || result.keywords) && (
            <div style={{ marginBottom: 16 }}>
              {result.description && <Paragraph><Text strong>描述：</Text>{result.description}</Paragraph>}
              {result.keywords && <Paragraph><Text strong>关键词：</Text><Tag>{result.keywords}</Tag></Paragraph>}
            </div>
          )}

          <Tabs defaultActiveKey="links">
            <TabPane tab={<span><LinkOutlined />链接</span>} key="links">
              <Table
                rowKey="url"
                columns={linkColumns}
                dataSource={result.links}
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </TabPane>
            <TabPane tab={<span><PictureOutlined />图片</span>} key="images">
              <Table
                rowKey="url"
                columns={imageColumns}
                dataSource={result.images}
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </TabPane>
            <TabPane tab={<span><PlayCircleOutlined />视频</span>} key="videos">
              {result.videos?.length ? (
                <ul style={{ paddingLeft: 16 }}>
                  {result.videos.map((v, i) => (
                    <li key={i} style={{ marginBottom: 8, wordBreak: 'break-all' }}>
                      <a href={v} target="_blank" rel="noreferrer">{v}</a>
                    </li>
                  ))}
                </ul>
              ) : <Paragraph type="secondary">未检测到视频直链</Paragraph>}
            </TabPane>
            <TabPane tab={<span><FileTextOutlined />正文预览</span>} key="text">
              <Paragraph style={{ whiteSpace: 'pre-wrap', background: '#f6ffed', padding: 12, borderRadius: 4 }}>
                {result.textPreview || '无正文内容'}
              </Paragraph>
            </TabPane>
          </Tabs>
        </Card>
      )}
    </div>
  );
}

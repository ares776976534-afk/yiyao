// 创建claw实例
import { materiaRequest as request } from '@/services/httpRequest';

// 兆文
const mockResponse = {
  "success": true,
  "language": "zh_CN",
  "invokeTime": null,
  "costTime": null,
  "retCode": "S0000",
  "retMsg": null,
  "exception": null,
  "result": {
    "machineUrl": "wss://30100-s-04owxw8rlp8kifoo3.cn-hangzhou.agentbay.wuying.com:8001",
    "token": 'dkswixkwjwl6medd29bynlrbehyfxidljeiersaf',
    "sessionKey": "agent:main:main"
  }
};

export default async function (): Promise<any> {
  // return mockResponse.result;

  const res = await request('/alphaclaw/deploy/create', {
    method: 'POST',
    credentials: 'include',
    body: "{}", // 无参，但是请求体需要空对象
  });

  if (!res.success) {
    const errorMap = {
      'DEPLOY_NUM_LIMIT': '申请数量已达上限，无法提供服务'
    }
    throw new Error(errorMap[res.retCode] || res.retMsg || res.exception || '');
  }

  return res.result;
}


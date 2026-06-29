// 获取Claw设置中个性化配置
import { materiaRequest as request } from '@/services/httpRequest';

const mockData = [
  {
    "channelName": "feishu",
    "displayName": "飞书",
    "enabled": true,
    "credentials": {
      "appId": "cli***xxx",
      "appSecret": "***"
    }
  },
  {
    "channelName": "dingtalk",
    "displayName": "钉钉",
    "enabled": false,
    "credentials": {
      "clientId": "",
      "clientSecret": "",
      "robotCode": ""
    }
  },
  {
    "channelName": "qqbot",
    "displayName": "QQ",
    "enabled": false,
    "credentials": {
      "appId": "",
      "clientSecret": ""
    }
  }
];

const mockResponse = {
  "success": true,
  "language": "zh_CN",
  "invokeTime": null,
  "costTime": null,
  "retCode": "S0000",
  "retMsg": null,
  "exception": null,
  "result": "渠道配置保存成功"
};

export default async function (data: any): Promise<any> {
  // return mockResponse.success;

  try {
    const res = await request('/alphaclaw/channel/config', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.success) {
      throw new Error(res.retMsg || res.exception || '');
    }

    return true;
  } catch (e) {
    throw new Error(e?.message || '保存失败');
  }
}


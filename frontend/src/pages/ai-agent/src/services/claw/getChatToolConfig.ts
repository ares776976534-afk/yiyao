// 获取Claw设置中个性化配置
import { materiaRequest as request } from '@/services/httpRequest';

const mockResponse = {
  "success": true,
  "result": {
    "channels": [
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
    ]
  }
}

export default async function (): Promise<any> {
  // return mockResponse.result;

  try {
    const res = await request('/alphaclaw/channel/config', {
      method: 'GET',
      credentials: 'include',
    });

    return res?.result;
  } catch (e) {
    return '';
  }
}


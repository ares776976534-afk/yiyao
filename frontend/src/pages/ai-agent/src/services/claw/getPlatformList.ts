// 获取Claw设置中个性化配置
import { materiaRequest as request } from '@/services/httpRequest';

const mockResponse = {
  "success": true,
  "language": "zh_CN",
  "invokeTime": null,
  "costTime": null,
  "retCode": "S0000",
  "retMsg": null,
  "exception": null,
  "result": [
    {
      "skillKey": "ozon-11-我的ozon店铺",
      "channel": "Ozon",
      "shopName": "11 我的Ozon店铺",
      "shopIdentifier": "11 我的Ozon店铺",
      "enabled": true,
      "credentials": {
        "OZON_API_KEY": "b abc123xyz789",
        "OZON_CLIENT_ID": "aa 12345",
        "SHOP_NAME": "11 我的Ozon店铺"
      },
      "authorizedTime": "2026-03-10"
    }
  ]
};

export default async function (data: any): Promise<any> {
  // return mockResponse.success;

  try {
    const res = await request('/alphaclaw/platform/accounts/list', {
      method: 'GET',
      credentials: 'include',
    });

    return res?.result;
  } catch (e) {
    return '';
  }
}


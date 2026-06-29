// 获取claw设置中的模型信息
import { materiaRequest as request } from '@/services/httpRequest';
const mockResponse = {
  "success": true,
  "language": "zh_CN",
  "invokeTime": null,
  "costTime": null,
  "retCode": "S0000",
  "retMsg": null,
  "exception": null,
  "result": {
    "useDefault": true,
    "totalPoints": 10000,
    "freePoints": 8000,
    "rechargePoints": 2000,
    "defaultModel": {
      "modelName": "anthropic/a",
      "apiKey": "sk-***************",
      "baseUrl": "https://coding.dashscope.aliyuncs.com/v1"
    },
    "customModel": {
      "modelName": "",
      "apiKey": "",
      "baseUrl": ""
    }
  }
};

export default async function (): Promise<any> {
  // return mockResponse.result;
  try {
    const res = await request('/alphaclaw/model/config', {
      method: 'GET',
      credentials: 'include',
    });

    return res?.result;
  } catch (e) {
    return '';
  }
}


/** 是否可以显示终端 */
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
      "userId": 2219675197903,
      "terminalAccess": false
  }
}

export default async function (): Promise<any> {
  // return mockResponse.result.terminalAccess;

  try {
    const res = await request('/alphaclaw/user/permissions', {
      method: 'GET',
      credentials: 'include',
    });

    return res?.result?.terminalAccess;
  } catch (e) {
    return '';
  }
}


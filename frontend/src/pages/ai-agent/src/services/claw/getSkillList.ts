// 获取skills列表
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
    "skills": [
      {
        "skillId": "1688-Product-to-Ozon",
        "skillName": "1688-Product-to-Ozon",
        "description": "",
        "version": "",
        "configured": false,
        "enabled": false,
        "source": "workspace",
        "isOfficial": false
      },
      {
        "skillId": "alphashop-image",
        "skillName": "alphashop-image",
        "description": "",
        "version": "",
        "configured": false,
        "enabled": false,
        "source": "workspace",
        "isOfficial": true
      },
      {
        "skillId": "alphashop-text",
        "skillName": "alphashop-text",
        "description": "",
        "version": "",
        "configured": false,
        "enabled": false,
        "source": "workspace",
        "isOfficial": true
      },
      {
        "skillId": "inquiry-1688",
        "skillName": "inquiry-1688",
        "description": "",
        "version": "",
        "configured": false,
        "enabled": false,
        "source": "workspace",
        "isOfficial": false
      },
      {
        "skillId": "ozon-product-selection",
        "skillName": "ozon-product-selection",
        "description": "",
        "version": "",
        "configured": false,
        "enabled": false,
        "source": "workspace"
      },
      {
        "skillId": "ozon-stock-manager",
        "skillName": "ozon-stock-manager",
        "description": "",
        "version": "",
        "configured": false,
        "enabled": false,
        "source": "workspace",
        "isOfficial": false
      },
      {
        "skillId": "query-1688-product-detail",
        "skillName": "query-1688-product-detail",
        "description": "",
        "version": "",
        "configured": false,
        "enabled": false,
        "source": "workspace",
        "isOfficial": false
      },
      {
        "skillId": "search-1688-supplier",
        "skillName": "search-1688-supplier",
        "description": "",
        "version": "",
        "configured": false,
        "enabled": false,
        "source": "workspace",
        "isOfficial": false
      }
    ]
  }
};

export default async function getSkillList(): Promise<any[]> {
  // return mockResponse.result.skills;

  try {
    const res = await request('/alphaclaw/skills/list', {
      method: 'GET',
      credentials: 'include',
    });

    return res.result.skills || [];
  } catch (e) {
    return [];
  }
}


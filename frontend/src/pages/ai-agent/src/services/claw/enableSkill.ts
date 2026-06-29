// 是否启用技能
import { materiaRequest as request } from '@/services/httpRequest';

const mockResponse = {
  "success": true,
};

export default async function (skillId: string, enabled: boolean): Promise<boolean> {
  // return mockResponse.result;

  try {
    const res = await request('/alphaclaw/skills/toggle', {
      method: 'POST',
      body: JSON.stringify({ skillId, enabled }),
      credentials: 'include',
    });

    return res.success;
  } catch (e) {
    return false;
  }
}


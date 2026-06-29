// 启用知识库
import { materiaRequest as request } from '@/services/httpRequest';

export type TypeKnowledgeListResponse = {
  "success": boolean;
  "result"?: boolean;
  "retCode"?: string;
  "retMsg"?: string;
  "exception"?: any;
};

export default async function (
  kbId: string,
): Promise<boolean> {
  const res = await request(`/personalKb/disable?kbId=${kbId}`, {
    method: 'POST',
    credentials: 'include',
  });

  if (res && res.result) {
    return true;
  }

  throw {
    success: res?.success || false,
    retCode: res?.retCode,
    message: res?.retMsg || '操作失败',
    result: res?.result || false,
    exception: res?.exception || null,
  };
}

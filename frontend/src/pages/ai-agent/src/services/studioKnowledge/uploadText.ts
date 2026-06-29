// 把文本上传到知识库
import { materiaRequest as request } from '@/services/httpRequest';

export type TypeKnowledgeListResponse = {
  "success": boolean;
  "result"?: boolean;
  "retCode"?: string;
  "retMsg"?: string;
  "exception"?: any;
};

export default async function (
  textContent: string,
): Promise<any> {
  const res = await request(`/resource/rawContent/upload`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify([textContent]),
  });

  if (res && res.result && res.result?.[0]) {
    return res.result[0];
  }

  throw {
    success: res?.success || false,
    retCode: res?.retCode,
    message: res?.retMsg || '操作失败',
    result: res?.result || [],
    exception: res?.exception || null,
  };
}

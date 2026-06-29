// 图片/文档等文件上传
import { materiaRequest as request } from '@/services/httpRequest';

export type TypeKnowledgeListResponse = {
  "success": boolean;
  "result"?: boolean;
  "retCode"?: string;
  "retMsg"?: string;
  "exception"?: any;
};

export default async function (
  formData: FormData,
): Promise<any[]> {
  const res = await request(`/resource/file/upload`, {
    method: 'POST',
    headers: {
      'content-type': 'multipart/form-data',
    },
    credentials: 'include',
    body: formData,
  });

  if (res && res.result) {
    return res.result;
  }

  throw {
    success: res?.success || false,
    retCode: res?.retCode,
    message: res?.retMsg || '操作失败',
    result: res?.result || [],
    exception: res?.exception || null,
  };
}

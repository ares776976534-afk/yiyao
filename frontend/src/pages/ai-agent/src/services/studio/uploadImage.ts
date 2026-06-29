// 图片上传
import { materiaRequest as request } from "@/services/httpRequest";

export interface TypeUploadImageResponse {
  success?: boolean;
  retCode?: string;
  retMsg?: string;
  result?: string;
}

// 上传图片 base64，返回后端生成的可访问 URL
export async function uploadImageBase64ReturnUrl(base64: string): Promise<string> {
  // 统一在接口层剥离 dataURL 前缀
  const commaIndex = base64.indexOf(',');
  const normalizedBase64 = commaIndex >= 0
    ? base64.slice(commaIndex + 1)
    : base64.replace(/^data:image\/[a-zA-Z.+-]+;base64,?/, '');
  const endpoint = `/upload/image`;

  try {
    const response = await request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64: normalizedBase64 }),
      credentials: 'include',
    });

    const data = response;

    if (!data || data.success !== true || !data.result) {
      throw new Error(data?.retMsg || 'upload image failed');
    }

    return data.result;
  } catch (e) {
    throw new Error('upload image failed: invalid json response');
  }
}



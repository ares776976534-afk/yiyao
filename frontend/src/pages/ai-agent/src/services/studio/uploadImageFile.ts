// 图片上传
import { materiaRequest as request } from "@/services/httpRequest";

export interface TypeUploadImageResponse {
  success?: boolean;
  retCode?: string;
  retMsg?: string;
  result?: string;
}

// 上传图片，返回后端生成的可访问 URL
export async function uploadImageFile(file: File): Promise<string> {
  // 创建 FormData 对象
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload/imageFile', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data = response;

  if (!data || data.success !== true || !data.result) {
    throw new Error(data?.retMsg || 'upload image failed');
  }

  return data.result;
}

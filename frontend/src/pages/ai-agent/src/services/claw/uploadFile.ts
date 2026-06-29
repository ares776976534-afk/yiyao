import { materiaRequest as request } from '@/services/httpRequest';

function pickUploadUrl(res: unknown): string {
  if (typeof res === 'string' && res.trim()) {
    return res.trim();
  }
  if (res && typeof res === 'object') {
    const o = res as Record<string, unknown>;
    
    if (typeof o.result === 'string' && o.result) {
      return o.result;
    }
  }
  return '';
}

/** 上传文件，返回可访问 URL；失败返回空字符串 */
export default async function uploadFile(data: FormData): Promise<string> {

  // return await new Promise(resolve => setTimeout(() => resolve('https://img.alicdn.com/imgextra/i3/O1CN01tmlikS1pzSAH3luE1_!!6000000005431-55-tps-16-16.svg'), (i++) * 1500));

  const res = await request('/upload/alphaclawFile', {
    method: 'POST',
    body: data,
    headers: {
      'content-type': 'multipart/form-data',
    },
    credentials: 'include',
  });
  return pickUploadUrl(res);
}


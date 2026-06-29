// 上传到 AlphaClaw 工作区（与 FileSystemPanel 使用同一套接口）

import { uploadFileManagerFile } from './fileManagerApi';

/** 上传文件（multipart：file、可选 filePath） */
export default async function uploadFile(data: FormData): Promise<string> {
  return uploadFileManagerFile(data);
}


// 获取知识库列表
import { materiaRequest as request } from '@/services/httpRequest';

// 文件类型定义
export interface TypeFile {
  id: string; // 文件id
  name: string; // 文件名称
  contentType: string; // 文件类型
  url: string; // 文件url
  metadata?: Record<string, any>; // 文件元数据
}

export interface TypeKnowledgeListItem {
  kbId?: string; // 知识库id，有id是更新，没有id是创建
  kbName: string; // 知识库名称
  kbType: string; // 知识库类型 text-文本知识库/image-图片知识库
  kbDesc: string; // 知识库描述
  fileList: TypeFile[]; // 文件列表
}

export type TypeKnowledgeListResponse = TypeKnowledgeListItem[];

export default async function getKnowledgeList(
  params?: Record<string, any>,
): Promise<TypeKnowledgeListResponse> {
  try {
    const res = await request('/personalKb/create', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (res && res.result?.kbInfo) {
      return res.result?.kbInfo;
    }

    return [];
  } catch (e) {
    console.error('获取知识库列表失败:', e);
    return [];
  }
}

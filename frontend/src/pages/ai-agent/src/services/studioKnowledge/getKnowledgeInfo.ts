// 查询知识库详情
import { materiaRequest as request } from '@/services/httpRequest';
import type { TypeFile } from './createKnowledge';

export interface TypeKbInfo {
  kbId: string; // 个人知识库 id
  kbName: string; // 知识库名称
  kbType: 'image' | 'text'; // 知识库类型 text-文本知识库/image-图片知识库
  kbDesc: string; // 知识库描述
  textContentList?: string[]; // 用户输入文本
  fileList?: TypeFile[]; // 用户输入文件
  enable: boolean; // 是否开启
  status: 'create' | 'success' | 'failed'; // create-创建中, success-创建成功, failed-创建失败
}


export default async function getKnowledgeInfo(
  kbId: string,
): Promise<TypeKbInfo | null> {

  try {
    const res = await request(`/personalKb/info?kbId=${kbId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (res && res.result) {
      return res.result;
    }

    return null;
  } catch (e) {
    return null;
  }

  // Mock 数据用于开发测试
  if (kbId === '1') {
    return {
      kbId: '1',
      kbName: '测试图片知识库',
      kbType: 'image',
      kbDesc: '这是一个测试图片知识库',
      fileList: [
        {
          id: '1',
          name: '示例图片1.jpg',
          url: 'https://img.alicdn.com/imgextra/i1/O1CN01abc123_!!6000000001234-0-tps-100-100.jpg',
          contentType: 'image/jpeg',
        },
        {
          id: '2',
          name: '示例图片2.jpg',
          url: 'https://img.alicdn.com/imgextra/i2/O1CN01def456_!!6000000001234-0-tps-100-100.jpg',
          contentType: 'image/jpeg',
        },
      ],
      enable: true,
      status: 'success',
    };
  }

  if (kbId === '2') {
    return {
      kbId: '2',
      kbName: '测试文本知识库',
      kbType: 'text',
      kbDesc: '这是一个测试文本知识库',
      textContentList: ['这是第一段文本内容', '这是第二段文本内容'],
      enable: true,
      status: 'success',
    };
  }
}


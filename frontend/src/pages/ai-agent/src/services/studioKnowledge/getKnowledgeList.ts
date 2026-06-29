// 查询知识库详情
import { materiaRequest as request } from '@/services/httpRequest';

export interface TypeKbInfo {
  kbId: string; // 个人知识库 id
  kbName: string; // 知识库名称
  kbDesc: string; // 知识库描述
  enable: boolean; // 是否开启
  status: string; // create-创建中, success-创建成功, failed-创建失败
  createTime: number; // 创建时间，时间戳
}

export default async function getKnowledgeInfo(
): Promise<TypeKbInfo[]> {
  try {
    const res = await request('/personalKb/list', {
      method: 'GET',
      credentials: 'include',
    });

    if (res && res.result) {
      return res.result;
    }

    return [];
  } catch (e) {
    return [];
  }
  // Mock 数据用于开发测试
  return [
    {
      kbId: '1',
      kbName: '测试图片知识库',
      kbDesc: 'creative',
      enable: true,
      status: 'create',
      createTime: Date.now(),
    },
    {
      kbId: '2',
      kbName: '测试文本知识库',
      kbDesc: 'edit',
      enable: true,
      status: 'failed',
      createTime: Date.now(),
    },
    {
      kbId: '3',
      kbName: '测试品牌素材库',
      kbDesc: 'brand',
      enable: true,
      status: 'success',
      createTime: Date.now(),
    },
    {
      kbId: '4',
      kbName: '测试产品介绍文案',
      kbDesc: 'product',
      enable: false,
      status: 'success',
      createTime: Date.now(),
    },
    {
      kbId: '5',
      kbName: '测试节日促销素材',
      kbDesc: 'festival',
      enable: true,
      status: 'create',
      createTime: Date.now(),
    },
    {
      kbId: '6',
      kbName: '测试营销话术库',
      kbDesc: 'marketing',
      enable: true,
      status: 'success',
      createTime: Date.now(),
    },
    {
      kbId: '7',
      kbName: '测试Banner设计参考',
      kbDesc: 'banner',
      enable: true,
      status: 'success',
      createTime: Date.now(),
    },
    {
      kbId: '8',
      kbName: '测试SEO关键词库',
      kbDesc: 'seo',
      enable: false,
      status: 'success',
      createTime: Date.now(),
    },
  ];

}


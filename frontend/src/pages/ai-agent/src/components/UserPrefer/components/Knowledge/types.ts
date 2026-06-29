export enum EnumKnowledgeStatus {
  Parsing = 'create',
  Success = 'success',
  Failed = 'failed',
}

export interface TypeKnowledgeItem {
  kbId: string;
  kbName: string;
  kbType: string;
  createTime: number;
  kbDesc?: string;
  status: string;
  enable: boolean;
}


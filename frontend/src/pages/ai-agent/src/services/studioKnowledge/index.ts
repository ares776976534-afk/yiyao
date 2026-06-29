// 知识库相关接口统一导出
export { default as getKnowledgeList } from './getKnowledgeList';
export { default as createKnowledge } from './createKnowledge';
export { default as getKnowledgeInfo } from './getKnowledgeInfo';
export { default as enableKnowledge } from './enableKnowledge';
export { default as disableKnowledge } from './disableKnowledge';
export { default as deleteKnowledge } from './deleteKnowledge';
export { default as uploadFile } from './upload';
export { default as uploadText } from './uploadText';
export { default as parseImageFeature } from './parseImageFeature';
export type { TypeKnowledgeListResponse } from './deleteKnowledge';
export type { TypeKbInfo } from './getKnowledgeInfo';
import type { TypeFileItem, TypeImageFromUrl } from '@/components/InputChat/utils/fileSelector';

export enum EnumToolType {
  MODEL_UPPER_BODY = 'MODEL_UPPER_BODY', // 模特上身
  MARKETING_IMAGE = 'MARKETING_IMAGE', // 营销图生成
  BACKGROUND_GENERATION = 'BACKGROUND_GENERATION', // 背景图生成
  STYLE_TRANSFER = 'STYLE_TRANSFER', // 风格迁移
  IMAGE_TRANSLATION = 'IMAGE_TRANSLATION', // 图片翻译
}

export interface TypeUploadConfig {
  uploadIcon?: string;
  label: string; // 上传组件的标签
  multiple?: boolean; // 是否支持多选，默认false
  maxCount?: number; // 最大上传数量，仅在multiple为true时生效
}

export interface TypeToolConfig {
  type: string;
  title: string;
  description: string;
  image: string;
  uploads: TypeUploadConfig[]; // 上传配置数组
  quickTemplate?: TypeImageFromUrl[][]; // 快捷模板，每个元素是图片数组
  modalImage: string;
  extra?: any;
  prompt?: string;
}

export interface TypeUploadComponentProps {
  preview?: boolean;
  uploadClassNames?: {
    root?: string;
    uploadIcon?: string;
    uploadText?: string;
    uploadArea?: string;
    filePreviewContainer?: string;
    deleteButton?: string;
  };
  uploadConfig: TypeUploadConfig;
  uploadedFiles: TypeFileItem[];
  uploadIcon: React.ReactNode;
  onFilesUpload: (files: TypeFileItem[]) => void;
  onFileDelete: (fileId: string) => void;
  store: any;
}

export interface TypeCaseToolsProps {
  className?: string;
  max?: number;
  jumpPageParams?: any;
  onClick?: (tool: TypeToolConfig) => boolean;
}

export type { TypeImageFromUrl };
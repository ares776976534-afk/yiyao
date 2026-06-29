import {
  OriginalImageIcon,
  StyleImageIcon,
  ModelImageIcon,
} from '@/components/Icons/Upload';
import { EnumToolType } from './types';

/**
 * 根据工具类型和索引获取对应的上传图标
 * @param type 工具类型
 * @param index 上传组件索引
 */
export const getUploadIcon = (type: EnumToolType, index: number) => {
  if (type === EnumToolType.MODEL_UPPER_BODY && index === 0) {
    return <ModelImageIcon />;
  } else if (
    [EnumToolType.BACKGROUND_GENERATION, EnumToolType.STYLE_TRANSFER].includes(type) &&
    index === 0
  ) {
    return <OriginalImageIcon />;
  } else {
    return <StyleImageIcon />;
  }
};

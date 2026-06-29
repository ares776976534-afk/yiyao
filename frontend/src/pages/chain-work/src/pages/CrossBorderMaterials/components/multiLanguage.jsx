import React from 'react';
import { Icon } from '@alifd/next';
import { SCHEMA_TEXTAREA } from '@/components/CommonTable/contanst';
import { SCHEMA_UPLOAD } from '@/pages/AlipayInternationalAccountRegistration/contanst';
import '../index.scss';

const urlList = (url) => {
  return {
    uid: '-1',
    name: 'image.png',
    status: 'done',
    url,
  };
};

// 上传组件配置
const createUploadConfig = (fieldKey, field) => ({
  hasClear: true,
  listType: 'picture-card',
  action: 'https://crossborder.1688.com/choice/upload',
  accept: '.jpg,.jpeg,.png,.pdf',
  fileList: field.getValue(fieldKey)?.map(ele => {
    return urlList(ele);
  }),
  className: 'upload-image',
  disabled: true,
  children: field.getValue(fieldKey)?.length >= 1 ? null : (
    <div className="upload-container">
      <div>
        <div className="text-[#999]">暂无</div>
      </div>
    </div>
  ),
});

// 字段配置映射
const FIELD_CONFIGS = {
  Zh: {
    title: { name: '标题', fieldKey: 'titleZh', style: { width: '356px' }, disabled: true },
    productMainImage: { name: '商品主图', fieldKey: 'productMainImageZh' },
    skuImage: { name: 'SKU图', fieldKey: 'skuImageZh' },
    productDetailImage: { name: '商品详情图', fieldKey: 'productDetailImageListZh' },
  },
  En: {
    title: { name: '标题 (英文)', fieldKey: 'titleEn', style: { width: '356px' } },
    productMainImage: { name: '商品主图 (英文)', fieldKey: 'productMainImageEn' },
    skuImage: { name: 'SKU图 (英文)', fieldKey: 'skuImageEn' },
    productDetailImage: { name: '商品详情图 (英文)', fieldKey: 'productDetailImageListEn' },
  },
};

// 字段类型配置
const FIELD_TYPES = {
  title: (config, field) => ({
    ...config,
    type: SCHEMA_TEXTAREA,
    opt: {
      hasClear: true,
      disabled: config?.disabled,
      ...(config.style && { style: config.style }),
    },
    style: { marginBottom: '12px' },
  }),

  upload: (config, field) => ({
    ...config,
    type: SCHEMA_UPLOAD,
    opt: createUploadConfig(config.fieldKey, field),
    style: { marginBottom: '12px' },
  }),
};

// 生成字段配置
const generateFields = (lang, field) => {
  const config = FIELD_CONFIGS[lang];
  if (!config) return [];
  return [
    FIELD_TYPES.title(config.title, field),
    FIELD_TYPES.upload(config.productMainImage, field),
    FIELD_TYPES.upload(config.skuImage, field),
    FIELD_TYPES.upload(config.productDetailImage, field),
  ];
};

export default ({ state, field }) => generateFields(state, field);
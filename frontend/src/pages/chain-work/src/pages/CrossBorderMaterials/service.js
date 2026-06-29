import { fetchItemMtop } from '@alife/dior-fetch-data';
import mtopRequest from '@/service/mtop';

// 编辑跨境素材
export const queryCrossBorderComponentByItemId = async (params) => {
  return fetchItemMtop('CDT_86aI3P', 'queryCrossBorderComponentByItemId', params);
};

// 更新单个商品的跨境素材
export const updateMaterialInfo = async (params) => {
  return fetchItemMtop('CDT_4saDlI', 'updateMaterialInfo', params);
};

// 查询单个商品的跨境素材
export const queryMaterialInfo = async (params) => {
  return fetchItemMtop('CDT_4saDlI', 'queryMaterialInfo', params);
};

// 跨境AI商品素材查询
export const queryCrossAIProductMaterials = async (params) => {
  return fetchItemMtop('CDT_86aI3P', 'queryCrossAIProductMaterials', params).then(res => res?.content);
};

// 跨境ai商品素材下载
// export const downloadCrossAIProductMaterials = async (params) => {
//   return fetchItemMtop('CDT_86aI3P', 'downloadCrossAIProductMaterials', params);
// };

// 跨境ai商品素材更新
export const updateProductMaterials = async (params) => {
  return fetchItemMtop('CDT_86aI3P', 'updateProductMaterials', params).then(res => res?.content);
};

// 跨境ai商品素材下载
export const downloadCrossAIProductMaterials = (params) => {
  return new Promise((resolve, reject) => {
    mtopRequest
      .request({
        api: 'mtop.1688.material.batchDownloadMultiLangInfo',
        v: '1.0',
        type: 'POST',
        data: {
          ...params,
        },
      })
      .then(({ data: _data }) => {
        resolve(_data);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};
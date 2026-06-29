import { FromPage, DisableItem } from '../types';
import request from '@/services/httpRequest';
import { inquiryApiBaseUrl } from '@/utils/env';

const getSupplier = (params: any) => {
  return new Promise((resolve) => {
    request({
      url: `${inquiryApiBaseUrl}/api/inquiry/supplier/queryByOffer`,
      method: 'POST',
      body: JSON.stringify(params),
    }).then((res) => {
      if (res.success) {
        resolve(res?.data || []);
      } else {
        resolve([]);
      }
    })
      .catch(() => {
        resolve([]);
      });
  });
};

// 需要判断suppliers中的memberId是否重复
const handleFilterSuppliers = (suppliers: any[]) => {
  return suppliers.filter((item, index, self) =>
    index === self.findIndex((target) => target.memberId === item.memberId),
  );
};

const getSupplierAndOffer = (params: any) => {
  return new Promise((resolve) => {
    request({
      url: `${inquiryApiBaseUrl}/api/inquiry/supplier/query`,
      method: 'POST',
      body: JSON.stringify(params),
    }).then((res) => {
      if (res.success) {
        resolve(res?.data || []);
      } else {
        resolve([]);
      }
    })
      .catch(() => {
        resolve([]);
      });
  });
};

const handleZS = async (offerIds: string, memberIds: string) => {
  return new Promise(async (resolve) => {
    // 将字符串转换为数组，如果没有值则为空数组
    const offerIdsArray = offerIds ? offerIds.split(',').filter(id => id.trim()) : [];
    const memberIdsArray = memberIds ? memberIds.split(',').filter(id => id.trim()) : [];

    // 将 offerIds 转换为数字数组
    const offerIdsNumberArray = offerIdsArray.map(id => {
      const numId = Number(id.trim());
      return Number.isNaN(numId) ? null : numId;
    }).filter(id => id !== null) as number[];

    const suppliers = await getSupplierAndOffer({
      offerIds: offerIdsNumberArray,
      memberIds: memberIdsArray,
    }) as any;

    // 保存完整的接口返回数据（包含 offerInfo 和 supplierInfo）
    const offerAndSupplierList = suppliers || [];

    // 提取供应商信息用于表单
    const supplierInfoList = offerAndSupplierList.map((item: any) => item.supplierInfo).filter(Boolean);
    const uniqueSupplierInfo = handleFilterSuppliers(supplierInfoList);

    // 判断是否有有效的商品信息（用于决定是否显示 OfferAndSupplierList）
    const hasValidOfferInfo = offerAndSupplierList.some((item: any) => item?.offerInfo);

    // 如果有 offerIds 且有有效的商品信息，则禁用供应商选择（因为会显示 OfferAndSupplierList）
    // 如果只有 memberIds 没有 offerIds，则不禁用（允许用户新增和删除）
    const shouldDisableSupplier = offerIdsArray.length > 0 && hasValidOfferInfo;

    const result = {
      supplierInfo: uniqueSupplierInfo.slice(0, 6) || [],
      offerIdLink: offerIdsArray.map((offerId) => `https://detail.1688.com/offer/${offerId}.html?offerId=${offerId}`),
      offerAndSupplierList: offerAndSupplierList.slice(0, 6) || [], // 保存完整数据
      [DisableItem.DISABLE_SELECT_SUPPLIER]: shouldDisableSupplier,
      [DisableItem.DISABLE_AUTO_ORDER]: false,
    };
    resolve(result);
  });
};

export default async (fromPage: string, offerIds: string, memberIds: string) => {
  switch (fromPage) {
    case FromPage.ZS: {
      const result = await handleZS(offerIds || '', memberIds || '');
      return result;
    }
    default:
      return Promise.resolve({
        [DisableItem.DISABLE_SELECT_SUPPLIER]: false,
        [DisableItem.DISABLE_AUTO_ORDER]: false, // 默认显示自动下单开关
      });
  }
};
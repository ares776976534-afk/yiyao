import Mtop from '@/libs/mtop';
import { fetchItemMtop } from '@alife/dior-fetch-data';
import { MessageError } from '@/utlis';
import { use } from '@alife/dior-sdk-lib/commonjs';
import configCenter from '@alife/channel-uni-config-center';

// 商家协议查询接口
export const queryTagId = async (tagId) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.querySellerType',
      v: '1.0',
      type: 'POST',
      data: {
        tagId,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。');
      });
  });
};

// 商家协议签署接口
export const submitTagId = async (tagId) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.submitShopEnrollInfo',
      v: '1.0',
      type: 'POST',
      data: {
        tagId,
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject(error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。');
      });
  });
};

// 制造商信息展示
export const queryAllManufacturerDetailsByUserId = async (params) => {
  return fetchItemMtop('CDT_86ajuJ', 'queryAllManufacturerDetailsByUserId', params).then((res) => {
    const { content, msg, success } = res;
    if (success) {
      return content?.map((ele) => {
        const { manufacturerModel } = ele;
        const { manufacturerId, manufacturerNameCn, detailedAddressCn, manufacturerAddress, phoneNumber, email } = manufacturerModel;
        return ({
          ...ele,
          key: manufacturerId,
          value: manufacturerId,
          label: `${manufacturerNameCn},${detailedAddressCn},${manufacturerAddress},${phoneNumber},${email}`,
        }) || [];
      });
    } else {
      MessageError(msg || '系统异常');
    }
  });
};

// 制造商地址or手机/固定电话号码区号
export const queryAreaInfo = async (params) => {
  return new Promise((resolve) => {
    fetchItemMtop('CDT_86aI3P', 'queryAreaInfo', {
      queryType: params.queryType,
    })
      .then((res) => {
        const { success, content } = res;
        if (success) {
          let model = [];
          switch (params.name) {
            case 'manufacturerAddress':
              model = content?.nameList;
              break;
            case 'phoneNumber':
              model = content?.dialCodeList;
              break;
            case 'manufacturerAddressPhone':
              model = [content?.nameDialCodeMap[params?.value]];
              break;
            default:
              break;
          }
          const categories = model.map((item) => {
            return {
              label: item,
              value: item,
              key: item,
            };
          });
          resolve(categories);
        } else {
          throw new Error('数据异常');
        }
      })
      .catch(() => resolve([]));
  });
};

// 制造商名称翻译
export const queryTranslate = async (params) => {
  return fetchItemMtop('CDT_86aI3P', 'queryTranslate', params);
};

// 添加制造商信息or删除，修改
export const alterManufacturerInfo = async (params) => {
  return fetchItemMtop('CDT_86ajuJ', 'altermanufacturerInfo', params);
};

// 查看制造商数量
export const getManufacturerCountByUserId = () => {
  return new Promise((resolve) => {
    fetchItemMtop('CDT_86ajuJ', 'getManufacturerCountByUserId').then((res) => {
      const { content } = res;
      const { success, model } = content;
      if (success) {
        resolve(model);
      } else {
        throw new Error('数据异常');
      }
    }).catch((err) => {
      MessageError(err?.errorMsg || '系统异常');
      resolve(0);
    });
  });
};

// 更换制造商
export const submitCrossBorderComponent = async (params) => {
  return fetchItemMtop('CDT_86aI3P', 'submitCrossBorderComponent', params);
};

// 批量设置制造商信息
export const batchSetManufacturers = async (params) => {
  return fetchItemMtop('CDT_86ajuJ', 'batchSetManufacturers', params);
};

export function fetchStrategy(taskScene, payload) {
  if (!taskScene) {
    return Promise.reject(false);
  }
  const fetchParams = {
    taskScene,
    // tab1: getTabOneKey(),
  };

  if (payload) {
    fetchParams.inpus = payload;
  }

  return use('getBizStrategy')(fetchParams, { platform: 'pc' });
}

export const getAlipayRobotSwitch = () => {
  return configCenter.getByResourceId(36917617).then((res) => {
    return res?.switch === true;
  });
};

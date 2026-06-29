// import Mtop from '@/service/mtop';
import React from 'react';
import { getTableData } from './utils';
import diorRequest from '@/service/diorRequest';
import { Message } from '@alifd/next';
// import { mtopRequest } from "@ali/ctf-universal-request";
import mtopRequest from '@/service/mtop';

// 查询商机与商品的sku匹配关系
export const queryCompanySku = ({ getSkuList = false, ...params }) => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_aqfh2x', 'querySkuMatch', {
      request: JSON.stringify(params),
    })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error(res?.msg);
        }
        const { model } = res;
        // const model = data;
        if (getSkuList) {
          const { supplySkuList } = model;
          const total = supplySkuList.length;
          resolve({
            success: true,
            data: { model: supplySkuList, total, priceAnomaly: model.priceAnomaly },
          });
        } else {
          // 需要 把同时满足【没有商机的sku+canSignup为false的sku】过滤掉 不出现在提报列表里面
          const tableData = getTableData(model);
          const total = tableData.length;
          resolve({
            success: true,
            data: { model: tableData, total, ...model },
          });
        }
      })
      .catch((err) => {
        resolve({});
        Message.error(String(err?.errorMessage || err).toString() || '系统繁忙，请稍后再试。');
      });
  });
};

// 物流信息查询
export const queryTransInfo = (params) => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_78f93P', 'process', {
      params: JSON.stringify({
        ...params,
        operation: 'MODIFY',
      }),
      serviceName: 'LogisticsModuleQueryService',
    })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error(res?.msg);
        }
        resolve(res.model);
      })
      .catch((err) => {
        resolve({});
        // Message.error(String(err?.errorMessage || err) || '系统繁忙，请稍后再试。');
        Message.error({
          type: 'error',
          content: (
            <div>
              当前商品未设置运费模板，完成设置后刷新此页面即可进行报名。
              <a href={`https://offer-new.1688.com/popular/publish.htm?spm=a262p2.12492837.redirect&id=${params?.itemId}&operator=edit`} target="_blank" rel="noreferrer">去设置</a>
            </div>
          ),
          hasMask: true,
        });
      });
  });
};
// 运费计算
export const queryOfficialAvgFgt = (params) => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_78f93P', 'process', {
      params: JSON.stringify(params),
      serviceName: 'PostageModuleQueryService',
    })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error(res?.msg || '当前商品运费计算失败，请检查并修改运费模版设置，完成后刷新此页面即可进行报名');
        }
        resolve(res.model);
      })
      .catch((err) => {
        resolve({});
        Message.error(String(err?.errorMessage || err) || '当前商品运费计算失败，请检查并修改运费模版设置，完成后刷新此页面即可进行报名');
      });
  });
};

export const getErrorInfos = (params) => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_78f93P', 'process', {
      params: JSON.stringify(params),
      serviceName: 'RefreshAndGetOppTemplateService',
    })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error(res?.msg);
        }
        console.log('getErrorInfos', res);
        resolve({ data: res.model, success: true });
      })
      .catch((err) => {
        resolve({});
        Message.error(String(err?.errorMessage || err) || '系统繁忙，请稍后再试。');
      });
    // resolve({
    //   success: true,
    //   data: {
    //     "postage": 0.0,
    //     "logisticsId": 331001,
    //     "postageTypeText": "您的运费价格较高，请按照包邮价报名！",
    //     "postageType": "no_postage"
    //   },
    // })
  });
};

export const reMatchOppSku = (params) => {
  // console.log('reMatchOppSku', params);
  return new Promise((resolve, reject) => {
    diorRequest('CDT_aqfh2x', 'changeSkuMatch', {
      request: JSON.stringify(params),
    })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error(res?.msg);
        }
        resolve(res);
      })
      .catch((err) => {
        resolve({});
        Message.error(String(err?.errorMessage || err) || '系统繁忙，请稍后再试。');
      });
  });
};

// 提报
// export const supplyProductSignUp = (signUpData) => {
//   return new Promise((resolve, reject) => {
//     diorRequest('CDT_99fI1U', 'signUp', {
//       params: JSON.stringify(signUpData),
//       // serviceName: 'SupplyProductSignUpService',
//     })
//       .then((res) => {
//         // console.log('supplyProductSignUp', params, res);
//         resolve(res);
//       })
//       .catch((err) => {
//         resolve({});
//         Message.error(String(err?.errorMessage || err) || '系统繁忙，请稍后再试。');
//       });
//   });
// };
export const supplyProductSignUp = (signUpData) => {
  return new Promise((resolve, reject) => {
    mtopRequest.request({
      api: 'mtop.1688.SupplyProductWriteService.signUp',
      v: '1.0',
      type: 'POST',
      data: {
        params: JSON.stringify(signUpData),
      },
    })
      .then((res) => {
        if (res.data?.model) {
          resolve(res.data);
        }
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.msg || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};
export const getLogistics = (params) => {
  return new Promise((resolve, reject) => {
    mtopRequest
      .request({
        api: 'mtop.1688.LogisticsConfigurationService.getsingle',
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
// 托管协议签署
export const supplyAgreementSign = (tagId) => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_99fDL8', 'signAgreement', {
      params: JSON.stringify({
        tagId,
      }),
      // serviceName: 'SupplyAgreementSignService',
    })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error(res?.msg);
        }
        resolve(res);
      })
      .catch((err) => {
        resolve({});
        Message.error(String(err?.errorMessage || err) || '系统繁忙，请稍后再试。');
      });
  });
};
// 查询协议签署
export const supplyAgreementCheck = (tagId) => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_78f93P', 'process', {
      params: JSON.stringify({
        tagId,
      }),
      serviceName: 'SupplyAgreementCheckService',
    })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error(res?.msg);
        }
        resolve(res);
      })
      .catch((err) => {
        resolve({});
        Message.error(String(err?.errorMessage || err) || '系统繁忙，请稍后再试。');
      });
  });
};

// 供货产品管理-灰度商家
export const getGrayConfig = () => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_9haMha', 'getGrayConfig', {})
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const queryOppServiceDemand = (params) => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_aqfh2x', 'queryOppServiceDemand', {
      request: JSON.stringify(params),
    })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

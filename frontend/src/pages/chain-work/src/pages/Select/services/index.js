import { fetchItemMtop } from '@alife/dior-fetch-data';
import diorRequest from '@/service/diorRequest';
import Mtop from '@/service/mtop';
import { listData } from '@/pages/Select/utlis';
import { Message, Icon } from '@alifd/next';
import { tagService } from '@/utlis';
import { querySellerType } from '@/pages/CrossBorderOfferlist/api';
import configCenter from '@alife/channel-uni-config-center';

const queryCom = ({ id, name, request }) => {
  return new Promise((resolve) => {
    diorRequest(id, name, { ...request })
      .then((res) => {
        const { success, list, total } = res;
        if (success) {
          const data = Object.assign({}, { model: list, total: Number(total) });
          resolve(data);
        } else {
          throw new Error('数据异常');
        }
      })
      .catch(() => resolve(Object.assign({}, { model: [], total: 0 })));
  });
};
// 件重尺预填
export const officialSkuFeaturesData = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.national.pws.queryOfficialSkuFeatures',
      v: '1.0',
      type: 'POST',
      data: {
        ...params,
      },
    })
      .then((res) => {
        resolve(res?.data?.model);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.msg || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

// 件重尺字段必填
export const requiredFields = async (offerId) => {
  return fetchItemMtop('CDT_68huyD', 'querySkuOnlyWeightRequired', {
    offerId,
  });
};

// 件重尺填写
export const submitSkuFeatures = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.national.pws.submitSkuPws',
      v: '1.0',
      type: 'POST',
      data: {
        ...params,
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.msg || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

// 跨境销售数据
export const getSendAndReceiveInfo = async () => {
  return diorRequest('CDT_68j5Xb', 'queryDataBoard', {});
};

// 待优化商品数
export const queryLosingRightItemCount = async () => {
  return diorRequest('CDT_69fCVe', 'queryLosingRightItemCount', {});
};

// 权益文案
export const queryRightContent = async () => {
  return diorRequest('CDT_68iJSp', 'queryRightContent', {});
};

// 查询条件返回值
export const queryItemSearchContent = () => {
  return new Promise((resolve) => {
    diorRequest('CDT_a42Gl0', 'queryItemSearchContent', {}, { cache: true })
      .then((res) => {
        if (res.success && res.model) {
          resolve(res.model || {});
        } else {
          resolve({});
        }
      })
      .catch(() => resolve({}));
  });
};

// 未加入Choice
export const queryItem = async (request) => {
  return queryCom({
    id: 'CDT_a42Gl0',
    name: 'pageHtqqItem',
    request: { request },
  });
};

// 是否弹窗
export const queryIsShowSelectHelpSell = async () => {
  return diorRequest('CDT_6hhnX4', 'isPopWindow', {});
};

// 查询是否加入
export const queryIsJoinSelectHelpSell = async () => {
  return diorRequest('CDT_6hhlXt', 'queryIsJoin', {}, { cache: true });
};

// 加入select帮卖
export const joinSelectHelpSell = async () => {
  return diorRequest('CDT_6hhpnO', 'joinSelect', {});
};

// 所属国家
export const fetchListCertCountry = () => {
  return new Promise((resolve) => {
    diorRequest('CDT_6ifEnH', 'listCertCountry', {})
      .then((res) => {
        const { success, model } = res;
        if (success) {
          resolve(listData(model, 'countryName', 'countryAbbrName'));
        } else {
          throw new Error('数据异常');
        }
      })
      .catch(() => resolve([]));
  });
};

// 证书类型
export const fetchListCertCategory = () => {
  return new Promise((resolve) => {
    diorRequest('CDT_6ifEnH', 'listCertCategory', {})
      .then((res) => {
        const { success, model } = res;
        if (success) {
          const categories = model.map((item) => {
            return {
              label: item.categoryName,
              value: JSON.stringify(item.categories || ''),
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

// 分页查询已关联/未关联证书信息
export const fetchPageQueryCertInfo = (certQueryParam) => {
  return queryCom({
    id: 'CDT_6ifEnH',
    name: 'pageQueryCertInfo',
    request: { certQueryParam },
  });
};

// 关联证书和商品/商品类目
export const fetchRelateCertificate = (relateCertificateParam) => {
  return diorRequest('CDT_6ifEnH', 'relateCertificate', { relateCertificateParam });
};

// 解除商品和证书关联
export const fetchCancelRelateCertificate = (cancelRelateCertificateParam) => {
  return diorRequest('CDT_6ifEnH', 'cancelRelateCertificate', { cancelRelateCertificateParam });
};

// 商品是否有官方测量件重尺数据
export const fetchIsOfficialSkuFeatures = (request) => {
  return diorRequest('CDT_76a3lI', 'querySampleId', request);
};

// 商家身份校验 & 商家可提报商品数量
export const fetchIsSeller = () => {
  return diorRequest('CDT_75bf84', 'getSellerIdentityAndSubmitNum', { });
};

// 商家可提报商品列表
export const fetchSellerItemList = (param) => {
  return new Promise((resolve) => {
    diorRequest('CDT_75bjcM', 'queryItemList', { param })
      .then((res) => {
        const { success, list, total } = res;
        if (success) {
          fetchIsSeller().then((r) => {
            if (r?.success) {
              const data = Object.assign({}, {
                model: list.map((item) => {
                  return {
                    ...item,
                    toSubmitItemNumber: r.model.toSubmitItemNumber,
                    disabled: param?.currentStatus === '0' && r.model.alreadySubmitItemNumber >= r.model.toSubmitItemNumber,
                  };
                }),
                total: Number(total),
              });
              resolve(data);
            } else {
              Message.show({
                iconType: false,
                title: <div style={{ marginLeft: '-22px' }}><Icon type="d-cancel" style={{ color: '#FF0000', marginRight: '10px' }} /> {r?.msg}</div>,
                hasMask: true,
              });
            }
          });
        } else {
          throw new Error('数据异常');
        }
      })
      .catch(() => resolve(Object.assign({}, { model: [], total: 0 })));
  });
};

// 商家选择提报商品提交
export const fetchSellerItemSubmit = (request) => {
  return diorRequest('CDT_75bkdn', 'submitSelectItem', request);
};

// 商家撤销已提报商品
export const fetchSellerItemCancel = (request) => {
  return diorRequest('CDT_75bl9D', 'cancelSubmitItem', request);
};

// Selec商家是否第一次进入页面
export const fetchSellerIsFirst = (request) => {
  return diorRequest('CDT_76aXmK', 'isFirstEnterSelect', request);
};

// 获取 Select 商品优化建议项信息
export const queryOptimizeInfo = () => {
  return new Promise((resolve) => {
    diorRequest('CDT_84kocw', 'queryOptimizeInfo', {})
      .then((res) => {
        const { success, model } = res;
        if (success) {
          return resolve(model);
        } else {
          return resolve(model || []);
        }
      })
      .catch(() => {
        return resolve([]);
      });
  });
};

// 查询是否签署select协议
export const querySignSelect = () => {
  return tagService(584387, { dataType: 'member', offerId: null }).get();
};

// 签署select协议
export const signSelect = () => {
  return tagService(584387, { dataType: 'member', offerId: null }).put();
};

// 查询select商机卡片
export const getOppCard = () => {
  return diorRequest('CDT_84lML5', 'getOppCard', {})
    .then((res) => {
      return res?.list || [];
    });
};

// 查询商机可提报的商品列表
export const querySignUpItem = (strategyId) => {
  return new Promise((resolve) => {
    diorRequest('CDT_84lML5', 'querySignUpItem', {
      strategyId,
    })
      .then(({ list = [], total = 0 }) => {
        resolve({
          list,
          total,
        });
      })
      .catch(() => {
        resolve({
          list: [],
          total: 0,
        });
      });
  });
};

// 加入select商机
export const postSignUpItem = (request) => {
  return new Promise((resolve) => {
    diorRequest('CDT_84lML5', 'signUpItem', request)
      .then(({ success, msg }) => {
        resolve({
          success,
          msg,
        });
      })
      .catch((err) => {
        resolve({
          success: false,
          msg: err.msg || '系统异常',
        });
      });
  });
};

// 已加入Choice
export const pageChoiceItem = async (request) => {
  return new Promise((resolve) => {
    diorRequest('CDT_a42Gl0', 'pageChoiceItem', request)
      .then((res) => {
        const { success, list, total, zeroStockCount = '' } = res;
        if (success) {
          const data = Object.assign({}, { model: list, total: Number(total), zeroStockCount });
          resolve(data);
        } else {
          throw new Error('数据异常');
        }
      })
      .catch(() => resolve(Object.assign({}, { model: [], total: 0 })));
  });
};

// 商品加入 choice（支持批量加入
export const addChoiceItem = (request) => {
  return diorRequest('CDT_a42Gl0', 'addChoiceItem', request);
};

// 单个商品退出 choice
export const exitChoiceItem = (request) => {
  return diorRequest('CDT_a42Gl0', 'exitChoiceItem', request);
};

// 获取 choice 基础信息
export const getChoiceBaseInfo = (request) => {
  return diorRequest('CDT_a42Gl0', 'getChoiceBaseInfo', request);
};

// 全店商品加入Choice
export const shopJoinChoice = (request) => {
  return diorRequest('CDT_a42Gl0', 'shopJoinChoice', request);
};

// 查询choice定招商品卡片
export const getDirectedItems = (request) => {
  return diorRequest('CDT_a42Gl0', 'pageChoiceDirectedItem', request);
};

// 查询商家注册状态
export const querySettledBaseInfo = (request) => {
  return diorRequest('CDT_08a0NN', 'querySettledBaseInfo', request);
};


// 查询内测弹窗开关
export const querySignBBSwitch = () => {
  return configCenter.getByResourceId(37073295).then((res) => {
    return res?.switch === true;
  });
};

// 查询内测用户标签
export const querySignBBTag = () => {
  return querySellerType(5259905)
    .then((res) => {
      return res?.data?.data === 'true';
    });
};

// 查询是否为内测用户
export const queryExitBBUserTag = () => {
  return querySellerType(5260289)
    .then((res) => {
      return res?.data?.data === 'true';
    });
};

// 查询弹窗是否开启
export const querySignBBDialog = () => {
  return new Promise((resolve) => {
    querySignBBSwitch().then((enable) => {
      if (enable) {
        queryExitBBUserTag()
          .then((isExist) => {
            resolve(isExist);
          })
          .catch(() => resolve(false));
      } else {
        resolve(false);
      }
    }).catch(() => {
      resolve(false);
    });
  });
};


// 获取定招商机卡片
export const getChoiceBusinessBacklog = (request) => {
  return diorRequest('CDT_48gM9v', 'getChoiceBusinessBacklog', request);
};

// 权益文案
export const getChoiceDirectOppCard = async () => {
  return diorRequest('CDT_48gM9v', 'getChoiceDirectOppCard', {});
};

// 单个商品件重尺查询
export const queryItemPws = async (request) => {
  return fetchItemMtop('CDT_5bfzQl', 'queryItemPws', { request });
};

// 查询跨境托管保证金相关信息
export const getChoiceBondInfo = async () => {
  return diorRequest('CDT_5qlhcd', 'getChoiceBondInfo', {});
};

// 退出跨境托管保证金
export const exitChoiceBond = async () => {
  return diorRequest('CDT_5qlhcd', 'exitChoiceBond', {});
};

// 加入跨境托管保证金
export const joinChoiceBond = async () => {
  return diorRequest('CDT_5qlhcd', 'joinChoiceBond', {});
};

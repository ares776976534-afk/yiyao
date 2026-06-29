/**
 * 订单分页查询
 */
import mtop from '@/service/mtop';

// 跨境登录判断
export const csbcLoginJudgement = () => {
  return new Promise((resolve) => {
    resolve(false);
    // mtop
    //   .request({
    //     api: 'mtop.alibaba.supply.chain.CommonMtop',
    //     data: {
    //       params: '',
    //       serviceName: 'LoginJudgment',
    //     },
    //     // method: 'POST',
    //   })
    //   .then((res) => {
    //     if (res && res.data && res.data.model) {
    //       const isLogin = res.data.model === 'true';
    //       resolve(isLogin);
    //     } else {
    //       resolve(false);
    //     }
    //   })
    //   .catch(() => {
    //     resolve(false);
    //   });
  });
};

// 跨境免登地址
export const csbcSSOTargetUrl = (url) => {
  return new Promise((resolve) => {
    mtop
      .request({
        api: 'mtop.alibaba.supply.chain.CommonMtop',
        data: {
          params: JSON.stringify({
            targetUrl: url,
          }),
          serviceName: 'AssociatedLogin',
        },
      })
      .then((res) => {
        if (res && res.data && res.data.model) {
          resolve(res.data.model);
        } else {
          resolve(null);
        }
      })
      .catch(() => {
        resolve(null);
      });
  });
};

// 国内供应链获取免登地址
export const dscSSOTargetUrl = (url) => {
  return new Promise((resolve) => {
    mtop
      .request({
        api: 'mtop.1688.sc.chian.trustLoginService.trustLogin',
        data: {
          targetUrl: url,
        },
      })
      .then((res) => {
        if (res && res.data && res.data.model) {
          resolve(res.data.model);
        } else {
          resolve(null);
        }
      })
      .catch(() => {
        resolve(null);
      });
  });
};

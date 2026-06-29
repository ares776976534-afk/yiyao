import { Message } from '@alifd/next';
import Mtop from '@/service/mtop';


export const getTallySheetQuery = (warehouseBizId) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.1688.carriage.warehouse.TallySheetQueryService.get',
      v: '1.0',
      data: {
        warehouseBizId,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

/**
 * 拒绝接口
 * @params  tallySheetId
 */
export const getTallySheetOperate = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.1688.carriage.warehouse.TallySheetOperateService.refuse',
      v: '1.0',
      data: {
        ...params,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

/**
 * 获取钉钉工号
 */
export const getEngineeringCode = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.alibaba.national.ae.CrmOppEngineService',
      v: '1.0',
      data: {
        ...params,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

/**
 * 查询是否需要签署-非洲寄售模式协议
 */
export const queryUserAgreementService = (params = {}) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.alibaba.national.sc.CommonMtop',
      v: '1.0',
      data: {
        serviceName: 'ScUserAgreementService',
        ...params,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
        Message.error(error.ret[0].split('::')[1]);
      });
  });
};

/**
* 签署-非洲寄售模式协议
*/
export const signBuffaloAgreementService = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.alibaba.national.sc.CommonMtop',
      v: '1.0',
      data: {
        serviceName: 'SignBuffaloAgreement',
        ...params,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
        Message.error(error.ret[0].split('::')[1]);
      });
  });
};

export const querySignHuoTongQuanQiu = (params = {}) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.alibaba.national.sc.CommonMtop',
      v: '1.0',
      data: {
        serviceName: 'SignHuoTongQuanQiu',
        ...params,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
        Message.error(error.ret[0].split('::')[1]);
      });
  });
};


/*
* 是否有紧急补货单
*/
export const getUrgentReplenishment = (params = {}) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.alibaba.national.sc.CommonMtop',
      v: '1.0',
      type: 'POST',
      data: {
        serviceName: 'moduleListQuery',
        ...params,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

/*
* 揽收明细
*/
export const queryPickUpOrderDetails = (params = {}) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.alibaba.national.sc.CommonMtop',
      v: '1.0',
      type: 'GET',
      data: {
        serviceName: 'PickUpOrderQuery',
        params,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
        Message.error(error.ret[0].split('::')[1]);
      });
  });
};

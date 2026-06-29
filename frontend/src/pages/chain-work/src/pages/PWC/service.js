import mtop from '@/service/mtop';

// 获取商品列表
export const getList = (params) => {
  const _params = {
    pageNum: params.pageNo,
    ...params,
  };
  return new Promise((resolve, reject) => {
    mtop.request({
      api: 'mtop.com.alibaba.national.pws.item.list2',
      data: _params,
    })
      .then((res) => {
        if (res && res.data) {
          const { list = [], total = 0 } = res.data;
          resolve({
            model: list,
            total,
          });
        } else {
          resolve({
            model: [],
            total: 0,
          });
        }
      })
      .catch(() => {
        resolve({
          model: [],
          total: 0,
        });
      });
  });
};

// 获取寄样单详情
export const getSampleInfo = (sampleIds) => {
  return new Promise((resolve, reject) => {
    mtop.request({
      api: 'mtop.com.alibaba.national.pws.measure.get',
      data: {
        sampleIdList: JSON.stringify(sampleIds),
      },
    })
      .then((res) => {
        if (res && res.data && res.data.data) {
          resolve({
            success: true,
            data: res.data.data,
          });
        } else {
          resolve({
            success: false,
          });
        }
      })
      .catch(() => {
        resolve({
          success: false,
        });
      });
  });
};

export const printBarcode = () => {
};

// 提交寄样
export const postSample = (data) => {
  return new Promise((resolve) => {
    mtop.request({
      api: 'mtop.com.alibaba.national.pws.sample.launch',
      data: {
        param: JSON.stringify(data),
      },
      type: 'POST',
    })
      .then((res) => {
        if (res.data && res.data.msg) {
          const { msg } = res.data;
          resolve({
            success: msg === 'success',
            msg,
          });
        } else {
          resolve({
            success: false,
          });
        }
      })
      .catch((err) => {
        resolve({
          success: false,
          msg: err?.data?.msg || '',
        });
      });
  });
};

// 查询仓库地址
export const getWarehouseAdd = (sampleId) => {
  return new Promise((resolve) => {
    mtop.request({
      api: 'mtop.com.alibaba.national.pws.sendaddress.get',
      data: {
        sampleId,
      },
    })
      .then((res) => {
        if (res && res.data && res.data.data) {
          resolve(res.data.data.sendAddress);
        } else {
          resolve(null);
        }
      })
      .catch(() => {
        resolve(null);
      });
  });
};

// 查询寄回地址
export const getReturnAdd = () => {
  return new Promise((resolve, reject) => {
    mtop.request({
      api: 'mtop.com.alibaba.national.pws.returnaddress.list',
      data: {
      },
    })
      .then((res) => {
        if (res && res.data && res.data.data) {
          resolve(res.data.data);
        } else {
          resolve([]);
        }
      })
      .catch(() => {
        resolve([]);
      });
  });
};

// 查询物流公司信息
export const getLogicInfo = () => {
  return new Promise((resolve, reject) => {
    mtop.request({
      api: 'mtop.com.alibaba.national.pws.company.list',
      data: {},
    })
      .then((res) => {
        if (res && res.data && res.data.data) {
          resolve(res.data.data);
        } else {
          resolve([]);
        }
      })
      .catch(() => {
        resolve([]);
      });
  });
};


// 查询是否签署官方物流 mtop.com.alibaba.national.pws.user.isSettled
export const getIsSettled = () => {
  return new Promise((resolve) => {
    mtop.request({
      api: 'mtop.com.alibaba.national.pws.user.isSettled',
      data: {},
    })
      .then((res) => {
        if (res && res.data && res.data.data) {
          resolve(res.data.data === 'true');
        } else {
          resolve(false);
        }
      })
      .catch(() => {
        resolve(false);
      });
  });
};

// 获取官方物流token mtop.com.alibaba.national.pws.user.token
export const getLogicToken = (deviceId) => {
  return new Promise((resolve) => {
    mtop.request({
      api: 'mtop.com.alibaba.national.pws.user.token',
      data: {
        deviceId,
      },
    })
      .then((res) => {
        if (res && res.data && res.data.data) {
          const token = res.data.data;
          resolve({
            token,
            msg: !token ? res.data.msg : null,
          });
        } else {
          resolve({
            token: null,
            msg: '',
          });
        }
      })
      .catch((err) => {
        const msg = err?.data?.msg || '';
        resolve({
          token: null,
          msg,
        });
      });
  });
};

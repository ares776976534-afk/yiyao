import { fetchItemMtop } from '@alife/dior-fetch-data';

// 修改制造商信息
export const queryManufacturerInfoByManuId = async (params) => {
  return fetchItemMtop('', 'queryManufacturerInfoByManuId', params);
};

// 制造商管理分页查询
export const queryPageAllManufacturerDetailsByUserId = async (params) => {
  return new Promise((resolve) => {
    fetchItemMtop('CDT_86ajuJ', 'queryPageAllManufacturerDetailsByUserId', {
      pageNum: params?.pageNo,
      ...params,
    })
      .then((res) => {
        const { success, content } = res;
        const { list, total } = content;
        if (success) {
          const obj = Object.assign({}, {
            model: list.map((item) => {
              return {
                ...item,
                key: item.manufacturerModel.manufacturerId,
              };
            }),
            total: Number(total),
          });
          resolve(obj);
        } else {
          throw new Error('数据异常');
        }
      })
      .catch(() => resolve([]));
  });
};

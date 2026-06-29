import { fetchItemMtop } from '@alife/dior-fetch-data';
import { MessageError } from '@/utlis';

// 管理商品制造商信息
export const listItemManufacturerInfoByManuId = async (params) => {
  return new Promise((resolve) => {
    fetchItemMtop('CDT_86ajuJ', 'listItemManufacturerInfoByManuId', {
      pageNum: params?.pageNo,
      ...params,
    })
      .then((res) => {
        const { success, content } = res;
        const { list, total } = content;
        if (success) {
          const obj = Object.assign({}, {
            model: list?.map((item) => {
              return {
                ...item,
                key: item.itemId,
              };
            }),
            total: Number(total),
          });
          resolve(obj);
        } else {
          throw new Error('数据异常');
        }
      })
      .catch((err) => {
        MessageError(err?.data?.errorInfo || err?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。');
        resolve([]);
      });
  });
};

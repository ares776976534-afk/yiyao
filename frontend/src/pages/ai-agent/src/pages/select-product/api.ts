import mtopRequest from '@/service/mtop';
import { $t } from '@/i18n';

export const aaa = () => {
  return new Promise((resolve, reject) => {
    mtopRequest.request({
      api: 'mtop.1688.mtopstreamservice.testmtopstream',
      v: '1.0',
      type: 'POST',
      headers: {
        'x-accept-stream': true,
      },
      data: {
        param: 'string',
      },
    })
      .then((res) => {
        console.log(res);
        if (res.data?.model) {
          resolve(res.data);
        }
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.msg || error?.ret[0]?.split('::')[1] || $t("global-1688-ai-app.select-product.smh", "系统繁忙，请稍后再试。"),
        });
      });
  });
};

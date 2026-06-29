import mtopRequest from '@/service/mtop';

export function findSellerEntryDetail() {
  return mtopRequest.request({
    api: 'mtop.alibaba.cbu.yanxuan.getSellerSignEntryProtocolDetail',
    data: { param: JSON.stringify({}) },
  }).then((res) => res?.data || {});
}

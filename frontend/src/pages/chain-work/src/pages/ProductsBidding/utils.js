import queryString from 'query-string';

const query = queryString.parse(location.search);

export function sendLogger(event) {
  try {
    const q = window.aplus_queue || (window.aplus_queue = []);
    q.push({
      action: 'aplus.record',
      arguments: ['/global.productsbidding.click', 'CLK', `event=${event}`],
    });
  } catch (e) {
    console.log(e);
  }
}

export const defaultImg =
  'https://img.alicdn.com/imgextra/i3/O1CN01TarHo21hMxn1ytbEt_!!6000000004264-2-tps-112-112.png';

// export const aeJingjiaType = '速卖通一品多SKU';
export const aeJingjiaType = query.aeJingjiaType || '跨境工作台-速卖通';

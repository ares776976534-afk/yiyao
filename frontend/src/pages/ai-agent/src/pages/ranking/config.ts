import { $t } from '@/i18n';
export const ImgMap = {
  1: 'https://img.alicdn.com/imgextra/i2/O1CN015lgREo1FEtiw7PDzm_!!6000000000456-2-tps-52-52.png',
  2: 'https://img.alicdn.com/imgextra/i4/O1CN01e9tLHL26IGGkRn5bf_!!6000000007638-2-tps-52-52.png',
  3: 'https://img.alicdn.com/imgextra/i3/O1CN01Dw9hU91JxYoKeQOJI_!!6000000001095-2-tps-52-52.png',
  4: 'https://img.alicdn.com/imgextra/i1/O1CN01wyavr71Yk1L2Kltjk_!!6000000003096-2-tps-52-52.png'
}

export const REGION_MAP: Record<string, { name: string; icon: string }> = {
  GB: { name: '英国', icon: 'https://img.alicdn.com/imgextra/i3/O1CN015hkwqJ1tsMTzj2NhB_!!6000000005957-2-tps-96-96.png' },
  MX: { name: '墨西哥', icon: 'https://img.alicdn.com/imgextra/i4/O1CN01Xb0sC31cNobChrUbu_!!6000000003589-2-tps-96-96.png' },
  IT: { name: '意大利', icon: 'https://img.alicdn.com/imgextra/i4/O1CN013U9QQu1fBOhy0ic2T_!!6000000003968-2-tps-96-96.png' },
  PH: { name: '菲律宾', icon: 'https://img.alicdn.com/imgextra/i3/O1CN01ZjzK9R1sKBJEbiJKA_!!6000000005747-2-tps-96-96.png' },
  CA: { name: '加拿大', icon: 'https://img.alicdn.com/imgextra/i2/O1CN01EhBmuV22Xb4HtOgzP_!!6000000007130-2-tps-96-96.png' },
  SG: { name: '新加坡', icon: 'https://img.alicdn.com/imgextra/i2/O1CN01kc4aLT1qIgmmEMuqG_!!6000000005473-2-tps-96-96.png' },
  BR: { name: '巴西', icon: 'https://img.alicdn.com/imgextra/i3/O1CN01o3IAUk1zbJQy6jcZJ_!!6000000006732-2-tps-96-96.png' },
  DE: { name: '德国', icon: 'https://img.alicdn.com/imgextra/i1/O1CN01MeiGcX28TN6oiBSEf_!!6000000007933-2-tps-96-96.png' },
  MY: { name: '马来西亚', icon: 'https://img.alicdn.com/imgextra/i2/O1CN0112YOQF1j16GZaGVRp_!!6000000004487-2-tps-96-96.png' },
  VN: { name: '越南', icon: 'https://img.alicdn.com/imgextra/i3/O1CN01yNsAlh2A8scUg6ld0_!!6000000008159-2-tps-96-96.png' },
  FR: { name: '法国', icon: 'https://img.alicdn.com/imgextra/i4/O1CN01JMU3L61spKF2wnrxC_!!6000000005815-2-tps-96-96.png' },
  ES: { name: '西班牙', icon: 'https://img.alicdn.com/imgextra/i3/O1CN0119X2ca1kYp2n9uqFV_!!6000000004696-2-tps-96-96.png' },
  JP: { name: '日本', icon: 'https://img.alicdn.com/imgextra/i3/O1CN01GETqiQ1LamLFPhzF7_!!6000000001316-2-tps-96-96.png' },
  ID: { name: '印尼', icon: 'https://img.alicdn.com/imgextra/i3/O1CN01ESDmyo29hrFfEkLGo_!!6000000008100-2-tps-96-96.png' },
  US: { name: '美国', icon: 'https://img.alicdn.com/imgextra/i4/O1CN01H2luE41p6UcnItP95_!!6000000005311-2-tps-96-96.png' },
  TH: { name: '泰国', icon: 'https://img.alicdn.com/imgextra/i2/O1CN01dfe5gC1MCnDOzbtaP_!!6000000001399-2-tps-96-96.png' },
  CN: { name: '中国', icon: 'https://img.alicdn.com/imgextra/i2/O1CN01YP57Yz1ID0xIdyfn9_!!6000000000858-2-tps-64-64.png' },
};

export const platformMap = {
  amazon: 'https://img.alicdn.com/imgextra/i2/O1CN018lgt8z1S9wR8IcK6Y_!!6000000002205-2-tps-72-72.png',
  tiktok: 'https://img.alicdn.com/imgextra/i3/O1CN01qfg45k1WqlwG6fJ5w_!!6000000002840-2-tps-72-72.png',
  taobao: 'https://img.alicdn.com/imgextra/i2/O1CN01GSmhD229FShwhOvGK_!!6000000008038-2-tps-64-64.png',
}

export const emptyIcon = 'https://img.alicdn.com/imgextra/i2/O1CN01D0Rdxr24gPvhJS0Yf_!!6000000007420-2-tps-256-256.png';

export const platformMapText = {
  amazon: $t('global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.ymx', '亚马逊'),
  tiktok: 'TikTok',
}

export const rankingTypeMapText = {
  new_itm: $t('global-1688-ai-app.ranking.ProductModal.new', '有新品机会的'),
  sold_cnt: $t('global-1688-ai-app.ranking.ProductModal.hot', '比较热销的'),
}
export const getTableData = (data) => {
  const { oppSkuList, supplySkuList } = data;
  const notUsedSku = [];
  const uesdSku = [];
  // 从 supplySkuList 取出对应的skuId的info，放入 oppSkuList 中
  if (!oppSkuList || !oppSkuList.length) {
    return supplySkuList.map((item, index) => {
      item.canSignup = true;
      return {
        baseSkuInfo: item,
        recordId: String(index),
      };
    });
  }
  const newOppSkuList = oppSkuList.map((item) => {
    const { supplySkuId, oppSkuId } = item;
    if (!oppSkuId) {
      return;
    }
    uesdSku.push(supplySkuId);
    const baseSkuInfo = supplySkuList.find((baseSku) => baseSku.skuId === supplySkuId) || {};
    return {
      ...item, // 商机相关信息
      baseSkuInfo,
      oppInfo: item,
    };
  });

  // 需要 把同时满足【没有商机的sku+canSignup为false的sku】过滤掉
  supplySkuList.forEach((item) => {
    const { skuId, oppSkuId, ...res } = item; // oppSkuId 有报名记录才会有这个字段 更靠谱的做法是再遍历一遍
    // if (!uesdSku.includes(skuId) && item.canSignup) {
    if (!uesdSku.includes(skuId) && String(item.canSignup) !== 'false') {
      notUsedSku.push({
        baseSkuInfo: item,
      });
    }
  });

  // 没有匹配到商机的skuId，追加到oppSkuList后面
  const tableData = newOppSkuList.filter((item) => item).concat(notUsedSku);
  const _tableData = tableData.map((item, index) => {
    return {
      ...item,
      recordId: String(index),
    };
  });
  // console.log('[ tableData ] >', tableData);
  return _tableData;
};

export const CHANNEL = [
  {
    label: '淘宝（菜鸟）',
    value: 'thyny',
    icon: 'https://img.alicdn.com/imgextra/i3/O1CN01N39r3m1UZhp9796tM_!!6000000002532-2-tps-64-64.png',
  },
  {
    label: '抖音',
    value: 'douyin',
    must: false,
    icon: 'https://img.alicdn.com/imgextra/i3/O1CN01aVfJWF1JYMtVg73oK_!!6000000001040-2-tps-64-64.png',
  },
  {
    label: '拼多多',
    value: 'pinduoduo',
    must: false,
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN01OnrRLe1PrV8MswIsk_!!6000000001894-2-tps-64-64.png',
  },
  {
    label: '小红书',
    value: 'xiaohongshu',
    must: false,
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN01f1fbNj1QQldC3Y4lB_!!6000000001971-2-tps-64-64.png',
  },
  {
    label: '快手',
    value: 'kuaishou',
    must: false,
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN016OzXlX1wTZlRVBfKq_!!6000000006309-2-tps-64-64.png',
  },
  {
    label: '视频号',
    value: 'shipinhao',
    must: false,
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN01BkYxsE1Sdi3OPq9pe_!!6000000002270-2-tps-64-64.png',
  },
  {
    label: '京东',
    value: 'jingdong',
    must: false,
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN01N8xncw1PQ1N2IMssB_!!6000000001834-2-tps-64-64.png',
  },
];
// oppId itemId supplyProductId categoryId clusterId supplyProductId
export const getUrlParam = (key) => {
  const value =
    new URLSearchParams(location.search).get(key) || new URLSearchParams(location.search).get(`_hex_${key}`);

  return value || '';
};
export const judgeActiveTab = () => {
  const defaultTab = getUrlParam('defaultTab');
  if (defaultTab.length === 0) {
    return 1;
  }
  return Number(defaultTab);
};
// 1.报名托管-有商机（全网热卖商机） 2.报名托管-无商机(无报名规格)（商家提报） 3.供货管理-价格修改（有建议供货价 无库存） 4.供货管理-价格修改（无参考商品规格 有建议供货价 无库存）
export const judgeTableType = () => {
  // url上有tableType
  if (getUrlParam('tableType').length === 0) {
    return getUrlParam('supplyProductId').length > 0 ? '3' : '1';
  } else {
    const tableType = getUrlParam('tableType');
    return tableType.toString();
  }
};

// 判断是否库存同步灰度商品
export const judgeInvControlGray = () => {
  const isInvControlGray = getUrlParam('invControlGray');
  return isInvControlGray === '1';
};

export const getAllUrlParams = () => {
  const paramsObj = Object.fromEntries(new URLSearchParams(location.search));
  return paramsObj;
};

// 把所有的字符串数字，转为数字类型 空字符串置为null
export const formatNumber = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'string' && !isNaN(Number(obj[key]))) {
      newObj[key] = Number(obj[key]);
    } else if (typeof obj[key] === 'string' && obj[key].length === 0) {
      newObj[key] = null;
    } else {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

export const judgeIsLocal = () => {
  return window.top === window; // 是否-不是iframe
};

// 构造url
export const constructUrl = (
  {
    oppId,
    offerId,
    categoryId,
    clusterId,
    supplyProductId,
    isFenxiao,
    isTmall,
    waybillChannels,
    bargain,
    services,
    selectBuyerProtect,
  },
  returnAsUrl = true,
) => {
  // 处理 waybillChannels 数组
  let formattedWaybillChannels;
  if (waybillChannels) {
    formattedWaybillChannels = Array.isArray(waybillChannels)
      ? (waybillChannels = waybillChannels.join(','))
      : waybillChannels;
  }
  const formattedServices = services && services?.length > 0 ? services.join(',') : undefined;

  const queryParams = [
    `_hex_tableType=${oppId ? 3 : 4}`, // 根据 oppId 是否存在设置 _hex_tableType
    isFenxiao ? '_hex_fenxiao=1' : undefined,
    isTmall ? '_hex_tmall=1' : undefined,
    oppId ? `_hex_oppId=${oppId}` : undefined,
    offerId ? `_hex_itemId=${offerId}` : undefined,
    categoryId ? `_hex_categoryId=${categoryId}` : undefined,
    clusterId ? `_hex_clusterId=${clusterId}` : undefined,
    supplyProductId ? `_hex_supplyProductId=${supplyProductId}` : undefined,
    formattedWaybillChannels ? `_hex_waybillChannels=${formattedWaybillChannels}` : undefined,
    bargain ? `_hex_bargain=${bargain}` : undefined,
    formattedServices ? `_hex_services=${formattedServices}` : undefined,
    selectBuyerProtect ? `_hex_selectBuyerProtect=${selectBuyerProtect}` : undefined,
  ].filter((param) => param);

  const query = queryParams.join('&');

  const baseUrl = judgeIsLocal()
    ? `https://${location.host}/app/channel-fe/chain-work/goodsupply.html?${query}#/itempost`
    : `https://work.1688.com/?_path_=gonghuotuoguan/tuoguan/fwcn&${query}`;
  if (!returnAsUrl) {
    const paramMap = {};
    queryParams.forEach((param) => {
      const [_key, value] = param.split('=');
      const key = _key.replace('_hex_', '');
      paramMap[key] = value;
    });
    return paramMap;
  }
  return baseUrl;
};

export const dealServicesAndWaybillChannels = (services, waybillChannels, isDistribution = false) => {
  const data = {};
  const servicesValue = {};
  services.forEach((item) => {
    if (['essxsfh', 'ssbxsfh'].includes(item)) {
      servicesValue.fhsx = item;
    } else {
      servicesValue[item] = true;
    }
  });
  if (servicesValue.fhsx === 'ssbxsfh' && services.indexOf('essxsfh') !== -1) {
    servicesValue.fhsx = 'essxsfh';
  }
  Object.assign(data, servicesValue);
  if (isDistribution) {
    // 分销 字段
    data.waybillChannels = waybillChannels;
  }
  return data;
};

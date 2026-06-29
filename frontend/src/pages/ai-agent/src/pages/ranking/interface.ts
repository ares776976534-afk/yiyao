interface countryListProps {
  code: string;
  name: string;
}

export interface platformCountryMappingProps {
  platform: string;
  platformCn: string;
  countryList: countryListProps[];
}

export interface rankingListProps {
  rankingName: string; // 榜单名称
  rankingDesc: string; // 榜单描述
  keywordUrl: string;
  updateTime: string; // 更新时间
  platform: string;
  order: string;
  rankingType: string; //榜单类型
  countryList: countryListProps[];
};
export interface listProps {
  listTitle: string;
  hoverText: string;
  categoryData: any;
  rankingList: rankingListProps[];
  timeRange: any;
  platformCountryMapping: platformCountryMappingProps[];
}

// 机会赛道榜结构
interface tagListProps {
  code: string;
  name: string;
}
interface ratingAvgProps { // 商品平均评分
  name: string;
  desc: string;
  value: number;
  valueLevelDetail: {
    valueLevel: string;
    text: string;
    valueLevelType: string;
    valueLevelDesc: string;
  },
  valueType: string;
}
interface newProductSalesPctProps { // 新品销售占比
  name: string;
  desc: string;
  value: string;
  valueLevelDetail: {
    valueLevel: string;
    text: string;
    valueLevelType: string;
    valueLevelDesc: string;
  },
  valueType: string;
  growthRate: {
    value: string;
    direction: string;
  }
};
interface cnSellerPctProps { // 中国卖家占比
  name: string;
  desc: string;
  value: string;
  valueLevelDetail: {
    valueLevel: string;
    text: string;
    valueLevelType: string;
    valueLevelDesc: string;
  },
  valueType: string;
};
interface brandMonopolyCoefficientProps  { // 品牌垄断系数
  name: string;
  desc: string;
  value: 0.42,
  valueLevelDetail: {
    valueLevel: string;
    text: string;
    valueLevelType: string;
    valueLevelDesc: string;
  },
  valueType: string;
};
interface itemMonopolyCoefficientProps { // 商品垄断系数
  name: string;
  desc: string;
  value: number;
  valueLevelDetail: {
    valueLevel: string;
    text: string;
    valueLevelType: string;
    valueLevelDesc: string;
  },
  valueType: string;
};
interface itemCountProps { // 在售商品数
  name: string;
  desc: string;
  value: number;
  valueLevelDetail: {
    valueLevel: string;
    text: string;
    valueLevelType: string;
    valueLevelDesc: string;
  },
  valueType: string;
  growthRate: {
    value: string;
    direction: string;
  }
};
export interface opportunityCardProps  {
  marketHeatLevel: {
    name: string;
    value: string;
  }
  marketHeatGrowthLevel: {
    name: string;
    value: string;
  }
  marketCompeteLevel: {
    name: string;
    value: string;
  }
  brandMonopolyCoefficient: brandMonopolyCoefficientProps;
  cnSellerPct: cnSellerPctProps;
  country: string; // 国家
  itemCount: itemCountProps;
  itemMonopolyCoefficient: itemMonopolyCoefficientProps;
  keyword: string; // 关键词
  keywordCn: string; // 关键词中文
  newProductSalesPct: newProductSalesPctProps;
  oppScore: string; // 机会分
  oppScoreDesc: string; // 机会分描述
  oppScoreDescList: any[]; // 机会分描述列表
  platform: string; // 平台
  priceAvg: { // 平均价格
    desc: string;
    name: string;
    value: string;
    valueLevel: string;
    valueLevelDesc: string;
    valueLevelDetail: {
      valueLevel: string;
      text: string;
      valueLevelType: string;
      valueLevelDesc: string;
      descL: string;
    },
    valueType: string;
  };
  productImgList: string[];
  ranking: string; // 排名
  ratingAvg: ratingAvgProps;
  soldCnt30d: { // 30天销量
    name: string;
    desc: string;
    value: number;
    valueLevelDetail: {
      valueLevel: string;
      text: string;
      valueLevelType: string;
      valueLevelDesc: string;
    },
    valueType: string;
    growthRate: { //月销量增速
      value: string;
      direction: string;
    }
  };
  soldCnt30dGrowthRate: { // 30天销量环比
    desc: string;
    growthRate: {
      value: string;
      direction: string;
    }
    name: string;
    value: string;
    valueLevel: string;
    valueLevelDesc: string;
    valueLevelDetail: {
      valueLevel: string;
      text: string;
      valueLevelType: string;
      valueLevelDesc: string;
      descL: string;
    },
    valueType: string;
  };
  tagList: tagListProps[];
}

export interface itemDataProps {
  platform: string; // 平台
  country: string; // 国家
  productId: string; // 商品id
  productImg: string; // 商品图片
  productTitle: string; // 商品标题
  productUrl: string; // 商品链接
  oppScore: string; // 机会分
  oppScoreDesc: string; // 机会分描述
  oppScoreDescList: any[]; // 机会分描述列表
  soldCnt: { // 30天销量
      name: string;
      desc: string;
      value: number;
      valueLevelDetail: {
        valueLevel: string;
        text: string;
        valueLevelType: string;
        valueLevelDesc: string;
      },
      valueType: string;
      growthRate: { //月销量增速
        value: string;
        direction: string;
      }
  },
  soldCntGrowthRate: { // 30天销量增速
    name: string;
    desc: string;
    value: string;
  },
  sameItemCnt: { // 同款商品数
    name: string;
    desc: string;
    value: number;
  }, 
  rating: { // 评分
    name: string;
    desc: string;
    value: number;
  }, 
  reviewCnt: number; //评论数
  launchTime: string; // 上架时间
  price: string; // 价格，带货币单位
  ranking: string; // 排名
}
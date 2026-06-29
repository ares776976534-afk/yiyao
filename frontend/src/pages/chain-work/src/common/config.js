import urlParser from 'url';
// 是否debug模式
const isDebug = location.host.indexOf('127.0.0.1') >= 0 || location.host.indexOf('30.37') >= 0;
const selleropDomain = isDebug === true ? '//sellerop-test.alibaba-inc.com' : '//sellerop.alibaba-inc.com';
const { query } = urlParser.parse(location.href, true);
const preEnv = 'pre' in query;

// 工具函数
const Util = {
  // 获取API URL
  getAPI(path) {
    return path;
  },
  // 获取链接地址
  getLink(url) {
    return isDebug ? `/src/pages/${url}/index.html` : `/${url}/home.html`;
  },

  // 获取maya域名
  getMaya() {
    return isDebug || location.host.indexOf('-test') >= 0 ? '//maya-test.alibaba-inc.com' : '//maya.alibaba-inc.com';
  },

  // 获取growing域名
  getGrowing() {
    return isDebug || location.host.indexOf('-test') >= 0
      ? '//growing-test.alibaba-inc.com'
      : '//growing.alibaba-inc.com';
  },

  idt: '//idt.alibaba-inc.com',
  idt2: '//idt2.alibaba-inc.com',
  maya: '//maya.alibaba-inc.com',
  tagai: '//tagai.alibaba-inc.com',
  insight: '//insight360.alibaba-inc.com',

  theme: preEnv ? '//pre-theme.alibaba-inc.com' : '//theme.alibaba-inc.com',
  freud: preEnv ? '//freud-microservice-v2.pre-dmsp.alibaba-inc.com' : '//freud-microservice-v2.dmsp.alibaba-inc.com',
  chimera: '//chimera.alibaba-inc.com',
  isDebug,
};

// 请求接口url
const URL = {
  common: {
    upload: '/common/fileUpload/upload.do',
  },
  ruleCondition: {
    get: `${Util.idt}/sea/feature.do`,
    save: `${Util.idt}/sea/feature.do`,
    count: `${Util.tagai}/tagai/offerpackage/queryCount`,
    export: `${Util.idt}/open/exchange/rulesampleB2b/download.do`,
    getExportSetDatasource: `${Util.idt}/service/open/exchange/RuleScene/load.do?id=62`,
    configDefault: `${Util.idt}/open/exchange/rulesampleB2b/configDefault.do`,
    defaultRuleDataSource: `${Util.idt}/open/exchange/defaultRule/list.do`,
    b2bQueryCountDefault: `${Util.idt}/open/exchange/rulesampleB2b/b2bQueryCountDefault.do`,
  },
  preview: {
    auction: `${Util.idt}/open/exchange/auctionsampleB2b/b2bExtract.do`,
    auctionExpression: `${Util.tagai}/tagai/offer/query.json`,
    shop: `${Util.idt}/open/exchange/shopsampleB2b/b2bExtract.do`,
    people: `${Util.idt}/open/exchange/peoplesampleB2b/b2bExtract.do`,
    marketing: `${Util.idt}/open/exchange/marketingsampleB2b/b2bExtract.do`,
    offerpower: `${Util.idt}/open/exchange/offerpowersampleB2b/b2bExtract.do`,
    xiayouxuanpin: `${Util.idt}/open/exchange/xiayouxuanpinsampleB2b/b2bExtract.do`,
    xiayouxuanpinExpression: `${Util.maya}/tagai/offer/taoBaoQuery.json`,
    scene: `${Util.idt}/open/exchange/scenesampleB2b/b2bExtract.do`,
    opportunity: `${Util.idt}/open/exchange/opportunitysampleB2b/b2bExtract.do`,
    markAdd: `${Util.idt}/open/exchange/ruleMark/create.do`,
    markRemove: `${Util.idt}/open/exchange/ruleMark/remove.do`,
    favoriteAdd: `${Util.idt}/open/exchange/shopsampleB2b/follow.do`,
    favoriteRemove: `${Util.idt}/open/exchange/shopsampleB2b/unfollow.do`,
    filterConfig: `${Util.idt}/sea/feature.do`,
    getDisplaySetDatasource: `${Util.idt}/service/open/exchange/RuleScene/load.do?id=63`,
    enumLevel: `${Util.idt}/common/webPluginUrl/enumLevel.do`,
    powerAuctionTag: `${Util.idt}/dashboard/powerAuctionTag/create.do`,
  },
  getSelectFieldSet: {
    downloadConfig: `${Util.idt}/service/open/exchange/RuleScene/load.do?id=62`,
    fetchConfig: `${Util.idt}/service/open/exchange/RuleScene/load.do?id=63`,
  },
  follow: {
    selectableSellerGroups: `${Util.idt}/open/exchange/shopsampleB2b/selectableSellerGroups.do`,
    followedSellerGroup: `${Util.idt}/open/exchange/shopsampleB2b/followedSellerGroup.do`,
    follow: `${Util.idt}/open/exchange/shopsampleB2b/follow.do`,
  },
  user: {
    get: `${Util.idt}/common/user.do`,
  },
  optool: {
    makecall: `${Util.idt}/optool/makecall`,
    stopcall: `${Util.idt}/optool/cancelcall`,
    taskType: `${Util.idt}/push/pushTaskConfig/load.do`,
    savePool: `${Util.idt}/push/memberPool/saveMemberPool.do`,
    sendMsg: `${Util.idt}/push/messagePush/createPushPlan.do`,
  },
  indicator: {
    all: `${Util.idt}/open/exchange/dsTreeFeatures/ruleFeaturesTree.do`,
  },
  list: {
    sceneList: `${Util.idt}/service/open/exchange/biz/list.do`,
    sceneTreeList: `${Util.idt}/service/open/exchange/biz/treeList.do`,
    ruleList: `${Util.idt}/open/exchange/rule/list.do`,
    rightsList: `${Util.idt}/open/exchange/MerchantBenefit/list.do`,
    topCategoryList: `${Util.idt}/open/exchange/MerchantCategory/topCategories.do`,
    taskList: `${Util.idt}/open/exchange/MerchantMission/list.do`,
    getRights: `${Util.idt}/open/exchange/rule/list.do`,
    getSingleRights: `${Util.idt}/open/exchange/MerchantBenefit/load.do`,
    getSingleTask: `${Util.idt}/open/exchange/MerchantMission/load.do`,
    getRule: `${Util.idt}/open/exchange/rule/list.do`,
    updateRights: `${Util.idt}/open/exchange/MerchantBenefit/modify.do`,
    createRights: `${Util.idt}/open/exchange/MerchantBenefit/create.do`,
    updateTask: `${Util.idt}/open/exchange/MerchantMission/modify.do`,
    createTask: `${Util.idt}/open/exchange/MerchantMission/create.do`,
    saveRule: `${Util.idt}/sea/basic.do`,
    deleRule: `${Util.idt}/open/exchange/rule/remove.do`,
    offRule: `${Util.idt}/open/exchange/rule/offline.do`,
    submitRule: `${Util.idt}/open/exchange/rule/submit.do`,
    bindTag: `${Util.idt}/open/exchange/ruleTag/bindTag.do`,
    saveOwner: '',
    copyRule: `${Util.idt}/open/exchange/rule/copy.do`,
  },
  component: {
    category: `${Util.idt}/open/exchange/category/reducedCategoryTree.do`,
    topicList: `${Util.idt}/common/webPluginUrl/topicList.do`,
    batchList: `${Util.idt}/common/webPluginUrl/batchList.do`,
    tagSource: `${Util.idt}/tag/tag/list.do?bizType=1`,
  },
  category: {
    category: `${Util.idt}/open/exchange/category/reducedCategoryTree.do`,
    initCategory: `${Util.idt}/open/exchange/category/reducedCategoryTree.do?q=*`,
    levelCategory: `${Util.idt}/open/exchange/category/categoryTree.do`,
  },
  attribute: {
    attrList: `${Util.idt}/service/open/exchange/featureValues.do?method=propQuery`,
    attrValue: `${Util.idt}/service/open/exchange/featureValues.do?method=catePropValQuery`,
  },
  pool: {
    upload: `${Util.idt}/common/fileUpload/upload.do`,
    save: `${Util.idt}/common/singaporePool/save.do`,
    get: `${Util.idt}/common/singaporePool/load.do`,
    list: `${Util.idt}/common/singaporePool/list.do`,
    delete: `${Util.idt}/common/singaporePool/delete.do`,
  },
  tag: {
    poseidon: `${Util.idt}/common/singaporePool/poseidon.do`,
  },
  poolData: {
    list: `${Util.idt}/common/singaporePoolData/list.do`,
    delete: `${Util.idt}/common/singaporePoolData/delete.do`,
    clear: `${Util.idt}/common/singaporePoolData/clear.do`,
    reset: `${Util.idt}/common/singaporePoolData/reset.do`,
    download: `${Util.idt}/common/singaporePool/download.do`,
  },
  scenePage: {
    rest: `${Util.idt}/service/open/exchange/RuleScene/load.do`,
    delete: `${Util.idt}/service/open/exchange/RuleScene/remove.do`,
    saveOrUpdate: `${Util.idt}/service/open/exchange/RuleScene/create.do`,
    list: `${Util.idt}/service/open/exchange/RuleScene/list.do`,
    indicatorList: `${Util.idt}/service/open/exchange/RuleScene/indicators.do`,
    indicator: `${Util.idt}/service/open/exchange/RuleScene/selected.do`,
    modify: `${Util.idt}/service/open/exchange/RuleScene/modify.do`,
  },

  // 货盘系统
  tagai: {
    hp: {
      getList: `${Util.tagai}/tagai/offerpackage/getList.json`,
      getById: `${Util.tagai}/tagai/offerpackage/getById.json`,
      queryByHpId: `${Util.tagai}/tagai/featureTagRule/queryByHpId.json`,
      addOrUpdate: `${Util.tagai}/tagai/offerpackage/addOrUpdate.json`,
      deleteById: `${Util.tagai}/tagai/offerpackage/deleteById.json`,
      createOrUpdateTag: `${Util.tagai}/tagai/featureTagRule/createOrUpdateTag.json`,
      getMeta: `${Util.tagai}/tagai/offerpackage/getMetaData`,
      getIndicator: `${Util.idt2}/magicbox/base/queryIndicatorForPallet?dimensionId=13`,
      queryComplexPutStrategy: `${Util.idt2}/magicbox/complex/queryComplexPutStrategy`,
      getDaGroupSelect: `${Util.maya}/uds/deliveryStrategyRpc/getDaGroupSelect.json`,
      // 保存选品规划+策略，获得投放位
      queryResourceIdByRuleId: `${Util.tagai}/tagai/oneClickDelivery/createOrUpdate`,
      // 获取页面+端+组件+数据源id作为主键的选品规划+策略配置
      queryStrategyConfig: `${Util.tagai}/tagai/oneClickDelivery/getByWga`,
      // 选品规划状态修改 (启用 | 下线)
      updateStatu: `${Util.tagai}/tagai/offerpackage/updateStatu`,
      // 选品规划复制
      copyRule: `${Util.tagai}/tagai/offerpackage/copyRule`,
      // 目标列表查询接口
      getGoalList: `${Util.tagai}/tagai/hpGoal/getList`,
      // 触达列表接口
      getTouchList: `${Util.tagai}/tagai/hpTouch/getList`,
      // 触达方式
      getTouchType: `${Util.tagai}/tagai/hpTouch/getTouchType`,
      // 千牛资源位类型下拉查询
      getQianNiuResourceType: `${Util.tagai}/tagai/hpTouch/getQianNiuResourceType`,
      // 淘特资源位类型下拉查询
      getTaoTeResourceType: `${Util.tagai}/tagai/hpTouch/getTaoteResourceType`,
      // 跨境ISV资源位类型下拉查询
      getIsvResourceType: `${Util.tagai}/tagai/hpTouch/getSecondType`,
      // 频率下拉
      getFrequency: `${Util.tagai}/tagai/hpTouch/getFrequency`,
      // 反向招商列表 新增/修改
      hpTouchAddOrUpdate: `${Util.tagai}/tagai/hpTouch/addOrUpdate`,
      // 反向招商列表 删除
      hpTouchDelete: `${Util.tagai}/tagai/hpTouch/delete`,
      skuQuery: `${Util.tagai}/tagai/offer/skuQuery`,
      invite: `${Util.tagai}/tagai/taote/invite`,
      getPriceCaculateList: `${Util.tagai}/tagai/hpTouch/getPriceCaculateList`,
    },
    featureTag: {
      getPrimaryCategory: `${Util.tagai}/tagai/cate/queryUsingCate.jsonp`,
      getLeafCategory: `${Util.tagai}/tagai/cate/queryCatesBycateLevel1Id.jsonp`,
      createOrUpdate: `${Util.tagai}/tagai/featureTagRule/createOrUpdate.jsonp`,
      deleteById: `${Util.tagai}/tagai/featureTagRule/deleteById.jsonp`,
      getList: `${Util.tagai}/tagai/featureTagRule/queryList.jsonp`,
      getDetail: `${Util.tagai}/tagai/featureTagRule/queryById.jsonp`,
      getEditTagList: `${Util.tagai}/tagai/indicator/get.jsonp`,
      saveSingleRule: `${Util.tagai}/tagai/rule/add.jsonp`,
      getAttrList: `${Util.tagai}/tagai/featureTagRule/queryAttributeList.jsonp`,
      getTypeList: `${Util.tagai}/tagai/featureTagRule/queryTypeList.jsonp`,
      addType: `${Util.tagai}/tagai/featureTagType/add.jsonp`,
      deleteType: `${Util.tagai}/tagai/featureTagType/delete.jsonp`,
      searchTag: `${Util.tagai}/tagai/atomTag/query.jsonp`,
      addTag: `${Util.tagai}/tagai/atomTag/add.jsonp`,
      searchMemberTag: `${Util.tagai}/tagai/memberTag/getList.jsonp`,
      testThemeTag: `${Util.tagai}/tagai/test/testThemeTag.jsonp`,
      exportTestFile: `${Util.tagai}/tagai/test/exportTestFile.jsonp`,
      set: `${Util.tagai}/tagai/tagshow/set.jsonp`,
      get: `${Util.tagai}/tagai/tagshow/get.jsonp`,
      queryTestDataForPage: `${Util.tagai}/tagai/test/queryTestDataForPage.jsonp`,
      queryTestDataInfo: `${Util.tagai}/tagai/test/queryTestDataInfo.jsonp`,
      updateTestDataMatch: `${Util.tagai}/tagai/test/updateTestDataMatch.jsonp`,
      TestTagMatch: `${Util.tagai}/tagai/membertest/test.jsonp`,
      queryOrderColumns: `${Util.tagai}/tagai/test/queryOrderColumns.jsonp`,
    },
    theme: {
      // 主题投放id获取明细
      queryById: `${Util.theme}/theme/uds/queryById`,
      // 主题会场列表
      getUdsList: `${Util.theme}/theme/uds/list`,
      // 主题列表
      getThemeList: `${Util.theme}/theme/scene/list`,
      // 保存主题投放
      createOrupdateTheme: `${Util.theme}/theme/uds/createOrupdateTheme`,
      // 热点洞察列表
      queryHotTagListNew: `${Util.theme}/theme/tag/queryHotTagListNew`,
      // 热点洞察多层级类目树
      getPrimaryCategory: `${Util.theme}/category/queryLayer?cateId=0&source=1688&layer=4`,
      // 热点商品详情多层级类目树
      queryLayer: `${Util.theme}/category/queryLayer`,
      // 热点商品详情列表
      tagItemList: `${Util.theme}/theme/tag/itemList`,
      // 行动点收拢 -> 伙拼行动点
      huopinAddExplosiveProduct: '//theme.alibaba-inc.com/theme/tag/huopin/addExplosiveProduct',
      // 行动点收拢 -> 品规行动点
      pinguiAddExplosiveProduct: `${Util.theme}/theme/tag/pingui/addExplosiveProduct`,
    },
    getSimilar1688List: `${Util.theme}/theme/tag/query1688Same`,
    getSimilarTaobaoList: `${Util.theme}/theme/tag/queryTaoBaoSame`,
    efficacy: `${Util.freud}/offerplan/sync_render`,
    // 南水北调消息触达效能
    execute: `${Util.freud}/template/execute`,
  },

  // 奇美拉平台
  chimera: {
    getPageList: `${Util.chimera}/api/page/list?pageIndex=1&pageSize=10&queryType=own`,
    getPageSchema: `${Util.chimera}/api/page/fullinfo`,
    getJdataSchema: `${Util.chimera}/rpc/jdata/get`,
    // 获取wga的dsIds配置的数据源的中文描述
    getDsIdDesc: '//wdc.alibaba-inc.com/open/uniformQueryWdcDataSourceList.jsonp',
    // 根据具体的一个dsId，获取接口定义的入参结构
    getDsIdSchema: '//wdc.alibaba-inc.com/open/uniformQueryWdcDataSourceById.jsonp',
    // 获取一个组件wga数据源的存储配置
    getDsConfig: `${Util.chimera}/rpc/jdata/getJdataQueryRule.json`,
    // 生成投放排期
    saveJdataQueryRule: `${Util.chimera}/rpc/jdata/saveJdataQueryRule.json`,
    // 保存组件数据
    saveComponentData: `${Util.chimera}/rpc/jdata/save`,
  },
  getUrl(path) {
    return Util.getAPI(path);
  },
  rule: {
    rest: '/rule',
    industry: '/rule/industry',
    bu: '/classify/allbu', // '/rule/bu',
    boundBlocks: '/rule/boundBlocks', // 规则关联的招商子活动
    inUseApps: '/rule/inUseApps', // 使用分层的业务方
    data: '/rule/data',
    discoverRule: {
      // 商家发现
      list: '/rule/discoverRule/list',
      counts: '/rule/discoverRule/counts',
      approve: '/rule/discoverRule/approve',
      unapprove: '/rule/discoverRule/unapprove',
      seeds: '/rule/discoverRule/seeds',
      syncSellers: '/rule/discoverRule/syncSellers', // 同步选品数据
    },
    info: Util.getLink('SellerGroupDetail'), // Util.getLink("ruleDetail"),
    list: Util.getLink('ruleList'),
    tagConfig: `${Util.idt}/sea/basic.do`,
  },
  garuda: {
    data: '/garuda/data',
    count: '/garuda/count',
    custom: '/garuda/custom',
    ddl: '/garuda/ddl',
  },
  groupNL: {
    realtimeGroupStatData_API: '/open/exchange/shopsampleB2b/diagnose.do?id=', // '//beidou.alibaba-inc.com/rule/aggregations',
    diagnose: '/open/exchange/rulesampleB2b/diagnose.do',
    profileTabsSource: '/service/open/exchange/RuleScene/load.do?id=69',
    qushiChartConfigs: '/service/open/exchange/RuleScene/load.do?id=67',
    loadDataFeed: '/dashboard/dataFeed/load.do',
  },
  precision: {
    // 精准招商
    audit: {
      apply: `${selleropDomain}/pb/apply`, // 申请
      approve: `${selleropDomain}/pb/approve`, // 审批
      list: `${selleropDomain}/pb/list`, // 查询
    },
    detail: {
      count: `${selleropDomain}/pb/count`,
    },
  },
  enlarge: {
    rule: {
      detail: '/enlarge/enlargeRule/load.do',
      list: '/enlarge/enlargeRule/enlargeRuleList.do',
      save: '/enlarge/enlargeRule/save.do',
      algorithmModelList: '/enlarge/enlargeRule/queryAlgorithmList.do',
      upload: '/common/fileUpload/upload.do',
      enlarge: '/enlarge/enlargeRule/enlarge.do',
      delete: '/enlarge/enlargeRule/remove.do',
    },
    manageSellers: {
      list: '/enlarge/enlargeMember/list.do',
      saveFilter: '/enlarge/enlargeFeature/saveFilter.do',
      pullData: '/enlarge/enlargeFeature/pollData.do',
      revertToInitial: '/enlarge/enlargeFeature/featureList.do',
      filterConditionSchema: '/enlarge/enlargeFeature/featureList.do',
      audit: '/enlarge/enlargeMember/audit.do',
      remove: '/enlarge/enlargeMember/remove.do',
      seed: '/enlarge/enlargeMember/seed.do',
      pullTopicHistoryData: '/enlarge/enlargeMember/pullTopicHistoryList.do',
    },
  },
  crmKa: {
    getInfo: '/biz/ka/tongtKa/load.do',
  },
  insight: {
    itemSelection: `${Util.insight}/itemSelection/tabs.json`,
  },
  pft: {
    enrollListQuery: `${Util.tagai}/tagai/pft/enroll/msg`,
    enrollActive: `${Util.tagai}/pft/web/enroll/active`,
    enrollReject: `${Util.tagai}/pft/web/enroll/reject`,
    enrollTablQuery: `${Util.tagai}/pft/web/enroll/query`,
    enrollSupplyTablQuery: `${Util.tagai}/pft/web/supply/offer/query`,
    enrollCategry: `${Util.idt}/open/exchange/category/reducedCategoryTree.do`,
    enrollOfferDetailGet: `${Util.tagai}/pft/web/enroll/detail/get`,
    enrollOfferDetailSave: `${Util.tagai}/pft/web/enroll/detail/save`,
    enrollOfferPricePopularGet: `${Util.tagai}/pft/web/enroll/price/popular/get`,
    enrollOfferPricePopularSave: `${Util.tagai}/pft/web/enroll/price/popular/save`,
    skuSubmit: `${Util.tagai}/pft/web/enroll/savePrice`,
  },
  yx: {
    auditEnrollList: `${Util.tagai}/pft/web/enroll/savePrice`,
  },
  fxOpp: {
    // 商机筛选接口
    queryIndicatorMetaList: `${Util.tagai}/fxOpp/indicatorMeta/queryIndicatorMetaList`,
    // 列表数据查询接口
    queryMetaMsgList: `${Util.tagai}/fxOpp/metaMsg/queryMetaMsgList`,
    // 商品列表查询接口
    queryOppItemList: `${Util.tagai}/fxOpp/match/queryOppItemList`,
    // 商家列表查询接口
    queryOppMerchantList: `${Util.tagai}/fxOpp/match/queryOppMerchantList`,
    // 品规生效/失效接口
    updateMetaMsgStatus: `${Util.tagai}/fxOpp/metaMsg/updateMetaMsgStatus`,
    // 总量查询接口
    queryOppStrategyMatchCount: `${Util.tagai}/fxOpp/strategy/queryOppStrategyMatchCount`,
    // 策略提交接口
    saveOppStrategy: `${Util.tagai}/fxOpp/strategy/saveOppStrategy`,
    // 策略操作失效接口
    invalidStatus: `${Util.tagai}/fxOpp/strategy/invalidStatus`,
    // 策略列表查询接口
    queryOppStrategyList: `${Util.tagai}/fxOpp/strategy/queryOppStrategyList`,
    // 推送渠道查询接口
    queryPushChannels: `${Util.tagai}/fxOpp/strategy/queryPushChannels`,
    // 商品标签查询接口
    queryTags: `${Util.tagai}/fxOpp/strategy/queryTags`,
  },
  fxCrm: {
    // 商家信息查询接口
    queryUserMsg: `${Util.tagai}/fxCrm/user/queryUserMsg`,
    // 商品信息查询接口
    queryItemList: `${Util.tagai}/fxCrm/user/queryItemList`,
    // 商品进度查询接口
    queryItemStatusList: `${Util.tagai}/fxCrm/user/queryItemStatusList`,
    // SKU维度价格数据查询
    querySkuPriceList: `${Util.tagai}/fxCrm/offer/querySkuPriceList`,
    queryOppMsgInfo: `${Util.tagai}/fxCrm/offer/queryOppMsgInfo`,
    queryAeSkuStatusList: `${Util.tagai}/fxCrm/offer/queryAeSkuStatusList`,
  },
};

// 创建群组配置
const RULE = {
  columnList: [
    { label: '名称', key: 'name' },
    { label: '场景', key: 'businessDesc' }, // 根据业务场景树匹配id拿到name进行拼接
    { label: '失效时间', key: 'endTime' },
    { label: '更新时间', key: 'gmtModified' },
    { label: '数据量', key: 'totalCount' },
    { label: '归属者', key: 'operators' },
    { label: '状态', key: 'status' },
  ],
  ruleStatus: {
    0: '草稿',
    1: '已下线',
    2: '已启用',
    3: '审核完成',
    '-2': '未知',
    '-1': '删除',
  },

  // 活动状态, 品的(descType=auction)
  auctionStatus: [
    { label: '审核通过', value: 'approved' },
    { label: 'offer审核不通过', value: 'reject' },
    { label: 'offer待审核', value: 'wait.offer' },
    { label: 'offer合同待制作', value: 'wait.contract' },
    { label: 'offer合同待确认', value: 'wait.confirm' },
  ],

  // 活动状态, 商的(descType=shop)
  shopStatus: [
    { label: '资质待审核', value: 'new' },
    { label: '资质审核通过', value: 'approved' },
    { label: '资质审核不通过', value: 'tbd' },
  ],

  typeDescText: {
    // 商：我的商家群组，所有商家群组  品：我的选品规划，所有选品规划  买家：我的买家分类，所有买家分类
    auction: '选品规划',
    shop: '商家群组',
    people: '买家分类',
    marketing: '营销选品',
    opportunity: 'CRM机会',
    offerpower: '商品力',
    xiayouxuanpin: '下游选品（淘宝）',
    scene: '选场景',
  },
  huopinTimeType: [
    {
      label: '时间区间', // YYYY-MM-DD hh24:ii:ss
      value: 'customTime',
    },
    {
      label: '动态时间', // 年月日的部分：T+N的形式，表示当前时间的前后一段，单位（天、月）；时分秒部分：（1）自由选择时间，（2）一个固定值——当前时间
      value: 'currentDateTime',
      checked: true,
    },
    {
      label: '当前及以后有效', // 无控件
      value: 'currentDateTime-All',
    },
  ],
};

const SCENE_PAGE = {
  columnList: [
    { label: 'ID', key: 'id' },
    { label: '场景类型', key: 'bizType' },
    { label: '场景名称', key: 'name' },
    { label: '来源类型', key: 'dsType' },
    { label: '服务名称', key: 'serviceName' },
  ],
  itemNew: {
    bizType: { label: '场景类型', type: 'text' },
    name: { label: '场景名称', type: 'text' },
    dsType: { label: '来源类型', type: 'text' },
    serviceName: {
      label: '服务名称',
      type: 'select',
      dataSource: [
        { value: '', label: '请选择' },
        { value: 'people', label: '买家' },
        { value: 'shop', label: '商家' },
        { value: 'opportunity', label: '机会' },
        { value: 'auction', label: '选品' },
      ],
      defaultValue: '',
    },
    feature: { label: '扩展', type: 'textArea' },
  },
  itemDict: {
    // 查询条件配置
    bizType: { label: '场景类型', type: 'text' },
    name: { label: '场景名称', type: 'text' },
    serviceName: {
      label: '服务名称',
      type: 'select',
      dataSource: [
        { value: '', label: '请选择' },
        { value: 'people', label: '买家' },
        { value: 'shop', label: '商家' },
        { value: 'auction', label: '选品' },
      ],
      defaultValue: '',
    },
  },
};

const sellerLevel = [
  {
    label: '核心',
    value: '1',
  },
  {
    label: '活跃',
    value: '2',
  },
  {
    label: '潜力',
    value: '3',
  },
];

const capacitySellerLevel = [
  {
    label: '低潜商家',
    value: '4',
  },
  {
    label: '中潜商家',
    value: '3',
  },
  {
    label: '高潜商家',
    value: '2',
  },
  {
    label: '顶潜商家',
    value: '1',
  },
];

// 创建群组配置
const RIGHTS = {
  business: [
    {
      label: '网站',
      value: 'wangzhan',
    },
    {
      label: '网销宝',
      value: 'wangxiaobao',
    },
    {
      label: '商学院',
      value: 'shangxueyuan',
    },
    {
      label: '服务市场',
      value: 'fuwushichang',
    },
    {
      label: '增值服务',
      value: 'zengzhifuwu',
    },
  ],
  sellerLevel,
  capacitySellerLevel,
  possible: [
    {
      label: '是',
      value: 0,
    },
    {
      label: '否',
      value: 1,
    },
  ],
  columnList: [
    { label: 'ID', key: 'id', width: 50 },
    { label: '权益名称', key: 'name', width: 190 },
    { label: '归属业务', key: 'ownedBusin', width: 110 },
    { label: '分层对象', key: 'slrLevel', width: 150 }, // 根据业务场景树匹配id拿到name进行拼接
    { label: '能力分要求', key: 'matchCond' },
    { label: '创建时间', key: 'gmtCreate', width: 160 },
    { label: '状态', key: 'statusName', width: 60 },
  ],
  rightsStatus: [
    { value: 'normal', label: '正常' },
    { value: 'stop', label: '停用' },
    { value: 'deleted', label: '删除' },
  ],
  typeDescText: {
    // 商：我的商家群组，所有商家群组  品：我的选品规划，所有选品规划  买家：我的买家分类，所有买家分类
    auction: '权益',
    shop: '商家群组',
    people: '买家分类',
  },
};

const POOL = {
  poolTypeDict: {
    'algo-bad': '算法黑名单',
    'algo-white': '算法白名单',
    blacklist: '黑名单',
    'topic-white': '专场白名单',
    whitelist: '白名单',
  },
};

// 创建消息表单配置
const MSG = {
  targetGroupType: {
    shop: 'slr',
    auction: 'slr',
    people: 'byr',
  },

  appName: {
    shop: 'slrlayer',
    auction: 'auctionlayer',
    people: 'byrlayer',
  },
};

export { Util, URL, RULE, RIGHTS, SCENE_PAGE, MSG, POOL };

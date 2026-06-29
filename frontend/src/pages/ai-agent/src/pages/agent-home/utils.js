import { $t } from '@/i18n';
export const contentList = [
  {
    id: 'LightBulbIcon',
    title: $t("global-1688-ai-app.agent-home.jaa", "机会新品选品"),
    value: $t("global-1688-ai-app.agent-home.jzkjucdeixsaa", "基于Amazon、TikTok亿级商品，秒级对比百款新品，分析市场趋势生成新品报告"),
    itemList: [
      {
        id: '1',
        value: $t("global-1688-ai-app.agent-home.biTkDjrl", "美国Tiktok近180天内上架新品宠物用品"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
      {
        id: '2',
        value: $t("global-1688-ai-app.agent-home.biAnDjrl", "美国Amazon近180天内上架新品箱包"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
    ],
    path: '/select-product',
  },
  {
    id: 'ImproveIcon',
    title: $t("global-1688-ai-app.agent-home.pch", "商品改进机会发现"),
    value: $t("global-1688-ai-app.agent-home.jisxvnuj", "精准定位高潜力市场、AI分析海量评价，智能输出专利级解决方案"),
    itemList: [
      {
        id: '1',
        value: $t("global-1688-ai-app.agent-home.biyRRwj", "美国亚马逊扫地机器人评价分析和改进方案"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
      {
        id: '2',
        value: $t("global-1688-ai-app.agent-home.biTkeff", "美国Tiktok卷发棒评价分析和改进方案"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
    ],
    path: '/select-product/improve-agent',
  },
  {
    id: 'FlagIcon',
    title: $t("global-1688-ai-app.agent-home.ptjqyjhfx", "平台间迁移机会发现"),
    value: $t("global-1688-ai-app.agent-home.mtdsrtTxhj", "多平台比对，动态识别同款商品流向，第一时间发现并推送爆款迁移机遇"),
    itemList: [
      {
        id: '1',
        value: $t("global-1688-ai-app.agent-home.sbiydtgo", "圣诞用品从美国亚马逊迁移到美国Tiktok"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
      {
        id: '2',
        value: $t("global-1688-ai-app.agent-home.bickym", "美妆从英国Tiktok迁移到英国亚马逊"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
    ],
    path: '/select-product/platform-agent',
  },
  {
    id: 'CountryIcon',
    title: $t("global-1688-ai-app.agent-home.gjjqyjhfx", "国家间迁移机会发现"),
    value: $t("global-1688-ai-app.agent-home.drtbrtje", "洞悉全球商品流动，精准捕捉同款商品迁移良机。极速抢占新市场"),
    itemList: [
      {
        id: '1',
        value: $t("global-1688-ai-app.agent-home.zojulqy", "在Tiktok儿童玩具从美国亚马逊迁移到西班牙"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
      {
        id: '2',
        value: $t("global-1688-ai-app.agent-home.qefiqTk", "汽摩配从美国Tiktok迁移到英国Tiktok"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
    ],
    path: '/select-product/country-agent',
  },
  {
    id: 'RaiseHandIcon',
    title: $t("global-1688-ai-app.agent-home.1688xyzs", "1688寻源找商"),
    value: $t("global-1688-ai-app.agent-home.A6bjkiny", "AI洞察1688平台百万供应商，精准分析同款供给价格，匹配你的专属供应商"),
    itemList: [
      {
        id: '1',
        value: $t("global-1688-ai-app.agent-home.tjtMa", "童年记忆塑料蜻蜓玩具同款商家"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
      {
        id: '2',
        value: $t("global-1688-ai-app.agent-home.ejma", "儿童防驼背矫正带同款商家"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
    ],
    path: '/select-business',
  },
  {
    id: 'CommodityIcon',
    title: $t("global-1688-ai-app.agent-home.tyxp", "通用选品"),
    value: $t("global-1688-ai-app.agent-home.fodxnjhj", "覆盖蓝海、热点、改款等任意选品需求，AI智能生成专家级报告，即刻获取决策依据"),
    itemList: [
      {
        id: '1',
        value: $t("global-1688-ai-app.agent-home.nzb", "现在入局做「香薰机」晚不晚？"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
      {
        id: '2',
        value: $t("global-1688-ai-app.agent-home.zbao", "最近有什么爆火的小商品？"),
        action: $t("global-1688-ai-app.agent-home.viewal", "查看案例"),
      },
    ],
    path: '/select-product/general-agent',
  },
];
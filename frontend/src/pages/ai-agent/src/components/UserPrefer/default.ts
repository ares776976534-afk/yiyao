import { DEFAULT_LANG } from "@/i18n/constants";
import type { TypePreference } from "@/components/UserPrefer/type";

const defaultPreference: TypePreference = {
  common: {
    // 主题风格
    theme: "dark",
    // 语言
    language: DEFAULT_LANG,
  },

  // 用户信息
  user: {
    // 昵称
    nickName: "",
    // 沟通程度
    communicationStyle: "simple",
    // 行业
    // industry: "",
    // 职能
    // job: "",
  },

  agent: {
    // pattern?: 'profession', // 专业模式，默认不开启
    pattern: "",
  },

  // 导出/下载偏好
  download: {
    // 图片水印
    imageWatermark: true,
    // 视频水印
    vedioWatermark: false,
    // 商品素材水印
    offerWatermark: false,
  },

  // 确认提示 true表示不再提醒
  confirm: {
    // 铺货采集确认提示
    distribute: false,
    // 图片下载确认提示
    image: false,
    // 视频下载确认提示
    video: false,
  },
  guide: {
    homeMaterialStepCloseTime: 0, // 首页素材tab引导关闭时间戳,0表示从未关闭
    homeAddBrowserBookmarkCloseTime: 0, // 首页引导加入收藏关闭时间戳,0表示从未关闭
    hasSubmittedAgent: false, // 是否提交过agent,false表示从未提交
  },
  cookieManager: {
    analytics: true,
  },
};

export default defaultPreference;

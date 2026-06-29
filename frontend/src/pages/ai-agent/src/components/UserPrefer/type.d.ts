import { LANG_MAPPING } from "@/i18n/constants";

export interface TypePreference {
  // 通用设置
  common: {
    // 主题风格，暗色、浅色
    theme: "dark" | "light";
    // 语言，中文、英文、日文、韩文、西班牙文
    language: keyof typeof LANG_MAPPING;
  };

  // 用户信息
  user: {
    // 昵称
    nickName: string;
    // 沟通风格: 简单高效 详尽全面 其他
    communicationStyle: "simple" | "detailed" | "other";
    // 行业
    // industry: string;
    // 职能
    // job: string;
  };

  // 智能体偏好
  agent: {
    pattern?: string;
  };

  // 导出/下载偏好
  download: {
    // 图片水印
    imageWatermark: boolean;
    // 视频水印
    vedioWatermark: boolean;
    // 商品素材水印
    offerWatermark: boolean;
  };

  // 确认提示
  confirm: {
    // 铺货采集确认提示
    distribute: boolean;
    // 图片下载提示
    image: boolean; // 图片下载
    // 视频下载提示
    video: boolean; // 视频下载
  };
  // 引导提示 - 记录关闭时间戳,用于疲劳度判断
  guide: {
    homeMaterialStepCloseTime: number; // 首页素材tab引导关闭时间戳
    homeAddBrowserBookmarkCloseTime: number; // 首页引导加入收藏关闭时间戳
    hasSubmittedAgent: boolean; // 是否提交过agent
  };
  cookieManager: {
    // 是否开启数据分析
    analytics: boolean;
  };
}

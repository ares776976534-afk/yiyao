/**
 * 严选弹窗疲劳度：一天最多弹一次，按页面 key 存 localStorage
 * 各页使用各自的 storageKey，互不影响
 */

/** 各页面严选弹窗疲劳度 localStorage key */
export const YX_DIALOG_FATIGUE_KEYS = {
  overseasDistribution: 'overseas_distribution_yx_dialog_last_shown',
  aeOrder: 'ae_order_yx_dialog_last_shown',
  aliexpress: 'aliexpress_yx_dialog_last_shown',
  crossBorderOfferlist: 'crossborder_offerlist_yx_dialog_last_shown',
  overseasBusinessOpportunities: 'overseas_business_opportunities_yx_dialog_last_shown',
};

/** 跨境信息弹窗疲劳度 localStorage key（一天最多弹一次，同上逻辑） */
export const CROSS_BORDER_INFO_FATIGUE_KEYS = {
  overseasDistribution: 'overseas_distribution_cross_info_dialog_last_shown',
  aliexpress: 'aliexpress_cross_info_dialog_last_shown',
  crossBorderOfferlist: 'crossborder_offerlist_cross_info_dialog_last_shown',
};

const getTodayDateString = () => {
  const d = new Date();
  const m = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${d.getFullYear()}-${m}-${day}`;
};

/**
 * 今天是否已弹过（严选/跨境信息等通用，传对应 fatigue key）
 * @param {string} storageKey 见 YX_DIALOG_FATIGUE_KEYS / CROSS_BORDER_INFO_FATIGUE_KEYS
 * @returns {boolean} 今天是否已弹过
 */
export const wasYxDialogShownToday = (storageKey) => {
  try {
    return localStorage.getItem(storageKey) === getTodayDateString();
  } catch {
    return false;
  }
};

/**
 * 标记今天已弹过
 * @param {string} storageKey 见 YX_DIALOG_FATIGUE_KEYS / CROSS_BORDER_INFO_FATIGUE_KEYS
 */
export const setYxDialogShownToday = (storageKey) => {
  try {
    localStorage.setItem(storageKey, getTodayDateString());
  } catch (_e) {
    // localStorage 不可用时忽略
  }
};

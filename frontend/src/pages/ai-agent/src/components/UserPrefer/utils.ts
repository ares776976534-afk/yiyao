import { toJS } from 'mobx';
import type { TypePreference } from '@/components/UserPrefer/type';
import defaultPreference from '@/components/UserPrefer/default';
import userPrefer from '@/stores/userPrefer';

const USER_PREFERENCE_KEY = 'user_preference';

/**
 * 获取本地存储的用户偏好设置
 * @returns 用户偏好设置对象，如果不存在则返回null
 */
export function getUserPreferenceFromLocal(): TypePreference {
  try {
    const preferences = userPrefer.getItem(USER_PREFERENCE_KEY);
    return preferences || defaultPreference;
  } catch (error) {
    // console.error("获取本地用户偏好设置失败:", error);
    return defaultPreference;
  }
}

/**
 * 设置本地存储的用户偏好设置，并同步更新 window.pageData.userPrefer
 * @param preferences 用户偏好设置对象
 * @returns 是否设置成功
 */
export function setUserPreferenceToLocal(preferences: TypePreference): boolean {
  try {
    // 保存到本地存储
    userPrefer.setItem(USER_PREFERENCE_KEY, preferences);

    // 同步更新 window.pageData.userPrefer
    if (window.pageData?.userPrefer) {
      window.pageData.userPrefer = toJS(preferences);
    }

    // console.log('本地存储用户偏好设置成功:', preferences);
    return true;
  } catch (error) {
    // console.error('设置本地用户偏好设置失败:', error);
    return false;
  }
}

/**
 * 合并偏好设置数据
 * @param base 基础偏好设置
 * @param override 覆盖偏好设置
 * @returns 合并后的偏好设置
 */
export function mergePreferences(
  base: TypePreference,
  override: Partial<TypePreference>,
): TypePreference {
  return {
    agent: { ...base.agent, ...override.agent },
    common: { ...base.common, ...override.common },
    user: { ...base.user, ...override.user },
    download: { ...base.download, ...override.download },
    confirm: { ...base.confirm, ...override.confirm },
    guide: { ...base.guide, ...override.guide },
    cookieManager: { ...base.cookieManager, ...override.cookieManager },
  };
}

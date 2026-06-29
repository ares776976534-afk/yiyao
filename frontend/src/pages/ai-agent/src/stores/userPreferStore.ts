import { makeAutoObservable, toJS } from 'mobx';
import throttle from 'lodash.throttle';
import cloneDeep from 'lodash.clonedeep';
import type { TypePreference } from '@/components/UserPrefer/type.d';
import defaultPreference from '@/components/UserPrefer/default';
import { getUserPrefer, saveUserPrefer } from '@/services/studio/userPrefer';
import { LANG_MAPPING } from '@/i18n/constants';
import {
  event_setCssTheme,
  event_setLanguage,
} from '@/components/studio/event';
import {
  mergePreferences,
  getUserPreferenceFromLocal,
  setUserPreferenceToLocal,
} from '@/components/UserPrefer/utils';
import { setCookie } from '@/utils/cookie';

export class UserPreferStore {
  preferences: TypePreference = window.pageData?.userPrefer
    ? cloneDeep(window.pageData.userPrefer)
    : cloneDeep(defaultPreference);

  throttledSave: ReturnType<typeof throttle>;

  // 用于标记高优先级配置（如 URL 参数、初始化配置等），防止被异步数据覆盖
  private priorityOverrides: Partial<TypePreference['common']> = {};

  constructor() {
    makeAutoObservable(
      this,
      {
        throttledSave: false,
      },
      { autoBind: true },
    );
    this.initializePreferences();
    this.initializeThrottledSave();
  }

  // 销毁时清理throttle
  destroy() {
    this.throttledSave.cancel();
  }

  // 初始化 throttle
  initializeThrottledSave() {
    this.throttledSave = throttle(this.savePreferences.bind(this), 2000, {
      leading: true,
      trailing: true,
    });
  }

  // 初始化偏好设置数据
  async initializePreferences() {
    try {
      // 1. 从默认数据开始
      let currentPrefs = { ...defaultPreference };

      // 2. 尝试从本地存储获取数据并合并
      const localPrefs = getUserPreferenceFromLocal();
      currentPrefs = mergePreferences(currentPrefs, localPrefs);
      this.setPreferences(currentPrefs);

      // 3. 尝试从远程服务器获取数据并合并
      try {
        const remotePrefs = await getUserPrefer();
        if (remotePrefs) {
          currentPrefs = mergePreferences(currentPrefs, remotePrefs);

          // 如果有高优先级配置，需要保留其优先级不被远程数据覆盖
          const hasPriorityOverrides =
            Object.keys(this.priorityOverrides).length > 0;
          if (hasPriorityOverrides) {
            currentPrefs = {
              ...(currentPrefs || {}),
              common: {
                ...(currentPrefs?.common || {}),
                ...this.priorityOverrides,
              },
            };
            // 同步到远程服务器
            saveUserPrefer(currentPrefs);
          }

          this.setPreferences(currentPrefs);

          // 同时更新本地存储
          console.log('currentPrefs', currentPrefs);
          setUserPreferenceToLocal(currentPrefs);
        }
      } catch (remoteError) {
        console.error('获取远程偏好设置失败:', remoteError);
      }
    } catch (error) {
      console.error('初始化偏好设置失败:', error);
    }
  }

  // 设置偏好数据
  setPreferences(preferences: TypePreference) {
    this.preferences = preferences;
  }

  // 批量更新偏好
  updatePreferences(preferences: TypePreference) {
    const newPrefs = {
      ...this.preferences,
      ...preferences,
    };
    this.setPreferences(newPrefs);
    this.throttledSave(newPrefs);
  }

  // 更新主题
  updateTheme(theme: 'light' | 'dark', isPriority = false) {
    // 如果是高优先级配置（如 URL 参数），标记为受保护状态
    if (isPriority) {
      this.priorityOverrides.theme = theme;
    }

    const newPrefs = {
      ...this.preferences,
      common: { ...this.preferences.common, theme },
    };
    this.setPreferences(newPrefs);
    this.throttledSave(newPrefs);

    // 全局通知切换了主题色
    window.dispatchEvent(
      new CustomEvent(event_setCssTheme, {
        detail: theme,
      }),
    );
  }

  // 更新语言
  updateLanguage(language: keyof typeof LANG_MAPPING) {
    const newPrefs = {
      ...this.preferences,
      common: { ...this.preferences.common, language },
    };
    this.setPreferences(newPrefs);
    // this.throttledSave(newPrefs);
    // 立即保存
    this.savePreferences(newPrefs);

    // 全局通知切换了语言
    window.dispatchEvent(
      new CustomEvent(event_setLanguage, {
        detail: language,
      }),
    );
  }

  // 更新昵称显示
  setNicknameDisplay(nickName: string) {
    this.preferences = {
      ...this.preferences,
      user: { ...this.preferences.user, nickName },
    };
  }

  // 更新昵称并保存
  updateNickname(nickName: string) {
    const newPrefs = {
      ...this.preferences,
      user: { ...this.preferences.user, nickName },
    };
    this.setPreferences(newPrefs);
    this.throttledSave(newPrefs);
  }

  // 更新沟通风格
  updateCommunicationStyle(
    communicationStyle: 'simple' | 'detailed' | 'other',
  ) {
    const newPrefs = {
      ...this.preferences,
      user: { ...this.preferences.user, communicationStyle },
    };
    this.setPreferences(newPrefs);
    this.throttledSave(newPrefs);
  }

  // 更新水印设置
  updateWatermark(key: keyof TypePreference['download'], value: boolean) {
    const newPrefs = {
      ...this.preferences,
      download: { ...this.preferences.download, [key]: value },
    };
    this.setPreferences(newPrefs);
    this.throttledSave(newPrefs);
  }

  // 更新确认提示
  updateConfirm(key: keyof TypePreference['confirm'], value: boolean) {
    const newPrefs = {
      ...this.preferences,
      confirm: { ...this.preferences.confirm, [key]: value },
    };
    this.setPreferences(newPrefs);
    this.throttledSave(newPrefs);
  }

  // 更新智能模式
  updateAgent(pattern: string) {
    const newPrefs = {
      ...this.preferences,
      agent: { ...this.preferences.agent, pattern },
    };
    this.setPreferences(newPrefs);
    this.throttledSave(newPrefs);
  }

  // 更新引导提示 - 记录关闭时间戳
  updateGuide(key: keyof TypePreference['guide'], timestamp: number) {
    const newPrefs = {
      ...this.preferences,
      guide: { ...this.preferences.guide, [key]: timestamp },
    };
    this.setPreferences(newPrefs);
    this.throttledSave(newPrefs);
  }

  // 检查引导是否应该显示(根据疲劳度)
  // 1、从未关闭过引导 (closeTime === 0) → 显示引导(不管有没有提交过agent)
  // 2、关闭过引导且从未提交过agent → 根据疲劳度判断是否重新显示
  // 3、关闭过引导且已经提交过agent → 不显示引导
  shouldShowGuide(
    key: keyof TypePreference['guide'],
    fatigueDays: number,
  ): boolean {
    const closeTime = (this.preferences.guide[key] || 0) as number;
    const { hasSubmittedAgent } = this.preferences.guide;

    // 如果从未关闭过,显示引导
    if (closeTime === 0) {
      return true;
    }

    // 如果用户已经提交过agent,不再显示引导
    if (hasSubmittedAgent) {
      return false;
    }

    // 如果用户从未提交过agent,但已经关闭过引导,根据疲劳度判断
    const currentTime = Date.now();
    const timeDiff = currentTime - closeTime;
    const fatigueDuration = fatigueDays * 24 * 60 * 60 * 1000; // 转换为毫秒

    // 如果超过疲劳度,重新显示
    return timeDiff >= fatigueDuration;
  }

  // 记录首次提交agent
  recordFirstAgentSubmit() {
    // 如果已经记录过,不再重复记录
    if (this.preferences.guide.hasSubmittedAgent) {
      return;
    }

    const newPrefs = {
      ...this.preferences,
      guide: {
        ...this.preferences.guide,
        hasSubmittedAgent: true,
      },
    };
    this.setPreferences(newPrefs);
    this.throttledSave(newPrefs);
  }

  // 重置偏好设置，对存储部分进行截流
  reset(preference: TypePreference) {
    // 把用户设置的偏好深度覆盖到默认偏好上，可以保证没有设置的值有默认值
    const defaultPrefs = cloneDeep(defaultPreference);
    const prefs = mergePreferences(defaultPrefs, preference);

    this.setPreferences(prefs);
    this.throttledSave(prefs);
  }

  // 保存偏好设置的函数
  private async savePreferences(prefs: TypePreference) {
    try {
      // 先保存到本地存储
      setUserPreferenceToLocal(prefs);

      setCookie('alpahshop.language', prefs.common.language || '');

      // 再保存到服务端
      await saveUserPrefer(prefs);
    } catch (error) {
      console.error('保存用户偏好失败:', error);
    }
  }

  // 处理Modal关闭，进行最终保存
  handleClose() {
    // 取消throttled函数的延迟执行
    this.throttledSave.cancel();

    // 立即执行最终保存
    this.savePreferences(this.preferences);
  }

  // Getters
  get theme() {
    return this.preferences.common.theme || defaultPreference.common.theme;
  }

  get language() {
    return (
      this.preferences.common.language || defaultPreference.common.language
    );
  }

  get nickname() {
    return this.preferences.user.nickName || defaultPreference.user.nickName;
  }

  get communicationStyle() {
    return (
      this.preferences.user.communicationStyle ||
      defaultPreference.user.communicationStyle
    );
  }

  get watermarkSettings() {
    return this.preferences.download || defaultPreference.download;
  }

  get agent() {
    return this.preferences.agent?.pattern || defaultPreference.agent.pattern;
  }

  get guideSettings() {
    return this.preferences.guide || defaultPreference.guide;
  }

  get cookieManager() {
    return this.preferences.cookieManager || defaultPreference.cookieManager;
  }
}

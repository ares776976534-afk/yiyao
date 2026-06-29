import React from 'react';
import { Space, Switch, Select } from 'antd';
import { IconLightTheme, IconDarkTheme } from '../icons';
import type { TypePreference } from '@/components/UserPrefer/type';
import { $t } from '@/i18n';
import { enableMultipleLanguages } from '@/utils/env';
import { LANG_MAPPING, LANGUAGE_OPTIONS } from '@/i18n/constants';
import styles from '../index.module.scss';

export default function Basic(props) {
  const { userPreferStore } = props;
  const { preferences } = userPreferStore;

  const handleThemeChange = (theme: 'light' | 'dark') => {
    userPreferStore.updateTheme(theme);
  };

  const handleWatermarkChange = (
    key: keyof TypePreference['download'],
    value: boolean,
  ) => {
    userPreferStore.updateWatermark(key, value);
  };

  const handleLanguageChange = (language: keyof typeof LANG_MAPPING) => {
    userPreferStore.updateLanguage(language);
  };

  return (
    <Space direction="vertical" size="large" className={styles.settingsSpace}>
      {/* 外观设置 */}
      <div>
        <div className={styles.sectionTitle}>
          {$t('global-1688-ai-app.UserPrefer.wgsettings', '外观设置')}
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.themePreview}>
            <div
              className={styles.themePreviewInner}
              onClick={() => handleThemeChange('light')}
            >
              <div
                className={[
                  styles.themePreviewIcon,
                  preferences.common.theme === 'light' ? styles.active : '',
                ].join(' ')}
              >
                <IconLightTheme />
              </div>
              <div className={styles.themeLabel}>
                {$t('global-1688-ai-app.UserPrefer.qsms', '浅色模式')}
              </div>
            </div>
            <div
              className={styles.themePreviewInner}
              onClick={() => handleThemeChange('dark')}
            >
              <div
                className={[
                  styles.themePreviewIcon,
                  preferences.common.theme === 'dark' ? styles.active : '',
                ].join(' ')}
              >
                <IconDarkTheme />
              </div>
              <div className={styles.themeLabel}>
                {$t('global-1688-ai-app.UserPrefer.ssms', '深色模式')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 语言设置 */}
      {!!enableMultipleLanguages && (
        <div>
          <div className={styles.sectionTitle}>
            {$t('global-1688-ai-app.UserPrefer.yysettings', '语言设置')}
          </div>
          <div className={styles.sectionContent}>
            <Select
              value={preferences.common.language}
              onChange={handleLanguageChange}
              options={LANGUAGE_OPTIONS}
              classNames={{
                root: styles.languageSelectRoot,
                popup: {
                  root: styles.languageSelectPopup,
                },
              }}
            />
          </div>
        </div>
      )}

      {/* 水印设置 */}
      <div>
        <div className={styles.sectionTitle}>
          {$t('global-1688-ai-app.UserPrefer.sysettings', '水印设置')}
        </div>
        <Space
          direction="vertical"
          size="middle"
          className={styles.watermarkSpace}
        >
          <div className={styles.settingItem}>
            <div>
              <div className={styles.settingLabel}>
                {$t('global-1688-ai-app.UserPrefer.imagesy', '图片水印')}
              </div>
              <div className={styles.settingDesc}>
                {$t(
                  'global-1688-ai-app.UserPrefer.etes',
                  '导出图片时添加水印标识',
                )}
              </div>
            </div>
            <Switch
              checked={preferences.download.imageWatermark}
              onChange={(checked) =>
                handleWatermarkChange('imageWatermark', checked)
              }
              className={styles.switch}
            />
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.settingLabel}>
                {$t('global-1688-ai-app.UserPrefer.pcy', '商品铺货水印')}
              </div>
              <div className={styles.settingDesc}>
                {$t(
                  'global-1688-ai-app.UserPrefer.pcxsy',
                  '商品素材导出时添加水印',
                )}
              </div>
            </div>
            <Switch
              disabled
              checked={preferences.download.offerWatermark}
              onChange={(checked) =>
                handleWatermarkChange('offerWatermark', checked)
              }
              className={styles.switch}
            />
          </div>
          <div className={styles.settingItem}>
            <div>
              <div className={styles.settingLabel}>
                {$t('global-1688-ai-app.UserPrefer.videosy', '视频水印')}
              </div>
              <div className={styles.settingDesc}>
                {$t(
                  'global-1688-ai-app.UserPrefer.etos',
                  '导出视频时添加水印标识',
                )}
              </div>
            </div>
            <Switch
              disabled
              checked={preferences.download.vedioWatermark}
              onChange={(checked) =>
                handleWatermarkChange('vedioWatermark', checked)
              }
              className={styles.switch}
            />
          </div>
        </Space>
      </div>
    </Space>
  );
}

/**
 * 模式选择器组件 (ModeSelector)
 * 用于选择搜索模式：智能模式、以品找商、直搜商家
 */

import React, { useState, useMemo } from 'react';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import type { TypeModeSelectorProps } from './types';
import { EnumSearchMode } from '../../enum';
import { MODE_CONFIGS } from './constants';
import styles from './index.module.scss';
import { AutoIcon, SearchOfferIcon, SearchProviderIcon } from './icons';
import { Checkmark2Icon, DownArrowIcon, PlanningIcon } from '@/components/Icon';
import log, { commonRecord } from '@/utils/log';
import { $t } from '@/i18n';

const ModeSelector: React.FC<TypeModeSelectorProps & { logKey?: string }> = ({
  value = EnumSearchMode.SMART,
  onChange,
  disabled = false,
  logKey,
}) => {
  const [open, setOpen] = useState(false);

  // 当前选中的模式配置
  const currentMode = useMemo(() => {
    return MODE_CONFIGS.find((config) => config.key === value) || MODE_CONFIGS[0];
  }, [value]);

  // 处理模式切换
  const handleModeChange = (mode: EnumSearchMode) => {
    if (logKey) {
      log.record(logKey as `/${string}.${string}.${string}`, 'CLK', { mode });
    }
    onChange?.(mode);
    setOpen(false);
    commonRecord(`模式选择`);
  };

  // 下拉菜单内容
  const dropdownRender = () => {
    return (
      <div className={styles.dropdownMenu}>
        {MODE_CONFIGS.map((config) => {
          const selected = config.key === currentMode.key;
          return (
            <div
              key={config.key}
              className={classNames(styles.modeItem, {
                [styles.selected]: selected,
              })}
              onClick={() => handleModeChange(config.key)}
            >
              <div className={styles.content}>
                <div className={styles.header}>
                  <div className={styles.icon}>
                    {config.key === EnumSearchMode.SMART && <PlanningIcon fill="var(--icon-primary)" />}
                    {config.key === EnumSearchMode.PRODUCT_TO_SUPPLIER && <SearchOfferIcon height={16} width={16} fill="var(--icon-primary)" />}
                    {config.key === EnumSearchMode.DIRECT_SUPPLIER && <SearchProviderIcon height={16} width={16} fill="var(--icon-primary)" />}
                  </div>
                  <span className={styles.title}>{config.title}</span>
                </div>
                <span className={styles.description}>{config.description}</span>
              </div>
              {selected && (
                <span className={styles.arrow}>
                  <Checkmark2Icon />
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 按钮内容
  const buttonContent = (
    <div
      className={classNames(styles.modeButton, {
        [styles.open]: open,
        [styles.disabled]: disabled,
      })}
    >
      {/* <img
        src={currentMode.icon}
        alt="模式图标"
        className={styles.leftIcon}
      /> */}
      <div className={styles.leftIcon}>
        {currentMode.key === EnumSearchMode.SMART && <PlanningIcon height={14} width={14} />}
        {currentMode.key === EnumSearchMode.PRODUCT_TO_SUPPLIER && <SearchOfferIcon />}
        {currentMode.key === EnumSearchMode.DIRECT_SUPPLIER && <SearchProviderIcon />}
      </div>
      <span className={styles.buttonText}>{currentMode.title}</span>
      <span className={styles.rightIcon}>
        <DownArrowIcon width={12} height={12} fill="currentColor" />
      </span>
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
      popupRender={dropdownRender}
      trigger={['click']}
      placement="bottomLeft"
    >
      {buttonContent}
    </Dropdown>
  );
};

export default ModeSelector;


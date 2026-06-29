import React, { useState, useEffect } from 'react';
import { Switch, InputNumber } from 'antd';
import IndexBlock from '../IndexBlock';
import { getNumberIcon } from '../FormatList/RightComponents/numberIconConfig';

import styles from './index.module.css';
import { $t } from '@/i18n';

interface AutoOrderSettingsProps {
  onChange?: (config: {
    enable: boolean;
    conditions: {
      key: string;
      value: string;
    }[];
  }) => void;
  value?: {
    enable: boolean;
    conditions: {
      key: string;
      value: string;
    }[];
  };
  number?: number; // 数字序号
}

const AutoOrderSettings: React.FC<AutoOrderSettingsProps> = ({ onChange, value, number = 5 }) => {
  const NumberIcon = getNumberIcon(number);
  const [autoOrder, setAutoOrder] = useState(value?.enable || false);
  const [conditions, setConditions] = useState(() => {
    // 从value中恢复条件值
    if (value?.conditions) {
      const conditionsMap: any = {};
      value.conditions.forEach(item => {
        conditionsMap[item.key] = item.value ? parseFloat(item.value) : undefined;
      });
      return {
        minOrderQuantity: conditionsMap.MOQ || undefined,
        deliveryDays: conditionsMap.deliveryDays || undefined,
        minPrice: conditionsMap.minPrice || undefined
      };
    }
    return {
      minOrderQuantity: undefined,
      deliveryDays: undefined,
      minPrice: undefined
    };
  });

  const handleAutoOrderChange = (checked: boolean) => {
    setAutoOrder(checked);
    // 直接触发onChange，避免useEffect死循环
    triggerOnChange(checked, conditions);
  };

  const handleConditionChange = (field: string, value: number | null) => {
    const newConditions = { ...conditions, [field]: value };
    setConditions(newConditions);
    // 直接触发onChange，避免useEffect死循环
    triggerOnChange(autoOrder, newConditions);
  };

  // 封装onChange逻辑，避免在useEffect中重复调用
  const triggerOnChange = (enable: boolean, conditionsData: any) => {
    onChange?.({
      enable,
      conditions: Object.entries(conditionsData)
        .filter(([key, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => ({
          key: key === 'minOrderQuantity' ? 'MOQ' : key,
          value: (value as any).toString()
        }))
    });
  };

  // 监听外部value变化 - 不触发onChange避免循环
  useEffect(() => {
    if (value) {
      setAutoOrder(value.enable);
      // 转换conditions格式
      const conditionsMap: any = {};
      value.conditions?.forEach(item => {
        conditionsMap[item.key] = item.value ? parseFloat(item.value) : undefined;
      });
      setConditions({
        minOrderQuantity: conditionsMap.MOQ || undefined,
        deliveryDays: conditionsMap.deliveryDays || undefined,
        minPrice: conditionsMap.minPrice || undefined
      });
    }
  }, [value]);

  // 组件挂载后初始化报告当前值 - 延迟执行避免循环
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerOnChange(autoOrder, conditions);
    }, 0);
    return () => clearTimeout(timer);
  }, []); // 只在组件挂载时执行一次

  return (
    <IndexBlock
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <NumberIcon />
          <span>{$t("global-1688-ai-app.inquiry.AutoOrderSettings.snPoCt", "设置自动下单条件")}</span>
        </div>
      }
    >
      <div className={styles.autoOrderCard}>
        <div className={styles.autoOrderHeader}>
          <div className={styles.autoOrderInfo}>
            <span className={styles.autoOrderTitle}>{$t("global-1688-ai-app.inquiry.AutoOrderSettings.slruo", "使用自动下单功能")}</span>
            <span className={styles.autoOrderSubtitle}>{$t("global-1688-ai-app.inquiry.AutoOrderSettings.ddegnoszjr", "当询盘结束，且满足设置的条件时，系统将自动为您创建订单")}</span>
          </div>
          <Switch
            checked={autoOrder}
            onChange={handleAutoOrderChange}
            className={styles.antdSwitch}
          />
        </div>
        {/* {autoOrder && (
          <>
            <div className={styles.divider} />
            <div className={styles.conditionRow}>
              <span className={styles.conditionLabel}>最小起订量</span>
              <div className={styles.conditionInput}>
                <span>低于</span>
                <InputNumber
                  placeholder="请输入数字"
                  className={styles.antdInputNumber}
                  disabled={!autoOrder}
                  value={conditions.minOrderQuantity}
                  onChange={(value) => handleConditionChange('MOQ', value as number)}
                />
                <span>个</span>
              </div>
            </div>
            <div className={styles.divider} />
            <div className={styles.conditionRow}>
              <span className={styles.conditionLabel}>交货期</span>
              <div className={styles.conditionInput}>
                <span>低于</span>
                <InputNumber
                  placeholder="请输入数字"
                  className={styles.antdInputNumber}
                  disabled={!autoOrder}
                  value={conditions.deliveryDays}
                  onChange={(value) => handleConditionChange('deliveryTime', value as number)}
                />
                <span>天</span>
              </div>
            </div>
            <div className={styles.divider} />
            <div className={styles.conditionRow}>
              <span className={styles.conditionLabel}>最低单价</span>
              <div className={styles.conditionInput}>
                <span>¥</span>
                <InputNumber
                  placeholder="请输入数字"
                  className={styles.antdInputNumber}
                  disabled={!autoOrder}
                  value={conditions.minPrice}
                  onChange={(value) => handleConditionChange('lowestPrice', value as number)}
                />
              </div>
            </div>
          </>
        )} */}
      </div>
    </IndexBlock>
  );
};

export default AutoOrderSettings;
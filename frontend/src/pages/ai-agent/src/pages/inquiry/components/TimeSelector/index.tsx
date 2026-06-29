import React, { useState, useEffect } from 'react';
import IndexBlock from '../IndexBlock';
import { getFinishTime } from '@/pages/inquiry/services';

import styles from './index.module.css';
import { $t } from '@/i18n';

interface TimeSelectorProps {
  onChange?: (time: number) => void;
  value?: number;
}
interface Time {
  minute: number;
  desc: string;
  text: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ onChange, value }) => {
  const [times, setTimes] = useState<Time[]>([]);
  const [timeOption, setTimeOption] = useState<number | null>(null);

  const handleTimeClick = (value: number) => {
    setTimeOption(value);
    // 直接触发onChange，避免useEffect死循环
    onChange?.(value);
  };

  // 监听外部value变化 - 不触发onChange避免循环
  useEffect(() => {
    if (value !== undefined && value !== timeOption) {
      setTimeOption(value);
    }
  }, [value]);

  // 组件挂载后初始化报告当前值 - 延迟执行避免循环
  useEffect(() => {
    const timer = setTimeout(() => {
      if (timeOption !== null) {
        onChange?.(timeOption);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []); // 只在组件挂载时执行一次

  useEffect(() => {
    getFinishTime().then((res: any) => {
      setTimes(res?.data || []);
      // handleTimeClick(res?.data?.[0]?.minute || 0);
    });
  }, []);
  return (
    <IndexBlock
      title={$t("global-1688-ai-app.inquiry.TimeSelector.settingsEndTime", "设置结束时间")}
    >
      <div className={styles.timeOptions}>
        {times.map((time) => (
          <div
            key={time.minute}
            className={`${styles.timeOption} ${timeOption === time.minute ? styles.selected : ''}`}
            onClick={() => handleTimeClick(time.minute)}
          >
            <span className={styles.timeValue}>{time.text}</span>
            <span className={styles.timeDescription}>{time.desc}</span>
          </div>
        ))}
      </div>
    </IndexBlock>
  );
};

export default TimeSelector;
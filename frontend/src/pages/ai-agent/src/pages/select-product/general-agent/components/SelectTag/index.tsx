import React, { useState, useEffect } from 'react';
import { Dropdown, MenuProps } from 'antd';
import styles from '../ReqComponent/index.module.css';
import Arrow from '../Icon/Arrow';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

interface SelectTagProps {
  value: string;
  options: { name }[];
  onChange: (value: string) => void;
}

const SelectTag: React.FC<SelectTagProps> = ({ value, options, onChange }) => {
  const [visible, setVisible] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([value]);

  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const handleSelect = (key: string) => {
    // 打点：切换关键词
    if (key !== value) {
      log.record(LOG_KEYS.GENERAL_AGENT.LP.SWITCH_KEYWORD, 'CLK', {
        fromKeyword: value,
        toKeyword: key,
      });
    }

    setSelectedKeys([key]);
    onChange(key);
  };

  const items: MenuProps['items'] = options.map(option => ({
    key: option.name,
    label: option.name,
    onClick: () => {
      handleSelect(option.name);
    },
  }));

  useEffect(() => {
    if (options?.length > 0) {
      handleSelect(options[0].name);
    }
  }, [options]);

  return (
    <Dropdown
      menu={{
        items,
        selectable: true,
        selectedKeys,
      }}
      trigger={['click']}
      overlayStyle={{ border: 'none' }}
      overlayClassName={styles.selectTagDropdown}
      onOpenChange={handleVisibleChange}
    >
      <div className={styles.tag} style={{ cursor: 'pointer' }}>
        <span className={styles.tagText}>{value}</span>
        <Arrow className={styles.tagIcon} style={{ transform: visible ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </div>
    </Dropdown>
  );
};

export default SelectTag;

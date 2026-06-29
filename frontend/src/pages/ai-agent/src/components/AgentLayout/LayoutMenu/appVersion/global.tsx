import { useMemo } from 'react';
import styles from '../../index.module.css';
import { Menu, Tooltip } from 'antd';

type TypeGlobalProps = {
  selectedKeys: string[];
  actualMenuItems: any[];
  handleMenuClick: (menuInfo: any) => void;
};

const Global = ({ selectedKeys, actualMenuItems, handleMenuClick }: TypeGlobalProps) => {
  // 为每个菜单项的图标添加 Tooltip 包裹
  const menuItemsWithTooltip = useMemo(() => {
    return actualMenuItems.map((item) => {
      const { label, key, icon, ...rest } = item;
      return ({
        ...rest,
        key,
        label,
        icon: (
          <Tooltip
            title={
              <div className={styles.tooltipContent}>
                <span>{key}</span>
              </div>
            }
            placement="right"
            arrow={false}
            align={{
              offset: [24, 0],
            }}
            overlayStyle={{ maxWidth: 'none' }}
            overlayInnerStyle={{ whiteSpace: 'nowrap' }}
          >
            <span>{icon}</span>
          </Tooltip>
        ),
      })
    });
  }, [actualMenuItems]);

  return (
    <div className={styles.siderContent}>
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItemsWithTooltip}
        onClick={handleMenuClick}
        className={styles.antdMenu}
        inlineCollapsed
      />
    </div>
  );
};

export default Global;
import styles from '../../index.module.css';
import { Menu } from "antd";

type TypeCnProps = {
  selectedKeys: string[];
  actualMenuItems: any[];
  handleMenuClick: (menuInfo: any) => void;
};
const Cn = ({ selectedKeys, actualMenuItems, handleMenuClick }: TypeCnProps) => {
  return (
    <div className={styles.siderContent}>
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={actualMenuItems}
        onClick={handleMenuClick}
        className={styles.antdMenu}
        inlineCollapsed
      />
    </div>
  );
};

export default Cn;
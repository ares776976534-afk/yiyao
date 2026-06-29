import { getVersionComponent } from '@/utils/versionRouter';
import styles from '../index.module.scss';

interface ColumnProps {
  type: 'default' | 'simple';
  menuItems: any[];
  renderMenuItem: (item: any) => React.ReactNode;
}
const cn = ({ type, menuItems, renderMenuItem }: ColumnProps) => {
  return (
    type !== 'simple' ? (
      <div className={styles.navigation}>
        {menuItems.map(renderMenuItem)}
      </div>
    ) : null 
  )
};

const global = () => <></>;

export default getVersionComponent({
  CN: cn,
  GLOBAL: global,
});
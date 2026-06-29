import { getVersionComponent } from '@/utils/versionRouter';
import styles from './index.module.css';

const Cn = ({ title }) => {
  return (
    <span className={styles.title}>{title}</span>
  )
}

const Global = ({ title }) => {
 return (
  <span className={styles.title} style={{ fontSize: 18 }}>{title}</span>
 )
}

export default getVersionComponent({
  CN: Cn,
  GLOBAL: Global,
});


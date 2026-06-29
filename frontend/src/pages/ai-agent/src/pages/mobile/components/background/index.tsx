import styles from './index.module.scss';
import { agentImg } from '../../config/agentImg';

export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.background}>
      <div className={styles.bgLeftTop}>
        <img src={agentImg.bgLeftTop} alt="" />
      </div>
      <div className={styles.bgRightBottom}>
        <img src={agentImg.bgRightBottom} alt="" />
      </div>
      {children}
    </div>    
  );
}
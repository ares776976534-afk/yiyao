import { agentImg } from '@/pages/mobile/config/agentImg';
import styles from './index.module.scss';

export const Empty = ({ text, style }: { text: string, style: React.CSSProperties }) => {
  return (
    <div className={styles.empty} style={style}>
      <div className={styles.container}>
        <img className={styles.image} src={agentImg.empty} alt="" srcSet="" />
      </div>
      <div className={styles.emptyText}>{text}</div>
    </div>
  )
}
import styles from './index.module.css';
import { agentImg } from '../../config';

export default function DialogueHeader({ text }) {
  return (
    <div className={styles.dialogueHeader}>
      <div className={styles.dialogueHeaderLogoContainer}>
        <img className={styles.dialogueHeaderLogo} src={agentImg.cnLogo} alt="" />
      </div>
      <div className={styles.dialogueHeaderText}>{text}</div>
    </div>
  )
}
import { Button } from 'antd'
import styles from './index.module.css'

interface Props {
  icon?: React.ReactNode;
  value?: string;
  text?: string;
  handleBtn?: (e) => void;
  style?: React.CSSProperties;
  other?: any;
}
// button 按钮
export const MainBtn = ({ icon, text, handleBtn, style, other }: Props) => {
  return (
    <Button
      type="primary"
      icon={icon}
      onClick={handleBtn}
      className={styles.mainBtn}
      style={{ fontSize: 14, ...style }}
      autoInsertSpace={false}
      {...other}
    >
      {text != null && text !== '' ? <span className={styles.btnText}>{text}</span> : null}
    </Button>
  )
}

export const SecondaryBtn = ({ icon, text, handleBtn, style }: Props) => {
  return (
    <Button
      type="primary"
      icon={icon}
      onClick={handleBtn}
      className={styles.secondaryBtn}
      autoInsertSpace={false}
      style={style}
    >
      {text != null && text !== '' ? <span className={styles.btnText}>{text}</span> : null}
    </Button>
  )
}

export const AssistanceBtn = ({ icon, text, handleBtn, style }: Props) => {
  return (
    <Button
      type="primary"
      icon={icon}
      onClick={handleBtn}
      className={styles.assistanceBtn}
      autoInsertSpace={false}
      style={style}
    >
      {text != null && text !== '' ? <span className={styles.btnText}>{text}</span> : null}
    </Button>
  )
}
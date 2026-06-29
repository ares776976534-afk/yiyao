import styles from './index.module.scss';
import { PanelIcon } from "@/components/Icons";

interface FormCardProps {
  title: string;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
  panelIcon?: React.ReactNode;
}

export default ({
  title,
  rightContent,
  children,
  panelIcon = <PanelIcon style={{ width: '16px', height: '16px' }} />
}: FormCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          {panelIcon}
          <div className={styles.cardTitle}>{title}</div>
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
      {children}
    </div>
  )
}
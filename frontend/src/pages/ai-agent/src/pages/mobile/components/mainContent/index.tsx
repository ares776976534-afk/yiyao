import styles from './index.module.scss';

interface MainContentProps {
  children: React.ReactNode;
}

export default ({ children }: MainContentProps) => {
  return (
    <div className={styles.mainContent}>
      {children}
    </div>
  )
}
import styles from './index.module.css';

interface TypeHeaderProps {
  title: string;
}
const Header = ({ title }: TypeHeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerIconContainer}>
        <div className={styles.headerIcon} />
      </div>
      <div className={styles.headerTitle}>
        {title}
      </div>
    </div>
  );
};

export default Header;
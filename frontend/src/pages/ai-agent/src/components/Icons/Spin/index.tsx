import styles from './index.module.scss';

export default ({className}: {className?: string} = {}) => {
  return (
    <div className={`${styles.spin}${className ? ` ${className}` : ''}`}>
    </div>
  );
};
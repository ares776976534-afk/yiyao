import styles from './global.module.css';

const Global = ({ label }: { label: string }) => {
  return (<div className={`${styles.menuItemLabelText} menuItemLabelTextGlobal`}>{label}</div>);
};

export default Global;
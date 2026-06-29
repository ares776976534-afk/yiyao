import styles from "./index.module.css";
import { DownArrowIcon } from "@/components/Icon";

interface TypePaginationProps {
  current: number;
  total: number;
  onChange?: (page: number) => void;
}

const Arrow = ({ rotate, disabled, onClick }: { rotate: number; disabled: boolean; onClick: () => void }) => (
  <div className={`${styles.iconBtn} ${disabled ? styles.disabled : ''}`} onClick={onClick}>
    <DownArrowIcon style={{ transform: `rotate(${rotate}deg)` }} width={12} height={12} fill="currentColor" />
  </div>
);

const Pagination: React.FC<TypePaginationProps> = ({ current, total, onChange }) => (
  <div className={styles.container}>
    <Arrow rotate={90} disabled={current <= 1} onClick={() => current > 1 && onChange?.(current - 1)} />
    <span className={styles.text}>{current}/{total}</span>
    <Arrow rotate={270} disabled={current >= total} onClick={() => current < total && onChange?.(current + 1)} />
  </div>
);

export default Pagination;

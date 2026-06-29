import type { TypeTagOption } from "../../types";
import styles from "./index.module.scss";

interface TagSelectorProps {
  label: string;
  required?: boolean;
  options: TypeTagOption[];
  value: string;
  onChange: (key: string) => void;
  optionClassName?: string;
}

const TagSelector = ({
  label,
  required = true,
  options,
  value,
  onChange,
  optionClassName = "",
}: TagSelectorProps) => {
  return (
    <div className={styles.selectorGroup}>
      <div className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </div>
      <div className={styles.options}>
        {options.map((item) => (
          <div
            key={item.key}
            className={`${styles.option} ${optionClassName} ${
              value === item.key ? styles.active : ""
            } ${item.disabled ? styles.disabled : ""}`}
            onClick={() => !item.disabled && onChange(item.key)}
          >
            {item.icon && (
              <img className={styles.icon} src={item.icon} alt={item.label} />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagSelector;

import React from 'react';
import styles from './index.module.scss';
import { EnumAlign, TypeTableHeader } from '../../types';
interface TextIconProps {
  header: TypeTableHeader;
  value: {
    value: string;
    icon: string;
  };
}

const TextIcon: React.FC<TextIconProps> = ({ value, header }) => {
  const align = header?.align;
  const { value: textValue, icon } = value || {};
  if (!textValue) {
    return null;
  }
  return (
    <div
      style={{
        justifyContent: align === EnumAlign.CENTER ? 'center'
          : align === EnumAlign.RIGHT ? 'flex-end' : 'flex-start',
      }}
      className={styles.textIconWrapper}
    >
      {icon && <img className={styles.icon} src={icon} alt="" />}
      <span className={styles.text}>{textValue}</span>
    </div>
  );
};

export default TextIcon;

import React from 'react';
import { EnumAlign, TypeTableHeader } from '../../types';
import styles from './index.module.scss';
import { TriangleIcon } from '@/components/Icon';
interface TextTrendProps {
  header: TypeTableHeader;
  value: {
    // value?: string | number | boolean;
    direction?: 'UP' | 'DOWN';
    text?: string;
  };
}

const TextTrend: React.FC<TextTrendProps> = ({ value, header }) => {
  const { direction, text } = value;
  const align = header?.align;
  return (
    <div
      style={{
        justifyContent: align === EnumAlign.CENTER ? 'center'
          : align === EnumAlign.RIGHT ? 'flex-end' : 'flex-start',
      }}
      className={`${styles.textTrendWrapper} ${direction === 'UP' ? styles.textTrendDirectionUp : styles.textTrendDirectionDown}`}
    >
      <div className={styles.textTrendDirection}>
        <TriangleIcon />
      </div>
      <div className={styles.textTrendText}>
        {text}
      </div>
    </div>
  );
};

export default TextTrend;

import React from 'react';
import type { TypeQwenTakeawayProps } from './types';
import renderContent from './components/RenderContent';
import styles from './qwenTakeway.module.css';

const QwenTakeaway: React.FC<TypeQwenTakeawayProps> = ({ children, className, class: htmlClass, ...props }) => {
  // 处理 HTML class 属性和 React className 属性
  const classValue = className || htmlClass || '';
  const combinedClassName = classValue
    ? `qwen-takeaway ${classValue}`
    : 'qwen-takeaway';

  return (
    <div className={`${combinedClassName} ${styles.qwenTakeawayContainer}`} {...props}>
      <div className={styles.qwenTakeawayContent}>
        {renderContent(children)}
        <div className={styles.qwenTakeawayIcon} />
      </div>
    </div>
  );
};
export default QwenTakeaway;

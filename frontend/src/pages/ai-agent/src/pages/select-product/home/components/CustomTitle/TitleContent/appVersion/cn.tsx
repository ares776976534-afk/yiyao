import styles from '../../index.module.scss';
import { HeaderLogo } from '@/pages/agent-home';
import React from 'react';

interface TypeCnProps {
  colorTitleParts: string[];
  parseText: (text: string) => { text: string; isEnglish: boolean }[];
  parseTitleText: (text: string) => { text: string; type: 'chinese' | 'agent' }[];
  title: string;
}
const Cn = ({ colorTitleParts, parseText, parseTitleText, title }: TypeCnProps) => {
  return (
    <div className={styles.titleContainer}>
      <HeaderLogo />

      {/* 竖线 */}
      <div className={styles.titleDivider} />

      {/* 渐变文本容器 */}
      <div className={styles.colorTitleContainer}>
        {colorTitleParts.map((part, partIndex) => {
          const parsedParts = parseText(part);
          return (
            <React.Fragment key={partIndex}>
              {parsedParts.map((parsedPart, parsedIndex) => (
                <span
                  key={parsedIndex}
                  className={parsedPart.isEnglish ? styles.colorTitleTextEnglish : styles.colorTitleText}
                >
                  {parsedPart.text}
                </span>
              ))}
              {partIndex < colorTitleParts.length - 1 && (
                <span className={styles.colorTitleDot}>·</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 普通文本 */}
      <div className={styles.titleTextContainer}>
        {parseTitleText(title).map((part, index) => (
          <span
            key={index}
            className={part.type === 'agent' ? styles.titleTextAgent : styles.titleText}
          >
            {part.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Cn;
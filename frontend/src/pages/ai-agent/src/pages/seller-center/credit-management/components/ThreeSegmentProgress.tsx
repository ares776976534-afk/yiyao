import React from 'react';
import styles from './ThreeSegmentProgress.module.css';

interface TypeThreeSegmentProgressProps {
  value1: number; // 第一段的值
  value2: number; // 第二段的值
  value3: number; // 第三段的值
  color1?: string; // 第一段颜色或渐变
  color2?: string; // 第二段颜色或渐变
  color3?: string; // 第三段颜色或渐变
  height?: number; // 高度，默认16px
  borderRadius?: number; // 圆角，默认8px
}

export const ThreeSegmentProgress: React.FC<TypeThreeSegmentProgressProps> = ({
  value1,
  value2,
  value3,
  color1 = '#52C41A',
  color2 = '#1890FF',
  color3 = '#B37FEB',
  height = 16,
  borderRadius = 50,
}) => {
  // 计算总值
  const total = value1 + value2 + value3;

  // 计算每段的百分比和宽度
  const percent1 = total > 0 ? (value1 / total) * 100 : 0;
  const percent2 = total > 0 ? (value2 / total) * 100 : 0;
  const percent3 = total > 0 ? (value3 / total) * 100 : 0;

  // 判断颜色是否是渐变
  const isGradient = (color: string) => color.includes('gradient');

  // 判断每段是否是最后一段
  const isLastSegment1 = percent1 > 0 && percent2 === 0 && percent3 === 0;
  const isLastSegment2 = percent2 > 0 && percent3 === 0;
  const isLastSegment3 = percent3 > 0;

  return (
    <div className={styles.progressWrapper} style={{ height: `${height}px`, borderRadius: `${borderRadius}px`, overflow: 'hidden' }}>
      <div className={styles.progressSegments}>
        {/* 第一段 */}
        {percent1 > 0 && (
          <div
            className={`${styles.segment} ${styles.segment1}`}
            style={{
              width: `${percent1}%`,
              height: `${height}px`,
              background: isGradient(color1) ? color1 : color1,
              borderTopLeftRadius: `${borderRadius}px`,
              borderBottomLeftRadius: `${borderRadius}px`,
              ...(isLastSegment1 ? {
                borderTopRightRadius: `${borderRadius}px`,
                borderBottomRightRadius: `${borderRadius}px`,
              } : {}),
            }}
          />
        )}

        {/* 第二段 */}
        {percent2 > 0 && (
          <div
            className={`${styles.segment} ${styles.segment2}`}
            style={{
              width: `${percent2}%`,
              height: `${height}px`,
              background: isGradient(color2) ? color2 : color2,
              ...(isLastSegment2 ? {
                borderTopRightRadius: `${borderRadius}px`,
                borderBottomRightRadius: `${borderRadius}px`,
              } : {}),
            }}
          />
        )}

        {/* 第三段 */}
        {percent3 > 0 && (
          <div
            className={`${styles.segment} ${styles.segment3}`}
            style={{
              width: `${percent3}%`,
              height: `${height}px`,
              background: isGradient(color3) ? color3 : color3,
              borderTopRightRadius: `${borderRadius}px`,
              borderBottomRightRadius: `${borderRadius}px`,
            }}
          />
        )}
      </div>
    </div>
  );
};

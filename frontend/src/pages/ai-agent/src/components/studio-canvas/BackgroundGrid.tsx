import React from 'react';
import styles from './index.module.scss';

export interface BackgroundGridProps {
  width: number;
  height: number;
  gridSize?: number;
  largeGridSize?: number;
  smallGridColor?: string;
  largeGridColor?: string;
}

const BackgroundGrid: React.FC<BackgroundGridProps> = ({
  width,
  height,
  gridSize = 10,
  largeGridSize = 50,
  smallGridColor = '#0a0a0a',
  largeGridColor = '#151515',
}) => {
  return (
    <div className={`${styles.backgroundGrid} ${styles.backgroundGridContainer}`} style={{ width, height }}>
      <svg width={width} height={height} className={styles.backgroundGridSvg}>
        <defs>
          <pattern
            id="grid-small"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={smallGridColor}
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id="grid-large"
            width={largeGridSize}
            height={largeGridSize}
            patternUnits="userSpaceOnUse"
          >
            <rect
              width={largeGridSize}
              height={largeGridSize}
              fill="url(#grid-small)"
            />
            <path
              d={`M ${largeGridSize} 0 L 0 0 0 ${largeGridSize}`}
              fill="none"
              stroke={largeGridColor}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-large)" />
      </svg>

      {/* 画布中心点 */}
      {/* <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 10,
          height: 10,
          backgroundColor: 'rgb(242, 210, 5)',
          borderRadius: '50%',
        }}
      /> */}
      {/* <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          width: 100,
          height: 380,
          backgroundColor: 'rgb(242, 210, 5)',
        }}
      /> */}
    </div>
  );
};

export default BackgroundGrid;

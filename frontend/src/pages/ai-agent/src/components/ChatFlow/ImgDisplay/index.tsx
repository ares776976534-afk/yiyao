import React, { useState, useRef, useCallback } from 'react';
import { Popover } from 'antd';
import styles from './index.module.css';

interface ImgDisplayProps {
  src: string;
  children: React.ReactNode;
}

const ImgDisplay: React.FC<ImgDisplayProps> = ({ src, children }) => {
  const [placement, setPlacement] = useState<'left' | 'right'>('right');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = useCallback((open: boolean) => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const midPoint = viewportWidth / 2;
      setPlacement(rect.left > midPoint ? 'left' : 'right');
    }
  }, []);

  const content = (
    <div className={`${styles.popoverContent} ${placement === 'left' ? styles.left : styles.right}`}>
      <div className={styles.arrow} />
      <div className={styles.imageWrapper}>
        <img src={src} alt="" className={styles.previewImage} />
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="hover"
      placement={placement}
      arrow
      classNames={{
        root: 'imgDisplayPopover',
      }}
      onOpenChange={handleOpenChange}
    >
      <div ref={containerRef} className={styles.trigger}>
        {children}
      </div>
    </Popover>
  );
};

export default ImgDisplay;

import React, { useState, FC, memo, CSSProperties } from 'react';
import { Image } from 'antd';
import type { ImageProps } from 'antd';
import styles from './index.module.scss';

interface ProgressiveImageProps extends ImageProps {
  className?: string;
  style?: CSSProperties;
  src?: string;
  alt?: string;
  onCompleted?: () => void;
  onError?: () => void;
  [key: string]: any;
}

const ProgressiveImage: FC<ProgressiveImageProps> = memo(
  ({
    className = '',
    style,
    src,
    alt,
    preview = false,
    onCompleted,
    onError,
    ...restProps
  }) => {
    const [loaded, setLoaded] = useState(false);

    const handleLoad = () => {
      setLoaded(true);
      onCompleted?.();
    };

    const handleError = () => {
      setLoaded(true); // 即使出错也认为"加载完成"，避免一直显示加载状态
      onError?.();
    };

    return (
      <div
        style={style}
        className={`${styles['preview']} ${
          loaded ? styles['previewLoaded'] : ''
        } ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          preview={preview}
          {...restProps}
        />
      </div>
    );
  },
);

export default ProgressiveImage;

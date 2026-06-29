import React from 'react';
import { ImageSize, CropRegionClassNames } from './types';
import { THUMBNAIL_SIZE, THUMBNAIL_CONTENT_SIZE } from './constants';
import { createClassNameGetter } from './utils';
import styles from './main.module.less';
import { CheckMarkIcon } from '@/components/Icon';

interface ThumbnailItemProps {
  cropRegion: number[];
  imageSrc?: string;
  naturalSize: ImageSize;
  isActive?: boolean;
  onClick?: () => void;
  classNameOverrides?: CropRegionClassNames;
  itemImageStyle?: React.CSSProperties;
  viewerMaskStyle?: React.CSSProperties;
  contentSize?: number;
  thumbnailSize?: number;
  itemStyle?: React.CSSProperties;
  disabled?: boolean;
}

export const ThumbnailItem: React.FC<ThumbnailItemProps> = ({
  cropRegion,
  imageSrc,
  naturalSize,
  isActive,
  onClick,
  classNameOverrides,
  itemImageStyle,
  viewerMaskStyle,
  contentSize,
  thumbnailSize,
  itemStyle,
  disabled,
}) => {
  // 创建类名获取器
  const getClassName = createClassNameGetter(styles, classNameOverrides);
  const [x1, x2, y1, y2] = cropRegion;
  const isHeight = x2 - x1 > y2 - y1;
  const scalePlus = isHeight
    ? x2 - x1 > 0 ? (contentSize || THUMBNAIL_CONTENT_SIZE) / (x2 - x1) : (contentSize || THUMBNAIL_CONTENT_SIZE)
    : y2 - y1 > 0 ? (contentSize || THUMBNAIL_CONTENT_SIZE) / (y2 - y1) : (contentSize || THUMBNAIL_CONTENT_SIZE);
  const _viewerMaskStyle = isHeight
    ? { height: `${scalePlus * (y2 - y1)}px`, width: '100%' }
    : { width: `${scalePlus * (x2 - x1)}px`, height: '100%' };
  const viewImgStyle = {
    top: `-${y1 * scalePlus}px`,
    left: `-${x1 * scalePlus}px`,
    width: `${naturalSize.width * scalePlus}px`,
    height: `${naturalSize.height * scalePlus}px`,
    backgroundImage: `url(${imageSrc})`,
  };

  const itemClassName = getClassName('viewerItem', 'cropper-viewer-item');
  const activeClassName = isActive
    ? (classNameOverrides?.viewerItemActive || styles['active'])
    : '';
  const disabledClassName = disabled ? styles['disabled'] : '';
  return (
    <div
      className={`${itemClassName} ${activeClassName} ${disabledClassName}`.trim()}
      style={{ width: thumbnailSize || THUMBNAIL_SIZE, height: thumbnailSize || THUMBNAIL_SIZE, ...itemStyle }}
      onClick={onClick}
    >
      {isActive && <div className={getClassName('viewerItemCheckMark', 'cropper-viewer-check-mark')}>
        <CheckMarkIcon />
      </div>}
      <div
        className={getClassName('viewerItemMask', 'cropper-viewer-item-mask')}
        style={{ ..._viewerMaskStyle, ...viewerMaskStyle }}
      >
        <div
          className={getClassName('viewerItemImage', 'cropper-viewer-item-image')}
          style={{ ...viewImgStyle, ...itemImageStyle }}
        />
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import './index.scss';

const renderSkeleton = (props) => {
  const { skeletonStyle } = props;
  return <div className="progressive-image-skeleton" style={skeletonStyle} />;
};

const ProgressiveImage = (props) => {
  const { src, className, style, SkeletonNode, skeletonStyle = {}, ...otherProps } = props;
  const [visible, setVisible] = useState(true);
  const handleLoad = () => {
    setVisible(false);
  };
  const Skeleton = SkeletonNode || renderSkeleton;

  return (
    <div className="progressive-image-container" data-role="progressive-image-container">
      {visible && <Skeleton skeletonStyle={skeletonStyle} />}
      <img
        className={className}
        style={style}
        src={src}
        data-role="progressive-image"
        onLoad={handleLoad}
        {...otherProps}
      />
    </div>
  );
};

export default ProgressiveImage;

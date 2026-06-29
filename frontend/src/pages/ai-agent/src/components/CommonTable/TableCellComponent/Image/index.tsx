import React from 'react';
import styles from './index.module.scss';
import { EnumAlign, TypeTableHeader } from '../../types';
interface ImageProps {
  value: {
    imgUrl: string;
    imgLink: string;
  };
  header: TypeTableHeader;
}
const Image: React.FC<ImageProps> = ({ value, header }) => {
  const align = header?.align;
  const { imgUrl, imgLink } = value;
  if (!imgUrl) {
    return null;
  }

  return (
    <div
      style={{ justifyContent: align === EnumAlign.CENTER ? 'center'
        : align === EnumAlign.RIGHT ? 'flex-end' : 'flex-start' }}
      onClick={() => imgLink && window.open(imgLink, '_blank')}
      className={styles.imageWrapper}
    >
      <img src={imgUrl} alt={imgLink} className={styles.commonImage} />
    </div>
  );
};

export default Image;

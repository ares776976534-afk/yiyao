import React from 'react';
import { TypeTableHeader, EnumShowType, EnumAlign } from '../../types';
import ConditionalTooltip from '../ConditionalTooltip';
import styles from './index.module.scss';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
interface TextProps {
  header: TypeTableHeader;
  value: string | {
    value?: string | number | boolean;
    linkUrl?: string;
    hoverText?: string;
  };
  isShowDetail?: boolean; // 是否显示详情
  onDetailClick?: () => void;
}

const Text: React.FC<TextProps> = ({ value, header, isShowDetail = false, onDetailClick }) => {
  const align = header?.align;
  const showType = header?.properties?.showType;
  const isHover = !!header?.properties?.isHover;
  const isLink = !!header?.properties?.isLink;
  const showRowNum = header?.properties?.showRowNum || 1;

  // 判断是否需要 tooltip 包裹
  const needTooltip = showType === EnumShowType.COLLAPSE || isHover;

  // 渲染带条件的 tooltip 包裹
  const renderWithConditionalTooltip = (content: React.ReactElement, tooltipTitle: string | number | boolean) => {
    // console.log('showRowNum', showRowNum, needTooltip, header);

    if (needTooltip) {
      // 默认显示2行，可通过 showRowNum 自定义
      const lineClamp = showRowNum || 1;
      return (
        <div
          className={`${styles.textEllipsisWrapper} commonTableTextEllipsisWrapper`}
          style={{
              // WebkitLineClamp: lineClamp,
              '--webkit-line-clamp-value': lineClamp,
              textAlign: align === EnumAlign.CENTER ? 'center'
                : align === EnumAlign.RIGHT ? 'right' : 'left',
              }}
        >
          <ConditionalTooltip title={String(tooltipTitle)}>
            {content}
          </ConditionalTooltip>
        </div>
      );
    }
    return (
      <div
        className={`${styles.textWrapper} commonTableTextWrapper`}
        style={{
          textAlign: align === EnumAlign.CENTER ? 'center'
            : align === EnumAlign.RIGHT ? 'right' : 'left',
          justifyContent: align === EnumAlign.CENTER ? 'center'
          : align === EnumAlign.RIGHT ? 'flex-end' : 'flex-start',
        }}
      >
        {content}
        {isShowDetail &&
          <div className={styles.imgCardTitleImg}>
            <img
              className={styles.imgCardTitleImgImg}
              src={imgIcon[5]}
              alt="img"
              onClick={onDetailClick}
            />
          </div>
        }
      </div>
    );
  };

  if (typeof value === 'string') {
    return renderWithConditionalTooltip(<span className={styles.text}>{value}</span>, value);
  }

  if (isLink) {
    const linkContent = (
      <a href={value.linkUrl} className={styles.textLink} target="_blank" rel="noopener noreferrer">
        {value.value}
      </a>
    );
    return renderWithConditionalTooltip(
      linkContent,
      isHover ? (value?.hoverText || '') : (value?.value || ''),
    );
  }

  if ((value?.value || value?.value === 0 || value?.value === false) && (typeof value?.value === 'string' ||
    typeof value?.value === 'number' ||
    typeof value?.value === 'boolean'
  )) {
    return renderWithConditionalTooltip(<span className={styles.text}>{value.value}</span>, value.value);
  }

  return renderWithConditionalTooltip(<span className={styles.text}>-</span>, '-');
};

export default Text;

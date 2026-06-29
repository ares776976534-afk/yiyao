import React from 'react';
import { TypeTableHeader } from '../../types';
import Text from '../Text';
import styles from './index.module.scss';
import TextTrend from '../TextTrend';


interface TextListProps {
  header: TypeTableHeader;
  value: {
    value: Array<string | {
      value?: string | number | boolean;
      direction?: 'UP' | 'DOWN';
      text?: string;
      linkUrl: string;
      hoverText: string;
      textType?: 'plain' | 'trend';
    }>;
  };
}

const TextList: React.FC<TextListProps> = (props) => {
  const { value, header } = props;
  // console.log('TextList props', props);

  if (!Array.isArray(value?.value)) {
    return null;
  }

  if (value?.value?.length === 0) {
    return <Text value="-" header={header} />;
  }

  return (
    <div className={styles.textListWrapper}>
      {
        (value?.value || []).map((item, index) => {
          // 如果是字符串，直接传递
          if (typeof item === 'string') {
            return (
              <Text
                key={index}
                value={item || '-'}
                header={header}
              />
            );
          }

          if (item?.textType === 'trend') {
            return (
              <TextTrend value={item} header={header} />
            );
          }

          // 如果是对象，处理对象的属性
          return (
            <Text
              key={index}
              value={{
                ...item,
                value: (item as any)?.text || item?.value || '-',
              }}
              header={header}
            />
          );
        })
      }
    </div>
  );
};

export default TextList;

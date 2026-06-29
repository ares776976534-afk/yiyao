import React from 'react';
import styles from './index.module.scss';
import { EnumAlign, TypeTableHeader } from '../../types';
import RadarChart from '@/components/ChatFlow/RadarChart';

export const LevelMap = {
  BEST: '强烈推荐',
  GOOD: '推荐',
  MEDIUM: '观望',
  BAD: '不推荐',
};

export const LevelColorMap = {
  BEST: '#F64343',
  GOOD: '#F6633A',
  MEDIUM: '#FF9F50',
  BAD: '#FCB103',
};
const evelColorMapList = [
  '#FCB103',
  '#FF9F50',
  '#F6633A',
  '#F64343',
];

interface OppscoreColProps {
  value: {
    // oppScore: number;
    // oppScoreDesc: string;
    value: {
      oppScore: string;
      text: string;
      valueLevel: "BEST" | "GOOD" | "MEDIUM" | "BAD";
      radarVO?: {
        propertyList?: any[];
        radarDescription?: string;
      };
      // radarTitle?: string;
    };
  };

  header: TypeTableHeader;
}

const OppscoreCol: React.FC<OppscoreColProps> = ({ value, header }) => {
  const align = header?.align;
  const { radarVO, oppScore } = value?.value || {};
  const rendervValueLevel = () => {
    const valueLevel = value?.value?.valueLevel;
    if (!valueLevel) {
      return null;
    }
    const highlightText = LevelMap[valueLevel] || '';
    const text = value?.value?.text;
    const color = LevelColorMap[valueLevel] || '#F64343';

    let count = 0;
    switch (valueLevel) {
      case "BEST":
        count = 4;
        break;
      case "GOOD":
        count = 3;
        break;
      case "MEDIUM":
        count = 2;
        break;
      case "BAD":
        count = 1;
        break;
      default:
        count = 0;
    }
    return (
      <div className={styles.oppscoreDesc}>
        <div className={styles.oppscoreDescItemContainer}>
          {
            [1, 2, 3, 4].map((_, index) => {
              return (
                <span
                  key={index}
                  className={styles.oppscoreDescItem}
                  style={{
                    background: index <= count ? evelColorMapList[index] : 'var(--fill-primary)',
                  }}
                />
              );
            })
          }
        </div>
        <div
          className={styles.oppscoreDescText}
          style={{ color: color }}
        >{text || highlightText}</div>
      </div>
    );
  };


  const renderOppscoreValue = () => {
    return (
      <div className={styles.radarChartContainer}>
        {radarVO && radarVO?.propertyList && radarVO?.propertyList?.length > 0 && (
          <div className={styles.radarChart}>
            <RadarChart
              radarDescription={radarVO?.radarDescription}
              radarTitle={header?.title || ''}
              oppScore={Number(oppScore) || 0}
              data={radarVO?.propertyList || []}
              orther={{ width: '42px', height: '42px' }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        alignItems: align === EnumAlign.CENTER ? 'center'
          : align === EnumAlign.RIGHT ? 'flex-end' : 'flex-start',
      }}
      className={styles.oppscoreColWrapper}
    >
      <div className={styles.oppscoreValueContainer}>
        <div className={styles.oppscoreValue}>{
          value?.value?.oppScore
            ? `${value?.value?.oppScore}分`
            : '-'
        }</div>
        {rendervValueLevel()}
      </div>
      {renderOppscoreValue()}
    </div>
  );
};

export default OppscoreCol;

import styles from './keywordsTable.module.scss';
import { Radio } from "antd";
import LineChart from '@/components/ChatFlow/LineAreaChart';
import LiftData from '@/components/ChatFlow/LiftData';
import { useState } from 'react';
import AgentPopup from '@/pages/mobile/components/agentPopup';

interface TypeKeywordsTableProps {
  keywordList?: any[];
  selectedKeyword?: string | null;
  onSelectKeyword?: (keyword: string, fromKeywordsTable?: boolean) => void;
  visible: boolean;
  onMaskClick: () => void;
}

const KeywordsTable = (props: TypeKeywordsTableProps) => {
  const { keywordList = [], selectedKeyword: propSelectedKeyword, onSelectKeyword, visible, onMaskClick } = props;
  const [internalSelectedKeyword, setInternalSelectedKeyword] = useState<string | null>(propSelectedKeyword || null);

  // 使用外部传入的值或内部状态
  const selectedKeyword = propSelectedKeyword !== undefined ? propSelectedKeyword : internalSelectedKeyword;

  const handleSelectKeyword = (keyword: string) => {
    if (onSelectKeyword) {
      onSelectKeyword(keyword, true); // 第二个参数表示来自 keywordsTable
    } else {
      setInternalSelectedKeyword(keyword);
    }
  };

  const renderKeywordTrend = (demandInfo: any) => {
    if (demandInfo?.rankTrends && demandInfo?.rankTrends.length > 0) {
      return (
        <div>
          <LineChart type='mobile' reflect={demandInfo?.rankTrendsIsBiggerHigher} data={demandInfo.rankTrends} toolTipYName={demandInfo?.rankTrendsPointName} />
        </div>
      );
    }
    return '-';
  };
  // 渲染带增长率的数据
  const renderWithGrowthRate = (title: string, value: string | number | undefined, growthRate: any) => {
    return (
      <div className={styles.keywordsFooterItem}>
        <div className={styles.keywordsFooterItemHeader}>
          <div className={styles.keywordsFooterItemTitle}>{title} </div>
          <div className={styles.keywordsFooterItemValue}>{value || '-'}</div>
        </div>
        {growthRate && (
          <LiftData
            direction={growthRate.direction}
            text={growthRate.value}
          />
        )}
      </div>
    );
  };
  return (
    <AgentPopup
      visible={visible}
      onMaskClick={onMaskClick}
      title='选择关键词'
    >
      <div className={styles.keywordsList}>
        {keywordList?.map((ele) => {
          const {keywordCn, showKeyword, demandInfo, salesInfo, platform = 'amazon', keyword} = ele;
          const isSelected = selectedKeyword === keyword;
          return (
            <div 
              key={keyword}
              className={`${styles.keywordsTable} ${isSelected ? styles.keywordsTableSelected : ''}`}
              onClick={() => handleSelectKeyword(keyword)}
            >
              <Radio
                className={styles.customRadio}
                checked={isSelected}
              >
                {showKeyword} {keywordCn}
              </Radio>
              <div className={styles.keywordsFooter}>
                <div className={styles.keywordsFooterLeft}>
                  <div className={styles.keywordsFooterLeftTitle}>{platform !== 'tiktok' ? '关键词排名' : '带货达人数量'}: {demandInfo?.searchRank}</div>
                  <div className={styles.keywordsFooterLeftSubTitle}>{platform !== 'tiktok' ? '关键词排名趋势: (近12个月)' : '带货达人数量趋势' }</div>
                  {renderKeywordTrend(demandInfo)}
                </div>
                <div className={styles.keywordsFooterRight}>
                  {renderWithGrowthRate('月销量: ', salesInfo?.soldCnt30d?.value, salesInfo?.soldCnt30d?.growthRate)}
                  {renderWithGrowthRate('月销售额: ', salesInfo?.soldAmt30d?.value?.amountWithSymbol, salesInfo?.soldAmt30d?.growthRate)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </AgentPopup>
  )
}

export default KeywordsTable
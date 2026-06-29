import RadarChart from '@/components/ChatFlow/RadarChart';
import styles from './index.module.css';
import { Tooltip } from 'antd';
import { $t } from '@/i18n';
import ContentTitle from './ContentTitle';
import FooterKeyword from './FooterKeyword';
import Card from './Card';

interface TabCardProps {
    index: number;
    item: any;
    handleClick: (index: number) => void;
    activeIndex: number | null;
}

export const keywordLevelMap = {
    BEST: $t("global-1688-ai-app.ChatFlow.TabCard.qod", "强烈推荐"),
    GOOD: $t("global-1688-ai-app.ChatFlow.TabCard.recommend", "推荐"),
    MEDIUM: $t("global-1688-ai-app.ChatFlow.TabCard.gw", "观望"),
    BAD: $t("global-1688-ai-app.ChatFlow.TabCard.notRecommend", "不推荐"),
};

export const keywordLevelColorMap = {
    BEST: '#F64343',
    GOOD: '#F6633A',
    MEDIUM: '#FF9F50',
    BAD: '#FCB103',
};
// 图标背景色配置
export const iconColors = ['#FFCA50', '#FF9F50', '#FF7650', '#F64343'];
// 根据关键词级别确定高亮图标数量
export const keywordLevelIconCount = {
    BEST: 4,
    GOOD: 3,
    MEDIUM: 2,
    BAD: 1,
};
export const iconList = [0, 1, 2, 3];

export default function TabCard({ index, item, handleClick, activeIndex }: TabCardProps) {
    return (
      <Card activeIndex={activeIndex} index={index} handleClick={handleClick}>
        <div className={styles.tabCardTitle}>
          {item?.keyword?.length > 30 ? (
            <Tooltip title={item?.keyword} placement="top">
              <div className={styles.tabCardTitleText}>{item?.showKeyword}</div>
            </Tooltip>
                ) : (
                  <div className={styles.tabCardTitleText}>{item?.showKeyword}</div>
                )}
          {item?.keywordCn?.length > 30 ? (
            <Tooltip title={item?.keywordCn} placement="top">
              <div className={styles.tabCardTitleTextCn}>{item?.keywordCn}</div>
            </Tooltip>
                ) : (
                  <div className={styles.tabCardTitleTextCn}>{item?.keywordCn}</div>
                )}
        </div>
        <div className={styles.footer}>
          <div className={styles.tabContentContainer}>
            <div className={styles.tabContent}>
              <ContentTitle contentTitle={item?.contentTitle} oppScore={item?.oppScore} />
              <div className={styles.tabContentValue}>{item?.oppScoreDesc}</div>
            </div>
            {item?.radar?.length > 0 && (
            <div className={styles.tabContentChart}>
              <RadarChart radarDescription={item?.radarDescription} radarTitle={item?.contentTitle} oppScore={item?.oppScore} data={item?.radar || []} orther={{ width: '42px', height: '42px' }} />
            </div>
                    )}
          </div>
          <div className={styles.tabCardLine} />
          <FooterKeyword keywordLevel={item?.keywordLevel} iconList={iconList} keywordLevelIconCount={keywordLevelIconCount} iconColors={iconColors} keywordLevelColorMap={keywordLevelColorMap} keywordLevelMap={keywordLevelMap} />
        </div>
      </Card>
    );
}
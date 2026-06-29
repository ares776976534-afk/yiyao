import styles from './index.module.css';
import ItemCard from '../ItemCard';
import type { rankingListProps } from '../../interface';
import { Tooltip } from 'antd';
import { RankingQuestionMarkIcon } from '@/components/Icon';
import { $t } from "@/i18n";

interface CommodityCardProps {
  rankingList: rankingListProps[];
  cateLevel?: string;
  cateId?: string;
  country: string;
  platform: string;
  userInfo: any;
  queryUserInfo: () => void;
}

const CommodityCard: React.FC<CommodityCardProps> = ({ rankingList, cateLevel, cateId, country, platform, userInfo, queryUserInfo }) => {
  return (
    <>
      {rankingList?.length > 0 && rankingList?.map((item, index) => (
        <div className={styles.commodityCard} key={item?.rankingName} data-ranking-card={index}>
          <div className={styles.commodityCardHeader}>
            <div className={styles.commodityCardHeaderTitleText}>
              {item?.rankingName}
              <Tooltip placement="top" title={item?.rankingDesc}>
                <RankingQuestionMarkIcon fill='#BBBDCA' />
              </Tooltip>
            </div>
            <div className={styles.commodityCardHeaderTitleTime}>{$t('global-1688-ai-app.ranking.OpportunityCard.updateTime', '更新时间')}: {item?.updateTime}</div>
          </div>
          <ItemCard 
            cateLevel={cateLevel} 
            cateId={cateId} 
            country={country} 
            platform={platform} 
            rankingType={item?.rankingType} 
            userInfo={userInfo}
            queryUserInfo={queryUserInfo}
          />
        </div>
      ))}
    </>
  );
};

export default CommodityCard;
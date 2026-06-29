import styles from './index.module.css';
import ProductCard from '../ProductCard';

import type { rankingListProps } from '../../interface';
import { platformMap } from '../../config';
import { useEffect, useState, useRef, useCallback } from 'react';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { Tooltip } from 'antd';
import { RankingQuestionMarkIcon } from '@/components/Icon';
import { $t } from "@/i18n";

interface OpportunityCardProps {
  rankingList: rankingListProps[];
  cateLevel?: string;
  cateId?: string;
  country: string;
  platform: string;
  userInfo: any;
  queryUserInfo: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ rankingList, cateLevel, cateId, country, platform, userInfo, queryUserInfo }) => {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const countryExpRef = useRef(false);
  const selectRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 检查元素是否在可视区域内（不被 Header 遮挡）
  const checkVisibility = useCallback(() => {
    // 获取 Header 的高度
    const header = document.querySelector('[class*="header"]') as HTMLElement;
    const headerHeight = header?.offsetHeight || 64; // 默认 64px

    Object.entries(openMap).forEach(([rankingName, isOpen]) => {
      if (isOpen) {
        const element = selectRefs.current[rankingName];
        if (element) {
          const rect = element.getBoundingClientRect();
          // 如果元素滚动到 Header 区域下方或滚出屏幕底部，关闭下拉框
          if (rect.top < headerHeight || rect.top > window.innerHeight) {
            setOpenMap(prev => ({
              ...prev,
              [rankingName]: false
            }));
          }
        }
      }
    });
  }, [openMap]);

  // 监听滚动事件
  useEffect(() => {
    const scrollContainer = document.querySelector('.ant-layout-content');

    const handleScroll = () => {
      checkVisibility();
    };

    scrollContainer?.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [checkVisibility]);
  useEffect(() => {
    if (countryExpRef.current || !rankingList?.length) return;
    countryExpRef.current = true;
    log.record(LOG_KEYS.RANKINGLIST.OPPORTUNITY.COUNTRY_SELECT, 'EXP');
  }, [rankingList]);

  return (
    rankingList?.length > 0 && rankingList?.map((item, index) => {

      return (
        <div className={styles.opportunityCard} key={item?.rankingName} data-ranking-card={index}>
          <div className={styles.opportunityCardHeader}>
            <div className={styles.opportunityCardHeaderLeft}>
              {/* <img className={styles.opportunityCardHeaderImg} src={item?.keywordUrl} alt="" srcSet="" /> */}
              <div className={styles.opportunityCardHeaderTitle}>
                <div className={styles.opportunityCardHeaderTitleText}>
                  {item?.rankingName}
                  <Tooltip placement="top" title={item?.rankingDesc}>
                    <RankingQuestionMarkIcon fill='#BBBDCA' />
                  </Tooltip>
                </div>
                <div className={styles.opportunityCardHeaderTitleTime}>{$t('global-1688-ai-app.ranking.OpportunityCard.updateTime', '更新时间')}: {item?.updateTime}</div>
              </div>
            </div>
          </div>
          <ProductCard
            rankingName={item?.rankingName}
            rankingType={item?.rankingType}
            cateLevel={cateLevel}
            country={country}
            platform={platform}
            cateId={cateId}
            userInfo={userInfo}
            queryUserInfo={queryUserInfo}
          />
        </div>
      )
    })
  );
};

export default OpportunityCard;
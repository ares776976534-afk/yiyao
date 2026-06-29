import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.css';
import { TargetIcon, SupplyIcon } from '@/components/Icon';
import StatsCard from '../StatsCard';
import ScoreArea from '../ScoreArea';
import ButtonsRow from '../ButtonsRow';
import { ImgMap, REGION_MAP, emptyIcon } from '@/pages/ranking/config';
import type { opportunityCardProps } from '../../interface';
import { queryOpportunityKeywordList } from '../../services';
import Pagination from '../Pagination';
import { message, Spin, Tooltip } from 'antd';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { $t } from "@/i18n";

const tagsMap = {
  HIGH: '#21A84A',
  MEDIUM_HIGH: '#0072FD',
  MEDIUM_LOW: '#FD963C',
  LOW: '#F55353',
}

const buttons = [
  { icon: <TargetIcon fill="#7C7F9A" width={18} height={18} />, text: $t('global-1688-ai-app.ranking.ProductCard.trackAnalysis', '赛道分析'), type: 'opportunity' },
  { icon: <SupplyIcon />, text: $t('global-1688-ai-app.ranking.ProductCard.1688Supply', '1688供给'), type: 'supply' },
];
interface ProductCardProps {
  rankingName: string;
  rankingType: string;
  cateLevel?: string;
  country: string;
  platform: string;
  cateId?: string;
  userInfo: any;
  queryUserInfo: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  rankingName,
  rankingType,
  cateLevel,
  country,
  platform,
  cateId,
  userInfo,
  queryUserInfo,
  }) => {
  const [productDataList, setProductDataList] = useState<opportunityCardProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 4;
  const exposedItemsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (country && platform && rankingType && cateLevel && cateId) {
      setLoading(true);
      queryOpportunityKeywordList({
        cateLevel,
        cateId,
        country,
        rankingType,
        platform,
      }).then((res) => {
        const { data, success, mesg = $t('global-1688-ai-app.F0001', '系统异常') } = res;
        setLoading(false);
        if (success) {
          setProductDataList(data);
          setCurrentPage(1); // 重置页码
        } else {
          message.error(mesg)
        }
      }).catch((err) => {
        setLoading(false);
        message.error(err?.message || $t('global-1688-ai-app.userinfo.exp.system_error', '系统异常，请稍后重试'));
      })
    }
  }, [country, platform, rankingType, cateLevel, cateId]);

  // 根据当前页码计算要展示的数据
  const currentPageData = productDataList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    currentPageData.forEach((item) => {
      if (item.keyword && !exposedItemsRef.current.has(item.keyword)) {
        exposedItemsRef.current.add(item.keyword);
        log.record(LOG_KEYS.RANKINGLIST.OPPORTUNITY.LIST_DETAIL, 'EXP', { listitemid: item.keyword });
      }
    });
  }, [currentPageData]);
  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin />
        <span className={styles.loadingText}>{$t('global-1688-ai-app.ranking.ProductCard.loading', '正在加载中...')}</span>
      </div>
    );
  }

  // 如果没有数据，显示空状态
  if (currentPageData?.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <img className={styles.emptyIcon} src={emptyIcon} alt={$t('global-1688-ai-app.ranking.ProductCard.noOpportunity', '暂无机会')} />
        <span className={styles.emptyText}>{$t('global-1688-ai-app.ranking.ProductCard.noOpportunity', '暂无机会')}</span>
      </div>
    );
  }

  return (
    <>
      <div className={styles.opportunityCardContent}>
        {currentPageData?.map((item: opportunityCardProps, index: number) => {
          const { keyword, keywordCn, country, oppScore, oppScoreDesc, oppScoreDescList, platform, itemCount, soldCnt30d, soldCnt30dGrowthRate, priceAvg, productImgList, newProductSalesPct, brandMonopolyCoefficient, cnSellerPct, marketHeatLevel, marketHeatGrowthLevel, marketCompeteLevel } = item;
          // 计算在全局列表中的实际索引
          const globalIndex = (currentPage - 1) * pageSize + index;
          
          const stats = [
            {
              label: itemCount?.name,
              value: itemCount?.value || '-',
            },
            {
              label: soldCnt30d?.name,
              value: soldCnt30d?.value || '-',
            },
            {
              label: soldCnt30dGrowthRate?.name,
              value: soldCnt30dGrowthRate?.value || '-',
            },
            {
              label: priceAvg?.name,
              value: priceAvg?.value || '-',
            },
          ];
          const modalData = {
            list: [
              {
                key: '1',
                itemCount, // 商品量
                soldCnt30d, // 月销量
                soldCnt30dGrowthRate, // 月销量环比
                priceAvg, // 平均价格
                newProductSalesPct, // 新品垄断系数
                brandMonopolyCoefficient, // 品牌垄断系数
                cnSellerPct, // 中国卖家占比
              }
            ],
            imageList: productImgList,
            platform,
            title: keyword,
          }
          const handleRowClick = () => {
            log.record(LOG_KEYS.RANKINGLIST.OPPORTUNITY.LIST_DETAIL, 'CLK', { listitemid: keyword });
          };
          return (
            <div key={keyword} className={styles.container} onClick={handleRowClick}>
              <div className={styles.mainContent}>
                {globalIndex < 3 ? <img className={styles.crownIcon} src={ImgMap[globalIndex + 1]} /> : <div className={styles.markNum}>{globalIndex + 1}</div>}
                <div className={styles.mainContentRight}>
                  <div className={styles.headerSection}>
                    <div className={styles.titleArea}>
                      <Tooltip placement="top" title={`${keyword}（${keywordCn}）`}>
                        <div className={styles.productTitle}>{`${keyword}（${keywordCn}）`}</div>
                      </Tooltip>
                      <div className={styles.tagRow}>
                        <img className={styles.fireIcon} src={REGION_MAP[country]?.icon} />
                        {marketHeatLevel?.name && (
                          <React.Fragment>
                            <div className={styles.divider} />
                            <span className={styles.tagText} style={{ color: tagsMap[marketHeatLevel?.value] }}>{marketHeatLevel?.name}</span>
                          </React.Fragment>
                        )}
                        {marketHeatGrowthLevel?.name && (
                          <React.Fragment>
                            <div className={styles.divider} />
                            <span className={styles.tagText} style={{ color: tagsMap[marketHeatGrowthLevel?.value] }}>{marketHeatGrowthLevel?.name}</span>
                          </React.Fragment>
                        )}
                        {marketCompeteLevel?.name && (
                          <React.Fragment>
                            <div className={styles.divider} />
                            <span className={styles.tagText} style={{ color: tagsMap[marketCompeteLevel?.value] }}>{marketCompeteLevel?.name}</span>
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                    {oppScore && <ScoreArea product={oppScore} radarDescription={oppScoreDesc} propertyList={oppScoreDescList} />}
                  </div>
                  <StatsCard stats={stats} index={globalIndex} modalData={modalData} country={country} width="80px" userInfo={userInfo} queryUserInfo={queryUserInfo} rankingName={rankingName} rankingType={rankingType} />
                  <ButtonsRow
                    buttons={buttons}
                    keyword={keyword}
                    platform={platform}
                    country={country}
                    logKeys={{
                      trackanalysis: LOG_KEYS.RANKINGLIST.OPPORTUNITY.TRACK_ANALYSIS,
                      sourcing1688: LOG_KEYS.RANKINGLIST.OPPORTUNITY.SOURCING_1688,
                    }}
                  />
                </div>
              </div>
              {index !== currentPageData?.length - 1 && <div className={styles.dividerLine} />}
            </div>
          )
        })}
      </div>
      {productDataList?.length > pageSize && (
        <Pagination 
          current={currentPage} 
          total={Math.ceil(productDataList.length / pageSize)}
          onChange={handlePageChange} 
        />
      )}
    </>
  );
};

export default ProductCard;

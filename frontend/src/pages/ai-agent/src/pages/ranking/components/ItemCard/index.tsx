import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import ScoreArea from '../ScoreArea';
import StatsCard from '../StatsCard';
import ButtonsRow from '../ButtonsRow';
import { SelectProductIcon, SelectSellerIcon, StudioIcon, InquiryIcon } from "@/components/Icon";
import { ImgMap, platformMap, REGION_MAP, emptyIcon } from '@/pages/ranking/config';
import Pagination from '../Pagination';
import { queryProductKeywordList } from '../../services';
import { message, Spin, Tooltip } from 'antd';
import type { itemDataProps } from '../../interface';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { $t } from "@/i18n";

interface ItemCardProps {
  cateLevel?: string;
  cateId?: string;
  country: string;
  platform: string;
  rankingType: string;
  userInfo: any;
  queryUserInfo: () => void;
}

const buttons = [
  { icon: <SelectProductIcon width={18} height={18} />, text: $t('global-1688-ai-app.agent-home.DemoList.viewbg', '查看报告') , type: 'report'},
  { icon: <SelectSellerIcon width={18} height={18} />, text: $t('global-1688-ai-app.ranking.ItemCard.sameItemSelect', '同款选商') , type: 'supply'},
  { icon: <InquiryIcon width={18} height={18} />, text: $t('global-1688-ai-app.ranking.ItemCard.merchantInquiry', '商家询盘') , type: 'inquiry'},
  { icon: <StudioIcon width={18} height={18} />, text: $t('global-1688-ai-app.ranking.ItemCard.materialProcessing', '素材加工') , type: 'studio'},
]

const ItemCard: React.FC<ItemCardProps> = ({ 
  cateLevel,
  cateId,
  country,
  platform,
  rankingType,
  userInfo,
  queryUserInfo,
 }) => {
  const [itemData, setItemData] = useState<itemDataProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 4;
  const exposedItemsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (country && platform && rankingType && cateLevel && cateId) {
      setLoading(true);
      queryProductKeywordList({
        cateLevel,
        cateId,
        country,
        platform,
        rankingType,
      }).then((res) => {
        const { data, success, mesg = '系统异常' } = res;
        if (success) {
          setItemData(data || []);
          setCurrentPage(1); // 重置页码
        } else {
          message.error(mesg)
        }
      }).finally(() => {
        setLoading(false);
      })
    }
  }, [country, platform, rankingType, cateLevel, cateId])
  // 根据当前页码计算要展示的数据
  const currentPageData = itemData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    currentPageData.forEach((item) => {
      const pid = item.productId || String((currentPage - 1) * pageSize);
      if (!exposedItemsRef.current.has(pid)) {
        exposedItemsRef.current.add(pid);
        log.record(LOG_KEYS.RANKINGLIST.SOURCING.REPORT, 'EXP', { item_id: item.productId });
        log.record(LOG_KEYS.RANKINGLIST.SOURCING.SELECT, 'EXP', { item_id: item.productId });
        log.record(LOG_KEYS.RANKINGLIST.SOURCING.INQUIRY, 'EXP', { item_id: item.productId });
        log.record(LOG_KEYS.RANKINGLIST.SOURCING.DESIGN, 'EXP', { item_id: item.productId });
      }
    });
  }, [currentPageData]);
  
  // 如果没有必要参数，不渲染内容
  if (!country || !platform || !rankingType) {
    return null;
  }

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
      <div className={styles.commodityCardContent}>
        {currentPageData.map((item: itemDataProps, index: number) => {
          const { productImg, productTitle, platform, country, launchTime, price, oppScore, oppScoreDesc, oppScoreDescList, soldCnt, soldCntGrowthRate, sameItemCnt, rating, productUrl } = item;
          // 计算在全局列表中的实际索引
          const globalIndex = (currentPage - 1) * pageSize + index;
          
          const stats = [
            {
              label: soldCnt?.name,
              value: soldCnt?.value || '-',
            },
            {
              label: soldCntGrowthRate?.name,
              value: soldCntGrowthRate?.value || '-',
            },
            {
              label: sameItemCnt?.name,
              value: sameItemCnt?.value || '-',
            },
            {
              label: rating?.name,
              value: rating?.value || '-',
            },
          ];
          return (
            <div key={globalIndex} className={styles.container}>
              <div className={styles.itemCardContent}>
                <div className={styles.itemCardHeader}>
                  <div className={styles.itemCardHeaderImgContent} onClick={() => window.open(productUrl, '_blank')}>
                    {globalIndex < 3 ?
                      <img className={styles.itemCardHeaderImgContentIcon} src={ImgMap[globalIndex + 1]} alt="" /> :
                      <div className={styles.itemCardHeaderImgContentIconContent}>
                        <img className={styles.itemCardHeaderImgContentIconF} src={ImgMap[4]} alt="" />
                        <div className={styles.markNum}>{globalIndex + 1}</div>
                      </div>
                    }
                    <img className={styles.itemCardHeaderImg} src={productImg} alt="" srcSet="" />
                  </div>
                  <div className={styles.itemCardHeaderRight}>
                    <div className={styles.itemCardHeaderRightContent}>
                      <div className={styles.itemCardHeaderRightContentTop}>
                        <Tooltip placement="top" title={productTitle}>
                          <div className={styles.itemCardHeaderRightTitle} onClick={() => window.open(productUrl, '_blank')}>{productTitle}</div>
                        </Tooltip>
                        <div className={styles.tagRow}>
                          <img className={styles.fireIcon} src={platformMap[platform]} />
                          <div className={styles.divider} />
                          <img className={styles.fireIcon} src={REGION_MAP[country]?.icon} />
                          <div className={styles.divider} />
                          <div className={styles.time}>{launchTime} {$t('global-1688-ai-app.ranking.ItemCard.onSale', '上架')}</div>
                        </div>
                      </div>
                      <div className={styles.itemCardHeaderRightContentBottom}>{price}</div>
                    </div>
                    {oppScore && <ScoreArea product={oppScore} radarDescription={oppScoreDesc} propertyList={oppScoreDescList} />}
                  </div>
                </div>
                <StatsCard stats={stats} index={globalIndex} isIcon={false} gap={30} width="84px" userInfo={userInfo} queryUserInfo={queryUserInfo} />
                <ButtonsRow
                  buttons={buttons}
                  imageUrl={productImg}
                  keyword={productTitle}
                  isItem={true}
                  itemId={item.productId}
                  logKeys={{
                    report: LOG_KEYS.RANKINGLIST.SOURCING.REPORT,
                    select: LOG_KEYS.RANKINGLIST.SOURCING.SELECT,
                    inquiry: LOG_KEYS.RANKINGLIST.SOURCING.INQUIRY,
                    design: LOG_KEYS.RANKINGLIST.SOURCING.DESIGN,
                  }}
                />
              </div>
              {index !== currentPageData?.length - 1 && <div className={styles.dividerLine} />}
            </div>
          )
        })}
      </div>
      {itemData?.length > pageSize && (
        <Pagination 
          current={currentPage} 
          total={Math.ceil(itemData.length / pageSize)}
          onChange={handlePageChange} 
        />
      )}
    </>
  );
};

export default ItemCard;

import { Popover } from 'antd';
import styles from './index.module.css';
import { DownArrowIcon } from "@/components/Icon";
import ProductSales from './components/ProductSales';
import ProductRating from './components/ProductRating';
import Skulist from './components/Skulist';
import { useEffect, useState, useCallback } from 'react';
import { searchSkus } from '@/components/ChatFlow/SameNumModal/services';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { $t } from '@/i18n';

const HeaderBottom = (poops) => {
  const { sold30d, reviewInfo, platform, region, productId, salesTrends } = poops;
  const [dataSource, setDataSource] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(5);
  const [loading, setLoading] = useState(false);
 
  // 加载数据函数
  const loadData = useCallback(async (page: number, pageSize: number = 5) => {
    try {
      setLoading(true);
      const params = {
        platform,
        region,
        productIds: [productId],
        pageNum: page,
        pageSize: pageSize || 5,
      };

      const res = await searchSkus(params);
      const newList = res?.oppSkuVOList|| [];
      setDataSource(newList);
      setTotalPages(res?.total || 0);
      setCurrentPage(page);
      setPageSize(pageSize || 5);
      setLoading(false);
    } catch (error) {
      setDataSource([]);
      setTotalPages(0);
      setLoading(false);
    }
  }, [platform, region, productId]);
  useEffect(() => {
    loadData(1);
  }, []);
  const logParams = {
    productId: productId || '',
    platform: platform || '',
    region: region || '',
  };

  const statsConfig = [
    {
      label: $t('global-1688-ai-app.product.sales', '商品销量'),
      value: sold30d,
      sub: $t('global-1688-ai-app.past.12months', '近12个月'),
      content: <ProductSales data={salesTrends} />,
      hoverLogKey: LOG_KEYS.GENERAL_AGENT.LP.PRODUCT_SALES_HOVER,
    },
    {
      label: $t('global-1688-ai-app.product.rating', '商品评分'),
      value: reviewInfo?.ratingScore,
      sub: $t(
        'global-1688-ai-app.review.commentCount',
        `共${reviewInfo?.reviewCnt}条评价`,
        [reviewInfo?.reviewCnt || 0],
      ),
      content: <ProductRating reviewLabel={reviewInfo?.reviewLabel} />,
      hoverLogKey: LOG_KEYS.GENERAL_AGENT.LP.PRODUCT_RATING_HOVER,
    },
    {
      label: 'SKU',
      value: totalPages,
      sub: $t('global-1688-ai-app.sku.count', `共${totalPages}个`, [totalPages || 0]),
      content: <Skulist currentPage={currentPage} loading={loading} pageSize={pageSize} totalPages={totalPages} loadData={loadData} dataSource={dataSource} />,
      hoverLogKey: LOG_KEYS.GENERAL_AGENT.LP.PRODUCT_SKU_HOVER,
    },
  ]

  const renderItem = ({ label, value, sub, content, hasPopover = true, hoverLogKey = '' }) => {
    const itemContent = (
      <div
        className={styles.headerBottomRightItem}
        onMouseEnter={() => {
          if (hoverLogKey) {
            log.record(hoverLogKey, 'OTHER', {
              ...logParams,
              label,
              value: value || '',
            });
          }
        }}
      >
        <div className={styles.headerBottomRightItemTitle}>
          <div className={styles.headerBottomRightItemTitleText}>{label}</div>
          {hasPopover && <DownArrowIcon className={styles.rotatedArrowIcon} />}
        </div>
        <div className={styles.headerBottomRightItemValue}>{value}</div>
      </div>
    );

    if (!hasPopover) {
      return <div key={label}>{itemContent}</div>;
    }

    return (
      <Popover
        content={content} 
        title={
          <div className={styles.skuPopoverTitle}>
            <div className={styles.skuPopoverTitleText}>{label}{$t('global-1688-ai-app.detail', '详情')}</div>
            <div className={styles.skuPopoverTitleTextCount}>{sub}</div>
          </div>
        }
        trigger="hover"
        rootClassName={styles.skuPopover}
        key={label}
      >
        {itemContent}
      </Popover>
    );
  };

  return (
    <div className={styles.headerBottomRight}>
      {statsConfig.map((config) => renderItem({
        ...config,
        hasPopover: config.label === 'SKU' ? !!totalPages : true,
      }))}
    </div>
  );
};

export default HeaderBottom;
import { useState, cloneElement, isValidElement, useEffect, useRef, useCallback } from 'react';
import type { ReactElement } from 'react';
import { Popover, Skeleton } from 'antd';
import { searchSkus } from '@/components/ChatFlow/SameNumModal/services';
import styles from './variantPopover.module.scss';
import { $t } from "@/i18n";

const PAGE_SIZE = 10;

interface VariantPopoverProps {
  children: React.ReactNode;
  openClassName?: string;
  platform: string;
  region: string;
  productId: string;
}

const VariantPopover = ({ children, openClassName, platform, region, productId }: VariantPopoverProps) => {
  const [variantList, setVariantList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(0);
  const pageNumRef = useRef(0);
  const pendingRef = useRef(false);

  useEffect(() => {
    pageNumRef.current = pageNum;
  }, [pageNum]);

  useEffect(() => {
    if (!open || !productId) return;
    let cancelled = false;
    setInitialLoading(true);
    setVariantList([]);
    setTotal(0);
    setPageNum(0);
    pageNumRef.current = 0;
    (async () => {
      pendingRef.current = true;
      try {
        const res = await searchSkus({
          platform,
          region,
          productIds: [productId],
          pageNum: 1,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) return;
        const list = res?.oppSkuVOList ?? [];
        setVariantList(list);
        setTotal(res?.total ?? list.length);
        setPageNum(1);
        pageNumRef.current = 1;
      } catch {
        if (!cancelled) {
          setVariantList([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) {
          pendingRef.current = false;
          setInitialLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, platform, region, productId]);

  const handleContentScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (pendingRef.current) return;
      const p = pageNumRef.current;
      if (p < 1 || !productId) return;
      const el = e.currentTarget;
      const bottomGap = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (bottomGap > 48) return;
      const t = total;
      if (t > 0 && variantList.length >= t) return;

      pendingRef.current = true;
      setLoadingMore(true);
      const nextPage = p + 1;
      (async () => {
        try {
          const res = await searchSkus({
            platform,
            region,
            productIds: [productId],
            pageNum: nextPage,
            pageSize: PAGE_SIZE,
          });
          const next = res?.oppSkuVOList ?? [];
          setVariantList((prev) => [...prev, ...next]);
          if (res?.total != null) {
            setTotal(res.total);
          }
          setPageNum(nextPage);
          pageNumRef.current = nextPage;
        } finally {
          pendingRef.current = false;
          setLoadingMore(false);
        }
      })();
    },
    [productId, platform, region, total, variantList.length],
  );

  const content = (
    <div className={styles.variantPopoverPanel}>
      <div className={styles.variantPopoverText}>
        <div className={styles.variantPopoverTextTitle}>{$t("global-1688-ai-app.select-product.general-agent.VariantPopover.skuDetail", "SKU详情")}</div>
        <div className={styles.variantPopoverTextCount}>
          {initialLoading ? (
            <Skeleton.Input active size="small" className={styles.variantPopoverCountSkeleton} />
          ) : (
            <>{$t('global-1688-ai-app.sku.count', `共${total > 0 ? total : variantList?.length || 0}个`, [total > 0 ? total : variantList?.length || 0])}</>
          )}
        </div>
      </div>
      <div className={styles.variantPopoverContent} onScroll={handleContentScroll}>
        {initialLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.variantPopoverSkeletonItem}>
                <Skeleton
                  active
                  title={false}
                  avatar={{ size: 40, shape: 'square' }}
                  paragraph={{ rows: 2, width: ['92%', '72%'] }}
                />
              </div>
            ))
          : variantList?.map((item) => (
              <div key={item?.skuId} className={styles.variantPopoverContentItem}>
                <div className={styles.variantPopoverContentItemImage}>
                  <img src={item.imageUrl} alt="" />
                </div>
                <div className={styles.variantPopoverContentItemInfo}>
                  <div className={styles.variantPopoverContentItemInfoText}>
                    {$t("global-1688-ai-app.select-product.general-agent.VariantPopover.skuPrice", "SKU价格")}:
                    <span className={styles.variantPopoverContentItemInfoTextValue}>{item.skuPrice}</span>
                  </div>
                  <div className={styles.variantPopoverContentItemInfoText}>
                    ID：
                    <span className={styles.variantPopoverContentItemInfoTextValue}>{item.skuId}</span>
                  </div>
                </div>
              </div>
            ))}
        {loadingMore && (
          <div className={styles.variantPopoverSkeletonItem}>
            <Skeleton
              active
              title={false}
              avatar={{ size: 40, shape: 'square' }}
              paragraph={{ rows: 2, width: ['92%', '72%'] }}
            />
          </div>
        )}
      </div>
    </div>
  );
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ className?: string }>, {
        className: [children.props.className, open && openClassName].filter(Boolean).join(' '),
      })
    : children;
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="hover"
      placement="top"
      content={content}
      styles={{ body: { padding: 0 } }}
      overlayClassName={styles.variantPopover}
    >
      {trigger}
    </Popover>
  );
};

export default VariantPopover;
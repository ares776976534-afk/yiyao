import styles from './index.module.css';
import CopywritingSummary from '@/components/ChatFlow/CopywritingSummary';
import ProductInfo from '../ProductInfo';
import { $t } from '@/i18n';
import SimilarCount from '../SimilarCount';
import { useState, useCallback, useEffect } from 'react';
import { SkeletonTable } from '@/pages/select-product/components/ImproveComponents/SkeletonTable';
import { searchSkus } from '../SameNumModal/services';
import style from '@/pages/select-product/components/ImproveComponents/reviewDetailModal.module.css';
import FrostedGlass from '../FrostedGlass';

const columns = [
  {
    title: $t("global-1688-ai-app.ChatFlow.SameInfo.SKUimage", "SKU图片"),
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    width: 100,
    align: 'center',
    render: (text, record) => {
      return (
        <FrostedGlass
          style={{ width: 48, height: 48, borderRadius: '2.4px' }}
          riskStatus={record?.riskStatus}
          productUrl={record?.productUrl || ''}
          imageUrl={text}
        />
      );
    },
  },
  {
    title: "SKU ID",
    dataIndex: 'skuId',
    key: 'skuId',
    width: 150,
  },
  {
    title: "SKU",
    dataIndex: 'title',
    key: 'title',
    width: 240,
    render: (text, record) => <div className={styles.skuTitle}>{text}</div>,
  },
  {
    title: $t("global-1688-ai-app.ChatFlow.SameInfo.SKUmonthSales", "SKU月销量"),
    dataIndex: 'sold30d',
    key: 'sold30d',
    width: 120,
    render: (text, record) => <div className={styles.skuSold}>{text}</div>,
  },
  {
    title: $t("global-1688-ai-app.ChatFlow.SameInfo.Sne", "SKU月销售额"),
    dataIndex: 'sold30dAmt',
    key: 'sold30dAmt',
    width: 120,
    render: (text, record) => <div className={styles.skuSold}>{text}</div>,
  },
  {
    title: $t("global-1688-ai-app.ChatFlow.SameInfo.SKUrating", "SKU评分"),
    dataIndex: 'ratingScore',
    key: 'ratingScore',
    width: 100,
    render: (text, record) => {
      return (
        <div className={styles.skuRating}>
          <div className={styles.skuRatingText}>{text}</div>
          <div className={styles.skuRatingTextSub}>分</div>
        </div>
      )
    },
  },
  {
    title: $t("global-1688-ai-app.ChatFlow.SameInfo.SKUsjtime", "SKU上架时间"),
    dataIndex: 'launchDate',
    key: 'launchDate',
    width: 154,
    render: (text, record) => <div className={styles.skuLaunchDate}>{text}</div>,
  },
];

// 骨架屏列配置
const skeletonColumns = [
  {
    title: $t("global-1688-ai-app.ChatFlow.SameInfo.SKUimage", "SKU图片"),
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    width: 100,
    render: () => <div className={style.skeletonLine} style={{ height: '60px', width: '80%' }} />
  },
  {
    title: "SKU ID",
    dataIndex: 'skuId',
    key: 'skuId',
    width: 150,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />
  },
  {
    title: "SKU",
    dataIndex: 'title',
    key: 'title',
    width: 240,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />
  },
  {
    title: $t("global-1688-ai-app.ChatFlow.SameInfo.SKUmonthSales", "SKU月销量"),
    dataIndex: 'sold30d',
    key: 'sold30d',
    width: 120,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />
  },
  {
    title: $t("global-1688-ai-app.ChatFlow.SameInfo.Sne", "SKU月销售额"),
    dataIndex: 'sold30dAmt',
    key: 'sold30dAmt',
    width: 120,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />
  },
  {
    title: $t("global-1688-ai-app.ChatFlow.SameInfo.SKUrating", "SKU评分"),
    dataIndex: 'ratingScore',
    key: 'ratingScore',
    width: 100,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />
  },
  {
    title: $t("global-1688-ai-app.ChatFlow.SameInfo.SKUsjtime", "SKU上架时间"),
    dataIndex: 'launchDate',
    key: 'launchDate',
    width: 154,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />
  }
];

// 生成骨架屏数据
const generateSkeletonData = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    key: `skeleton-${index}`,
    imageUrl: '',
    skuId: '',
    title: '',
    sold30d: '',
    sold30dAmt: '',
    ratingScore: '',
    launchDate: ''
  }));
};
export const InfoItem = ({ platform, spItemCnt, spSoldCnt30d, spRatingAvg, spPriceAvg, isProduct, region, spInfo, productId }: { platform: string, spItemCnt: number, spSoldCnt30d: number, spRatingAvg: number, spPriceAvg: number, isProduct?: boolean, region?: string, spInfo?: any, productId?: string }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  // 加载数据函数
  const loadData = useCallback(async (page: number, pageSize: number = 10) => {
    try {
      setLoading(true);
      const params = {
        platform,
        region,
        productIds: [productId],
        pageNum: page,
        pageSize: pageSize || 10,
      };

      const res = await searchSkus(params);
      const newList = res?.oppSkuVOList|| [];
      setList(newList);
      setTotal(res?.total || 0);
      setPageNum(page);
      setPageSize(pageSize || 10);
      setLoading(false);
    } catch (error) {
      setList([]);
      setTotal(0);
      setLoading(false);
    }
  }, [platform, region, productId]);

  // 初始加载
  useEffect(() => {
    if (open) {
      setList([]);
      setPageNum(1);
      setTotal(0);
      loadData(1);
    }
  }, [open, loadData]);
  const handleBtn = () => {
    setOpen(!open);
  };
  return (
    <div>
      <ProductInfo
        title={
          <div className={styles.headerTitle}>
            <div className={styles.headerPoint} />{$t("global-1688-ai-app.ChatFlow.SameInfo.productInformation", "商品信息")}</div>
        }
        open={open}
        data={[
          [
            {
              title: <SimilarCount
                count={$t("global-1688-ai-app.ChatFlow.SameInfo.tkproducts", "同款商品数")}
                record={{
                  spId: spInfo?.spId, // 同款簇ID
                  region,     // 地区二字码
                  platform, // 平台
                }}/>,
              value: spItemCnt,
            },
            {
              title: isProduct ? $t("global-1688-ai-app.ChatFlow.SameInfo.jya", "近30天SPU销量") : $t("global-1688-ai-app.ChatFlow.SameInfo.jys", "近30天销量"),
              value: spSoldCnt30d,
            },
            {
              title: isProduct ? $t("global-1688-ai-app.ChatFlow.SameInfo.Srg", "SPU平均评分") : $t("global-1688-ai-app.ChatFlow.SameInfo.rating", "评分"),
              value: spRatingAvg,
            },
            {
              title: isProduct ? $t("global-1688-ai-app.ChatFlow.SameInfo.SPUprice", "SPU价格") : $t("global-1688-ai-app.ChatFlow.ComparedDetailTable.pricefw", "价格范围"),
              value: spPriceAvg,
              isBtn: platform !== 'tiktok',
              handleBtn: handleBtn,
            },
          ],
        ]}
        className={`${open ? 'gap-[20px]' : 'pb-[8px] gap-[8px]'} grid`}
      />
      {open && (
        <div className={styles.skuList}>
          <SkeletonTable
            open={open}
            loading={loading}
            list={list}
            pageSize={pageSize}
            total={total}
            columns={columns}
            skeletonColumns={skeletonColumns}
            generateSkeletonData={generateSkeletonData}
            onPageChange={loadData}
            currentPage={pageNum}
            maxHeight='100%'
            footerName={$t("global-1688-ai-app.ChatFlow.SameInfo.tSKU", "条SKU")}
          />
        </div>
      )}
    </div>
  )
};
export default function SameInfo({ data, onClick, isProduct }: { data?: any; onClick: () => void, isProduct?: boolean }) {
  const { catePath, summary, platform, spItemCnt, spSoldCnt30d, spRatingAvg, spPriceAvg, region, spInfo, productId } = data;

  return (
    <>
      <InfoItem platform={platform} spItemCnt={spItemCnt} spSoldCnt30d={spSoldCnt30d} spRatingAvg={spRatingAvg} spPriceAvg={spPriceAvg} isProduct={isProduct} region={region} spInfo={spInfo} productId={productId} />
      <div className={styles.sameInfo}>
        <div className={styles.sameInfoContentMiddleTitle}>
          <div className={styles.headerTitle}>
            <div className={styles.headerPoint} />
            <div className={styles.sameInfoContentMiddleTitleText}>{$t("global-1688-ai-app.ChatFlow.SameInfo.tlpd", "同类目销量Top5商品")}</div>
          </div>
          <div className={styles.sameInfoContentMiddleTitleTextSub}>{$t("global-1688-ai-app.ChatFlow.SameInfo.sslm", `所属类目：${catePath}`, [catePath])}</div>
        </div>
        <CopywritingSummary
          summary={summary}
          onClick={onClick}
        />
      </div>
    </>
  );
}
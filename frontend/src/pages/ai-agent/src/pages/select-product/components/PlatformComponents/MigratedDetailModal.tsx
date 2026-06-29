import { Modal } from 'antd';
import MigratedDetailTable from './MigratedDetailTable';
import { getValue } from '@/utils/valueExtractor';
import { $t } from '@/i18n';
import styles from './migratedDetailModal.module.css';

const transformData = (rawData: any) => {
  const result: any[] = [];

  // 第一行：分类标题（新品）
  result.push({
    key: 'category-new',
    isCategory: true,
    text: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedDetailModal.product", `${rawData?.regionCn + rawData?.platform}商品`, [rawData?.regionCn + rawData?.platform]),
  });

  // 第二行：主商品数据（targetProduct外部）
  result.push({
    key: rawData.productId,
    image: rawData.mainImgUrl,
    similarCount: rawData.spItemCnt,
    topProduct: {
      title: rawData.title,
      link: rawData.productUrl,
    },
    launchDate: rawData.onShelfDate,
    priceRange: `${getValue(rawData?.spInfo?.spPriceMin)}-${getValue(rawData?.spInfo?.spPriceMax)}`,
    ratingRange: `${rawData?.spInfo?.spRatingMin}-${rawData?.spInfo?.spRatingMax}`,
    monthlySales: {
      count: rawData.soldCnt30d,
      growth: rawData.soldCnt30dMom?.value || '',
      isPositive: rawData.soldCnt30dMom?.direction === 'UP',
    },
    platform: rawData.platform,
    region: rawData.region,
    spId: rawData.spInfo?.spId,
    riskStatus: rawData.riskStatus,
    productUrl: rawData.productUrl,
  });

  // 检查targetProduct是否有必要的字段
  const hasTargetProductData = rawData.targetProduct &&
    rawData.targetProduct.productId &&
    rawData.targetProduct.mainImgUrl &&
    rawData.targetProduct.spItemCnt &&
    rawData.targetProduct.title &&
    rawData.targetProduct.productUrl;

  // 第三行：分类标题（同类目Top5热销品）
  if (hasTargetProductData) {
    result.push({
      key: 'category-top5',
      isTopProducts: true,
      platform: rawData.targetProduct?.platform,
      region: rawData.targetProduct?.regionCn,
      text: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedDetailModal.tkproduct", `${rawData?.targetProduct?.regionCn + rawData?.targetProduct?.platform}同款商品`, [rawData?.targetProduct?.regionCn + rawData?.targetProduct?.platform]),
    });

    // 第四行：targetProduct里的数据
    result.push({
      key: rawData.targetProduct.productId,
      image: rawData.targetProduct.mainImgUrl,
      similarCount: rawData.targetProduct.spItemCnt,
      topProduct: {
        title: rawData.targetProduct.title,
        link: rawData.targetProduct.productUrl,
      },
      launchDate: rawData.targetProduct.onShelfDate,
      priceRange: `${getValue(rawData.targetProduct?.spInfo?.spPriceMin)}-${getValue(rawData.targetProduct?.spInfo?.spPriceMax)}`,
      ratingRange: `${rawData.targetProduct?.spInfo?.spRatingMin}-${rawData.targetProduct?.spInfo?.spRatingMax}`,
      monthlySales: {
        count: rawData.targetProduct.soldCnt30d,
        growth: rawData.targetProduct.soldCnt30dMom?.value || '',
        isPositive: rawData.targetProduct.soldCnt30dMom?.direction === 'UP',
      },
      platform: rawData.targetProduct?.platform,
      region: rawData.targetProduct?.regionCn,
      spId: rawData.targetProduct?.spInfo?.spId,
      riskStatus: rawData.targetProduct?.riskStatus,
      productUrl: rawData.targetProduct?.productUrl,
    });
  }

  return result;
};


export const MigratedDetailModal = ({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
}) => {
  const dataSource = transformData(data);
  return (
    <Modal
      title={$t("global-1688-ai-app.select-product.PlatformComponents.MigratedDetailModal.viewDetails", "查看详情")}
      open={open}
      onCancel={onClose}
      footer={false}
      style={{
        minWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 132px)',
        top: '24px',
      }}
      className={styles.migratedDetailModalContentContainer}
    >
      <div className="flex">
        <div className="overflow-scroll flex-1 [&_.ant-table-wrapper]:!overflow-scroll [&_.ant-table-container]:!overflow-scroll [&_.ant-spin-nested-loading]:!min-w-[936px] [&_.ant-spin-nested-loading]:h-[calc(100vh-132px)] [&_.ant-modal-content]:h-[calc(100vh-24px)]">
          <MigratedDetailTable
            data={dataSource}
          />
        </div>
      </div>
    </Modal >
  );
};
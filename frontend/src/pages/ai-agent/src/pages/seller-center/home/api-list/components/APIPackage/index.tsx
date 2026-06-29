import React from 'react';
import PricingCard from './PriceCard';
import CustomCard from './CustomCard';
import DoneCard from './DoneCard';
import styles from './index.module.scss';
import { $t } from '@/i18n';

interface ApiPackagePageProps {
  id?: string;
  packageData?: any[];
  serviceData?: any[];
}

const cardData: any[] = [
  {
    id: 1,
    icon: "https://img.alicdn.com/imgextra/i4/6000000001836/O1CN010yx3VM1PQwGf1mYhs_!!6000000001836-2-gg_dtc.png",
    title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.imagefybzb", "图片翻译标准版"),
    subtitle: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.035pointsz", "0.35积分/张")
  },
  {
    id: 2,
    icon: "https://img.alicdn.com/imgextra/i1/6000000007738/O1CN01KQJpQs2DYS0xqEpiK_!!6000000007738-2-gg_dtc.png",
    title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.dez", "文档翻译专业版"),
    subtitle: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.050pointsy", "0.50积分/页")
  },
  {
    id: 3,
    icon: "https://img.alicdn.com/imgextra/i2/6000000003577/O1CN01rGce0v1dGvKQJ8ZxL_!!6000000003577-2-gg_dtc.png",
    title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.yysbhighjb", "语音识别高级版"),
    subtitle: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.0ii", "0.25积分/分钟")
  },
  {
    id: 4,
    icon: "https://img.alicdn.com/imgextra/i3/6000000004982/O1CN01mNvQpH1wKvLxJ8ZxL_!!6000000004982-2-gg_dtc.png",
    title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.zmc", "智能摘要生成"),
    subtitle: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.0iz", "0.40积分/千字")
  },
  {
    id: 4,
    icon: "https://img.alicdn.com/imgextra/i3/6000000004982/O1CN01mNvQpH1wKvLxJ8ZxL_!!6000000004982-2-gg_dtc.png",
    title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.zmc", "智能摘要生成"),
    subtitle: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.0iz", "0.40积分/千字")
  },
  {
    id: 4,
    icon: "https://img.alicdn.com/imgextra/i3/6000000004982/O1CN01mNvQpH1wKvLxJ8ZxL_!!6000000004982-2-gg_dtc.png",
    title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.zmc", "智能摘要生成"),
    subtitle: $t("global-1688-ai-app.seller-center.home.api-list.APIPackage.0iz", "0.40积分/千字")
  }

];

interface APICardProps {
  packageData?: any[];
}

export const APICard: React.FC<APICardProps> = ({ packageData = [] }) => {
  return (
    <div className={styles.mainSection}>
      <div className={styles.headerSection}>
        <div className={styles.titleWrapper}>
          <span className={styles.mainTitle}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.APItcgm", "API套餐购买")}</span>
        </div>
        <span className={styles.subtitle}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.sttnvblhwee", "选择适合您的套餐，积分仅可用于AlphaShop的官网API服务使用")}</span>
      </div>
      <div className={styles.cardsSection}>
        {
          packageData.filter((item) => !!item).map((item) => (
            <PricingCard
              key={item.packageId}
              {...item}
            />
          ))
        }
        <CustomCard />
      </div>
    </div>
  );
};


const ApiPackagePage: React.FC<ApiPackagePageProps> = ({ packageData = [], serviceData = [] }) => {
  return (
    <div className={styles.container}>
      <div className={styles.explanationSection}>
        <span className={styles.explanationTitle}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.fiox", "功能及积分消耗说明")}</span>
        <span className={styles.explanationDescription}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.pmheetcennorggFitCnycFiynr", "平台提供了多样化的AI服务，积分是兑换这些功能的唯一凭证。平台共提供三大类型的功能，包含图像处理类、内容生成与优化类、文本处理类，详细功能及对应的积分消耗如下.")}</span>
        <div className={styles.explanationContent}>
          {serviceData.filter((item) => !!item).map((card) => (
            <DoneCard
              {...card}
              key={card.serviceId}
              onClick={() => (card)}
              className={styles.cardItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiPackagePage;

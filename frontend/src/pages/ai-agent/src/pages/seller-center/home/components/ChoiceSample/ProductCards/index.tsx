import React from 'react';
import ProductCard from './ProducctCard';
import styles from './index.module.scss';
import { $t } from '@/i18n';

interface ProductCardsGridProps {
  id?: string;
}

const ProductCardsGrid: React.FC<ProductCardsGridProps> = ({ id }) => {
  const cardData = [
    {
      image: "https://img.alicdn.com/imgextra/i4/6000000006666/O1CN01y07wsF1z75GTzd5iA_!!6000000006666-2-gg_dtc.png",
      title: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.rsdc", "发布商品种草贴"),
      description: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.bkfyjchIsmthtg", "爆款一键改款，修改幅度任意调整。一键将灵感转换成款式图案或者纹样。AI为您一键生成款式的模特上身图，同时可以更换指定模特图。\nAI轻松更换场景。"),
      hasOverlay: true
    },
    {
      image: "https://img.alicdn.com/imgextra/i4/6000000003011/O1CN01pwKKEy1Y75e0TZgED_!!6000000003011-2-gg_dtc.png",
      title: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.AIfzkscnew", "AI服装款式创新"),
      description: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.bkfyjchIsmthtg", "爆款一键改款，修改幅度任意调整。一键将灵感转换成款式图案或者纹样。AI为您一键生成款式的模特上身图，同时可以更换指定模特图。\nAI轻松更换场景。"),
      hasOverlay: false
    },
    {
      image: "https://img.alicdn.com/imgextra/i1/6000000001671/O1CN01UmBt3G1ODMurGcqiy_!!6000000001671-2-gg_dtc.png",
      title: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.mjy", "模型玩具配件查询"),
      description: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.bkfyjchIsmthtg", "爆款一键改款，修改幅度任意调整。一键将灵感转换成款式图案或者纹样。AI为您一键生成款式的模特上身图，同时可以更换指定模特图。\nAI轻松更换场景。"),
      hasOverlay: false
    },
    {
      image: "https://img.alicdn.com/imgextra/i1/6000000003594/O1CN01WAKsNj1cQ6YCm6U8x_!!6000000003594-2-gg_dtc.png",
      title: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.AIfzkscnew", "AI服装款式创新"),
      description: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.bkfyjchIsmthtg", "爆款一键改款，修改幅度任意调整。一键将灵感转换成款式图案或者纹样。AI为您一键生成款式的模特上身图，同时可以更换指定模特图。\nAI轻松更换场景。"),
      hasOverlay: false
    },
    {
      image: "https://img.alicdn.com/imgextra/i2/6000000002082/O1CN010B5TeV1RFbhOyDq8w_!!6000000002082-2-gg_dtc.png",
      title: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.AIfzkscnew", "AI服装款式创新"),
      description: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.bkfyjchIsmthtg", "爆款一键改款，修改幅度任意调整。一键将灵感转换成款式图案或者纹样。AI为您一键生成款式的模特上身图，同时可以更换指定模特图。\nAI轻松更换场景。"),
      hasOverlay: false
    },
    {
      image: "https://img.alicdn.com/imgextra/i4/6000000001797/O1CN01B3cLEl1P94ovRSNfk_!!6000000001797-2-gg_dtc.png",
      title: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.AIfzkscnew", "AI服装款式创新"),
      description: $t("global-1688-ai-app.seller-center.home.ChoiceSample.ProductCards.bkfyjchIsmthtg", "爆款一键改款，修改幅度任意调整。一键将灵感转换成款式图案或者纹样。AI为您一键生成款式的模特上身图，同时可以更换指定模特图。\nAI轻松更换场景。"),
      hasOverlay: false
    }
  ];

  return (
    <div id={id} className={styles.container}>
      {cardData.map((card, index) => (
        <ProductCard
          key={index}
          image={card.image}
          title={card.title}
          description={card.description}
          hasOverlay={card.hasOverlay}
        />
      ))}
    </div>
  );
};

export default ProductCardsGrid;

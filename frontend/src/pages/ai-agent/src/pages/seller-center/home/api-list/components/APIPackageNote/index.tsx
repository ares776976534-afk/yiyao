import React from 'react';
import BottomNote from './BottomNote';
import pxToVw from '@/utils/pxToVw';
import styles from './index.module.scss';
import { $t } from '@/i18n';

interface AIServicePageProps {
  id?: string;
}

const BlockLeft = (data: any) => {
  const { icon, demoImg, desc } = data;
  return (
    <div className={styles.serviceCard}>
      <div className={styles.serviceContent}>
        <img
          src={icon}
          alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.serviceIcon", "服务图标")}
          className={styles.serviceIcon}
        />
        <div className={styles.serviceInfo}>
          {
            desc.map((item: any) => (
              <div className={styles.serviceItem}>
                <span className={styles.serviceTitle}>{item.title}</span>
                <span className={styles.serviceDesc}>{item.desc}</span>
              </div>
            ))
          }
        </div>
      </div>
      <div className={styles.serviceImageWrapper} style={{ width: pxToVw(demoImg.width), height: pxToVw(demoImg.height) }}>
        <img
          src={demoImg.src}
          alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.imagefysl", "图片翻译示例")}
          className={styles.serviceImage}
        />
      </div>
    </div>
  )
}

const BlockRight = (data: any) => {
  const { icon, demoImg, desc } = data;
  return (
    <div className={styles.serviceCard}>
      <div className={styles.aiToolsDemo} style={{ width: pxToVw(demoImg.width), height: pxToVw(demoImg.height) }}>
        <img
          src={demoImg.src}
          alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.imagefysl", "图片翻译示例")}
          className={styles.serviceImage}
        />
      </div>
      <div className={styles.serviceContent}>
        <img
          src={icon}
          alt={$t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.serviceIcon", "服务图标")}
          className={styles.serviceIcon}
        />
        <div className={styles.serviceInfo}>
          {
            desc.map((item: any) => (
              <div className={styles.serviceItem}>
                <span className={styles.serviceTitle}>{item.title}</span>
                <span className={styles.serviceDesc}>{item.desc}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}


const blockItems = [
  {
    icon: "https://img.alicdn.com/imgextra/i4/O1CN01j61Cu41EkDA4amEUA_!!6000000000389-2-tps-144-144.png",
    demoImg: {
      src: "https://img.alicdn.com/imgextra/i1/O1CN01C94IFa1cOGy573TUO_!!6000000003590-2-tps-780-600.png",
      width: 680,
      height: 504
    },
    desc: [
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.imagefy", "图片翻译"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.srylemwqanpyi", "支持数十种语向，精准处理图片内的复杂文本布局，并确保与图片内容匹配，提升翻译质量")
      },
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.ifb", "图片翻译Pro版"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.jzvbuyzd", "较标准版，在整体翻译可用性质量上进一步增加了15%到20%")
      }
    ],
    position: "left"
  },
  {
    icon: 'https://img.alicdn.com/imgextra/i3/O1CN01I346ke1IO0QBu8ASo_!!6000000000882-2-tps-144-144.png',
    demoImg: {
      src: 'https://img.alicdn.com/imgextra/i4/O1CN01ETLRUQ1q4wsUF11PC_!!6000000005443-2-tps-1156-1008.png',
      width: 626,
      height: 544,
    },
    desc: [
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.znkt", "智能抠图"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.zxxthtczg", "自动识别图像中的显著性主体，将主体和背景进行分离，返回去除背景后的主体图片")
      },
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.znxc", "智能消除"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.zxmdmkkxg", "自动识别并消除电商图片中的文字、特定名称、透明字块和牛皮癣，可按需指定消除图片内对象")
      },
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.zncj", "智能裁剪"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.kdguSrbejgecx", "可以按照指定尺寸改变输入的图像，支持自动识别图片主体区域，精准裁剪出各类尺寸，适配各种场景的设计需求")
      }
    ],
    position: "right"
  },
  {
    icon: 'https://img.alicdn.com/imgextra/i3/O1CN018hxMrv1bfO9ZVPu0i_!!6000000003492-2-tps-144-144.png',
    demoImg: {
      src: 'https://img.alicdn.com/imgextra/i1/O1CN01cctnDn1hYsDJP54SS_!!6000000004290-2-tps-1156-1008.png',
      width: 607,
      height: 535,
    },
    desc: [
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.thr", "图像高清放大"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.kpmhtfedwxlsxHxzl", "可以对输入的图片进行2-4倍的图像分辨率放大，有效提升低分辨率图像的质量，改善图像纹理细节，全面提高图像清晰度与主观质量"),
      },
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.znyssb", "智能元素识别"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.fsgbzss", "快速识别图片主体和背景中的文字、Logo、水印及含字色块等元素")
      }
    ],
    position: "left"
  },
  {
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN016RpkUI1dTbBp9Og4B_!!6000000003737-2-tps-144-144.png',
    demoImg: {
      src: 'https://img.alicdn.com/imgextra/i1/O1CN019ZB1Rs1v1LqUDhl49_!!6000000006112-2-tps-1156-1008.png',
      width: 578,
      height: 504,
    },
    desc: [
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.xnsy", "虚拟试衣"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.gprfsse", "根据服饰平铺图，取代真人模特拍摄，快速生成模特上身图片"),
      },
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.mthf", "模特换肤"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.smhzud", "生成跨国别、多元化的模特，扩展商品的穿戴效果表达")
      },
    ],
  },
  {
    icon: "https://img.alicdn.com/imgextra/i4/O1CN01QwhJQK1unbxosgqwi_!!6000000006082-2-tps-144-144.png",
    demoImg: {
      src: "https://img.alicdn.com/imgextra/i3/O1CN01Ywgqr520YOUzOfsXd_!!6000000006861-2-tps-1342-1008.png",
      width: 671,
      height: 504,
    },
    desc: [
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.pcl", "商品标题生成"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.tdxhwtkbgurte", "通过商品特性分析，提炼核心关键词，以提升流量和可读性为目标，生成适配各渠道的多语商品标题")
      },
      {
        title: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.pcci", "商品描述生成"),
        desc: $t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.tczgdmPc", "通过灵活入参，可生成精准卖点的结构化商品详描文案，提升商品转化率")
      },
    ],
    position: "left"
  },
]

const AIServicePage: React.FC<AIServicePageProps> = ({ id }) => {
  return (
    <div id={id} className={styles.container}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <span className={styles.titleText}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.tg", "提供")}</span>
          <span className={styles.colorTitle}>API</span>
          <span className={styles.titleText}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.service", "服务")}</span>
        </div>
        <span className={styles.headerDescription}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackageNote.fIikfctckjSmafhzx", "丰富的API服务，覆盖跨境电商的翻译、铺货、素材制作、广告投放等通用场景。开发者可将其自主集成到现有系统中，实现快速开发与高效运营，显著提升业务效率。")}</span>
      </div>
      <div className={styles.blockItems}>
        {
          blockItems.map((item) => (
            item.position === "left" ? <BlockLeft {...item} /> : <BlockRight {...item} />
          ))
        }
      </div>
      <div className={styles.bottomNote}>
        <BottomNote />
      </div>
    </div >
  );
};

export default AIServicePage;

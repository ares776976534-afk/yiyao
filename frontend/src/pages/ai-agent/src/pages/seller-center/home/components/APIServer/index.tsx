import React from 'react';
import styles from './index.module.scss';
import { ApiDocumentIcon, DocumentPlusIcon, DocumentStarIcon, EditIcon } from '@/components/Icon';
import { $t } from '@/i18n';

interface ApiServicePageProps {
  id?: string;
}

const ApiServicePage: React.FC<ApiServicePageProps> = ({ id }) => {
  return (
    <div
      className="flex justify-center overflow-x-hidden w-full relative"
    >
      <div className="flex flex-col items-center justify-center w-[1108px] mb-[40px]">

        <p className="flex items-center justify-center gap-1 mt-[184px] h-[51px]">
          <span className={styles.titleCN}>{$t("global-1688-ai-app.seller-center.home.APIServer.tg", "提供")}</span>

          <span className={styles.titleEN}>
            API
          </span>

          <span className={styles.titleCN}>{$t("global-1688-ai-app.seller-center.home.APIServer.service", "服务")}</span>
        </p>

        <p className={styles.titleDesc}>{$t("global-1688-ai-app.seller-center.home.APIServer.fIikfctckjSmafhzx", "丰富的API服务，覆盖跨境电商的翻译、铺货、素材制作、广告投放等通用场景。开发者可将其自主集成到现有系统中，实现快速开发与高效运营，显著提升业务效率")}</p>

        {/* 1 */}
        <div className={styles.apiRow}>
          <div className={styles.apiImageContainer} >
            <img
              className={styles.apiImage}
              style={{
                marginTop: '39px',
                position: 'absolute',
                left: '-144px',
                top: 0,
              }}
              src="https://img.alicdn.com/imgextra/i2/O1CN01x2qYar1WEl3deOdTw_!!6000000002757-2-tps-1187-690.png"
              alt={$t("global-1688-ai-app.seller-center.home.APIServer.APIservice", "API服务")}
            />
          </div>

          <div className={styles.apiContent}>
            <div className={styles.apiItem}>
              <div className={styles.apiIcon}>
                <ApiDocumentIcon />
              </div>
              <span className={styles.apiTitle}>{$t("global-1688-ai-app.seller-center.home.APIServer.imagefy", "图片翻译")}</span>
            </div>

            <p className={styles.desc}>{$t("global-1688-ai-app.seller-center.home.APIServer.zxwzzzoH", "专业地将图像文本转换为多种语言，以满足全球消费者的喜好，性价比高")}</p>
          </div>
        </div>

        {/* 2 */}
        <div className={styles.apiRow}>
          <div className={styles.apiContent}>
            <div className={styles.apiItem}>
              <div className={styles.apiIcon2}>
                <DocumentPlusIcon />
              </div>
              <span className={styles.apiTitle}>{$t("global-1688-ai-app.seller-center.home.APIServer.iHfe", "图片高清放大")}</span>
            </div>

            <p className={styles.desc}>{$t("global-1688-ai-app.seller-center.home.APIServer.kpmhtfedwxlsxHxzl", "可以对输入的图片进行2-4倍的图像分辨率放大，有效提升低分辨率图像的质量，改善图像纹理细节，全面提高图像清晰度与主观质量。")}</p>
          </div>

          <div className={styles.apiImageContainer} >
            <img
              className={styles.apiImage}
              style={{
                position: 'absolute',
                right: '-120px',
                top: 0,
              }}
              src="https://img.alicdn.com/imgextra/i1/O1CN01vojz8Y1TI11lgvTut_!!6000000002358-2-tps-1086-675.png"
              alt=""
            />
          </div>
        </div>

        {/* 3 */}
        <div className={styles.apiRow}>
          <div className={styles.apiImageContainer} >
            <img
              className={styles.apiImage}
              style={{
                position: 'absolute',
                left: '-48px',
                top: 0,
                width: '618px',
                height: '400px',
              }}
              src="https://img.alicdn.com/imgextra/i2/O1CN01nZQb0Q1KrR7Lq05mE_!!6000000001217-2-tps-1270-854.png"
              alt=""
            />
          </div>

          <div className={styles.apiContent}>
            <div className={styles.apiItem}>
              <div className={styles.apiIcon3}>
                <EditIcon />
              </div>
              <span className={styles.apiTitle}>{$t("global-1688-ai-app.seller-center.home.APIServer.znkt", "智能抠图")}</span>
            </div>
            <p className={styles.desc}>{$t("global-1688-ai-app.seller-center.home.APIServer.zxxthtczg", "自动识别图像中的显著性主体，将主体和背景进行分离，返回去除背景后的主体图片。")}</p>
          </div>
        </div>

        <div className={styles.apiRow}>
          <div className={styles.apiContent}>
            <div className={styles.apiItem}>
              <div className={styles.apiIcon4}>
                <DocumentStarIcon />
              </div>
              <span className={styles.apiTitle}>{$t("global-1688-ai-app.seller-center.home.APIServer.pcl", "商品标题生成")}</span>
            </div>

            <p className={styles.desc}>{$t("global-1688-ai-app.seller-center.home.APIServer.jsjgxslixuHenMl", "基于海量电商数据进行训练，可根据品类特性快速生成吸引力十足的标题，凸显商品优势，帮助商家获取更多流量")}</p>
          </div>

          <div className={styles.apiImageContainer} >
            <img
              className={styles.apiImage}
              style={{
                position: 'absolute',
                right: '-145px',
                top: 0,
                width: '660px',
                height: '420px',
              }}
              src="https://img.alicdn.com/imgextra/i4/O1CN01DpAFfy1OeOIdU913s_!!6000000001730-2-tps-1320-840.png"
              alt=""
            />
          </div>
        </div>
      </div>

      <div className={styles.bg} />

    </div>
  );
};

export default ApiServicePage;

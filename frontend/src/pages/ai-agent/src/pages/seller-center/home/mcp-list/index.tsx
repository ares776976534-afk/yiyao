import React from 'react';
import Layout from '../components/Layout';
import styles from './index.module.scss';
import { $t } from '@/i18n';

interface McpServicePageProps {
  id?: string;
}

const McpServicePage: React.FC<McpServicePageProps> = ({ id }) => {
  return (
    <Layout contentStyle={{ padding: '0' }}>
      <div id={id} className={styles.container}>
        <div className={styles.mainContent}>
          {/* 标题部分 */}
          <div className={styles.titleSection}>
            <div className={styles.titleRow}>
              <span className={styles.titleText}>{$t("global-1688-ai-app.seller-center.home.mcp-list.tg", "提供")}</span>
              <span className={styles.colorTitle}>MCP</span>
              <span className={styles.titleText}>{$t("global-1688-ai-app.seller-center.home.mcp-list.service", "服务")}</span>
            </div>
            <span className={styles.description}>{$t("global-1688-ai-app.seller-center.home.mcp-list.tscntndyywxmjslgFiMhqsb", "通过MCP服务，能够即时为Agent接入榜单查询、多语言图搜等外部工具，无需编写复杂接口，显著提升开发效率。灵活扩展Agent的功能，满足多样化的业务需求，快速响应市场变化")}</span>
          </div>
          <div className={styles.hotSearchCards}>
            {/* 商品热搜词卡片 */}
            <div className={styles.hotSearchCard}>
              <div className={styles.cardContent}>
                <div className={styles.cardTag}>
                  <img
                    src="https://img.alicdn.com/imgextra/i2/O1CN01r8fsi21tzEOcxbQFb_!!6000000005972-2-tps-124-72.png"
                    className={styles.tagIcon}
                    alt={$t("global-1688-ai-app.seller-center.home.mcp-list.sj", "商机")}
                  />
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardTitle}>{$t("global-1688-ai-app.seller-center.home.mcp-list.pcsh", "商品热搜词")}</div>
                  <span className={styles.cardDesc}>{$t("global-1688-ai-app.seller-center.home.mcp-list.zjcrteciutoxshr", "针对电商场景，提供多语言商品热门搜索词服务，且支持关键词维度下的热搜词查询")}</span>
                </div>
              </div>
              <img src="https://img.alicdn.com/imgextra/i2/O1CN01IMYBkm28MV8lyqARt_!!6000000007918-2-tps-1500-860.png" className={styles.hotSearchImage} />
            </div>

            {/* 多语言关键词搜索卡片 */}
            <div className={styles.searchCard}>
              <img src="https://img.alicdn.com/imgextra/i1/O1CN0136Xcaz1LN2QsIFQz2_!!6000000001286-2-tps-2010-1434.png" className={styles.hotSearchImage} />
              <div className={styles.searchInfo}>
                <div className={styles.cardTag}>
                  <img
                    src="https://img.alicdn.com/imgextra/i3/O1CN017fPiTg1eyZahr3K6u_!!6000000003940-2-tps-116-72.png"
                    className={styles.tagIcon}
                    alt={$t("global-1688-ai-app.seller-center.home.mcp-list.sj", "商机")}
                  />
                </div>
                <div className={styles.searchTitle}>{$t("global-1688-ai-app.seller-center.home.mcp-list.myoa", "多语言关键词搜索")}</div>
                <span className={styles.searchDesc}>{$t("global-1688-ai-app.seller-center.home.mcp-list.myguyShi", "多语言场景下，提供商品关键词搜索服务")}</span>
              </div>
            </div>

            {/* 多语言商详卡片 */}
            <div className={styles.hotSearchCard}>
              <div className={styles.cardContent}>
                <div className={styles.cardTag}>
                  <img
                    src="https://img.alicdn.com/imgextra/i3/O1CN017fPiTg1eyZahr3K6u_!!6000000003940-2-tps-116-72.png"
                    className={styles.tagIcon}
                    alt={$t("global-1688-ai-app.seller-center.home.mcp-list.sj", "商机")}
                  />
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardTitle}>{$t("global-1688-ai-app.seller-center.home.mcp-list.muchyysx", "多语言商详")}</div>
                  <span className={styles.cardDesc}>{$t("global-1688-ai-app.seller-center.home.mcp-list.srhnrtShrtifeonag", "支持多种语向，输入商品id，即可搜索并提取商品详情（含：主副标题、视频、SKU信息、供应商等）")}</span>
                </div>
              </div>
              <img src="https://img.alicdn.com/imgextra/i2/O1CN01J61OPb1WPkY710of8_!!6000000002781-2-tps-2766-2256.png" className={styles.hotSearchImage} />
            </div>
          </div>
        </div>

        {/* 更多服务能力部分 */}
        <div className={styles.moreServices}>
          <span className={styles.moreServicesTitle}>{$t("global-1688-ai-app.seller-center.home.mcp-list.gSc", "更多服务能力")}</span>
          <div className={styles.serviceCards}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceTag}>
                <img
                  src="https://img.alicdn.com/imgextra/i2/O1CN01r8fsi21tzEOcxbQFb_!!6000000005972-2-tps-124-72.png"
                  className={styles.serviceTagIcon}
                  alt={$t("global-1688-ai-app.seller-center.home.mcp-list.product", "商品")}
                />
              </div>
              <span className={styles.serviceCardTitle}>{$t("global-1688-ai-app.seller-center.home.mcp-list.qbt", "查询榜单列表")}</span>
              <div className={styles.serviceCardDesc}>
                <span className={styles.serviceCardText}>{$t("global-1688-ai-app.seller-center.home.mcp-list.srdoshudsrmztsrdej", "支持基于榜单类型、商品数和多语言等多维度的榜单列表查询，如：complex综合榜，hot热卖榜，goodPrice好价榜")}</span>
              </div>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceTag}>
                <img
                  src="https://img.alicdn.com/imgextra/i3/O1CN017fPiTg1eyZahr3K6u_!!6000000003940-2-tps-116-72.png"
                  className={styles.serviceTagIcon}
                  alt={$t("global-1688-ai-app.seller-center.home.mcp-list.product", "商品")}
                />
              </div>
              <span className={styles.serviceCardTitle}>{$t("global-1688-ai-app.seller-center.home.mcp-list.muchyyts", "多语言图搜")}</span>
              <div className={styles.serviceCardDesc}>
                <span className={styles.serviceCardText}>{$t("global-1688-ai-app.seller-center.home.mcp-list.srhdefdaraenoi", "支持多种语向下的图片检索，获取丰富商品数据，如：价格、销量、商家信息等")}</span>
              </div>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceTag}>
                <img
                  src="https://img.alicdn.com/imgextra/i3/O1CN017fPiTg1eyZahr3K6u_!!6000000003940-2-tps-116-72.png"
                  className={styles.serviceTagIcon}
                  alt={$t("global-1688-ai-app.seller-center.home.mcp-list.product", "商品")}
                />
              </div>
              <span className={styles.serviceCardTitle}>{$t("global-1688-ai-app.seller-center.home.mcp-list.grmrt", "根据关键字推荐商品")}</span>
              <div className={styles.serviceCardDesc}>
                <span className={styles.serviceCardText}>{$t("global-1688-ai-app.seller-center.home.mcp-list.grutPcodlr", "根据关键字（如：商品标题）进行商品推荐，按销量排序")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default McpServicePage;

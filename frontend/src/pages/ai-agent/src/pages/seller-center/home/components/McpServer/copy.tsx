import React from 'react';
import styles from './index.module.scss';
import { useIsMobile } from '@/hooks/useDeviceDetection';
import { $t } from '@/i18n';

interface MCPServicePageProps {
  id?: string;
}

const MCPServicePage: React.FC<MCPServicePageProps> = ({ id }) => {
  const isMobile = useIsMobile();

  return (
    <div id={id} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.headerSection}>
          <div className={styles.titleSection}>
            <div className={styles.titleRow}>
              <span className={styles.serviceText}>{$t("global-1688-ai-app.seller-center.home.McpServer.tg", "提供")}</span>
              <span className={styles.colorTitle}>MCP</span>
              <span className={styles.serviceText}>{$t("global-1688-ai-app.seller-center.home.McpServer.service", "服务")}</span>
            </div>
          </div>
          <span className={styles.description}>{$t("global-1688-ai-app.seller-center.home.McpServer.tscntndyywxmjsFwewgeeCed", "通过MCP服务，能够即时为Agent接入榜单查询、多语言图搜等外部工具，无需编写复杂接口，显著提升开发效率。快速为你的Agent接入外部工具，通过 MCP服务，不必编写复杂接口！即点即用！")}</span>
        </div>

        <div className={styles.servicesContainer}>
          <div className={styles.serviceCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                {isMobile
                  ? (<>
                    <div className={styles.cardTitleSectionMobile}>
                      <div className={styles.businessTag}>
                        <img
                          src="https://img.alicdn.com/imgextra/i4/6000000005906/O1CN01OwHAey1tV0FuzSTzB_!!6000000005906-2-gg_dtc.png"
                          className={styles.tagIcon}
                          alt="Business Icon"
                        />
                        <span className={styles.tagText}>{$t("global-1688-ai-app.seller-center.home.McpServer.sj", "商机")}</span>
                      </div>
                      <span className={styles.cardTitle}>{$t("global-1688-ai-app.seller-center.home.McpServer.pcsh", "商品热搜词")}</span>
                    </div>
                  </>)
                  : <>
                    <div className={styles.cardTitleSection}>
                      <span className={styles.cardTitle}>{$t("global-1688-ai-app.seller-center.home.McpServer.pcsh", "商品热搜词")}</span>
                      <div className={styles.businessTag}>
                        <img
                          src="https://img.alicdn.com/imgextra/i4/6000000005906/O1CN01OwHAey1tV0FuzSTzB_!!6000000005906-2-gg_dtc.png"
                          className={styles.tagIcon}
                          alt="Business Icon"
                        />
                        <span className={styles.tagText}>{$t("global-1688-ai-app.seller-center.home.McpServer.sj", "商机")}</span>
                      </div>
                    </div>
                  </>}

                <span className={`${styles.cardDescription}`}>{$t("global-1688-ai-app.seller-center.home.McpServer.zjcrteciutoxshr", "针对电商场景，提供多语言商品热门搜索词服务，且支持关键词维度下的热搜词查询")}</span>
              </div>

              <div className={styles.cardVisual}>
                <img
                  src="https://img.alicdn.com/imgextra/i3/O1CN01JA2u241qQvtWRj0Yi_!!6000000005491-2-tps-686-528.png"
                  className="w-full h-full"
                  alt="Decoration"
                />

                {/* <img
                  src="https://img.alicdn.com/imgextra/i1/6000000007944/O1CN01DrvGfW28YPRCHG6g5_!!6000000007944-2-gg_dtc.png"
                  className={styles.decorIcon}
                  alt="Decoration"
                />

                <div className={styles.visualContent}>
                  <div className={styles.blurCircle1} />
                  <img
                    src="https://img.alicdn.com/imgextra/i2/6000000002744/O1CN01KT0TUA1W8ntZlXV8k_!!6000000002744-2-gg_dtc.png"
                    className={styles.chartIcon}
                    alt="Chart"
                  />
                  <div className={styles.blurCircle2} />

                  <div className={styles.gradientCard}>
                    <span className={styles.gradientTitle}>1688全站日用品商品飙升榜</span>
                    <span className={styles.gradientSubtitle}>连续7天全网热销</span>
                  </div>

                  <div className={styles.whiteCard}>
                    <div className={styles.cardTop}>
                      <div className={styles.headerBar} />
                      <div className={styles.chartBars}>
                        <div className={styles.chartBar} />
                        <div className={styles.chartBar} />
                        <div className={styles.chartBar} />
                      </div>
                    </div>
                    <div className={styles.cardBottom}>
                      <div className={styles.pill1} />
                      <div className={styles.pillGroup}>
                        <div className={styles.smallCircle} />
                        <div className={styles.pill2} />
                      </div>
                    </div>
                  </div>

                  <img
                    src="https://img.alicdn.com/imgextra/i4/6000000006019/O1CN01nUfuBU1uKl0kF0Y54_!!6000000006019-2-gg_dtc.png"
                    className={styles.bottomIcon}
                    alt="Bottom Icon"
                  />
                </div>

                <div className={styles.hotSalesTag}>
                  <span>女装今日热销榜</span>
                </div> */}
              </div>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                {isMobile
                  ? (
                    <div className={styles.cardTitleSectionMobile}>
                      <div className={styles.productTag}>
                        <img
                          src="https://img.alicdn.com/imgextra/i4/6000000003691/O1CN01j5v75B1d8WyBLAsI9_!!6000000003691-2-gg_dtc.png"
                          className={styles.tagIcon}
                          alt="Product Icon"
                        />
                        <span className={styles.tagText}>{$t("global-1688-ai-app.seller-center.home.McpServer.product", "商品")}</span>
                      </div>
                      <span className={`${styles.cardTitle}`}>{$t("global-1688-ai-app.seller-center.home.McpServer.myoa", "多语言关键词搜索")}</span>
                    </div>
                  )
                  : (
                    <div className={styles.cardTitleSection}>
                      <span className={styles.cardTitle}>{$t("global-1688-ai-app.seller-center.home.McpServer.myoa", "多语言关键词搜索")}</span>
                      <div className={styles.productTag}>
                        <img
                          src="https://img.alicdn.com/imgextra/i4/6000000003691/O1CN01j5v75B1d8WyBLAsI9_!!6000000003691-2-gg_dtc.png"
                          className={styles.tagIcon}
                          alt="Product Icon"
                        />
                        <span className={styles.tagText}>{$t("global-1688-ai-app.seller-center.home.McpServer.product", "商品")}</span>
                      </div>
                    </div>
                  )}
                <span className={`${styles.cardDescription} ${styles.cardMiddle}`}>{$t("global-1688-ai-app.seller-center.home.McpServer.myguyShi", "多语言场景下，提供商品关键词搜索服务")}<br />
                </span>
              </div>
              <div className={styles.searchVisual}>
                <img
                  src="https://img.alicdn.com/imgextra/i4/O1CN01CIxVxB28IpyJG3rQY_!!6000000007910-2-tps-1680-1296.png"
                  className={styles.searchImage}
                />
              </div>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                {isMobile
                  ? (
                    <div className={styles.cardTitleSectionMobile}>
                      <div className={styles.productTag}>
                        <img
                          src="https://img.alicdn.com/imgextra/i4/6000000003691/O1CN01j5v75B1d8WyBLAsI9_!!6000000003691-2-gg_dtc.png"
                          className={styles.tagIcon}
                          alt="Product Icon"
                        />
                        <span className={styles.tagText}>{$t("global-1688-ai-app.seller-center.home.McpServer.product", "商品")}</span>
                      </div>
                      <span className={styles.cardTitle}>{$t("global-1688-ai-app.seller-center.home.McpServer.muchyysx", "多语言商详")}</span>
                    </div>
                  )
                  : (<div className={styles.cardTitleSection}>
                    <span className={styles.cardTitle}>{$t("global-1688-ai-app.seller-center.home.McpServer.muchyysx", "多语言商详")}</span>
                    <div className={styles.productTag}>
                      <img
                        src="https://img.alicdn.com/imgextra/i4/6000000003691/O1CN01j5v75B1d8WyBLAsI9_!!6000000003691-2-gg_dtc.png"
                        className={styles.tagIcon}
                        alt="Product Icon"
                      />
                      <span className={styles.tagText}>{$t("global-1688-ai-app.seller-center.home.McpServer.product", "商品")}</span>
                    </div>
                  </div>)}

                <span className={styles.cardDescription}>{$t("global-1688-ai-app.seller-center.home.McpServer.srhnrtShrtifeonag", "支持多种语向，输入商品id，即可搜索并提取商品详情（含：主副标题、视频、SKU信息、供应商等）")}</span>
              </div>

              <div className={styles.searchVisual}>
                <img src="https://img.alicdn.com/imgextra/i1/O1CN01AzBJtc28MV8ev4Fzq_!!6000000007918-2-tps-1680-1296.png" className={styles.searchImage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default MCPServicePage;

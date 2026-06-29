import React from 'react';
import styles from './index.module.scss';
import { $t } from '@/i18n';
import { MessageBubbleIcon, ShoppingBagIcon } from '@/components/Icon';

interface MCPServicePageProps {
  id?: string;
}

const MCPServicePage: React.FC<MCPServicePageProps> = ({ id }) => {
  return (<div
    className="flex justify-center overflow-x-hidden overflow-y-hidden w-full"
  >
    <div className="flex flex-col items-center justify-center w-[1200px]">

      <p className="flex h-[61px] items-center justify-center gap-1 mt-[164px]">
        <span className={styles.titleCN}>{$t("global-1688-ai-app.seller-center.home.McpServer.tg", "提供")}</span>

        <span className={styles.titleEN}>
          MCP
        </span>

        <span className={styles.titleCN}>{$t("global-1688-ai-app.seller-center.home.McpServer.service", "服务")}</span>
      </p>

      <p className={styles.titleDesc}>{$t("global-1688-ai-app.seller-center.home.McpServer.tscntndyywxmjsFwew", "通过MCP服务，能够即时为Agent接入榜单查询、多语言图搜等外部工具，无需编写复杂接口，显著提升开发效率，快速为你的Agent接入外部工具。")}</p>

      <div className="pt-[74px] pb-[50px] flex gap-3">
        <div className={styles.cardContainer}>
          <div className={styles.cardContent}>

            <div className={styles.titleBox}>
              <span className={styles.cardTitle}>{$t("global-1688-ai-app.seller-center.home.McpServer.pcsh", "商品热搜词")}</span>

              <div className={styles.cardTag}>
                <MessageBubbleIcon />
                <span className={styles.tagText}>{$t("global-1688-ai-app.seller-center.home.McpServer.sj", "商机")}</span>
              </div>
            </div>

            <p className={styles.desc}>{$t("global-1688-ai-app.seller-center.home.McpServer.th6oHaRmenolr8gsot", "提供多纬度的1688商品热搜词推荐，帮助机构能够更好的让独立站用户知道1688大家在选什么，什么最热")}</p>
          </div>


          <div
            className={styles.cardImage}
            style={{ backgroundImage: `url(https://img.alicdn.com/imgextra/i3/O1CN018sqTNb1qCHEEHvWra_!!6000000005459-2-tps-786-606.png)` }}
          />
        </div>


        <div className={styles.cardContainer}>
          <div className={styles.cardContent}>

            <div className={styles.titleBox}>
              <span className={styles.cardTitle}>{$t("global-1688-ai-app.seller-center.home.McpServer.myoa", "多语言关键词搜索")}</span>

              <div
                className={styles.cardTag2}
              >
                <ShoppingBagIcon />
                <span className={styles.tagText2}>{$t("global-1688-ai-app.seller-center.home.McpServer.product", "商品")}</span>
              </div>
            </div>

            <p className={styles.desc}>{$t("global-1688-ai-app.seller-center.home.McpServer.myguyShi", "多语言场景下，提供商品关键词搜索服务")}</p>
          </div>
          <div
            className={styles.cardImage}
            style={{ backgroundImage: `url(https://img.alicdn.com/imgextra/i4/O1CN01nPFU8A1Q69vWKSrQh_!!6000000001926-2-tps-786-578.png)` }}
          />
        </div>


        <div className={styles.cardContainer}>
          <div className={styles.cardContent}>

            <div className={styles.titleBox}>
              <span className={styles.cardTitle}>{$t("global-1688-ai-app.seller-center.home.McpServer.muchyysx", "多语言商详")}</span>

              <div
                className={styles.cardTag2}
              >
                <ShoppingBagIcon />
                <span className={styles.tagText2}>{$t("global-1688-ai-app.seller-center.home.McpServer.product", "商品")}</span>
              </div>
            </div>

            <p className={styles.desc}>{$t("global-1688-ai-app.seller-center.home.McpServer.srhnrtShrtifeonag", "支持多种语向，输入商品ID，即可搜索并提取商品详情（含：主副标题、视频、SKU信息、供应商等）")}</p>
          </div>
          <div
            className={styles.cardImage}
            style={{ backgroundImage: `url(https://img.alicdn.com/imgextra/i2/O1CN01cSUrzr2AMcUEpHHST_!!6000000008189-2-tps-786-606.png)` }}
          />
        </div>
      </div>
    </div>

  </div>);
};

export default MCPServicePage;

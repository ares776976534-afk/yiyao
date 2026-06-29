import React, { useState, useEffect } from 'react';
import ProductCard from './Card';
import styles from './index.module.css';
import httpRequest from '@/services/httpRequest';
import { Scence } from '@/pages/select-product/components/ChatHistory/HistoryList';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { transformRawData } from '@/pages/select-product/components/LeftComponents/UserInputText';
import { appBaseUrl, serviceBaseUrl } from '@/utils/env';
import log, { commonRecord } from '@/utils/log';
import { $t } from '@/i18n';

type TypeShowcaseLogKeys = {
  VIEW?: string;
  SAME?: string;
};

interface ProductCardsLayoutProps {
  id?: string;
  scene?: string;
  showcaseLogKeys?: TypeShowcaseLogKeys;
}

export const sceneMap = {
  [Scence.NEW_PRODUCT_DISCOVERY]: {
    icon: 'https://img.alicdn.com/imgextra/i1/6000000002369/O1CN012sZUvs1TN3Nce0U95_!!6000000002369-2-gg_dtc.png',
    title: $t("global-1688-ai-app.agent-home.DemoList.jaa", "机会新品选品"),
    url: '/select-product',
    makeSimilar: true,
  },
  [Scence.PRODUCT_IMPROVEMENT]: {
    icon: 'https://img.alicdn.com/imgextra/i4/6000000000851/O1CN018PVIuO1I9o9VBHqzJ_!!6000000000851-2-gg_dtc.png',
    title: $t("global-1688-ai-app.agent-home.DemoList.pcp", "商品改进选品发现"),
    url: '/select-product/improve-agent',
    makeSimilar: true,
  },
  [Scence.PLATFORM_MARKET_MIGRATION]: {
    icon: 'https://img.alicdn.com/imgextra/i2/6000000007502/O1CN01IhhBZz25HyNzEU0HI_!!6000000007502-2-gg_dtc.png',
    title: $t("global-1688-ai-app.agent-home.DemoList.ptqyxpfx", "平台迁移选品发现"),
    url: '/select-product/platform-agent',
    makeSimilar: true,
  },
  [Scence.COUNTRY_MARKET_MIGRATION]: {
    icon: 'https://img.alicdn.com/imgextra/i2/6000000006433/O1CN01av0hQx1xOMzYa5l8P_!!6000000006433-2-gg_dtc.png',
    title: $t("global-1688-ai-app.agent-home.DemoList.gjqyxpfx", "国家迁移选品发现"),
    url: '/select-product/country-agent',
    makeSimilar: true,
  },
  [Scence.ALGO]: {
    icon: 'https://img.alicdn.com/imgextra/i4/6000000007770/O1CN01WI3ajC27GiX1hGnZk_!!6000000007770-2-gg_dtc.png',
    title: $t("global-1688-ai-app.agent-home.DemoList.tyxp", "通用选品"),
    url: '/select-product/general-agent',
    makeSimilar: false,
  },
  [Scence.FIND_PROVIDER]: {
    url: '/sourcing',
    showTitle: $t("global-1688-ai-app.agent-home.DemoList.xsAgent", "选商Agent"),
    makeSimilar: true,
  },
  [Scence.CONSULT]: {
    url: '/chat',
    showTitle: $t("global-1688-ai-app.agent-home.DemoList.consultationAgent", "咨询Agent"),
    makeSimilar: true,
  },
  [Scence.INQUIRY]: {
    url: '/inquiry',
    makeSimilar: false,
    showTitle: $t("global-1688-ai-app.agent-home.DemoList.xpAgent", "询盘Agent"),
    hiddenBottom: true,
  },
};

export const getCardsData = async (scene: string) => {
  const res = await httpRequest({
    url: `${serviceBaseUrl}/opp/share/getBestCases`,
    method: 'POST',
    body: JSON.stringify({
      caseScene: scene,
    }),
  });
  return res;
};

const ProductCardsLayout: React.FC<ProductCardsLayoutProps> = ({ id, scene, showcaseLogKeys }) => {
  const [cardsData, setCardsData] = useState<any[]>([]);
  const { navigateByCache } = useChatQuery();
  const handleViewReport = (shareCode: string, url: string) => {
    window.open(`${appBaseUrl}${url}?__share_code__=${shareCode}`, '_blank');
  };

  const handleMakeSimilar = (userRequest: string, url: string) => {
    navigateByCache({ chatInput: userRequest, url: url, isMakeSimilar: true, target: 'blank' });
  };

  useEffect(() => {
    if (scene) {
      getCardsData(scene).then(res => {
        setCardsData((res?.list || []).reduce((acc: any[], item: any, index: number) => {
          if (index % 3 === 0) {
            acc.push([]);
          }
          acc[acc.length - 1].push({
            tagIcon: sceneMap[item.oppScene]?.icon || '',
            tagText: sceneMap[item.oppScene]?.title || '',
            description: item.caseTitle || '',
            isSpecial: true,
            image: item.imgUrl || '',
            shareCode: item.shareCode,
            primaryButton: {
              text: $t("global-1688-ai-app.agent-home.DemoList.viewbg", "查看报告"),
              icon: 'https://img.alicdn.com/imgextra/i1/O1CN01DPkile1TZQ4ulTNqU_!!6000000002396-2-tps-49-49.png',
              onClick: () => {
                if (showcaseLogKeys?.VIEW) {
                  log.record(showcaseLogKeys.VIEW as `/${string}.${string}.${string}`, 'CLK', { share_code: item.shareCode });
                }
                commonRecord(`示例-${sceneMap[item.oppScene]?.title}查看报告`);
                handleViewReport(item.shareCode, sceneMap[item.oppScene]?.url);
              },
            },
            secondaryButton: sceneMap[item.oppScene]?.makeSimilar ? {
              text: $t("global-1688-ai-app.agent-home.DemoList.ztk", "做同款"),
              icon: 'https://img.alicdn.com/imgextra/i1/O1CN01BB2XPS1qdIaxaYXKU_!!6000000005518-2-tps-56-56.png',
              onClick: () => {
                if (showcaseLogKeys?.SAME) {
                  log.record(showcaseLogKeys.SAME as `/${string}.${string}.${string}`, 'CLK', { share_code: item.shareCode });
                }
                commonRecord(`示例-${sceneMap[item.oppScene]?.title}做同款`);
                const userRequest = transformRawData(item.userRequest);
                const chatInput = transformRawData(userRequest?.rawData) || userRequest;
                handleMakeSimilar(chatInput, sceneMap[item.oppScene]?.url);
              },
            } : null,
          });
          return acc;
        }, []) || []);
      });
    }
  }, [scene]);

  return cardsData.length > 0 ? (
    <div id={id} className={styles.container}>
      <div className={styles.header}>
        <img className={styles.headerLine} src="https://img.alicdn.com/imgextra/i2/6000000001487/O1CN01fhvCa31Mr63BYJB9b_!!6000000001487-2-gg_dtc.png" />
        <span className={styles.headerText}>{$t("global-1688-ai-app.agent-home.DemoList.tsjxal", "探索精选案例")}</span>
        <img className={styles.headerLine} src="https://img.alicdn.com/imgextra/i1/6000000007289/O1CN016XPW9i23iQ1Xp511M_!!6000000007289-2-gg_dtc.png" />
      </div>

      {cardsData.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((card, cardIndex) => (
            <ProductCard
              key={`${rowIndex}-${cardIndex}`}
              tagIcon={card.tagIcon}
              tagText={card.tagText}
              description={card.description}
              isSpecial={card.isSpecial}
              primaryButton={card.primaryButton}
              secondaryButton={card.secondaryButton}
              image={card.image}
            />
          ))}
        </div>
      ))}
    </div>
  ) : null;
};

export default ProductCardsLayout;

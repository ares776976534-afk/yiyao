import React from 'react';
import styles from './index.module.scss';
import ExploreSection from '../../ExploreSection';
import ChatInput from '../../ChatInput';
import showTaskLinkModal from '@/components/TaskLinkModel';
import { createLink } from '../index';
import { AgentType } from '../../../enum';
import { BASE_PC_URL } from '../index';
import SelectProductCard from './SelectProductCard';
import { $t } from '@/i18n';

const list = [
  {
    id: '986b6b4f92',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.fqoNivngeevrf", "分析亚马逊清洁机器人的致命差评，智能生成“差评转五星”的改良方案"),
    image: 'https://img.alicdn.com/imgextra/i3/O1CN014Lx4XV1DULqO8D485_!!6000000000219-2-tps-3024-2268.png',
  },
  {
    id: '30339c1cb0',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.ywyhkm", "有哪些户外玩具产品在亚马逊卖的很火但Tiktok还没人卖？"),
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01dJwOwV1YRhTypwvy1_!!6000000003056-2-tps-3024-2268.png',
  },
  {
    id: 'ffb2ed50c5',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.cjwyhNr", "宠物赛道“内卷”血海？AI为你定位下一个高利润潜力新品"),
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01XDghit1tsMT9tknQN_!!6000000005957-2-tps-3024-2268.png',
  },
  {
    id: '22d7f75950',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.sjrlaut", "上架电脑支架新品？先看美亚数据报告"),
    image: 'https://img.alicdn.com/imgextra/i2/O1CN01ynmHA6215pQTIyNmf_!!6000000006934-2-tps-3024-2268.png',
  },
  {
    id: '2c754e5de1',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.haoiflg", "高销量低评分的厨房小工具，如何改进？"),
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01raMAWW1GTqFbNRJCu_!!6000000000624-2-tps-3024-2268.png',
  },
  {
    id: 'eee44b9278',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.yefgaazgl", "一键分析美国瑜伽裤新品机会，不再错过下一个“Lululemon”！"),
    image: 'https://img.alicdn.com/imgextra/i1/O1CN015l52rs29sqk6ShWXc_!!6000000008124-2-tps-3024-2268.png',
  },
];

interface TypeCardItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  link: string;
}

const cardItems: TypeCardItem[] = [
  {
    id: 'opportunity',
    icon: 'https://img.alicdn.com/imgextra/i2/6000000005509/O1CN012aFAZd1qZB1i2cGYY_!!6000000005509-2-gg_dtc.png',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.jaa", "机会新品选品"),
    description: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.jzkjucdei", "基于Amazon、TikTok亿级商品，秒级对比百款新品"),
    link: '/mobile/insight/execute/product',
  },
  {
    id: 'improvement',
    icon: 'https://img.alicdn.com/imgextra/i3/6000000004007/O1CN01mYfYII1fTG8TSRFiW_!!6000000004007-2-gg_dtc.png',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.pcp", "商品改进选品发现"),
    description: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.Axvnua", "AI精准分析海量评价、智能输出解决方案"),
    link: '/select-product/improve-agent',
  },
  {
    id: 'platform-migration',
    icon: 'https://img.alicdn.com/imgextra/i3/6000000001083/O1CN01jWV4O71Js42VVr9wD_!!6000000001083-2-gg_dtc.png',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.ptqyxpfx", "平台迁移选品发现"),
    description: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.uekuulw", "动态识别同款商品在多平台流向 ，提早把握机会"),
    link: '/select-product/platform-agent',
  },
  {
    id: 'country-migration',
    icon: 'https://img.alicdn.com/imgextra/i2/6000000004083/O1CN01pYVayo1g24EjhMX3w_!!6000000004083-2-gg_dtc.png',
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.gjqyxpfx", "国家迁移选品发现"),
    description: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.drtNc", "洞悉全球商品流动，抢占新兴市场"),
    link: '/select-product/country-agent',
  },
];

const SelectProduct: React.FC = () => {
  const handleCardClick = (link: string, id: string) => {
    if (id === 'opportunity') {
      location.href = link;
    } else {
      const handler = showTaskLinkModal({
        onClose: () => {
          handler.close();
        },
        url: `${BASE_PC_URL}${link}`,
      });
    }
    
 
  };

  return (
    <div className={styles.selectProduct}>
      <ChatInput
        placeholder={$t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.qtlfI", "请输入您关注的细分市场选品问题")}
        onSubmit={(value) => {
          createLink(AgentType.SELECT_PRODUCT, value).then(link => {
            const handler = showTaskLinkModal({
              onClose: () => {
                handler.close();
              },
              url: link,
            });
          });
        }}
      />
      <div className={styles.cardList}>
        {cardItems.map((item) => (
          <div
            key={item.id}
            className={styles.card}
            onClick={() => handleCardClick(item.link, item.id)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <img src={item.icon} alt={item.title} />
              </div>
              <div className={styles.cardTitle}>{item.title}</div>
            </div>

            <div className={styles.cardContent}>

              <div className={styles.cardDescription}>{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.exploreSectionContainer}>
        <ExploreSection title={$t("global-1688-ai-app.mobile-agent-home.Agents.SelectProduct.tsjxal", "探索精选案例")} />
        <div className={styles.selectSellerCardList}>
          {list.map(item => {
            return (
              <SelectProductCard
                onClick={() => {
                  location.href = `/mobile/insight?__share_code__=${item.id}`;
                }}
                key={item.id}
                data={item}
              />
            );
          })}
        </div>
        {/* <ExploreSection title="到底了" /> */}
      </div>
    </div>
  );
};

export default SelectProduct;

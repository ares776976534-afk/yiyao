import React from 'react';
import Arrow from '@/components/Icon/Arrow';
import styles from '../ReqComponent/index.module.css';
import { $t } from '@/i18n';
import { appVersionType, AppVersionType } from '@/utils/env';

const isGlobal = appVersionType === AppVersionType.GLOBAL;

const ExamplesSection: React.FC<{ onClick: (example: any) => void }> = ({ onClick }) => {
  const style = isGlobal ? { fontFamily: 'Poppins' } : {};
  const examples = [
    {
      text: $t("global-1688-ai-app.select-product.general-agent.ExamplesSection.wombdwsYxz", "我关注的是亚马逊日本。我想开发【電動歯ブラシ】，先帮我看看这个市场过去一年的需求趋势是怎样的？"),
    },
    {
      text: $t("global-1688-ai-app.select-product.general-agent.ExamplesSection.womulSgnl0ndumj", "我关注的是亚马逊美国。在厨房小工具里，月销量>300，评分值<3.7的商品里有没有可以改进的方向？"),
    },
    {
      text: $t("global-1688-ai-app.select-product.general-agent.ExamplesSection.wogoulyGr1yoRm", "我关注的是泰国TikTok。美妆工具里有没有卖得好、价格在100泰株以内的商品推荐？"),
    },
    {
      text: $t("global-1688-ai-app.select-product.general-agent.ExamplesSection.womulclxl", "我关注的是亚马逊美国。在自动宠物喂食器里还有哪些细分市场是蓝海？"),
    },
  ];
  return (
    <div className={styles.examplesSection}>
      {examples.map((example) => (
        <div className={styles.exampleCard} onClick={() => onClick(example)} key={example.text}>
          <span className={styles.exampleText} style={style}>{example.text}</span>
          <Arrow color="#BBBDCA" />
        </div>
      ))}
    </div>
  );
};

export default ExamplesSection;
import { useEffect, useState } from 'react';
import styles from './headerCarouselCard.module.css';
import CarouselCard from '@/components/ChatFlow/CarouselCard';
import { $t } from '@/i18n';
import log from '@/utils/log';

const typeMap = {
  product: $t("global-1688-ai-app.select-product.RightComponents.HeaderCarouselCard.nrj", "新品机会分"),
  improve: $t("global-1688-ai-app.select-product.RightComponents.HeaderCarouselCard.gjjhf", "改进机会分"),
  platform: $t("global-1688-ai-app.select-product.RightComponents.HeaderCarouselCard.scqyjhf", "市场迁移机会分"),
};

interface HeaderCarouselCardProps {
  keywordList?: any[];
  defaultShowKeyword?: string;
  onActionClick?: (type: string, data: any) => void;
  setTabHistory?: any;
  defaultActiveIndex?: number;
  type?: string;
  logKey?: `/${string}.${string}.${string}`;
}

export const HeaderCarouselCard = (props: HeaderCarouselCardProps) => {
  const { keywordList = [], defaultShowKeyword = '', onActionClick = () => {}, setTabHistory, defaultActiveIndex = 0, type = 'product', logKey } = props;
  const [tabList, setTabList] = useState<any[]>([]);
   useEffect(() => {
    const tabData = keywordList?.map((item) => {
      return {
        ...item,
        contentTitle: typeMap[type],
        radar: item?.radar?.propertyList || [],
        radarDescription: item?.radar?.radarDescription,
      };
    }) || [];

    setTabHistory(defaultActiveIndex, props);

    setTabList(tabData);
  }, [keywordList, defaultActiveIndex]);
  const onClick = (index) => {
    const keyword = keywordList[index]?.keyword;
    if (keyword) {
      // 埋点：切换关键词
      if (logKey) {
        log.record(logKey, 'CLK', {
          keyword,
          index,
          type,
        });
      }
      onActionClick('SWICH_KEYWORD', {
        keywordList,
        keyword,
        index,
        type,
      });
    }
  };
  return (
    <div className={styles.keywordCard}>
      <div className={styles.keywordListTitle}>{$t("global-1688-ai-app.select-product.RightComponents.HeaderCarouselCard.ydhgo", `以下为「${defaultShowKeyword}」相关度从高到低${keywordList?.length}个关键词：`, [defaultShowKeyword, keywordList?.length])}</div>
      <CarouselCard
        list={tabList}
        defaultActiveIndex={defaultActiveIndex}
        onClick={onClick}
      />
    </div>
  );
};
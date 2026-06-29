import { useEffect, useMemo, useRef } from 'react';
import { Card } from './components/Card';
import { Header } from './components/Header';
import styles from './index.module.css';
import SupplierRecommendation from './components/SupplierRecommendation';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

export interface TypeQwenOfferCard {
  categoryNamePath: string;
  currency: string;
  imageUrl: string;
  oppScore: string;
  platform: string;
  productId: string;
  productUrl: string;
  region: string;
  reviewInfo: {
    ratingCnt: number;
    ratingScore: string;
    reviewLabel: any[]
  }
  sameStyleItemCnt: string;
  sameStylePrice: string;
  sold30d: string;
  spId: string;
  spLaunchTime: string;
  title: string;
  keywordLevel: string;
  sellingPrice: string;
  providerInfoList: any[];
  oppScoreValueLevel: string;
  radarVO: {
    propertyList: any[];
    radarDescription: string;
  }

}

const QwenOfferCard = ({ data }) => {
  const productList = useMemo(() => JSON.parse(data)?.productList, [data]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const exposedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!productList?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.getAttribute('data-index'));
          const item = productList[index];
          if (!item) return;
          const id = item?.productId || item?.spId || String(index);
          if (!exposedIdsRef.current.has(id)) {
            exposedIdsRef.current.add(id);
            log.record(LOG_KEYS.GENERAL_AGENT.LP.REPORT_ITEMCARD, 'EXP', {
              productId: item?.productId || item?.spId || '',
              title: item?.title || '',
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => {
      observer.disconnect();
      cardRefs.current = [];
    };
  }, [productList]);

  return (
    <div className={styles.container}>
      {productList.map((item, index) => (
        <div
          key={index}
          className={styles.cardWrapper}
          ref={(el) => { cardRefs.current[index] = el; }}
          data-index={index}
        >
          <Card>
            <Header {...item} />
            <div className={styles.divider} />
            <SupplierRecommendation {...item} />
          </Card>
        </div>
      ))}
    </div>
  );
};

export default QwenOfferCard;

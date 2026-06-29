import React, { useEffect, useRef } from 'react';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import log, { commonRecord } from '@/utils/log';
import styles from './index.module.css';

interface CardItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  link?: string;
  key: string;
  isHot?: boolean;
  logKey?: string;
}

interface CardsProps {
  cards: CardItem[];
  onCardClick?: (id: string) => void;
  containerStyle?: React.CSSProperties;
}

const Cards: React.FC<CardsProps> = ({ cards, containerStyle }) => {
  const navigate = useNavigateWithScroll();
  const hasExposed = useRef(false);
  const clickingRef = useRef<string | null>(null);

  useEffect(() => {
    if (hasExposed.current) return;
    hasExposed.current = true;
    cards.forEach((card) => {
      if (card.logKey) {
        log.record(card.logKey as `/${string}.${string}.${string}`, 'EXP');
      }
    });
  }, [cards]);

  const handleCardClick = (id: string) => {
    if (clickingRef.current === id) return;
    clickingRef.current = id;
    setTimeout(() => { clickingRef.current = null; }, 500);

    const card = cards.find((item) => item.id === id);
    if (card?.link) {
      if (card.logKey) {
        log.record(card.logKey as `/${string}.${string}.${string}`, 'CLK');
      }
      commonRecord(`${card?.key}卡片点击`);
      navigate(card.link);
    }
  };

  return (
    <div className={styles.cards} style={containerStyle}>
      {cards.map((card) => (
        <div
          key={card.id}
          className={styles.card}
          onClick={() => handleCardClick(card.id)}
        >
          <div className={styles.cardHeader}>
            <img
              className={styles.cardIcon}
              src={card.icon}
              alt=""
            />
            <span className={styles.cardTitle}>{card.title}</span>
            {card.isHot && (
              <img
                className={styles.opportunityBadge}
                src="https://img.alicdn.com/imgextra/i1/O1CN01f98VS91s3h2J4MAni_!!6000000005711-2-tps-152-56.png"
                alt=""
              />
            )}
          </div>
          <span className={styles.cardDescription}>{card.description}</span>
        </div>
      ))}
    </div>
  );
};

export default Cards;

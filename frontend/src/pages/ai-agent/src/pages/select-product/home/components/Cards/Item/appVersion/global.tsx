import styles from '../../index.module.css';
import stylesGlobal from './global.module.css';

interface TypeCardItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  link?: string;
  key: string;
}

interface TypeCnProps {
  card: TypeCardItem;
  handleCardClick: (id: string) => void;
}

const Global = ({ card, handleCardClick }: TypeCnProps) => {
  return (
    <div
      key={card.id}
      className={styles.card}
      onClick={() => handleCardClick(card.id)}
    >
      <div className={stylesGlobal.itemWrapper}>
        <div className={stylesGlobal.cardIconWrapper}>
          <img
            className={styles.cardIcon}
            src={card.icon}
            alt=""
          />
          {card.id === 'opportunity' && (
            <img
              className={styles.opportunityBadge}
              src="https://img.alicdn.com/imgextra/i1/O1CN01f98VS91s3h2J4MAni_!!6000000005711-2-tps-152-56.png"
              alt=""
            />
          )}
        </div>
        <span className={stylesGlobal.itemTitle}>{card.title}</span>
      </div>
      <span className={stylesGlobal.itemDescription}>{card.description}</span>
    </div>
  );
};

export default Global;
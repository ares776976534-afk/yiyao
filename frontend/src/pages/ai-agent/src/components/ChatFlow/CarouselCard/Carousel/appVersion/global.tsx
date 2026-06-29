import { Carousel } from 'antd';
import style from '../../index.module.css';
import styles from './global.module.css';

interface GlobalProps {
  children: React.ReactNode;
  carouselRef: React.RefObject<any>;
  slidesToShow: number;
}

const Global = ({ children, carouselRef, slidesToShow }: GlobalProps) => {
  return (
    <Carousel
      ref={carouselRef}
      className={`${style.carousel} ${styles.carouselGlobal}`}
      id="carousel-card-wrapper"
      arrows
      infinite={false}
      speed={500}
      dots={false}
      slidesToShow={slidesToShow}
      slidesToScroll={1}
      variableWidth
    >
      {children}
    </Carousel>
  );
};

export default Global;
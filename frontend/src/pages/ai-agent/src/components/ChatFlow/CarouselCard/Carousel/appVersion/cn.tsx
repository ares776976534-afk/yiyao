import { Carousel } from 'antd';
import style from '../../index.module.css';
import styles from './cn.module.css';

interface CnProps {
  children: React.ReactNode;
  carouselRef: React.RefObject<any>;
  slidesToShow: number;
}
const Cn = ({ children, carouselRef, slidesToShow }: CnProps) => {
  return (
    <Carousel
      ref={carouselRef}
      className={`${style.carousel} ${styles.carouselCn}`}
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

export default Cn;
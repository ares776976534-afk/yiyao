import { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import TabCard from '@/components/ChatFlow/TabCard';
import { useChatHistory } from '@/pages/select-product/components/ChatHistory/useChatHistory';
import { $t } from '@/i18n';
import Carousel from './Carousel';

const CarouselCard = ({
  list = [],
  // slidesToShow = 4,
  defaultActiveIndex,
  onClick
}: {
  list?: any[]; slidesToShow?: number;
  defaultActiveIndex?: number;
  onClick?: (index: number) => void;
  active?: number;
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const carouselRef = useRef<any>(null);
  const { shareCode } = useChatHistory();
  const [slidesToShow, setSlidesToShow] = useState<number>(4);
  const handleClick = (index: number) => {
    if (shareCode) {
      message.info($t("global-1688-ai-app.ChatFlow.CarouselCard.sboKr", "分享不支持切换关键词"));
      return;
    }
    onClick?.(index);
  };

  const setSlidesToShowFn = () => {
    const _width = document.getElementById('carousel-card-wrapper')?.offsetWidth;
    if (_width) {
      // 向上取整，因为卡片宽度是252px，所以需要向上取整
      setSlidesToShow(Math.floor(_width / 252));
    }
  }

  useEffect(() => {
    if (defaultActiveIndex !== undefined && defaultActiveIndex !== null) {
      setActiveIndex(defaultActiveIndex);

      // 滚动到对应的卡片位置，让目标卡片显示在最左边第二个位置
      setTimeout(() => {
        if (carouselRef.current && list.length > 0) {
          // 计算最大可滚动位置（确保最后一个卡片在最右侧时不再滚动）
          const maxScrollPosition = Math.max(0, list.length - slidesToShow);
          // 计算目标滚动位置
          const targetSlide = Math.min(
            Math.max(0, defaultActiveIndex - 2),
            maxScrollPosition
          );
          carouselRef.current.goTo(targetSlide);
        }
      }, 100);
    }
  }, [defaultActiveIndex, slidesToShow, list.length]);


  useEffect(() => {
    window.addEventListener('resize', setSlidesToShowFn);
    setTimeout(() => {
      setSlidesToShowFn();
    }, 500);
    return () => {
      window.removeEventListener('resize', setSlidesToShowFn);
    };
  }, []);
  return (
    <Carousel
      carouselRef={carouselRef}
      slidesToShow={slidesToShow}
    >
      {list?.map((item, index) => (
        <div key={item?.keyword}>
          <TabCard
            index={index}
            item={item}
            handleClick={handleClick}
            activeIndex={activeIndex}
          />
        </div>
      ))}
    </Carousel>
  );
};

export default CarouselCard;
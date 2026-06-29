import { useWindowWidth } from '@/components/ChatFlow/UICarousel/useWindowWidth';

export const windowWidth = () => {
  const windowWidth = useWindowWidth();
  const containerWidth = Math.max(0, windowWidth - 552);
  return containerWidth;
}
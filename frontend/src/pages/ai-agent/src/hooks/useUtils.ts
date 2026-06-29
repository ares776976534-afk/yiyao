import { useSearchParams } from 'ice';

export const useFullScreen = () => {
  const [searchParams] = useSearchParams();
  return searchParams.get('__full_screen__') === 'true';
};

export const useSourceFrom = () => {
  const [searchParams] = useSearchParams();
  return searchParams.get('__from__') || 1;
};
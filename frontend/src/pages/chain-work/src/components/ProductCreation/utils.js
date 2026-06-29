export const judgeIsFirst = () => {
  const isFirstParam =
      new URLSearchParams(location.search).get('isfirst') || new URLSearchParams(location.search).get('_hex_isfirst');
  return isFirstParam === '1';
};

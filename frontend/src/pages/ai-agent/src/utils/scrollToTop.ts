export default (el?: any) => {
  console.log('scrollToTop');
  (el || window).scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};
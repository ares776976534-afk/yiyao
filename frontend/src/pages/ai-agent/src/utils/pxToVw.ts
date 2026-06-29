export default (px: number, designWidth: number = 1500) => {
  return px / designWidth * 100 + 'vw';
}
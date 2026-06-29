// 给菜鸟的独立页面

// import APP from '../AeOrder';

// export default APP;

// 获取当前页面URL
const params = new URLSearchParams(location.search);

console.log('test2')

if (params.toString() !== '') {
  window.location.href = `https://work.1688.com/?${params}&_path_=gonghuotuoguan/cross_boarder_2/ae_order`;
} else {
  window.location.href = 'https://work.1688.com/?_path_=gonghuotuoguan/cross_boarder_2/ae_order';
}

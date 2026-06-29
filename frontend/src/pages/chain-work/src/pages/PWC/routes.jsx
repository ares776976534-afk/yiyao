import Home from './pages/Home';
import SendSampleDetail from './pages/SendSampleDetail';

export default [
  {
    path: '/sendSampleDetail',
    component: SendSampleDetail,
    pageConfig: {
      title: '寄样详情',
    },
  },
  {
    path: '/',
    component: Home,
    pageConfig: {
      title: '件重尺测量',
    },
  },
];

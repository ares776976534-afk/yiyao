/**
 * 国内供应链 - Domestic Supply Chain
 */
import { runApp } from 'ice';
import moment from 'moment';
import routes from './routes';

moment.locale('zh-cn');

const appConfig = {
  app: {
    rootId: 'ice-container',
  },
  router: {
    type: 'hash',
    routes,
  },
};

runApp(appConfig);

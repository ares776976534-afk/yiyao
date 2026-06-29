/**
 * 件重尺 - Piece Weight Cube
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
    basename: '/pwc',
    routes,
  },
};

runApp(appConfig);

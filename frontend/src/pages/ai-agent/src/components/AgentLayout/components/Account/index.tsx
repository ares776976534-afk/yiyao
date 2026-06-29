import CNLogin from './appVersion/cn';
import GlobalLogin from './appVersion/global';
import { getVersionComponent } from '@/utils/versionRouter';

export default getVersionComponent({
  CN: CNLogin,
  GLOBAL: GlobalLogin,
});

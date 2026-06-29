import cn from './appVersion/cn';
import global from './appVersion/global';
import { getVersionComponent } from '@/utils/versionRouter';

export default getVersionComponent({
  CN: cn,
  GLOBAL: global,
});
import { Cn, Global } from './appVersion';
import { getVersionComponent } from '@/utils/versionRouter';

export default getVersionComponent({
  CN: Cn,
  GLOBAL: Global,
});
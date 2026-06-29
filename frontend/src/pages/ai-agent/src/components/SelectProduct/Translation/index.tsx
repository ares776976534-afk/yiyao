import cn from './appVersion/cn';
import global from './appVersion/global';
import { getVersionComponent } from '@/utils/versionRouter';

export type { TypeTranslationProps } from './appVersion/global';

export default getVersionComponent({
  CN: cn,
  GLOBAL: global,
});
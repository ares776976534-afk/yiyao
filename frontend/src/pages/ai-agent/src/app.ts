import { defineAppConfig } from 'ice';
import type { Manifest } from '@ice/plugin-pha/types';
import { defineSpmConfig } from '@ali/ice-plugin-spm/types';
import { initI18n } from '@/i18n';

initI18n();
// App config, see https://ice3.alibaba-inc.com/v3/docs/guide/basic/app
export default defineAppConfig(() => ({
  router: {
    basename: '/',
  },
}));

export const spmConfig = defineSpmConfig(() => {
  return {
    spmA: 'a263az',
  };
});

export const phaManifest: Manifest = {
  routes: [],
};
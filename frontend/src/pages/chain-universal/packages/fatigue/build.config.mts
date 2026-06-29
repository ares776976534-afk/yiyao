import { defineConfig } from '@ice/pkg';
import pkg from './package.json';

export default defineConfig({
  plugins: [
    [
      '@ice/pkg-plugin-docusaurus',
      {
        title: `${pkg.name}（${pkg.version}）`,
        remarkPlugins: [
          "require('@ice/remark-react-docgen-docusaurus')",
        ],
        baseUrl: `/${pkg.name}@${pkg.version}/build/`
      },
    ],
  ],
});
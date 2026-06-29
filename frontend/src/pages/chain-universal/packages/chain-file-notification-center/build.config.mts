import { defineConfig } from '@ice/pkg';
import pkg from './package.json';
export default defineConfig({
  plugins: [
    [
      '@ice/pkg-plugin-docusaurus',
      {
        remarkPlugins: [
          "require('@ice/remark-react-docgen-docusaurus')",
        ],
        baseUrl: `/${pkg.name}@${pkg.version}/build/`
      },
    ],
  ]
});
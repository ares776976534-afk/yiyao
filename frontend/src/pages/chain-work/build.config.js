const { default: CloudbuildWebpackPlugin } = require('@ali/cloudbuild-webpack-plugin');

const cacheConfig = (config) => {
  config.name('web');
  config.cache = {
    type: 'filesystem',
    compression: 'gzip',
    buildDependencies: {
      config: [__filename], // 如果有其他配置文件,也可以添加到该数组中
    },
  };
};

const cloudbuildPlugin = (config) => {
  config.plugin('analyse').use(CloudbuildWebpackPlugin);
};

module.exports = {
  mpa: true,
  vite: false,
  vendor: false,
  minify: {
    type: 'esbuild',
    // 指定 esbuild 压缩选项：https://github.com/privatenumber/esbuild-loader#minifyplugin
    options: {
      target: 'esnext',
    },
  },

  plugins: [
    [
      'build-plugin-moment-locales',
      {
        locales: ['zh-cn'],
      },
    ],
    [
      'build-plugin-ignore-style',
      {
        libraryName: '@alifd/next',
      },
    ],
    '@ali/build-plugin-ice-spm',
    '@ali/build-plugin-ice-def',
    ({ onGetWebpackConfig }) => {
      onGetWebpackConfig((config) => {
        config.module
          .rule('css')
          .use('postcss-loader')
          .loader(require.resolve('postcss-loader'))
          .tap(() => {
            return {
              implementation: require('postcss'),
            };
          });
      });
    },
    ({ onGetWebpackConfig }) => {
      onGetWebpackConfig('web', cacheConfig);
    },
    ({ onGetWebpackConfig }) => {
      onGetWebpackConfig('web', cloudbuildPlugin);
    },
  ],
};

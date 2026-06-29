import { defineConfig } from '@ice/app';
import def from '@ali/ice-plugin-def';
// import pha from '@ice/plugin-pha';
import spm from '@ali/ice-plugin-spm';
// import webapp from '@ali/ice-plugin-webapp';
// import routes from './routes';

// The project config, see https://ice3.alibaba-inc.com/v3/docs/guide/basic/config
const minify = process.env.NODE_ENV === 'production' ? 'swc' : false;

export default defineConfig(() => ({
  // Set your configs here.
  publicPath: '/',
  minify,
  // 完全关闭SSR，避免服务端渲染时访问浏览器API的问题
  // server: {
  //   onDemand: true,
  //   format: 'esm',
  // },
  // ssg进行服务端渲染
  ssg: false,
  plugins: [
    def(),
    // pha(), // 暂时禁用PHA插件以避免构建错误
    spm(),
    // webapp(), // 发布webapp页面会根据defineRoutes中配置的路由生成正确的html文件，不会出现a.html.html的情况
  ],
  polyfill: 'usage',
  // compileDependencies: true,
  codeSplitting: 'page', // 代码分包
  routes: {
    ignoreFiles: [
      '**/components/**', // 如果每个页面下有 components 目录存放当前页面的组件，可以通过添加此配置忽略被解析成路由组件
    ],
    defineRoutes: (route) => {
      route('/', 'agent-home/index.tsx');
      route('/app/home', 'agent-home/index.tsx');
      route('/app/about-us', 'about-us/index.tsx');
      route('/app/insight', 'insight/index.tsx');
      route('/app/sourcing', 'sourcing/index.tsx');
      route('/app/design', 'design/index.tsx');
      route('/app/inquiry', 'inquiry/index.tsx');
      route('/app/chat', 'chat/index.tsx');
      route('/app/mobile/home', 'mobile/home/index.tsx');
      route('/app/mobile/insight', 'mobile/insight/index.tsx');
      route('/app/mobile/sourcing', 'mobile/sourcing/index.tsx');
      route('/app/mobile/inquiry', 'mobile/inquiry/index.tsx');
      route('/app/mobile/chat', 'mobile/chat/index.tsx');
      route('/app/mobile-agent-home', 'mobile/home/index.tsx');
      route('/mobile-agent-home', 'mobile/home/index.tsx');
      route('/app/seller-center/home', 'seller-center/home/index.tsx');
      route('/app/personalized-settings', 'personalized-settings/index.tsx');
      route('/kapp/1688-global/ai-agent/studio', 'studio/index.tsx');
      route('/kapp/1688-global/ai-agent/studio/od', 'studio/od/index.tsx');
    },
    // config: routes, // 自定义路由
  },
  proxy: {
    '/ai/alpha-shop/chat/stream/mock': {
      target: "https://pre-aiapp.alibaba-inc.com",
      changeOrigin: true,
    },
  },
  webpack: (webpackConfig: any) => {
    if (typeof webpackConfig.devServer?.client === 'object') {
      // 修改 webpack 配置
      webpackConfig.devServer.client.overlay = false;
    }

    webpackConfig.module.rules.push({
      test: /\.node$/,
      use: 'null-loader',
    });
     // 生产环境
    if (process.env.NODE_ENV === 'production') {
      // 禁用 source map
      webpackConfig.devtool = false;
    }
    return webpackConfig;
  },
}));

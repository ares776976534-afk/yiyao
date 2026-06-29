import React, { useRef, useEffect, createContext, useContext, useState } from 'react';
import { definePageConfig } from 'ice';
import Layout from './components/Layout';
import SimpleNote from './components/SimpleNote';
import AgentNote from './components/AgentNote';
import CustomVoice from './components/CustomVoice';
import ReactFullpage from '@fullpage/react-fullpage';
import 'fullpage.js/dist/fullpage.min.css';
import ApiServer from './components/APIServer';

import { $t } from '@/i18n';
import NextPageBtn from './components/NextPageBtn';
import DemoList from './components/DemoList';
import McpServer from './components/McpServer';
import Footer from './components/Layout/Footer';
import BottomMask from './components/BottomMask';

let scrollTimeout: any = null;

export const FullpageApiContext = createContext<any>(null);

export const useFullpageApi = () => {
  return useContext(FullpageApiContext);
};

const Home = () => {
  const fullpageApiRef = useRef<any>(null);
  const [fullpageApi, setFullpageApi] = useState<any>(null);
  const hasSetApiRef = useRef(false);
  const [hiddenHeader, setHiddenHeader] = useState(false);

  useEffect(() => {
    const removeFullPageLink = () => {
      const selectors = [
        'a[href*="fullPage"]',
        'a[href*="alvarotrigo.com/fullPage"]',
        'a[data-spm-anchor-id*="seller-center-home"]',
        '.fp-watermark',
      ];

      selectors.forEach((selector) => {
        const links = document.querySelectorAll(selector);
        links.forEach((link) => {
          const text = link.textContent || '';
          if (text.includes('Made with') || text.includes('fullPage')) {
            link.remove();
          }
        });
      });
    };

    // 覆盖 fullPage.js 导航点的内联样式
    const overrideNavStyles = () => {
      // 检查导航点是否存在
      const navContainer = document.querySelector('#fp-nav');
      if (!navContainer) {
        return false; // 导航点还未创建
      }

      // 覆盖激活状态的导航点样式
      const activeSpans = document.querySelectorAll('#fp-nav ul li a.active span, .fp-slidesNav ul li a.active span');
      activeSpans.forEach((span) => {
        const element = span as HTMLElement;
        element.style.backgroundColor = '#ad9cff';
        element.style.width = '14px';
        element.style.height = '14px';
        element.style.border = '7px solid #ece8ff';
        element.style.borderRadius = '50%';
        element.style.boxSizing = 'content-box';
        element.style.position = 'absolute';
        element.style.top = '50%';
        element.style.left = '50%';
        element.style.transform = 'translate(-50%, -50%)';
        element.style.margin = '0';
        element.style.boxShadow = '0 0 10px 0 rgba(236, 232, 255, 0.5)';
        element.style.minWidth = '14px';
        element.style.minHeight = '14px';
        element.style.maxWidth = '14px';
        element.style.maxHeight = '14px';
      });

      // 覆盖非激活状态的导航点样式
      const inactiveSpans = document.querySelectorAll('#fp-nav ul li a:not(.active) span, .fp-slidesNav ul li a:not(.active) span');
      inactiveSpans.forEach((span) => {
        const element = span as HTMLElement;
        element.style.width = '10px';
        element.style.height = '10px';
        element.style.borderRadius = '50%';
        element.style.backgroundColor = '#d8d8d8';
        element.style.border = 'none';
        element.style.position = 'absolute';
        element.style.top = '50%';
        element.style.left = '50%';
        element.style.transform = 'translate(-50%, -50%)';
        element.style.margin = '0';
        element.style.minWidth = '10px';
        element.style.minHeight = '10px';
        element.style.maxWidth = '10px';
        element.style.maxHeight = '10px';
        element.style.boxShadow = 'none';
      });

      // 覆盖所有导航点的链接容器样式，确保对齐
      const allLinks = document.querySelectorAll('#fp-nav ul li a, .fp-slidesNav ul li a');
      allLinks.forEach((link) => {
        const element = link as HTMLElement;
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.width = '26px';
        element.style.height = '26px';
        element.style.position = 'relative';
        element.style.margin = '0 auto';
      });

      // 覆盖导航点列表项的间距，确保32px间距生效
      const allListItems = document.querySelectorAll('#fp-nav ul li, .fp-slidesNav ul li');
      allListItems.forEach((li) => {
        const element = li as HTMLElement;
        element.style.margin = '32px 0';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.position = 'relative';
      });

      return true; // 样式已应用
    };

    // 使用 requestAnimationFrame 确保在下一帧应用样式
    const applyStylesWithRetry = (retries = 10) => {
      const applied = overrideNavStyles();
      if (!applied && retries > 0) {
        requestAnimationFrame(() => {
          applyStylesWithRetry(retries - 1);
        });
      }
    };

    removeFullPageLink();
    // 立即尝试应用样式，如果导航点还未创建则重试
    applyStylesWithRetry();

    const observer = new MutationObserver(() => {
      removeFullPageLink();
      // 使用 requestAnimationFrame 确保在 DOM 更新后应用样式
      requestAnimationFrame(() => {
        overrideNavStyles();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    // 监听页面加载和 section 切换事件
    const handleSectionChange = () => {
      requestAnimationFrame(() => {
        overrideNavStyles();
      });
    };

    window.addEventListener('load', handleSectionChange);
    document.addEventListener('DOMContentLoaded', handleSectionChange);

    // 使用 setInterval 定期检查并应用样式（作为兜底方案）
    const intervalId = setInterval(() => {
      overrideNavStyles();
    }, 200);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      window.removeEventListener('load', handleSectionChange);
      document.removeEventListener('DOMContentLoaded', handleSectionChange);
    };
  }, []);

  const handleNextPage = () => {
    if (fullpageApiRef.current) {
      fullpageApiRef.current.moveSectionDown();
    }
  };

  // 每页的背景图片配置
  const sectionBackgrounds = [
    '', // 第一屏 - 欢迎页
    // 第二屏 - Agent 核心功能
    'https://img.alicdn.com/imgextra/i1/O1CN01t1luqM1edxmSXqPuF_!!6000000003895-2-tps-2280-1170.png',
    // 第三屏 - 用户案例展示
    'https://img.alicdn.com/imgextra/i2/O1CN01QLHyw81tZaELvaj12_!!6000000005916-2-tps-4560-2340.png',
    // 第四屏 - 品牌客户声音
    'https://img.alicdn.com/imgextra/i2/O1CN01AMZPAh1xajgmlau3b_!!6000000006460-2-tps-2280-1170.png',
    // 第五屏 - API
    '',
    // 'https://img.alicdn.com/imgextra/i3/O1CN01V7ydD71CU3ygtWU1q_!!6000000000083-2-tps-2280-1268.png',
    // 第六屏 - MCP Server
    'https://img.alicdn.com/imgextra/i3/O1CN01V7ydD71CU3ygtWU1q_!!6000000000083-2-tps-2280-1268.png', // 第六屏 - MCP Server
  ];

  // 每页的背景色配置
  const sectionBackgroundColors = [
    'linear-gradient(180deg, #F5F3FD 8%, #FEFEFF 13%, #F5F2FD 71%, #F6F2FF 90%)',
    undefined, // 第二屏
    undefined, // 第三屏
    undefined, // 第四屏
    undefined, // 第五屏
    undefined, // 第六屏
  ];

  const getSectionStyle = (bgImage: string, backgroundColor?: string) => {
    const isGradient = backgroundColor?.includes('gradient');
    const style: React.CSSProperties = {
      width: '100%',
      height: '100%',
      minHeight: '100vh',
    };

    if (bgImage) {
      style.backgroundImage = `url(${bgImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center center';
      style.backgroundRepeat = 'no-repeat';
    }

    if (backgroundColor) {
      if (isGradient) {
        // 渐变使用 background 属性
        style.background = backgroundColor;
      } else {
        // 纯色使用 backgroundColor 属性
        style.backgroundColor = backgroundColor;
      }
    }

    return style;
  };

  const listenScroll = () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    // 滚动隐藏，停止滚动显示header
    setHiddenHeader(true);
    scrollTimeout = setTimeout(() => {
      setHiddenHeader(false);
    }, 300);
  };

  const beforeLeave = (origin: any, destination: any, direction: string, trigger: any) => {
    setHiddenHeader(true);
  };

  const afterLoad = (origin: any, destination: any, direction: string, trigger: any) => {
    setHiddenHeader(false);
  };

  useEffect(() => {
    const node = document.querySelectorAll('.fp-overflow');
    node.forEach((item: any) => {
      item.addEventListener('scroll', listenScroll);
    });
  }, []);

  return (
    <FullpageApiContext.Provider value={fullpageApi}>
      <Layout contentStyle={{ padding: '0' }} hiddenFooter hiddenHeader={hiddenHeader}>
        <ReactFullpage
          debug={false}
          credits={{ enabled: false }}
          navigation
          navigationPosition="right"
          scrollingSpeed={1000}
          anchors={['page1', 'page2', 'page3', 'page4', 'page5', 'page6']}
          beforeLeave={beforeLeave}
          afterLoad={afterLoad}
          render={({ fullpageApi: api }) => {
            fullpageApiRef.current = api;
            // 使用 setTimeout 延迟更新 state，避免在 render 中直接调用 setState
            if (api && !hasSetApiRef.current) {
              hasSetApiRef.current = true;
              setTimeout(() => {
                setFullpageApi(api);
              }, 0);
            }

            // 在 fullPage.js 初始化完成后立即应用导航点样式
            // 使用多个 requestAnimationFrame 确保在 DOM 完全渲染后应用
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const overrideNavStyles = () => {
                  const navContainer = document.querySelector('#fp-nav');
                  if (!navContainer) return;

                  // 覆盖所有导航点的链接容器样式，确保对齐
                  const allLinks = document.querySelectorAll('#fp-nav ul li a, .fp-slidesNav ul li a');
                  allLinks.forEach((link) => {
                    const element = link as HTMLElement;
                    element.style.display = 'flex';
                    element.style.alignItems = 'center';
                    element.style.justifyContent = 'center';
                    element.style.width = '26px';
                    element.style.height = '26px';
                    element.style.position = 'relative';
                    element.style.margin = '0 auto';
                  });

                  // 覆盖导航点列表项的间距，确保32px间距生效
                  const allListItems = document.querySelectorAll('#fp-nav ul li, .fp-slidesNav ul li');
                  allListItems.forEach((li) => {
                    const element = li as HTMLElement;
                    element.style.margin = '32px 0';
                    element.style.display = 'flex';
                    element.style.alignItems = 'center';
                    element.style.justifyContent = 'center';
                    element.style.position = 'relative';
                  });

                  // 覆盖激活状态的导航点样式
                  const activeSpans = document.querySelectorAll('#fp-nav ul li a.active span, .fp-slidesNav ul li a.active span');
                  activeSpans.forEach((span) => {
                    const element = span as HTMLElement;
                    element.style.backgroundColor = '#ad9cff';
                    element.style.width = '14px';
                    element.style.height = '14px';
                    element.style.border = '7px solid #ece8ff';
                    element.style.borderRadius = '50%';
                    element.style.boxSizing = 'content-box';
                    element.style.position = 'absolute';
                    element.style.top = '50%';
                    element.style.left = '50%';
                    element.style.transform = 'translate(-50%, -50%)';
                    element.style.margin = '0';
                    element.style.boxShadow = '0 0 10px 0 rgba(236, 232, 255, 0.5)';
                    element.style.minWidth = '14px';
                    element.style.minHeight = '14px';
                    element.style.maxWidth = '14px';
                    element.style.maxHeight = '14px';
                  });

                  // 覆盖非激活状态的导航点样式
                  const inactiveSpans = document.querySelectorAll('#fp-nav ul li a:not(.active) span, .fp-slidesNav ul li a:not(.active) span');
                  inactiveSpans.forEach((span) => {
                    const element = span as HTMLElement;
                    element.style.width = '10px';
                    element.style.height = '10px';
                    element.style.borderRadius = '50%';
                    element.style.backgroundColor = '#d8d8d8';
                    element.style.border = 'none';
                    element.style.position = 'absolute';
                    element.style.top = '50%';
                    element.style.left = '50%';
                    element.style.transform = 'translate(-50%, -50%)';
                    element.style.margin = '0';
                    element.style.minWidth = '10px';
                    element.style.minHeight = '10px';
                    element.style.maxWidth = '10px';
                    element.style.maxHeight = '10px';
                    element.style.boxShadow = 'none';
                  });
                };
                overrideNavStyles();
              });
            });

            return (
              <ReactFullpage.Wrapper>
                {/* 第一屏 - 欢迎页 */}
                <div
                  className="section"
                  style={getSectionStyle(sectionBackgrounds[0], sectionBackgroundColors[0])}
                >
                  <SimpleNote />
                  <NextPageBtn onClick={handleNextPage} />
                </div>

                {/* 第二屏 - Agent 核心功能 */}
                <div
                  className="section"
                  style={getSectionStyle(sectionBackgrounds[1])}
                >
                  <AgentNote />
                  <NextPageBtn onClick={handleNextPage} />
                </div>

                {/* 第三屏 - 用户案例展示 */}
                <div className="section fp-auto-height" style={getSectionStyle(sectionBackgrounds[2])}>
                  <DemoList />
                  {/* <NextPageBtn onClick={handleNextPage} /> */}
                  {/* <BottomMask /> */}
                  <Footer />
                </div>

                {/* 第四屏 - */}
                {/* <div className="section" style={getSectionStyle(sectionBackgrounds[3])}>
                  <CustomVoice />
                  <NextPageBtn onClick={handleNextPage} />
                  <BottomMask />
                </div> */}

                {/* 第五屏 - API */}
                {/* <div className="section" style={getSectionStyle(sectionBackgrounds[4])}>
                  <ApiServer />
                  <NextPageBtn onClick={handleNextPage} />
                </div> */}

                {/* 第六屏 - MCP Server */}
                {/* <div
                  className="section fp-auto-height"
                  style={getSectionStyle(sectionBackgrounds[5])}
                >
                  <McpServer />
                  <Footer />
                </div> */}
              </ReactFullpage.Wrapper>
            );
          }}
        />
      </Layout>
    </FullpageApiContext.Provider>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.seller-center.home.ajA", "遨虾-AI跨境电商运营Agent"),
  spm: {
    spmB: 'seller-center-home',
  },
});

export default Home;
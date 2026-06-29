import React from 'react';
import { getComponentRegistry } from './componentRegistry';
import type { TypeComponentConfig, TypeComponentRegistry } from './MarkdownCustomComponents/types';

import styles from './reportContent.module.css';
import { AnimatedMarkdown } from 'flowtoken';
import 'flowtoken/dist/styles.css';
// import ProductCard from './ProductCard';
import RecommendedProducts from '../RecommendedProducts';
import type { listDataProps } from '../RecommendedProducts/interface';

class ReportContentErrorBoundary extends React.Component<{ children: React.ReactNode; contentLength: number }> {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ReportContent] AnimatedMarkdown error', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      contentLength: this.props.contentLength,
    });
  }
  render() {
    return this.props.children;
  }
}

interface TypeReportContentProps {
  rawData?: string;
  extraData?: any;
}

interface TypeCachedRegex {
  config: TypeComponentConfig;
  tagName: string;
  blockTagRegex?: RegExp;
  selfClosingRegex: RegExp;
  inlineRegex?: RegExp;
  openTagRegex?: RegExp;
  closeTagRegex?: RegExp;
}

let cachedRegistry: TypeComponentRegistry | null = null;
let cachedRegexList: TypeCachedRegex[] = [];

const buildRegexCache = (registry: TypeComponentRegistry): TypeCachedRegex[] => {
  if (cachedRegistry === registry) return cachedRegexList;

  cachedRegistry = registry;
  cachedRegexList = Object.entries(registry).map(([tagName, componentOrConfig]) => {
    const config: TypeComponentConfig =
      typeof componentOrConfig === 'function'
        ? { component: componentOrConfig, renderAs: 'block', tagName: 'div' }
        : {
          component: componentOrConfig.component,
          renderAs: componentOrConfig.renderAs || 'block',
          tagName: componentOrConfig.tagName || (componentOrConfig.renderAs === 'inline' ? 'span' : 'div'),
          className: componentOrConfig.className || '',
        };

    const { renderAs } = config;
    const attrPattern = `(?:\\s+[\\w\\-]+='(?:[^'\\\\]|\\\\.)*'|\\s+[\\w\\-]+="(?:[^"\\\\]|\\\\.)*")*`;
    const result: TypeCachedRegex = {
      config,
      tagName,
      selfClosingRegex: new RegExp(`<${tagName}(${attrPattern})\\s*\\/\\s*>`, 'gi'),
    };

    if (renderAs === 'block') {
      result.blockTagRegex = new RegExp(`([^\\n])(<${tagName}(?:\\s|>|\\/))`, 'gi');
      result.openTagRegex = new RegExp(`<${tagName}(${attrPattern})\\s*>`, 'gi');
      result.closeTagRegex = new RegExp(`<\\/${tagName}>`, 'gi');
    } else {
      result.inlineRegex = new RegExp(`<${tagName}(${attrPattern})\\s*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
    }

    return result;
  });

  return cachedRegexList;
};

const ReportContent: React.FC<TypeReportContentProps> = ({ rawData, extraData }) => {

  const isBatchProductRecommendContent = React.useMemo(() => {
    const s = typeof rawData === 'string' ? rawData : '';
    return s.includes('<batch_product_recommend');
  }, [rawData]);

  const componentRegistry = React.useMemo((): TypeComponentRegistry => {
    const base = getComponentRegistry();
    return {
      ...base,
      batch_product_recommend: (props: Record<string, unknown>) => {
        const dataId = props['data-_id'];
        const raw = dataId != null ? extraData[dataId as string] : undefined;
        const list: listDataProps[] = Array.isArray(raw) ? (raw as listDataProps[]) : [];
        return <RecommendedProducts listData={list} />;
      },
    };
  }, [extraData]);
  // if (typeof window !== 'undefined') {
  //   console.log('[ReportContent] rawData', {
  //     type: typeof rawData,
  //     isString: typeof rawData === 'string',
  //     length: typeof rawData === 'string' ? rawData.length : 0,
  //     preview: typeof rawData === 'string' ? rawData.slice(0, 300) : String(rawData).slice(0, 300),
  //     hasTable: typeof rawData === 'string' && rawData.includes('|'),
  //   });
  // }
  // const componentRegistry = React.useMemo(() => getComponentRegistry(), []);

  const preprocessedData = React.useMemo(() => {
    const str = typeof rawData === 'string' ? rawData : '';
    if (!str) return '';

    let processed = str;
    const regexList = buildRegexCache(componentRegistry);

    for (const item of regexList) {
      const { tagName } = item;
      const selfCloseCount = (processed.match(new RegExp(`<${tagName}[^>]*/\\s*>`, 'gi')) || []).length;
      const allOpenCount = (processed.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>`, 'gi')) || []).length;
      const closeCount = (processed.match(new RegExp(`</${tagName}>`, 'gi')) || []).length;
      const unclosedCount = allOpenCount - selfCloseCount - closeCount;
      for (let i = 0; i < unclosedCount; i++) {
        processed += `</${tagName}>`;
      }
    }

    for (const item of regexList) {
      const { config, tagName, blockTagRegex, selfClosingRegex, inlineRegex, openTagRegex, closeTagRegex } = item;
      const { renderAs, tagName: targetTagName, className } = config;
      const classAttr = className ? ` class="${className}"` : '';

      try {
        if (renderAs === 'block' && blockTagRegex) {
          processed = processed.replace(blockTagRegex, '$1\n\n$2');
        }

        if (renderAs === 'inline') {
          processed = processed.replace(selfClosingRegex, (_m, attributes) => {
            const escapedAttributes = attributes.replace(/\\'/g, '&#39;');
            return `<${targetTagName}${classAttr} data-component="${tagName}"${escapedAttributes}></${targetTagName}>`;
          });
          if (inlineRegex) {
            processed = processed.replace(inlineRegex, (_m, attributes, content) => {
              const escapedAttributes = attributes.replace(/\\'/g, '&#39;');
              return `<${targetTagName}${classAttr} data-component="${tagName}"${escapedAttributes}>${content}</${targetTagName}>`;
            });
          }
        } else {
          processed = processed.replace(selfClosingRegex, (_m, attributes) => {
            const escapedAttributes = attributes.replace(/\\'/g, '&#39;');
            return `\n\n<${targetTagName} data-component="${tagName}"${escapedAttributes}></${targetTagName}>\n\n`;
          });
          if (openTagRegex) {
            processed = processed.replace(openTagRegex, (_m, attributes) => {
              const escapedAttributes = attributes.replace(/\\'/g, '&#39;');
              return `\n\n<${targetTagName} data-component="${tagName}"${escapedAttributes}>`;
            });
          }
          if (closeTagRegex) {
            processed = processed.replace(closeTagRegex, `</${targetTagName}>\n\n`);
          }
        }

        selfClosingRegex.lastIndex = 0;
        inlineRegex && (inlineRegex.lastIndex = 0);
        openTagRegex && (openTagRegex.lastIndex = 0);
        closeTagRegex && (closeTagRegex.lastIndex = 0);
        blockTagRegex && (blockTagRegex.lastIndex = 0);
      } catch (error) {
        console.error(`[ReportContent] Safari 兼容性错误 - tagName: ${tagName}`, error);
      }
    }

    return processed;
  }, [rawData, componentRegistry]);

  // 构建 react-markdown 的 components 配置
  const components = React.useMemo(() => {
    return {
      // 处理带 data-component 属性的 div（预处理后的自定义标签）
      div: (props: any) => {
        const { children, ...restProps } = props;
        const dataComponent = restProps['data-component'];

        // 如果有 data-component 属性，渲染对应的自定义组件
        if (dataComponent && componentRegistry[dataComponent]) {
          const componentOrConfig = componentRegistry[dataComponent];

          // 提取实际的组件（支持直接组件或配置对象）
          const Component =
            typeof componentOrConfig === 'function'
              ? componentOrConfig
              : componentOrConfig.component;

          // 移除 data-component 属性，避免传递给自定义组件
          const { 'data-component': _dataComponent, ...componentProps } = restProps;

          return (
            <div className={`${styles.markdownCutsomComponentContainer} ${styles[`markdownCutsomComponentContainer-${dataComponent}`]}`}>
              <Component {...componentProps}>{children}</Component>
            </div>
          );
        }

        // 否则渲染普通 div
        return <div {...restProps}>{children}</div>;
      },
      // 保持默认的图片处理
      img: ({ src, alt, ...props }: any) => (
        <img
          src={src}
          alt={alt}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '4px',
          }}
          {...props}
        />
      ),
      // 保持默认的链接处理
      a: (props: any) => {
        const { href, children, url, ...restProps } = props;
        const dataComponent = restProps['data-component'];

        // 如果有 data-component 属性，渲染对应的自定义组件
        if (dataComponent && componentRegistry[dataComponent]) {
          const componentOrConfig = componentRegistry[dataComponent];
          const Component =
            typeof componentOrConfig === 'function'
              ? componentOrConfig
              : componentOrConfig.component;
          const { 'data-component': _dataComponent, ...componentProps } = restProps;
          return (
            // 使用 ProductCard 组件包裹自定义组件
            // <ProductCard>
            //   <Component href={href} url={url} {...componentProps}>{children}</Component>
            // </ProductCard>
            <Component href={href} url={url} {...componentProps}>{children}</Component>
          );
        }

        // 否则渲染普通链接
        return (
          <a href={href || url} target="_blank" rel="noopener noreferrer" {...restProps}>
            {children}
          </a>
        );
      },
      p: ({ children, ...props }: any) => {
        const _children = typeof children === 'string' ? children.trim() : children;
        return _children ? <p {...props}>{_children}</p> : null;
      },
      span: (props: any) => {
        const { children, ...restProps } = props;
        const dataComponent = restProps['data-component'];

        // 如果有 data-component 属性，渲染对应的自定义组件
        if (dataComponent && componentRegistry[dataComponent]) {
          const componentOrConfig = componentRegistry[dataComponent];
          const Component =
            typeof componentOrConfig === 'function'
              ? componentOrConfig
              : componentOrConfig.component;
          const { 'data-component': _dataComponent, ...componentProps } = restProps;
          return <Component {...componentProps}>{children}</Component>;
        }

        // 否则渲染普通 span
        const _children = typeof children === 'string' ? children.trim() : children;
        return _children ? <span {...restProps}>{_children}</span> : null;
      },
      li: ({ children, ...props }: any) => {
        const _children = typeof children === 'string' ? children.trim() : children;
        return _children ? <li {...props}>{_children}</li> : null;
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentRegistry]);

  // Safari 16.3 兼容性：不传递包含特殊字符的 tag names 给 AnimatedMarkdown
  // 因为已经在预处理阶段转换为 <div data-component="...">，所以只需要 div 处理器
  const safeComponents = React.useMemo(() => {
    return {
      div: components.div,
      img: components.img,
      a: components.a,
      p: components.p,
      span: components.span,
      li: components.li,
    };
  }, [components]);

  // if (typeof rawData !== 'string' || !rawData) {
  //   if (typeof window !== 'undefined') console.log('[ReportContent] skip render: rawData not string or empty', { type: typeof rawData });
  //   return null;
  // }

  // if (typeof window !== 'undefined') {
  //   console.log('[ReportContent] render AnimatedMarkdown', {
  //     preprocessedDataLength: preprocessedData.length,
  //     preprocessedHasTable: preprocessedData.includes('|'),
  //     preprocessedPreview: preprocessedData.slice(0, 200),
  //   });
  // }

  const rootClassName = isBatchProductRecommendContent
    ? `${styles.recommendedProducts} markdownComponent`
    : `${styles.defaultMarkdownComponent} markdownComponent`;

  return (
    <div className={rootClassName}>
      <ReportContentErrorBoundary contentLength={preprocessedData.length}>
        <AnimatedMarkdown
          customComponents={safeComponents}
          content={preprocessedData}
          animation="fadeIn"
          animationDuration="0.1s"
          animationTimingFunction="ease-in-out"
          sep="word"
        />
      </ReportContentErrorBoundary>
    </div>
  );
};

export default ReportContent;

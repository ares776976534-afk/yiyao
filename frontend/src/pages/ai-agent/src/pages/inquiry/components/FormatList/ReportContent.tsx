import React from 'react';
import markdownit from 'markdown-it';
import styles from './reportContent.module.css';

// 转换 qwen 标签的函数（使用浏览器原生 DOMParser）
const transformQwenTags = (html: string): string => {
  // 创建 DOMParser 实例
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  // 递归处理节点
  const processNode = (node: Node): void => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    if (tagName.startsWith('qwen:')) {
      const tagType = tagName.substring(5);

      if (tagType === 'takeaway') {
        const newElement = doc.createElement('div');
        const originalClass = element.getAttribute('class') || '';
        const newClass = originalClass
          ? `qwen-takeaway ${originalClass}`
          : 'qwen-takeaway';

        Array.from(element.attributes).forEach(attr => {
          if (attr.name !== 'class') {
            newElement.setAttribute(attr.name, attr.value);
          }
        });
        newElement.className = newClass;

        while (element.firstChild) {
          newElement.appendChild(element.firstChild);
        }

        element.parentNode?.replaceChild(newElement, element);
        Array.from(newElement.childNodes).forEach(child => processNode(child));
      }
      else if (tagType === 'cite') {
        const newElement = doc.createElement('a');
        const url = element.getAttribute('url') || '';
        const originalClass = element.getAttribute('class') || '';
        const newClass = originalClass
          ? `qwen-cite ${originalClass}`
          : 'qwen-cite';

        newElement.href = url;

        Array.from(element.attributes).forEach(attr => {
          if (attr.name !== 'url' && attr.name !== 'class') {
            // newElement.setAttribute(attr.name, attr.value);
          }
        });
        newElement.className = newClass;

        while (element.firstChild) {
          newElement.appendChild(element.firstChild);
        }

        element.parentNode?.replaceChild(newElement, element);
        Array.from(newElement.childNodes).forEach(child => processNode(child));
      }
    } else {
      Array.from(element.childNodes).forEach(child => processNode(child));
    }
  };

  Array.from(body.childNodes).forEach(node => processNode(node));

  return body.innerHTML;
};

const md = markdownit({ html: true, breaks: true });

export default (props: any) => {
  const { rawData } = props;

  return (
    <div dangerouslySetInnerHTML={{
      __html: md.render(transformQwenTags(rawData))
    }} className={styles.markdownComponent} />
  );
};
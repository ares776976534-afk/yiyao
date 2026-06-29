import React, { useEffect, useRef } from 'react';
import { Message } from '@alifd/next';
import ClipboardJS from 'clipboard';

export default ({ children, text }) => {
  const textToCopyRef = useRef(null);
  const clipboard = useRef(null);

  useEffect(() => {
    clipboard.current = new ClipboardJS(textToCopyRef.current);
    clipboard.current.on('success', () => {
      Message.success('复制成功');
    });
    clipboard.current.on('error', () => {
      Message.error('复制失败');
    });

    return () => {
      if (clipboard.current) {
        clipboard.current.destroy();
      }
    };
  }, []);

  return (
    <span ref={textToCopyRef} data-clipboard-text={text} style={{ cursor: 'pointer' }}>
      {children}
    </span>
  );
};

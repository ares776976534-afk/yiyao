import React, { useEffect, useRef } from 'react';
import ClipboardJS from 'clipboard';

export default ({ children, text, onSuccess, onError }) => {
  const textToCopyRef = useRef(null);
  const clipboard = useRef(null);

  useEffect(() => {
    clipboard.current = new ClipboardJS(textToCopyRef.current);
    clipboard.current.on('success', () => {
      onSuccess?.();
    });
    clipboard.current.on('error', () => {
      onError?.();
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

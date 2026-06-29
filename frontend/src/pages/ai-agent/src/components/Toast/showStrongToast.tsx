import React from 'react';
import { createRoot } from 'react-dom/client';
import StrongToast from './StrongToast';

const showStrongToast = (content: React.ReactNode, options: any = {}) => {
  const { duration, onClose } = options;
  const container = document.createElement('div');
  const root = createRoot(container);
  
  const handleClose = () => {
    onClose?.();
    root.unmount();

    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  };

  document.body.appendChild(container);
  root.render(<StrongToast content={content} duration={duration * 1000} onClose={handleClose} />);
};

export default showStrongToast;

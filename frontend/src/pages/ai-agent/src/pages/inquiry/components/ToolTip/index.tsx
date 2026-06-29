import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styles from './index.module.css';
import { $t } from '@ali/1688-global-i18n-core';

enum IconUrl {
  SUCCESS = "https://img.alicdn.com/imgextra/i1/6000000001743/O1CN01UmFWUy1OkLSHnUIl1_!!6000000001743-2-gg_dtc.png",
  ERROR = "https://img.alicdn.com/imgextra/i1/O1CN01usqHwb1jnBqZ6nHHS_!!6000000004592-2-tps-160-160.png",
}

interface ToolTipOptions {
  id?: string;
  title?: string;
  message?: string;
  timeout?: number;
  onClose?: () => void;
  type?: 'success' | 'error';
}

interface ToolTipProps extends ToolTipOptions {
  visible?: boolean;
}

const ToolTipComponent: React.FC<ToolTipProps> = ({
  title,
  message = '页面即将于{countdown}s后自动关闭',
  timeout = 2,
  onClose,
  visible = true,
  type = 'success',
}) => {
  const [countdown, setCountdown] = useState(timeout);
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (!isVisible || timeout <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsVisible(false);
          onClose?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, timeout, onClose]);

  useEffect(() => {
    setIsVisible(visible);
    if (visible) {
      setCountdown(timeout);
    }
  }, [visible, timeout]);

  if (!isVisible) return null;

  const displayMessage = message.replace('{countdown}', countdown.toString());

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <img
          className={styles.icon}
          src={type === 'success' ? IconUrl.SUCCESS : IconUrl.ERROR}
          alt="Success Icon"
        />
        <div className={styles.content}>
          {title && <div className={styles.title}>{title}</div>}
          <div className={styles.text}>{displayMessage}</div>
        </div>
      </div>
    </div>
  );
};

// 函数调用方式
const showToolTip = (options: ToolTipOptions = {}) => {
  // 创建容器元素
  const container = document.createElement('div');
  container.id = 'authorization-success-container';
  document.body.appendChild(container);

  // 创建 React 根节点
  const root = createRoot(container);

  // 关闭函数
  const handleClose = () => {
    options.onClose?.();
    // 延迟销毁，确保动画完成
    setTimeout(() => {
      root.unmount();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, 300);
  };

  // 渲染组件
  root.render(
    <ToolTipComponent
      {...options}
      visible={true}
      onClose={handleClose}
    />
  );

  // 返回关闭函数，允许手动关闭
  return {
    close: handleClose
  };
};

export default ToolTipComponent;
export { showToolTip };

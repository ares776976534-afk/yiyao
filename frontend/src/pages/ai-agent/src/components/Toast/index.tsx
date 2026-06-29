import React from "react";
import { App } from "antd";
import { InfoIcon, SuccessIcon, ErrorIcon, WarningIcon } from "./Iocns";
import showStrongToast from "./showStrongToast";
import styles from "./index.module.scss";

interface TypeUseToastOptions {
  type?: 'strong';
  duration?: number;
}

const useToast = (hookOptions: TypeUseToastOptions = {}) => {
  const { message } = App.useApp();
  const DURATION = hookOptions.duration ?? 2;
  const isStrong = hookOptions.type === 'strong';

  const info = (content: string | React.ReactNode, options: any = {}) => {
    const duration = (options.duration ?? DURATION);

    if (isStrong) {
      showStrongToast(content, {
        ...options,
        duration,
      });
      return;
    }
    message.open({
      duration,
      type: 'info',
      content,
      icon: <InfoIcon className={styles.icon} />,
      className: [styles.toast, styles.infoToast].join(' '),
      ...options,
    });
  };

  const success = (content: string | React.ReactNode, options: any = {}) => {
    const duration = (options.duration ?? DURATION);

    if (isStrong) {
      showStrongToast(content, {
        ...options,
        duration,
      });
      return;
    }

    message.open({
      duration,
      type: 'success',
      content,
      icon: <SuccessIcon className={styles.icon} />,
      className: [styles.toast, styles.successToast].join(' '),
      ...options,
    });
  };

  const error = (content: string | React.ReactNode, options: any = {}) => {
    const duration = (options.duration ?? DURATION);

    if (isStrong) {
      showStrongToast(content, {
        ...options,
        duration,
      });
      return;
    }

    message.open({
      duration,
      type: 'error',
      content,
      icon: <ErrorIcon className={styles.icon} />,
      className: [styles.toast, styles.errorToast].join(' '),
      ...options,
    });
  };

  const warning = (content: string | React.ReactNode, options: any = {}) => {
    const duration = (options.duration ?? DURATION);

    if (isStrong) {
      showStrongToast(content, {
        ...options,
        duration,
      });
      return;
    }

    message.open({
      duration,
      type: 'warning',
      content,
      icon: <WarningIcon className={styles.icon} />,
      className: [styles.toast, styles.warningToast].join(' '),
      ...options,
    });
  };

  const loading = (content: string | React.ReactNode, options: any = {}) => {
    const duration = (options.duration ?? DURATION);
    
    message.open({
      duration,
      type: 'loading',
      content,
      icon: <div className={styles.loadingIcon} />,
      className: [styles.toast, styles.loadingToast].join(' '),
      ...options,
    });
  };

  const destroy = (key?: string) => {
    message.destroy(key);
  };

  return {
    success,
    error,
    warning,
    info,
    destroy,
    loading,
  };
};


export default useToast;

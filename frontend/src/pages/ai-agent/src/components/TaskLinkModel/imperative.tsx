import React from 'react';
import { Modal } from 'antd-mobile';
import type { ModalShowHandler } from 'antd-mobile/es/components/modal';
import type { TypeTaskLinkModalProps } from './TaskLinkModal';
import { TaskLinkContent } from './TaskLinkContent';
import styles from './index.module.scss';

type TypeShowOptions = Omit<TypeTaskLinkModalProps, 'visible'>;

/**
 * 命令式调用 TaskLinkModal 弹窗
 * @param options 配置选项
 * @returns 返回一个包含 close 方法的对象
 *
 * @example
 * ```tsx
 * import showTaskLinkModal from '@/pages/mobile-agent-home/components/TaskLinkCard';
 *
 * // 打开弹窗
 * const handler = showTaskLinkModal({
 *   title: '自定义标题',
 *   buttonText: '确认',
 *   onClose: () => {
 *     console.log('弹窗关闭');
 *   }
 * });
 *
 * // 手动关闭弹窗
 * handler.close();
 * ```
 */
export const showTaskLinkModal = (options: TypeShowOptions = {}): ModalShowHandler => {
  const {
    closeOnMaskClick = true,
    title,
    titleAfterClick,
    buttonText,
    onButtonClick,
    hideButtonAfterClick,
    onClose,
    bodyStyle,
    maskStyle,
    isClickable,
    url,
    ...restProps
  } = options;

  // 使用 Modal.show() 指令式调用
  return Modal.show({
    closeOnMaskClick,
    showCloseButton: false,
    className: styles.taskLinkModal,
    content: (
      <TaskLinkContent
        onClose={onClose}
        url={url}
        title={title}
        isClickable={isClickable}
        titleAfterClick={titleAfterClick}
        buttonText={buttonText}
        onButtonClick={onButtonClick}
        hideButtonAfterClick={hideButtonAfterClick}
      />
    ),
    bodyStyle: {
      backgroundColor: 'transparent',
      padding: '0px',
      ...bodyStyle,
    },
    maskStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      ...maskStyle,
    },
    ...restProps,
  });
};

/**
 * 快速打开 TaskLinkModal 弹窗（使用默认配置）
 *
 * @example
 * ```tsx
 * import showTaskLinkModal from '@/pages/mobile-agent-home/components/TaskLinkCard';
 *
 * // 快速打开
 * const handler = showTaskLinkModal();
 * ```
 */
export default showTaskLinkModal;

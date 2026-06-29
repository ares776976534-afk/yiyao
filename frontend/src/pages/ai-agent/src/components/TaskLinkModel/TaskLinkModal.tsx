import React from 'react';
import { Modal } from 'antd-mobile';
import type { ModalProps } from 'antd-mobile';
import { TaskLinkContent } from './TaskLinkContent';
import type { TypeTaskLinkContentProps } from './TaskLinkContent';
import classNames from 'classnames';
import styles from './index.module.scss';

export interface TypeTaskLinkModalProps extends Omit<ModalProps, 'content' | 'title'>, TypeTaskLinkContentProps {
}

export const TaskLinkModal: React.FC<TypeTaskLinkModalProps> = ({
  visible = false,
  onClose,
  closeOnMaskClick = true,
  title,
  titleAfterClick,
  buttonText,
  onButtonClick,
  hideButtonAfterClick,
  className,
  isClickable,
  url,
  ...restProps
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      className={classNames(styles.taskLinkModal, className)}
      closeOnMaskClick={closeOnMaskClick}
      showCloseButton={false}
      content={
        <TaskLinkContent
          url={url}
          isClickable={isClickable}
          onClose={onClose}
          title={title}
          titleAfterClick={titleAfterClick}
          buttonText={buttonText}
          onButtonClick={onButtonClick}
          hideButtonAfterClick={hideButtonAfterClick}
        />
      }
      bodyStyle={{
        backgroundColor: 'transparent',
        padding: '0px',
      }}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
      }}
      {...restProps}
    />
  );
};

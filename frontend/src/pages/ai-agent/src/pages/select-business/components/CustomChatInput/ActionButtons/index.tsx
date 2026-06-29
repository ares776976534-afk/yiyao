/**
 * 操作按钮组件
 * 包含"创建询盘任务"和"发起新对话"两个按钮
 */
import React from 'react';
import styles from './index.module.scss';
import { AddIcon, Inquire2Icon } from '@/components/Icon';
import { $t } from '@/i18n';

interface TypeActionButtonsProps {
  onCreateInquiry?: () => void;
  onNewConversation?: () => void;
}

const ActionButtons: React.FC<TypeActionButtonsProps> = ({
  // onCreateInquiry,
  onNewConversation,
}) => {
  return (
    <div className={styles.buttonContainer}>
      {/* 创建询盘任务按钮 */}
      {/* <button className={styles.actionButton} onClick={onCreateInquiry}>
        <span className={styles.icon}>
          <Inquire2Icon />
        </span>
        <span className={styles.text}>创建询盘任务</span>
      </button> */}

      {/* 发起新对话按钮 */}
      <button className={styles.actionButton} onClick={onNewConversation}>
        <span className={styles.icon}>
          <AddIcon width={12} height={12} />
        </span>
        <span className={styles.text}>{$t("global-1688-ai-app.select-business.CustomChatInput.ActionButtons.fqnewdh", "发起新对话")}</span>
      </button>
    </div>
  );
};

export default ActionButtons;


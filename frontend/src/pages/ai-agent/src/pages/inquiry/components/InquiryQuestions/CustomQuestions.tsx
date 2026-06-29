import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styles from './customQuestions.module.css';
import { $t } from '@/i18n';

interface CustomQuestionsProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (question: string) => boolean; // 返回布尔值，表示是否成功创建
  initialValue?: string; // 编辑模式下的初始值
  onUpdate?: (question: string) => void; // 更新回调（编辑模式）
  onDelete?: () => void; // 删除回调（编辑模式）
}

const CustomQuestions: React.FC<CustomQuestionsProps> = ({
  open,
  onClose,
  onSubmit,
  initialValue = '',
  onUpdate,
  onDelete,
}) => {
  const [inputValue, setInputValue] = useState('');

  // 当弹窗打开或初始值变化时，更新输入框
  useEffect(() => {
    if (open) {
      setInputValue(initialValue);
    }
  }, [open, initialValue]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      if (onUpdate && initialValue) {
        // 编辑模式
        onUpdate(inputValue.trim());
        setInputValue('');
        onClose();
      } else {
        // 新建模式：只有成功创建时才关闭弹窗
        const success = onSubmit(inputValue.trim());
        if (success) {
          setInputValue('');
          onClose();
        }
      }
    }
  };

  const handleAddNext = () => {
    if (inputValue.trim()) {
      if (onUpdate && initialValue) {
        // 编辑模式下不支持"添加下一个"
        onUpdate(inputValue.trim());
        setInputValue('');
        onClose();
      } else {
        // 新建模式：只有成功创建时才清空输入框，不关闭弹窗以便继续添加
        const success = onSubmit(inputValue.trim());
        if (success) {
          setInputValue('');
        }
      }
    }
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      setInputValue('');
      onClose();
    }
  };

  const isEditMode = !!initialValue;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closable={false}
      centered
      width={600}
      styles={{
        content: {
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>
          {isEditMode ? $t("global-1688-ai-app.inquiry.InquiryQuestions.CustomQuestions.epe", "编辑询盘问题") : $t("global-1688-ai-app.inquiry.InquiryQuestions.CustomQuestions.zdyxpissue", "自定义询盘问题")}
        </h2>
        <button
          className={styles.closeButton}
          onClick={handleClose}
        >
          <CloseOutlined className={styles.closeIcon} />
        </button>
      </div>

      <p className={styles.modalDescription}>{$t("global-1688-ai-app.inquiry.InquiryQuestions.CustomQuestions.zzhwid", "在询盘过程中，AI可能会根据上下文，改变询盘问题的问法。")}</p>

      <div className={styles.inputContainer}>
        <Input
          placeholder={$t("global-1688-ai-app.inquiry.InquiryQuestions.CustomQuestions.qinputwb", "请输入文本")}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onPressEnter={handleSubmit}
          autoFocus
          style={{
            height: '36px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #E7E8EE',
          }}
          maxLength={50}
        />
      </div>

      <div className={styles.buttonGroup}>
        {!isEditMode && (
          <Button
            className={styles.secondaryButton}
            onClick={handleAddNext}
            disabled={!inputValue.trim()}
          >{$t("global-1688-ai-app.inquiry.InquiryQuestions.CustomQuestions.ced", "完成并添加下一个")}</Button>
        )}
        {isEditMode && onDelete && (
          <Button
            className={styles.deleteButton}
            onClick={handleDelete}
          >{$t("global-1688-ai-app.inquiry.InquiryQuestions.CustomQuestions.deu", "删除该问题")}</Button>
        )}
        <Button
          className={styles.primaryButton}
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
        >
          {isEditMode ? $t("global-1688-ai-app.inquiry.InquiryQuestions.CustomQuestions.save", "保存") : $t("global-1688-ai-app.inquiry.InquiryQuestions.CustomQuestions.complete", "完成")}
        </Button>
      </div>
    </Modal>
  );
};

export default CustomQuestions;
import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'antd-mobile';
import ChatBoxSend from '@/components/Icon/ChatBoxSend';
import UploadBtn, { UploadArea, UPLOAD_STATUS } from './UploadBtn';
// import InputArea from './InputArea';
import UploadArrowIcon from './Icon/UploadArrow';

import styles from './index.module.scss';
// import { SendIcon } from '@/components/InputChat/components/Icons';
import classNames from 'classnames';
import SendBtn from './Icon/SendBtn';
import SendBtnGradient from './Icon/SendBtnGradient';
import { $t } from '@/i18n';

interface ChatInputProps {
  prefix?: React.ReactNode | null;
  onSubmit: (data: any) => void;
  isStreaming?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  footer?: React.ReactNode | null;
  enableUploadImage?: boolean;
  uploadMaxCount?: number;
  sendBtnDisabled?: boolean;
  fancy?: boolean;
  defaultValue?: any;
}

export default ({
  prefix = null,
  onSubmit,
  isStreaming,
  placeholder = $t("global-1688-ai-app.mobile-agent-home.ChatInput.qte", "请输入问题"),
  onChange,
  footer = null,
  enableUploadImage = false,
  sendBtnDisabled = false,
  fancy = true,
  uploadMaxCount = 1,
  defaultValue,
}: ChatInputProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadingPreview, setUploadingPreview] = useState<string | null>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (sendBtnDisabled || ((!inputValue.trim() && fileList.length === 0) || isStreaming)) {
      return;
    }
    onSubmit({
      inputValue,
      fileList,
    });
    setInputValue('');
  };

  const handleChange = (value: string) => {
    setInputValue(value);
    onChange?.(value);
  };

  const handleFileListRemove = (id: string) => {
    setFileList(fileList.filter((item: any) => item.imgFileKey !== id));
  };

  const handleUploadChange = (data: any) => {
    setFileList((prev: any[] = []) => [...prev, data]);
  };

  const handleUploadStatusChange = (status: any) => {
    setUploadStatus(status);
  };

  const handleUploadPreviewChange = (previewUrl: string | null) => {
    setUploadingPreview(previewUrl);
  };

  useEffect(() => {
    if (defaultValue) {
      setFileList(defaultValue.fileList || []);
      setInputValue(defaultValue.query || defaultValue.inputValue || '');
    }
  }, [defaultValue]);

  const disabled = sendBtnDisabled || ((!inputValue.trim() && fileList.length === 0) || isStreaming);
  return (
    <div className={`${styles.chatInput} ${fancy ? styles.fancy : ''}`}>
      <div className={styles.boxShadow} />
      <div className={styles.inputSection} ref={inputSectionRef}>
        <UploadArea
          list={enableUploadImage ? fileList : []}
          onRemove={handleFileListRemove}
          uploading={uploadStatus === UPLOAD_STATUS.UPLOADING}
          uploadingPreview={uploadingPreview}
        />
        <div className={styles.inputContent}>
          {prefix}
          {/* <InputArea
            onChange={handleChange}
            placeholder={placeholder}
            handleEnter={handleSubmit}
            value={inputValue}
            parentContainerRef={inputSectionRef}
            defaultValue={defaultValue?.query || defaultValue?.inputValue || ''}
          /> */}

          <textarea
            className={styles.textarea}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
        <div className={styles.inputActions}>
          <div className={styles.footer}>
            {footer}
            {enableUploadImage && fileList.length < uploadMaxCount && (
              <UploadBtn
                onChange={handleUploadChange}
                onUploadStatusChange={handleUploadStatusChange}
                onUploadPreviewChange={handleUploadPreviewChange}
              >
                <Button
                  className={styles.uploadButton}
                >
                  <UploadArrowIcon width="3.7333vw" height="3.7333vw" />
                  <span>{$t("global-1688-ai-app.mobile-agent-home.ChatInput.udu", "上传商品图")}</span>
                </Button>
              </UploadBtn>
            )}
          </div>
          <div
            color="primary"
            onClick={handleSubmit}
            className={classNames(styles.sendButton, {
              [styles.sendDisabled]: disabled,
            })}
          >
            {
              disabled
                ? <SendBtn
                    width="8.53333vw"
                    height="8.53333vw"
                />
                : <SendBtnGradient
                    width="8.53333vw"
                    height="8.53333vw"
                />
            }

          </div>
        </div>
      </div>
    </div>
  );
};
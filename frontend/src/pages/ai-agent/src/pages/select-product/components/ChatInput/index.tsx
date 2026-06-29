import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import ChatBoxSend from '@/components/Icon/ChatBoxSend';
import LoadingCircle from '@/components/Icon/LoadingCircle';
import UploadBtn, { UploadArea, UPLOAD_STATUS, checkImageFile, uploadFileRequest } from './UploadBtn';
import InputArea from './InputArea';
import UploadArrowIcon from './Icon/UploadArrow';
import log, { commonRecord } from '@/utils/log';
import { checkAuthAndLogin } from '@/utils/login';

import styles from './index.module.css';
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
  sendButton?: React.ReactNode;
  onFocus?: () => void;
  imageUploadLogKey?: string;
}

export default ({
  prefix = null,
  onSubmit,
  isStreaming,
  placeholder = $t("global-1688-ai-app.select-product.ChatInput.ncn", "你可以向我继续提问..."),
  onChange,
  footer = null,
  enableUploadImage = false,
  sendBtnDisabled = false,
  fancy = true,
  uploadMaxCount = 1,
  defaultValue,
  sendButton,
  onFocus,
  imageUploadLogKey,
}: ChatInputProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadingPreview, setUploadingPreview] = useState<string | null>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  const handleSubmit = () => {
    if (sendBtnDisabled || ((!inputValue.trim() && fileList.length === 0) || isStreaming)) {
      return;
    }
    checkAuthAndLogin({
      onSuccess: () => {
        commonRecord(`对话框提交`);
        onSubmit({
          inputValue,
          fileList,
        });
        setInputValue('');
      },
    })
      .then((loginSuccess) => {
        if (loginSuccess) {
          commonRecord(`对话框提交`);
          onSubmit({
            inputValue,
            fileList,
          });
          setInputValue('');
        }
      });
  };

  const handleChange = (value: string) => {
    setInputValue(value);
    onChange?.(value);
  };

  const handleFileListRemove = (id: string) => {
    setFileList(fileList.filter((item: any) => item.imgFileKey !== id));
  };

  const handleUploadChange = (data: any) => {
    if (imageUploadLogKey) {
      log.record(imageUploadLogKey as `/${string}.${string}.${string}`, 'CLK', { imgurl: data?.imgFileKey || '' });
    }
    commonRecord(`对话框上传图片`);
    setFileList((prev: any[] = []) => [...prev, data]);
  };

  const handleUploadStatusChange = (status: any) => {
    setUploadStatus(status);
  };

  const handleUploadPreviewChange = (previewUrl: string | null) => {
    setUploadingPreview(previewUrl);
  };

  const handleInputFocus = () => {
    onFocus?.();
  };

  const handlePaste = useCallback((event: ClipboardEvent) => {
    if (!enableUploadImage || fileList.length >= uploadMaxCount) return;
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file && checkImageFile(file)) {
          event.preventDefault();
          commonRecord(`对话框粘贴图片`);
          uploadFileRequest(file, {
            onStatusChange: handleUploadStatusChange,
            onPreviewChange: handleUploadPreviewChange,
            onSuccess: (data) => {
              setFileList((prev: any[] = []) => [...prev, { ...data, offerId: undefined }]);
            },
          });
        }
        break;
      }
    }
  }, [enableUploadImage, fileList.length, uploadMaxCount]);

  const handleDragEnter = useCallback((event: DragEvent) => {
    if (!enableUploadImage || fileList.length >= uploadMaxCount) return;
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current++;
  }, [enableUploadImage, fileList.length, uploadMaxCount]);

  const handleDragOver = useCallback((event: DragEvent) => {
    if (!enableUploadImage || fileList.length >= uploadMaxCount) return;
    event.preventDefault();
    event.stopPropagation();
  }, [enableUploadImage, fileList.length, uploadMaxCount]);

  const handleDragLeave = useCallback((event: DragEvent) => {
    if (!enableUploadImage || fileList.length >= uploadMaxCount) return;
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current--;
  }, [enableUploadImage, fileList.length, uploadMaxCount]);

  const handleDrop = useCallback((event: DragEvent) => {
    if (!enableUploadImage || fileList.length >= uploadMaxCount) return;
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = 0;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(file => file.type.indexOf('image') !== -1);
    if (imageFiles.length === 0) return;

    const remainingSlots = uploadMaxCount - fileList.length;
    const filesToUpload = imageFiles.slice(0, remainingSlots);

    filesToUpload.forEach((file) => {
      if (checkImageFile(file)) {
        commonRecord(`对话框拖拽上传图片`);
        uploadFileRequest(file, {
          onStatusChange: handleUploadStatusChange,
          onPreviewChange: handleUploadPreviewChange,
          onSuccess: (data) => {
            setFileList((prev: any[] = []) => [...prev, { ...data, offerId: undefined }]);
          },
        });
      }
    });
  }, [enableUploadImage, fileList.length, uploadMaxCount]);

  useEffect(() => {
    const container = inputSectionRef.current;
    if (!container) return;
    
    container.addEventListener('paste', handlePaste);
    container.addEventListener('dragenter', handleDragEnter as any);
    container.addEventListener('dragover', handleDragOver as any);
    container.addEventListener('dragleave', handleDragLeave as any);
    container.addEventListener('drop', handleDrop as any);
    
    return () => {
      container.removeEventListener('paste', handlePaste);
      container.removeEventListener('dragenter', handleDragEnter as any);
      container.removeEventListener('dragover', handleDragOver as any);
      container.removeEventListener('dragleave', handleDragLeave as any);
      container.removeEventListener('drop', handleDrop as any);
    };
  }, [handlePaste, handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

  useEffect(() => {
    if (defaultValue) {
      setFileList(defaultValue.fileList || []);
      setInputValue(defaultValue.query || defaultValue.inputValue || '');
    }
  }, [defaultValue]);

  if (isStreaming) {
    return (
      <div className={`${styles.chatInput} ${fancy ? styles.fancy : ''}`}>
        <div className={styles.streamingSection}>
          <span className={styles.streamingText}>{$t("global-1688-ai-app.select-product.ChatInput.rwzxz", "任务执行中...")}</span>
          <LoadingCircle className={styles.loadingIcon} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.chatInput} ${fancy ? styles.fancy : ''}`}>
      <div
        className={styles.inputSection}
        ref={inputSectionRef}
      >
        <UploadArea
          list={enableUploadImage ? fileList : []}
          onRemove={handleFileListRemove}
          uploading={uploadStatus === UPLOAD_STATUS.UPLOADING}
          uploadingPreview={uploadingPreview}
        />
        <div className={styles.inputContent}>
          {prefix}
          <InputArea
            onChange={handleChange}
            placeholder={placeholder}
            handleEnter={handleSubmit}
            value={inputValue}
            parentContainerRef={inputSectionRef}
            defaultValue={defaultValue?.query || defaultValue?.inputValue || ''}
            onFocus={handleInputFocus}
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
                  icon={<UploadArrowIcon fill={'var(--icon-primary)'} />}
                  className={styles.uploadButton}
                >{$t("global-1688-ai-app.select-product.ChatInput.udu", "上传商品图")}</Button>
              </UploadBtn>
            )}
          </div>
          {sendButton ? (
            React.isValidElement(sendButton) ? (
              React.cloneElement(sendButton as React.ReactElement<any>, {
                onClick: () => {
                  handleSubmit();
                },
                disabled: sendBtnDisabled || ((!inputValue.trim() && fileList.length === 0) || isStreaming),
              })
            ) : (
              <div
                onClick={handleSubmit}
              >
                {sendButton}
              </div>
            )
          ) : (
            <Button
              icon={<ChatBoxSend />}
              type="primary"
              shape="circle"
              onClick={handleSubmit}
              disabled={sendBtnDisabled || (!inputValue.trim() && fileList.length === 0)}
              className={styles.sendButton}
            />
          )}
        </div>
      </div>
    </div>
  );
};
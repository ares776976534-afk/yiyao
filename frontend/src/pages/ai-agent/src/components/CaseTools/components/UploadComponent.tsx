import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button } from 'antd';
import { DeleteIcon, UploadIcon, AddMoreIcon } from '@/components/Icons/Upload';
import Loading from '@/components/InputChat/components/Loading';
import ProgressiveImage from '@/components/ProgressiveImage';
import useToast from '@/components/Toast';
import {
  selectImage,
  selectMultipleImages,
  createTypeFileItems,
  simulateProgressForFiles,
  validateImage,
  formatInvalidImagesMessage,
  IMAGE,
  getImageDimensions,
  validateImageDimensions,
  getImageDimensionErrorMessage,
} from '@/components/InputChat/utils/fileSelector';
import { useFileSelector } from '@/components/InputChat/hooks/useFileSelector';
import type { TypeFileItem } from '@/components/InputChat/utils/fileSelector';
import { $t } from '@/i18n';
import type { TypeUploadComponentProps } from '../types';
import styles from './UploadComponent.module.scss';

export const UploadComponent: React.FC<TypeUploadComponentProps> = ({
  preview = true,
  uploadConfig,
  uploadedFiles,
  uploadIcon,
  onFilesUpload,
  onFileDelete,
  store,
  uploadClassNames = {
    root: '',
    uploadIcon: '',
    uploadText: '',
  },
}) => {
  const fileSelectorState = useFileSelector();
  const toast = useToast();
  const [brigeLoading, setBrigeLoading] = useState(false);
  const uploadedFilesRef = useRef<TypeFileItem[]>([]);
  // 追踪正在处理中的文件数量,用于防止连续上传时超过限制
  const processingCountRef = useRef(0);

  const uploadAndFilterImageItems = async (
    items: TypeFileItem[],
  ): Promise<TypeFileItem[]> => {
    const uploadedItems = await Promise.all(
      items.map(async (item) => {
        if (item.type === IMAGE) {
          try {
            const url = await store.uploadImageFile(item.file);
            return { ...item, imagePreviewUrl: url } as TypeFileItem;
          } catch (e) {
            toast.error(e.message || '图片上传失败');
            return null;
          }
        }
        return item;
      }),
    );
    return uploadedItems.filter(Boolean) as TypeFileItem[];
  };

  // 统一的选择前过滤与告警（格式、大小、数量、尺寸校验）
  const beforeUpload = async (files: File[]): Promise<File[] | null> => {
    if (!files || files.length === 0) return null;

    // 不允许同时上传多种文件类型
    const fileTypes = new Set(files.map((file) => file.type.split('/')[0]));
    if (fileTypes.size > 1) {
      toast.info(
        $t(
          'global-1688-ai-app.CaseTools.multipleFileTypes',
          '不允许同时上传多种文件类型',
        ),
      );
      return null;
    }

    // 1. 校验格式，过滤出合格的图片文件
    const validFiles: File[] = [];
    let invalidFormatCount = 0;

    for (const file of files) {
      const result = validateImage(file);
      if (result === true) {
        validFiles.push(file);
      } else {
        invalidFormatCount += 1;
      }
    }

    // 提示格式不合规的文件
    if (invalidFormatCount > 0) {
      toast.warning(formatInvalidImagesMessage(invalidFormatCount));
    }

    if (validFiles.length === 0) return null;

    // 2. 检查数量限制
    const { multiple = false, maxCount } = uploadConfig;
    // 统计已存在的文件数量(包括正在处理中的)
    const currentCount =
      uploadedFilesRef.current.length + processingCountRef.current;

    const shouldBlockInvalidSize = false; // 开关 决定是否拦截不符合尺寸要求的图片上传

    // 单选模式直接处理
    if (!multiple) {
      if (validFiles.length > 1) {
        toast.warning(
          $t(
            'global-1688-ai-app.CaseTools.ganaidc',
            '该上传区域只能上传1个文件，已自动选择第一个',
          ),
        );
      }
      const filesToCheck = validFiles.slice(0, 1);

      // 校验尺寸
      const validFilesWithDimensions: File[] = [];
      let invalidDimensionCount = 0;

      await Promise.all(
        filesToCheck.map(async (file) => {
          try {
            const dimensions = await getImageDimensions(file);
            const imageDimensionsValid = validateImageDimensions(
              dimensions.width,
              dimensions.height,
              file.size,
            );

            if (imageDimensionsValid) {
              validFilesWithDimensions.push(file);
            } else {
              invalidDimensionCount++;
            }
          } catch (error) {
            invalidDimensionCount++;
          }
        }),
      );

      // 根据开关决定是拦截还是只提示
      if (shouldBlockInvalidSize) {
        // 拦截模式:尺寸不合格的图片不允许上传
        if (invalidDimensionCount > 0) {
          toast.error(getImageDimensionErrorMessage());
        }

        return validFilesWithDimensions.length > 0
          ? validFilesWithDimensions
          : null;
      } else {
        // 提示模式:只提示但允许上传
        if (invalidDimensionCount > 0) {
          toast.error(getImageDimensionErrorMessage());
        }

        return filesToCheck;
      }
    }

    // 多选模式：先按数量裁剪,只对真正会被上传的图片进行尺寸校验
    const availableSlots = maxCount
      ? maxCount - currentCount
      : validFiles.length;
    if (availableSlots <= 0) {
      toast.warning(
        $t(
          'global-1688-ai-app.CaseTools.zzoi',
          `最多只能上传${maxCount}个文件`,
          [maxCount || 0],
        ),
      );
      return null;
    }

    // 3. 从图片中按数量裁剪
    const finalFiles = validFiles.slice(0, availableSlots);

    // 4. 校验尺寸
    const validFilesWithDimensions: File[] = [];
    let invalidDimensionCount = 0;

    await Promise.all(
      finalFiles.map(async (file) => {
        try {
          const dimensions = await getImageDimensions(file);
          const imageDimensionsValid = validateImageDimensions(
            dimensions.width,
            dimensions.height,
            file.size,
          );

          if (imageDimensionsValid) {
            validFilesWithDimensions.push(file);
          } else {
            invalidDimensionCount++;
          }
        } catch (error) {
          invalidDimensionCount++;
        }
      }),
    );

    // 根据开关决定是拦截还是只提示
    if (shouldBlockInvalidSize) {
      // 拦截模式:尺寸不合格的图片不允许上传
      if (validFilesWithDimensions.length === 0) {
        if (invalidDimensionCount > 0) {
          toast.error(getImageDimensionErrorMessage());
        }
        return null;
      }

      if (invalidDimensionCount > 0) {
        toast.error(getImageDimensionErrorMessage());
      }

      return validFilesWithDimensions;
    } else {
      // 提示模式:只提示但允许上传
      if (invalidDimensionCount > 0) {
        toast.error(getImageDimensionErrorMessage());
      }

      // 如果图片数量超过剩余可上传数量,提示超限
      if (validFiles.length > availableSlots) {
        toast.warning(
          $t(
            'global-1688-ai-app.CaseTools.zhoidc',
            `最多还能上传${availableSlots}个文件，已自动选择前${availableSlots}个`,
            [availableSlots, availableSlots],
          ),
        );
      }

      return finalFiles;
    }
  };

  // 统一处理文件上传
  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;

    // 统一校验：格式、大小、数量、尺寸
    const filtered = await beforeUpload(arr);
    if (!filtered || filtered.length === 0) {
      return;
    }

    // 标记正在处理的文件数量
    processingCountRef.current += filtered.length;

    try {
      setBrigeLoading(true);
      const [_, items] = await Promise.all([
        simulateProgressForFiles(filtered, fileSelectorState.instance),
        createTypeFileItems(filtered),
      ]);
      const readyItems = await uploadAndFilterImageItems(items);
      if (readyItems.length > 0) {
        // 合并新上传的文件和已有文件
        const newFiles = [...uploadedFiles, ...readyItems];
        onFilesUpload(newFiles);
      }
    } catch (error) {
      console.error('上传文件失败', error);
      toast.error('上传文件失败');
    } finally {
      // 处理完成后减去数量
      processingCountRef.current -= filtered.length;
      setBrigeLoading(false);
    }
  };

  // 点击上传
  const handleUploadClick = async () => {
    try {
      const { multiple = false } = uploadConfig;
      let files: File[];

      if (multiple) {
        // 多选模式
        files = await selectMultipleImages({
          beforeUpload,
          instance: fileSelectorState.instance,
        });
      } else {
        // 单选模式
        const file = await selectImage({
          beforeUpload,
        });
        files = [file];
      }

      if (!files || files.length === 0) return;

      // 标记正在处理的文件数量
      processingCountRef.current += files.length;

      try {
        setBrigeLoading(true);
        const [_, items] = await Promise.all([
          simulateProgressForFiles(files, fileSelectorState.instance),
          createTypeFileItems(files),
        ]);
        const readyItems = await uploadAndFilterImageItems(items);
        if (readyItems.length > 0) {
          const newFiles = [...uploadedFiles, ...readyItems];
          onFilesUpload(newFiles);
        }
      } catch (error) {
        console.error('上传文件失败', error);
        toast.error('上传文件失败');
      } finally {
        // 处理完成后减去数量
        processingCountRef.current -= files.length;
        setBrigeLoading(false);
      }
    } catch (error) {
      console.error('选择文件失败', error);
    }
  };

  // 拖拽相关
  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const { files, items } = event.dataTransfer;
    if (items && items.length > 0) {
      const hasFile = Array.from(items).some((it) => it.kind === 'file');
      if (!hasFile) return;
    }

    handleFiles(files);
  };

  const isLoading = fileSelectorState.isLoading || brigeLoading;
  const isMultipleMode = uploadConfig.multiple;
  const hasFiles = uploadedFiles.length > 0;

  // multiple模式下的loading逻辑：有文件时用Loading，无文件时用LoadingIcon
  const shouldShowLoadingIcon =
    (!isMultipleMode && isLoading) ||
    (isMultipleMode && isLoading && !hasFiles);
  const shouldShowLoadingInMultiple = isMultipleMode && isLoading && hasFiles;

  const shouldShowAddMoreButton =
    isMultipleMode &&
    (!uploadConfig.maxCount || uploadedFiles.length < uploadConfig.maxCount) &&
    !isLoading;

  useEffect(() => {
    uploadedFilesRef.current = uploadedFiles?.length > 0 ? uploadedFiles : [];
  }, [uploadedFiles]);

  return (
    <div className={classNames(styles.uploadContainer, uploadClassNames.root)}>
      <div
        className={classNames(styles.uploadArea, uploadClassNames.uploadArea)}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={handleUploadClick}
      >
        {shouldShowLoadingIcon ? (
          <div className={styles.loadingIcon} />
        ) : (
          <>
            {uploadedFiles.length > 0 ? (
              <div
                // className={[
                //   styles.filePreviewContainer,
                //   uploadConfig.multiple
                //     ? styles.multipleFilePreviewContainer
                //     : "",
                // ].join(" ")}
                className={classNames(
                  styles.filePreviewContainer,
                  uploadConfig.multiple && styles.multipleFilePreviewContainer,
                  uploadClassNames.filePreviewContainer,
                )}
              >
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={styles.filePreview}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <ProgressiveImage
                      className={styles.progressiveImage}
                      preview={preview}
                      src={file.imagePreviewUrl}
                      alt={$t(
                        'global-1688-ai-app.CaseTools.imagePreview',
                        '图片预览',
                      )}
                    />
                    <div
                      className={classNames(
                        styles.deleteButton,
                        uploadClassNames.deleteButton,
                      )}
                      onClick={() => onFileDelete(file.id)}
                      title={$t('global-1688-ai-app.CaseTools.delete', '删除')}
                    >
                      <DeleteIcon />
                    </div>
                  </div>
                ))}
                {shouldShowAddMoreButton && (
                  <div className={styles.addMoreButton}>
                    <AddMoreIcon />
                    <div>
                      {$t('global-1688-ai-app.CaseTools.dcupload', '点此上传')}
                    </div>
                  </div>
                )}
                {shouldShowLoadingInMultiple && <Loading />}
              </div>
            ) : (
              <>
                <div
                  className={classNames(
                    styles.uploadIcon,
                    uploadClassNames.uploadIcon,
                  )}
                >
                  {uploadIcon}
                </div>
                <div
                  className={classNames(
                    styles.uploadText,
                    uploadClassNames.uploadText,
                  )}
                >
                  {uploadConfig.label}
                </div>
                <Button
                  type="primary"
                  className={styles.uploadButton}
                  disabled={fileSelectorState.isLoading}
                >
                  <UploadIcon />
                  {$t('global-1688-ai-app.CaseTools.bdupload', '本地上传')}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

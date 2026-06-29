import React from 'react';
import { Upload, message, Popover } from 'antd';
import { uploadImage } from '@/pages/inquiry/services';
import { inquiryApiBaseUrl } from '@/utils/env';
import LoadingIcon from './Icon/Loading';
import UploadGuide from './UploadGuide';

import styles from './uploadBtn.module.css';

export enum UPLOAD_STATUS {
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  ERROR = 'ERROR',
  NO_UPLOAD = 'NO_UPLOAD',
}

export const checkImageFile = (file: File): boolean => {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/jpg') {
    message.error('请上传JPG/PNG格式图片');
    return false;
  }
  if (file.size > 10 * 1024 * 1024) {
    message.error('请上传不超过10MB的图片');
    return false;
  }
  return true;
};

export const uploadFileRequest = (
  file: File,
  callbacks: {
    onStatusChange: (status: UPLOAD_STATUS) => void;
    onPreviewChange: (previewUrl: string | null) => void;
    onSuccess: (data: { imgFileKey: string; previewUrl: string }) => void;
  },
) => {
  const { onStatusChange, onPreviewChange, onSuccess } = callbacks;
  const formData = new FormData();
  const previewUrl = URL.createObjectURL(file);
  onPreviewChange(previewUrl);
  onStatusChange(UPLOAD_STATUS.UPLOADING);
  formData.append('file', file);
  uploadImage(formData).then((res: any) => {
    if (res?.data?.fileKey) {
      const newData = {
        imgFileKey: res.data.fileKey,
        previewUrl: res.data.previewUrl,
      };
      onStatusChange(UPLOAD_STATUS.UPLOADED);
      onPreviewChange(null);
      onSuccess({
        imgFileKey: newData.imgFileKey,
        previewUrl: newData.previewUrl,
      });
      URL.revokeObjectURL(previewUrl);
    } else {
      onStatusChange(UPLOAD_STATUS.ERROR);
      onPreviewChange(null);
      URL.revokeObjectURL(previewUrl);
    }
  }).catch(() => {
    onStatusChange(UPLOAD_STATUS.ERROR);
    onPreviewChange(null);
    URL.revokeObjectURL(previewUrl);
  });
};

interface UploadBtnProps {
  children: React.ReactNode;
  onChange?: (data: any) => void;
  onUploadStatusChange?: (status: UPLOAD_STATUS) => void;
  onUploadPreviewChange?: (previewUrl: string | null) => void;
}

interface TypeUploadAreaProps {
  list?: any[];
  onRemove?: (id: string) => void;
  uploading?: boolean;
  uploadingPreview?: string | null;
}

export const UploadArea = ({
  list = [] as any[],
  onRemove = () => { },
  uploading = false,
  uploadingPreview = null,
}: TypeUploadAreaProps) => {
  const handleRemove = (id: string) => {
    onRemove(id);
  };
  return (list.length > 0 || uploading) ? (
    <div className={styles.uploadArea}>
      {list?.map((item: any) => (
        <div key={item.imgFileKey} className={styles.uploadItem}>
          <img src={item.previewUrl} alt={item.name} className={styles.uploadItemImage} />
          <div onClick={() => handleRemove(item.imgFileKey)} className={styles.uploadItemDelete} />
        </div>
      ))}
      {
        uploading && uploadingPreview && (
          <div className={styles.uploadItemUploading}>
            <img src={uploadingPreview} alt="uploading" className={styles.uploadItemImage} />
            <div className={styles.uploadItemMask}>
              <LoadingIcon className={styles.uploadItemUploadingIcon} />
            </div>
          </div>
        )
      }
    </div>
  ) : null;
};

export default function UploadBtn({
  children,
  onChange = () => { },
  onUploadStatusChange = () => { },
  onUploadPreviewChange = () => { },
}: UploadBtnProps) {
  const handleCustomRequest = (options: any) => {
    uploadFileRequest(options.file, {
      onStatusChange: onUploadStatusChange,
      onPreviewChange: onUploadPreviewChange,
      onSuccess: (data) => {
        onChange({ ...data, offerId: undefined });
      },
    });
  };

  return (
    <Popover
      content={<UploadGuide />}
      trigger="hover"
      placement="bottom"
      arrow={false}
      classNames={{
        root: 'uploadGuidePopover',
      }}
    >
      <Upload
        showUploadList={false}
        customRequest={handleCustomRequest}
        beforeUpload={checkImageFile}
        accept="image/jpeg,image/png,image/jpg"
        action={`${inquiryApiBaseUrl}/api/inquiry/item/upload`}
      >
        {children}
      </Upload>
    </Popover>
  );
}
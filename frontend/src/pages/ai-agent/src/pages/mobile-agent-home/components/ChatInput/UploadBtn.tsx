import React, { useRef, useState } from 'react';
// import { Upload, message } from 'antd-mobile';
import { Toast } from 'antd-mobile';
import { uploadImage } from '@/pages/inquiry/services';
import { inquiryApiBaseUrl } from '@/utils/env';
import LoadingIcon from './Icon/Loading';

import styles from './uploadBtn.module.scss';
import { CloseIcon } from '@/components/Icons';
import { $t } from '@/i18n';

export enum UPLOAD_STATUS {
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  ERROR = 'ERROR',
  NO_UPLOAD = 'NO_UPLOAD',
}

interface UploadBtnProps {
  children: React.ReactNode;
  onChange?: (data: any) => void;
  onUploadStatusChange?: (status: UPLOAD_STATUS) => void;
  onUploadPreviewChange?: (previewUrl: string | null) => void;
}

export const UploadArea = ({ list = [] as any[], onRemove = (id: string) => { }, uploading = false,
  uploadingPreview = null }: {
    list?: any[]; onRemove?: (id: string) => void; uploading?: boolean;
    uploadingPreview?: string | null;
  }) => {
  const handleRemove = (id: string) => {
    onRemove(id);
  };
  return (list.length > 0 || uploading) ? (
    <div className={styles.uploadArea}>
      {list?.map((item: any) => (
        <div key={item.imgFileKey} className={styles.uploadItem}>
          <img src={item.previewUrl} alt={item.name} className={styles.uploadItemImage} />
          <div onClick={() => handleRemove(item.imgFileKey)} className={styles.uploadItemDelete} >
            <CloseIcon size="3.7333333vw" />
          </div>
        </div>
      ))}
      {
        uploading && uploadingPreview && (
          <div className={styles.uploadItemUploading}>
            <img src={uploadingPreview} alt="uploading" className={styles.uploadItemImage} />
            <div className={styles.uploadItemMask}>
              <LoadingIcon width="5.333vw" height="5.333vw" className={styles.uploadItemUploadingIcon} />
            </div>
          </div>
        )
      }
    </div>
  ) : null;
};

export default function UploadBtn({ children, onChange = (data: any) => { },
  onUploadStatusChange = (status: UPLOAD_STATUS) => { },
  onUploadPreviewChange = (previewUrl: string | null) => { } }: UploadBtnProps) {
  const [uploadStatus, setUploadStatus] = useState(UPLOAD_STATUS.NO_UPLOAD);
  const [uploadData, setUploadData] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleUploadStatusChange = (status: UPLOAD_STATUS) => {
    setUploadStatus(status);
    onUploadStatusChange(status);
  };

  const handleUploadBeforeCheck = (file: File) => {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/jpg') {
      Toast.show($t("global-1688-ai-app.mobile-agent-home.ChatInput.UploadBtn.qaPI", "请上传JPG/PNG格式图片"));
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      Toast.show($t("global-1688-ai-app.mobile-agent-home.ChatInput.UploadBtn.qa1I", "请上传不超过10MB的图片"));
      return false;
    }
    return true;
  };

  const handleCustomRequest = (file: File) => {
    const formData = new FormData();
    // 创建本地预览URL
    const previewUrl = URL.createObjectURL(file);
    onUploadPreviewChange(previewUrl);
    handleUploadStatusChange(UPLOAD_STATUS.UPLOADING);
    formData.append('file', file);
    uploadImage(formData).then((res: any) => {
      if (res?.data?.fileKey) {
        const newData = {
          imgFileKey: res.data.fileKey,
          previewUrl: res.data.previewUrl,
        };
        setUploadData(newData);
        handleUploadStatusChange(UPLOAD_STATUS.UPLOADED);
        onUploadPreviewChange(null); // 清空预览
        // 直接触发onChange，避免useEffect死循环
        onChange && onChange({
          imgFileKey: newData.imgFileKey,
          offerId: undefined,
          previewUrl: newData.previewUrl,
        });
        // 释放本地URL
        URL.revokeObjectURL(previewUrl);
      } else {
        handleUploadStatusChange(UPLOAD_STATUS.ERROR);
        onUploadPreviewChange(null);
        URL.revokeObjectURL(previewUrl);
      }
    })
      .catch((err: any) => {
        handleUploadStatusChange(UPLOAD_STATUS.ERROR);
        onUploadPreviewChange(null);
        URL.revokeObjectURL(previewUrl);
      });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file && handleUploadBeforeCheck(file)) {
      handleCustomRequest(file);
    }
  };

  return (
    // <Upload
    //   showUploadList={false}
    //   customRequest={handleCustomRequest}
    //   beforeUpload={handleUploadBeforeCheck}
    //   accept="image/jpeg,image/png,image/jpg"
    //   action={`${inquiryApiBaseUrl}/api/inquiry/item/upload`}
    // >
    //   {children}
    // </Upload>
    <div onClick={() => {
      inputRef.current?.click();
    }}
    >
      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
      />
      {children}</div>
  );
}
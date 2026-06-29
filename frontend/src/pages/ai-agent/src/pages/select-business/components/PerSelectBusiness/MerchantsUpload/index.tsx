import React, { useState, useEffect } from 'react';
import { Input, Button, Upload, message } from 'antd';
import IndexBlock from '@/pages/inquiry/components/IndexBlock';
// import { serviceBaseUrl } from '@/utils/env';
// import { uploadImageForSelectProduct } from './services';
import { UploadLoadingIcon, UploadOutlinedIcon, LinkOutlinedIcon, ImgDeleteIcon } from '@/components/Icon';
import CropRegion from '@/components/crop-region';
// import { fileToBase64 } from '@/utils/imageUtils';

import styles from './index.module.css';


// 工具函数：将坐标数组转换为字符串
const coordinatesToString = (coordinates: number[]): string => {
  return coordinates.join(',');
};

// 工具函数：合并区域字符串
const joinRegions = (currentRegion: string, originYoloCropRegion: string): string => {
  if (!originYoloCropRegion) return currentRegion;
  if (!currentRegion) return originYoloCropRegion;
  return `${currentRegion};${originYoloCropRegion}`;
};


// enum UPLOAD_TYPE {
//   IMAGE = 'ITEM_IMG',
//   LINK_1688 = 'ITEM_LINK',
// }

// enum UPLOAD_STATUS {
//   UPLOADING = 'UPLOADING',
//   UPLOADED = 'UPLOADED',
//   ERROR = 'ERROR',
//   NO_UPLOAD = 'NO_UPLOAD',
// }

interface ProductUploadProps {
  onChange?: (product: ChangeValue) => void;
  // value?: ChangeValue;
  title?: React.ReactNode | string;
  isDisabled?: boolean;
  imageUrl: string;
  currentRegion: string;
  yoloCropRegion: string;
}

interface ChangeValue {
  // imgFileKey?: string;
  // offerId?: string;
  // type?: UPLOAD_TYPE;
  // previewUrl?: string;
  currentRegion?: string;
  yoloCropRegion?: string;
}

// const UploadLoading = ({ type }) => {
//   const loaddingText = {
//     [UPLOAD_TYPE.IMAGE]: '正在上传图片',
//     [UPLOAD_TYPE.LINK_1688]: '正在解析商品链接',
//   };
//   return (
//     <div className={styles.uploadLoading}>
//       <div className={styles.uploadLoadingIcon}>
//         <UploadLoadingIcon />
//       </div>
//       <div className={styles.uploadLoadingText}>{loaddingText[type]}</div>
//     </div>
//   );
// };

const MerchantsUpload: React.FC<ProductUploadProps> = ({ onChange, imageUrl,
  currentRegion,
  yoloCropRegion,
  title,
  isDisabled,
}) => {
  // const [uploadData, setUploadData] = useState<any>(value ? {
  //   imgFileKey: value.imgFileKey,
  //   offerId: value.offerId,
  //   previewUrl: null, // 这个需要从服务器获取或者从value中传递
  // } : null);
  // const [uploadStatus, setUploadStatus] =
  // useState(value?.previewUrl ? UPLOAD_STATUS.UPLOADED : UPLOAD_STATUS.NO_UPLOAD);
  // const [uploadType, setUploadType] = useState(value?.type || UPLOAD_TYPE.IMAGE);
  // const [link, setLink] = useState('');
  // const [currentRegion, setCurrentRegion] = useState('');
  // const [yoloCropRegion, setYoloCropRegion] = useState('');
  // const handleUploadBeforeCheck = (file: any) => {
  //   if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/jpg') {
  //     message.error('请上传JPG/PNG格式图片');
  //     return false;
  //   }
  //   if (file.size > 5 * 1024 * 1024) {
  //     message.error('请上传不超过5MB的图片');
  //     return false;
  //   }
  //   return true;
  // };
  // const handleCustomRequest = async (options: any, urlImage?: string) => {
  //   try {
  //     setUploadStatus(UPLOAD_STATUS.UPLOADING);
  //     setUploadType(UPLOAD_TYPE.IMAGE);
  //     // 异步获取base64，使用统一的工具函数
  //     const base64 = urlImage || await fileToBase64(options.file, 1000, 0.8);
  //     const formData = new FormData();
  //     // formData.append('file', options.file);
  //     const uploadResult = await uploadImageForSelectProduct(JSON.stringify({
  //       uploadType: urlImage ? 'IMAGE_LINK' : 'IMAGE',
  //       imageBase64: base64,
  //       imageUrl: urlImage,
  //       ...formData,
  //     }));

  //     if (uploadResult?.data) {
  //       const newData = {
  //         previewUrl: uploadResult.data.imageUrl,
  //       };
  //       setCurrentRegion(uploadResult?.data?.currentRegion);
  //       setYoloCropRegion(uploadResult?.data?.yoloCropRegion?.split(';').slice(0, 5).join(';'));
  //       setUploadData(newData);
  //       setUploadStatus(UPLOAD_STATUS.UPLOADED);
  //       // 直接触发onChange，避免useEffect死循环
  //       onChange && onChange({
  //         offerId: undefined,
  //         type: UPLOAD_TYPE.IMAGE,
  //         previewUrl: newData.previewUrl,
  //         currentRegion: uploadResult?.data?.currentRegion,
  //         yoloCropRegion: uploadResult?.data?.yoloCropRegion,
  //       });
  //     } else {
  //       message.error(uploadResult?.data?.mesg || '上传失败');
  //       setUploadStatus(UPLOAD_STATUS.ERROR);
  //     }
  //   } catch (err: any) {
  //     console.error('上传过程出错：', err);
  //     setUploadStatus(UPLOAD_STATUS.ERROR);
  //   }
  // };

  // const handleParseLink = () => {
  //   if (!link) return;
  //   setUploadStatus(UPLOAD_STATUS.UPLOADING);
  //   setUploadType(UPLOAD_TYPE.LINK_1688);
  //   uploadImageForSelectProduct(JSON.stringify({
  //     uploadType: 'IMAGE_LINK',
  //     imageUrl: link,
  //   })).then((res: any) => {
  //     if (res?.data) {
  //       const newData = {
  //         previewUrl: res.data.imageUrl,
  //       };
  //       setCurrentRegion(res?.data?.currentRegion);
  //       setYoloCropRegion(res?.data?.yoloCropRegion?.split(';').slice(0, 5).join(';'));
  //       setUploadData(newData);
  //       setUploadStatus(UPLOAD_STATUS.UPLOADED);
  //       // 直接触发onChange，避免useEffect死循环
  //       onChange && onChange({
  //         imgFileKey: undefined,
  //         type: UPLOAD_TYPE.LINK_1688,
  //         previewUrl: newData.previewUrl,
  //         currentRegion: res?.data?.currentRegion,
  //         yoloCropRegion: res?.data?.yoloCropRegion,
  //       });
  //     } else {
  //       message.error(res?.data?.mesg || '解析失败');
  //       setUploadStatus(UPLOAD_STATUS.ERROR);
  //     }
  //   })
  //     .catch((err: any) => {
  //       console.error('上传过程出错：', err);
  //       setUploadStatus(UPLOAD_STATUS.ERROR);
  //     });
  // };

  // const handleDelete = () => {
  //   setUploadData(null);
  //   setUploadStatus(UPLOAD_STATUS.NO_UPLOAD);
  //   setLink('');
  //   // 直接触发onChange，避免useEffect死循环
  //   onChange && onChange({
  //     imgFileKey: undefined,
  //     offerId: undefined,
  //     type: UPLOAD_TYPE.IMAGE, // 重置为默认类型
  //     previewUrl: undefined,
  //     currentRegion,
  //     yoloCropRegion,
  //   });
  // };

  // 监听外部value变化 - 不触发onChange避免循环
  // useEffect(() => {
  //   if (value?.previewUrl) {
  //     // 如果 value 中有 previewUrl，直接使用
  //     setUploadData({
  //       imgFileKey: value.imgFileKey,
  //       offerId: value.offerId,
  //       previewUrl: value.previewUrl,
  //     });
  //     setUploadStatus(UPLOAD_STATUS.UPLOADED);
  //     setUploadType(value.type || UPLOAD_TYPE.IMAGE);
  //     setCurrentRegion(value.currentRegion || '');
  //     setYoloCropRegion(value.yoloCropRegion || '');
  //   } else if (value?.imgFileKey || value?.offerId) {
  //     setUploadData({
  //       imgFileKey: value.imgFileKey,
  //       offerId: value.offerId,
  //       previewUrl: value.previewUrl || null, // 保持原有的previewUrl
  //     });
  //     setUploadStatus(UPLOAD_STATUS.UPLOADED);
  //     setUploadType(value.type || UPLOAD_TYPE.IMAGE);
  //   } else if (!value) {
  //     setUploadData(null);
  //     setUploadStatus(UPLOAD_STATUS.NO_UPLOAD);
  //     setLink('');
  //   }
  // }, [value]);

  // useEffect(() => {
  //   if (imageUrl && uploadStatus === UPLOAD_STATUS.NO_UPLOAD) {
  //     handleCustomRequest(null, imageUrl);
  //   }
  // }, [imageUrl]);

  // 组件挂载后初始化报告当前值 - 延迟执行避免循环
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     onChange && onChange({
  //       imgFileKey: uploadData?.imgFileKey,
  //       offerId: uploadData?.offerId,
  //       type: uploadType,
  //       previewUrl: uploadData?.previewUrl,
  //       currentRegion,
  //       yoloCropRegion,
  //     });
  //   }, 0);
  //   return () => clearTimeout(timer);
  // }, []); // 只在组件挂载时执行一次

  const handleCropChange = (
    cropRegion: number[],
    originYoloCropRegion: string,
  ) => {
    const currentRegionTemp = coordinatesToString(cropRegion);
    const yoloCropRegionTemp = joinRegions(currentRegion, originYoloCropRegion);

    return {
      currentRegion: currentRegionTemp,
      yoloCropRegion: yoloCropRegionTemp,
    };
  };
  const handleCropClick = (cropRegion: string) => {
    onChange && onChange({
      // ...value,
      currentRegion: cropRegion,
    });
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <div style={{
      display: 'block !important',
      width: '100%',
      flex: 'none !important',
      alignItems: 'unset !important',
    }}
    >
      <IndexBlock
        title={title}
      >
        <div className={styles.productSection}>
          {/* {
            uploadStatus === UPLOAD_STATUS.UPLOADING && <UploadLoading type={uploadType} />
          } */}
          {
            // (uploadStatus === UPLOAD_STATUS.UPLOADED || value?.previewUrl) && (
            <div className={styles.uploadData}>
              {/* {
                  uploadType === UPLOAD_TYPE.IMAGE && (
                    <CropRegion
                      cropImage={uploadData.previewUrl || value?.previewUrl}
                      currentRegion={currentRegion}
                      yoloCropRegion={yoloCropRegion}
                      onCropChange={(
                        cropRegion: number[],
                        originYoloCropRegion: string,
                      ) => {
                        const { currentRegion: currentRegionTemp,
                          yoloCropRegion: yoloCropRegionTemp } = handleCropChange(
                          cropRegion,
                          originYoloCropRegion,
                        );
                        // 设置当前区域和yolo区域
                        setCurrentRegion(currentRegionTemp);
                        setYoloCropRegion(yoloCropRegionTemp);
                      }}
                      onCropClick={handleCropClick}
                    />
                  )
                } */}
              <CropRegion
                cropImage={imageUrl}
                currentRegion={currentRegion}
                yoloCropRegion={yoloCropRegion}
                disabled={isDisabled}
                onCropChange={(
                  cropRegion: number[],
                  originYoloCropRegion: string,
                ) => {
                  const { currentRegion: currentRegionTemp,
                    yoloCropRegion: yoloCropRegionTemp } = handleCropChange(
                      cropRegion,
                      originYoloCropRegion,
                    );
                  onChange && onChange({
                    currentRegion: currentRegionTemp,
                    yoloCropRegion: yoloCropRegionTemp,
                  });
                  // 设置当前区域和yolo区域
                  // setCurrentRegion(currentRegionTemp);
                  // setYoloCropRegion(yoloCropRegionTemp);
                }}
                onCropClick={handleCropClick}
              />
              {/* {!disabled && (
                  <div className={styles.uploadDataDelete} onClick={handleDelete}>
                    <ImgDeleteIcon style={{ width: 15, height: 15 }} />
                  </div>
                )} */}
            </div>
            // )
          }
          {/* {
            uploadStatus === UPLOAD_STATUS.NO_UPLOAD && (
              <>
                <Upload.Dragger
                  className={styles.antdUpload}
                  showUploadList={false}
                  action={`${inquiryApiBaseUrl}/api/inquiry/item/upload`}
                  customRequest={handleCustomRequest}
                  beforeUpload={handleUploadBeforeCheck}
                  accept="image/jpeg,image/png,image/jpg"
                >
                  <div className={styles.uploadCard}>
                    <UploadOutlinedIcon />
                    <div className={styles.uploadText}>
                      <span className={styles.uploadTitle}>点击上传商品图</span>
                      <span className={styles.uploadSubtitle}>支持JPG/PNG格式，文件大小不超过5MB</span>
                    </div>
                  </div>
                </Upload.Dragger>
                <span className={styles.orText}>或</span>
                <div className={styles.linkCard}>
                  <LinkOutlinedIcon />
                  <div className={styles.linkContent}>
                    <span className={styles.linkTitle}>解析图片链接</span>
                    <div className={styles.linkInputContainer}>
                      <Input
                        placeholder="请粘贴链接到此处"
                        className={styles.antdLinkInput}
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        style={{
                          height: '36px',
                          lineHeight: '20px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        suffix={<Button
                          type="link"
                          className={styles.parseButton}
                          onClick={handleParseLink}
                          style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                            padding: '0 8px',
                          }}
                        >解析</Button>}
                      />
                    </div>
                  </div>
                </div>
              </>
            )
          } */}
          {/* {
            uploadStatus === UPLOAD_STATUS.ERROR && (
              <div className={styles.uploadData}>
                <div className={styles.uploadDataDelete} onClick={handleDelete}>
                  <ImgDeleteIcon style={{ width: 15, height: 15 }} />
                </div>
                <div className={styles.uploadErrorText}>上传失败</div>
              </div>
            )
          } */}
        </div >
      </IndexBlock >
    </div>
  );
};

export default MerchantsUpload;
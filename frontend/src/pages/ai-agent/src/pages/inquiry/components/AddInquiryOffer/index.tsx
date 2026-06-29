import React, { useState, useEffect } from 'react';
import { Input, Button, Upload, message } from 'antd';
import IndexBlock from '../IndexBlock';
import { serviceBaseUrl, inquiryApiBaseUrl } from '@/utils/env';
import { uploadImage, parse1688Link } from '@/pages/inquiry/services';
import { UploadLoadingIcon, ImgDeleteIcon, ImgLinkIcon, InquiryUpload, InquiryLink } from '@/components/Icon';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import { getNumberIcon } from '../FormatList/RightComponents/numberIconConfig';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { useSearchParams } from 'ice';

import styles from './index.module.css';
import { $t } from '@/i18n';


enum UPLOAD_TYPE {
  IMAGE = 'ITEM_IMG',
  LINK_1688 = 'ITEM_LINK',
}

enum UPLOAD_STATUS {
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  ERROR = 'ERROR',
  NO_UPLOAD = 'NO_UPLOAD',
}

interface ProductUploadProps {
  onChange?: (product: ChangeValue) => void;
  value?: ChangeValue;
  offerIdLink?: string[];
  disabled?: boolean; // 是否禁用
  showFindSupplierTip?: boolean; // 是否显示"前往寻源找商"提示
  number?: number; // 数字序号
}

interface ChangeValue {
  imgFileKey?: string;
  offerId?: string;
  type: UPLOAD_TYPE;
  previewUrl?: string;
  offerImg?: string;
}

const UploadLoading = ({ type }) => {
  const loaddingText = { 
    [UPLOAD_TYPE.IMAGE]: $t("global-1688-ai-app.inquiry.AddInquiryOffer.zoa", "正在上传图片"),
    [UPLOAD_TYPE.LINK_1688]: $t("global-1688-ai-app.inquiry.AddInquiryOffer.z6oL", "正在解析1688商品链接"),
  };
  return (
    <div className={styles.uploadLoading}>
      <div className={styles.uploadLoadingIcon}>
        <UploadLoadingIcon />
      </div>
      <div className={styles.uploadLoadingText}>{loaddingText[type]}</div>
    </div>
  );
};

const AddInquiryOffer: React.FC<ProductUploadProps> = ({
  onChange,
  value,
  offerIdLink = [],
  disabled = false,
  showFindSupplierTip = false,
  number = 1,
}) => {
  const NumberIcon = getNumberIcon(number);
  const navigate = useNavigateWithScroll();
  const { navigateByCache } = useChatQuery();
  const [searchParams] = useSearchParams();
  const urlImageUrl = searchParams.get('imageUrl');
  
  // 初始化 uploadData，确保 previewUrl 正确设置
  const getInitialUploadData = () => {
    // 优先使用 URL 参数中的图片
    if (urlImageUrl) {
      return {
        imgFileKey: urlImageUrl,
        offerId: undefined,
        previewUrl: urlImageUrl,
        offerImg: '',
      };
    }
    
    if (!value) return null;
    
    const isLinkType = value.type === UPLOAD_TYPE.LINK_1688;
    // 计算初始 previewUrl
    let previewUrl = value.previewUrl;
    if (!previewUrl) {
      if (isLinkType) {
        previewUrl = value.offerImg || '';
      } else {
        // 图片类型，使用imgFileKey作为预览URL
        previewUrl = value.imgFileKey || '';
      }
    }
    
    return {
      imgFileKey: value.imgFileKey,
      offerId: value.offerId,
      previewUrl: previewUrl,
      offerImg: value.offerImg || '',
    };
  };
  
  const [uploadData, setUploadData] = useState<any>(getInitialUploadData());
  const [uploadStatus, setUploadStatus] = useState((urlImageUrl || value) ? UPLOAD_STATUS.UPLOADED : UPLOAD_STATUS.NO_UPLOAD);
  const [uploadType, setUploadType] = useState(urlImageUrl ? UPLOAD_TYPE.IMAGE : (value?.type || UPLOAD_TYPE.IMAGE));
  const [link, setLink] = useState('');

  const handleUploadBeforeCheck = (file: any) => {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/jpg') {
      message.error('请上传JPG/PNG格式图片');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('请上传不超过5MB的图片');
      return false;
    }
    return true;
  };

  const handleCustomRequest = (options: any) => {
    console.log('options', options);
    const formData = new FormData();
    setUploadStatus(UPLOAD_STATUS.UPLOADING);
    setUploadType(UPLOAD_TYPE.IMAGE);
    formData.append('file', options.file);
    uploadImage(formData).then((res: any) => {
      if (res?.data?.fileKey) {
        const newData = {
          imgFileKey: res.data.fileKey,
          previewUrl: res.data.previewUrl,
        };
        setUploadData(newData);
        setUploadStatus(UPLOAD_STATUS.UPLOADED);
        // 直接触发onChange，避免useEffect死循环
        onChange && onChange({
          imgFileKey: newData.imgFileKey,
          offerId: undefined,
          type: UPLOAD_TYPE.IMAGE,
          previewUrl: newData.previewUrl,
        });
      } else {
        setUploadStatus(UPLOAD_STATUS.ERROR);
      }
    })
      .catch((err: any) => {
        setUploadStatus(UPLOAD_STATUS.ERROR);
      });
  };
  const handleParseLink = () => {
    if (!link) return;
    setUploadStatus(UPLOAD_STATUS.UPLOADING);
    setUploadType(UPLOAD_TYPE.LINK_1688);
    parse1688Link(link).then((res: any) => {
      if (res?.data?.offerId) {
        const newData = {
          offerId: res.data.offerId,
          previewUrl: res.data.mainImg,
          offerImg: res.data.mainImg,
        };
        setUploadData(newData);
        setUploadStatus(UPLOAD_STATUS.UPLOADED);
        // 直接触发onChange，避免useEffect死循环
        onChange && onChange({
          imgFileKey: undefined,
          offerId: newData.offerId,
          type: UPLOAD_TYPE.LINK_1688,
          previewUrl: newData.previewUrl,
          offerImg: newData.offerImg,
        });
      } else {
        // 如果返回的数据中没有 offerId，也视为失败
        setUploadStatus(UPLOAD_STATUS.ERROR);
        message.error($t("global-1688-ai-app.inquiry.AddInquiryOffer.parseLinkFailed", "解析链接失败，请检查链接是否正确或稍后重试"));
      }
    })
      .catch((err: any) => {
        setUploadStatus(UPLOAD_STATUS.ERROR);
        const errorMessage = err?.message || err?.errorMessage || $t("global-1688-ai-app.inquiry.AddInquiryOffer.parseLinkFailed", "解析链接失败，请检查链接是否正确或稍后重试");
        message.error(errorMessage);
      });
  };

  const handleDelete = () => {
    setUploadData(null);
    setUploadStatus(UPLOAD_STATUS.NO_UPLOAD);
    setLink('');
    // 直接触发onChange，避免useEffect死循环
    onChange && onChange({
      imgFileKey: undefined,
      offerId: undefined,
      type: UPLOAD_TYPE.IMAGE, // 重置为默认类型
      previewUrl: undefined,
      offerImg: undefined,
    });
  };

  // 处理 URL 参数中的图片 - 只在初始化时执行一次
  useEffect(() => {
    if (urlImageUrl && !value) {
      // URL 参数中有图片，自动设置
      const newData = {
        imgFileKey: urlImageUrl,
        offerId: undefined,
        previewUrl: urlImageUrl,
        offerImg: '',
      };
      setUploadData(newData);
      setUploadStatus(UPLOAD_STATUS.UPLOADED);
      setUploadType(UPLOAD_TYPE.IMAGE);
      
      // 通知父组件
      onChange && onChange({
        imgFileKey: newData.imgFileKey,
        offerId: undefined,
        type: UPLOAD_TYPE.IMAGE,
        previewUrl: newData.previewUrl,
        offerImg: '',
      });
    }
  }, []); // 只在组件挂载时执行一次

  useEffect(() => {
    if (offerIdLink.length > 0 && !link) {
      setLink(offerIdLink[0]);
    }
  }, [offerIdLink]);

  useEffect(() => {
    if (link && offerIdLink.length > 0) {
      handleParseLink();
    }
  }, [link]);

  // 监听外部value变化 - 不触发onChange避免循环
  useEffect(() => {
    if (value?.imgFileKey || value?.offerId) {
      const isLinkType = value.type === UPLOAD_TYPE.LINK_1688;
      let previewUrl = value.previewUrl;
      if (!previewUrl) {
        if (isLinkType) {
          previewUrl = value.offerImg || '';
        } else {
          // 图片类型，使用imgFileKey作为预览URL
          previewUrl = value.imgFileKey || '';
        }
      }
      
      setUploadData({
        imgFileKey: value.imgFileKey,
        offerId: value.offerId,
        previewUrl: previewUrl,
        offerImg: value.offerImg || null,
      });
      setUploadStatus(UPLOAD_STATUS.UPLOADED);
      setUploadType(value.type || (value.imgFileKey ? UPLOAD_TYPE.IMAGE : UPLOAD_TYPE.LINK_1688));
    } else if (!value && !urlImageUrl) {
      // 只有在没有value且没有urlImageUrl时才清空
      setUploadData(null);
      setUploadStatus(UPLOAD_STATUS.NO_UPLOAD);
      setLink('');
    }
  }, [value]);

  // 组件挂载后初始化报告当前值（仅当有 value 但没有 urlImageUrl 时）- 延迟执行避免循环
  useEffect(() => {
    if (!urlImageUrl && uploadData) {
      const timer = setTimeout(() => {
        onChange && onChange({
          imgFileKey: uploadData?.imgFileKey,
          offerId: uploadData?.offerId,
          type: uploadType,
          previewUrl: uploadData?.previewUrl,
          offerImg: uploadData?.offerImg,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []); // 只在组件挂载时执行一次

  return (
    <div className={styles.addInquiryOfferContainer}>
      <IndexBlock
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <NumberIcon />
              <span>{$t("global-1688-ai-app.inquiry.AddInquiryOffer.aPc", "添加询盘商品")}</span>
            </div>
            {showFindSupplierTip && (
              <div className={styles.findSupplierTip}>
                <span className={styles.tipText}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.bmaz", "不知道哪些商家在卖这个品？")}</span>
                <span
                  className={styles.tipLink}
                  onClick={(event) => {
                    event.preventDefault();
                    // 如果有图片 URL，通过 navigateByCache 传递 searchImageUrl
                    // 优先使用 previewUrl（完整图片 URL），如果没有则使用 imgFileKey
                    const imageUrl = uploadData?.previewUrl || uploadData?.imgFileKey;
                    if (imageUrl) {
                      navigateByCache({
                        chatInput: {
                          searchImageUrl: imageUrl,
                          intention: 'AUTO',
                        },
                        url: '/sourcing',
                        isMakeSimilar: false,
                        target: 'blank',
                      });
                    } else {
                      navigate('/sourcing', { target: 'blank' });
                    }
                  }}
                >{$t("global-1688-ai-app.inquiry.ChooseSuppliers.qwxyzs", "前往寻源找商")}<span className={styles.arrow}>→</span>
                </span>
              </div>
            )}
          </div>
        }
      >
        <div className={styles.productSection}>
          {
            uploadStatus === UPLOAD_STATUS.UPLOADING && <UploadLoading type={uploadType} />
          }
          {
            uploadStatus === UPLOAD_STATUS.UPLOADED && (
              <div className={styles.uploadData}>
                <div className={styles.uploadDataItem}>
                  {
                    uploadType === UPLOAD_TYPE.IMAGE && (
                      <img className={styles.uploadDataItemValue} src={uploadData.previewUrl} />
                    )
                  }
                  {
                    uploadType === UPLOAD_TYPE.LINK_1688 && (
                      <a
                        href={link || (uploadData?.offerId ? `https://detail.1688.com/offer/${uploadData.offerId}.html` : '#')}
                        target="_blank"
                        className={styles.uploadDataItemLinkWrapper}
                      >
                        <img className={styles.uploadDataItemValue} src={uploadData.previewUrl} />
                        <div className={styles.uploadDataItemLinkWrapperMask}>
                          <ImgLinkIcon />
                        </div>
                      </a>
                    )
                  }
                </div>
                {!disabled && (
                  <div className={styles.uploadDataDelete} onClick={handleDelete}>
                    <ImgDeleteIcon style={{ width: 15, height: 15 }} />
                  </div>
                )}
              </div>
            )
          }
          {
            (uploadStatus === UPLOAD_STATUS.NO_UPLOAD || uploadStatus === UPLOAD_STATUS.ERROR) && !disabled && (
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
                    <InquiryUpload className={styles.uploadIcon} />
                    <div className={styles.uploadText}>
                      <span className={styles.uploadTitle}>{$t("global-1688-ai-app.inquiry.AddInquiryOffer.doot", "点击上传商品图")}</span>
                      <span className={styles.uploadSubtitle}>{$t("global-1688-ai-app.inquiry.AddInquiryOffer.srPFamc", "支持JPG/PNG格式，文件大小不超过5MB")}</span>
                    </div>
                  </div>
                </Upload.Dragger>
                <span className={styles.orText}>{$t("global-1688-ai-app.inquiry.AddInquiryOffer.h", "或")}</span>
                <div className={styles.linkCard}>
                  <InquiryLink className={styles.linkIcon} />
                  <div className={styles.linkContent}>
                    <span className={styles.linkTitle}>{$t("global-1688-ai-app.inquiry.AddInquiryOffer.j8un", "解析1688商品链接")}</span>
                    <div className={styles.linkInputContainer}>
                      <Input
                        placeholder={$t("global-1688-ai-app.inquiry.AddInquiryOffer.qztlinkdcc", "请粘贴链接到此处")}
                        className={styles.antdLinkInput}
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        suffix={<Button type="link" className={styles.parseButton} onClick={handleParseLink}>{$t("global-1688-ai-app.inquiry.AddInquiryOffer.jx", "解析")}</Button>}
                      />
                    </div>
                  </div>
                </div>
              </>
            )
          }
        </div >
      </IndexBlock >
    </div>
  );
};

export default AddInquiryOffer;
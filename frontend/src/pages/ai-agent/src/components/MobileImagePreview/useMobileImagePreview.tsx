import React, { useState, useRef, useCallback, type ReactNode } from "react";
import classNames from "classnames";
import { Mask, Swiper, Button, SafeArea } from "antd-mobile";
import type { SwiperRef } from "antd-mobile";
import type {
  TypeFileItem,
  TypeMobileImagePreviewReturn,
  TypeMobileImagePreviewOptions,
} from "./types";
import { BackArrowIcon, DownloadIcon } from "@/components/Icons";
import { ShareIcon } from "@/components/CaseShareController/icons";
import download from "@/utils/download";
import styles from "./useMobileImagePreview.module.scss";

/**
 * 移动端图片预览
 */
export const useMobileImagePreview = (
  options?: TypeMobileImagePreviewOptions,
): TypeMobileImagePreviewReturn => {
  const [visible, setVisible] = useState(false);
  const [images, setImages] = useState<TypeFileItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareLoading, setShareLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const swiperRef = useRef<SwiperRef>(null);

  const {
    onClose,
    onChange,
    onShare,
    onDownload,
    showShareButton = false,
  } = options || {};

  const openPreview = useCallback((imageList: TypeFileItem[], index = 0) => {
    setImages(imageList);
    setCurrentIndex(index);
    setVisible(true);
  }, []);

  const openSinglePreview = useCallback((image: TypeFileItem) => {
    setImages([image]);
    setCurrentIndex(0);
    setVisible(true);
  }, []);

  const closePreview = useCallback(() => {
    setVisible(false);
    onClose?.();
  }, [onClose]);

  const handleIndexChange = useCallback(
    (index: number) => {
      const prevIndex = currentIndex;
      setCurrentIndex(index);
      onChange?.(index, prevIndex);
    },
    [currentIndex, onChange],
  );

  const defaultShare = useCallback(() => {
    console.log("defaultShare");
  }, []);

  const defaultDownload = useCallback((item: TypeFileItem) => {
    download(item?.imagePreviewUrl || "", item?.file?.name || "");
  }, []);

  const handleShare = useCallback(async () => {
    setShareLoading(true);
    try {
      const handler = onShare || defaultShare;
      await handler(images[currentIndex], currentIndex, images);
    } finally {
      setShareLoading(false);
    }
  }, [currentIndex, images, onShare, defaultShare]);

  const handleDownload = useCallback(async () => {
    setDownloadLoading(true);
    try {
      const handler = onDownload || defaultDownload;
      await handler(images[currentIndex], currentIndex, images);
    } finally {
      setDownloadLoading(false);
    }
  }, [currentIndex, images, onDownload, defaultDownload]);

  // 渲染单张图片
  const renderImage = useCallback((image: TypeFileItem) => {
    return <img src={image.imagePreviewUrl} className={styles.previewImage} />;
  }, []);

  const PreviewModal: ReactNode = (
    <Mask
      visible={visible}
      color="rgb(0, 0, 0)"
      getContainer={() => document.body}
    >
      <div className={styles.previewBox}>
        {/* 关闭按钮 */}
        <div className={styles.previewClose} onClick={closePreview}>
          <BackArrowIcon />
        </div>

        {/* 图片内容区域 */}
        <div className={styles.previewContent}>
          {visible &&
            (images.length > 1 ? (
              <Swiper
                ref={swiperRef}
                defaultIndex={currentIndex}
                onIndexChange={handleIndexChange}
                loop={false}
                className={styles.previewSwiper}
              >
                {images.map((image) => (
                  <Swiper.Item key={image.id}>{renderImage(image)}</Swiper.Item>
                ))}
              </Swiper>
            ) : (
              <div className={styles.previewImageContainer}>
                {renderImage(images[0])}
              </div>
            ))}
        </div>

        {/* 操作区域 - 分享、下载 */}
        <div className={styles.previewActions}>
          {showShareButton && (
            <Button
              className={styles.previewActionItem}
              onClick={handleShare}
              loading={shareLoading}
            >
              <ShareIcon className={styles.previewActionIcon} />
              <span>分享</span>
            </Button>
          )}
          <Button
            className={classNames(
              styles.previewActionItem,
              styles.previewActionDownload,
            )}
            onClick={handleDownload}
            loading={downloadLoading}
          >
            <DownloadIcon className={styles.previewActionIcon} />
            <span>下载图片</span>
          </Button>
        </div>
      </div>
      <SafeArea position="bottom" />
    </Mask>
  );

  return {
    openPreview,
    openSinglePreview,
    closePreview,
    PreviewModal,
    currentIndex,
    images,
    swiperRef,
  };
};

export default useMobileImagePreview;

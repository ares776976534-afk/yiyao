import React, { useState, type ReactNode } from "react";
import { Image } from "antd";
import ProgressiveImage from "@/components/ProgressiveImage";
import type { TypeMobileImagePreviewReturn } from "@/components/MobileImagePreview";
import { IMAGE, VIDEO } from "../utils/fileSelector";
import type { TypeFileItem } from "../utils/fileSelector";
import type {
  TypeUploadItem,
  TypeOfferItem,
} from "@/components/InputChat/types";
import { OFFER } from "@/components/InputChat/types";
import { OfferLinkIcon } from "./Icons";
import { DeleteIcon } from "@/components/Icons/Upload";
import { $t } from "@/i18n";
import styles from "./FileList.module.scss";

interface Props {
  fileItems: TypeUploadItem[];
  onDelete?: (id: string) => void;
  tailNode?: ReactNode;
  /** 自定义图片预览 hooks 返回值 - 用于自定义图片预览逻辑 */
  imagePreview?: TypeMobileImagePreviewReturn;
}

export default (props: Props) => {
  const { fileItems, onDelete, tailNode, imagePreview } = props;
  const [loadedOfferMap, setLoadedOfferMap] = useState<Record<string, boolean>>(
    {},
  );

  const useCustomPreview = !!imagePreview;

  const hasContent = fileItems?.length > 0 || tailNode;

  const handleOfferImageLoaded = (id: string) => {
    setLoadedOfferMap((prev) => ({ ...prev, [id]: true }));
  };

  // 获取所有图片列表（用于自定义预览）
  const getImageList = (): TypeFileItem[] => {
    return fileItems.filter(
      (item) => item.type === IMAGE || item.type === VIDEO,
    ) as TypeFileItem[];
  };

  // 获取当前图片在图片列表中的索引
  const getImageIndex = (item: TypeFileItem) => {
    const imageItems = getImageList();
    return imageItems.findIndex((it) => it.id === item.id);
  };

  // 处理图片点击
  const handleImageClick = (item: TypeFileItem) => {
    if (useCustomPreview && imagePreview) {
      const images = getImageList();
      const index = getImageIndex(item);
      imagePreview.openPreview(images, index);
    }
  };

  const renderImagePreview = (item: TypeFileItem) => {
    return (
      <ProgressiveImage
        src={item.imagePreviewUrl}
        alt={$t(
          "global-1688-ai-app.InputChat.FileList.imagePreview",
          "图片预览",
        )}
        preview={!useCustomPreview}
        onClick={() => handleImageClick(item)}
      />
    );
  };

  const renderVideoPreview = (item: TypeFileItem) => {
    // 此处使用视频首帧生成的预览图（base64）
    return (
      <ProgressiveImage
        src={item.videoPreviewUrl}
        alt={$t(
          "global-1688-ai-app.InputChat.FileList.videoPreview",
          "视频预览",
        )}
        preview={!useCustomPreview}
        onClick={() => handleImageClick(item)}
      />
    );
  };

  const renderOfferPreview = (item: TypeUploadItem) => {
    const offerItem = item as TypeOfferItem;
    const images = [...(offerItem?.offer?.images || [])];
    const cover = images.shift();
    const offerId = offerItem.offer?.offerId;
    const loaded = !!loadedOfferMap[offerItem.id];
    const offerDetailUrl = `https://detail.1688.com/offer/${offerId}.html`;
    if (!cover) {
      const title =
        offerItem.offer?.title ||
        $t("global-1688-ai-app.InputChat.FileList.product", `商品 ${offerId}`, [
          offerId,
        ]);
      return (
        <div className={styles["preview"]} title={title}>
          {title}
        </div>
      );
    }
    return (
      <div
        className={styles["offer-item"]}
        onClick={() => {
          if (offerId) {
            window.open(offerDetailUrl);
          }
        }}
      >
        <ProgressiveImage
          src={cover}
          alt={$t(
            "global-1688-ai-app.InputChat.FileList.productImage",
            "商品图片",
          )}
          onCompleted={() => handleOfferImageLoaded(offerItem.id)}
          preview={false}
        />
        {loaded && (
          <div className={styles["offer-item-mask"]}>
            <OfferLinkIcon className={styles["offer-link-icon"]} />
          </div>
        )}
      </div>
    );
  };

  const renderPreview = (item: TypeUploadItem) => {
    switch (item.type) {
      case OFFER:
        return renderOfferPreview(item as TypeOfferItem);
      case IMAGE:
        return renderImagePreview(item as TypeFileItem);
      case VIDEO:
        return renderVideoPreview(item as TypeFileItem);
      default:
        return null;
    }
  };

  const renderFileItems = () => {
    return fileItems.map((item) => {
      return (
        <div className={styles["file-list-item"]} key={item.id}>
          {renderPreview(item)}
          <div
            className={styles["delete-btn"]}
            onClick={() => onDelete?.(item.id)}
            title={$t("global-1688-ai-app.InputChat.FileList.delete", "删除")}
          >
            <DeleteIcon />
          </div>
        </div>
      );
    });
  };

  return (
    <div
      className={[
        styles["file-list"],
        hasContent
          ? styles["file-list-hasContent"]
          : styles["file-list-noContent"],
      ].join(" ")}
    >
      {/* 注意：为了保持上传顺序，这里整体按顺序渲染；
          如果使用自定义预览，则不使用 Image.PreviewGroup；
          否则使用 antd 的 Image.PreviewGroup 实现图片组预览 */}
      {useCustomPreview ? (
        <>
          {renderFileItems()}
          {/* 渲染自定义预览 Modal */}
          {imagePreview?.PreviewModal}
        </>
      ) : (
        <Image.PreviewGroup preview={{ getContainer: () => document.body }}>
          {renderFileItems()}
        </Image.PreviewGroup>
      )}
      {tailNode}
    </div>
  );
};

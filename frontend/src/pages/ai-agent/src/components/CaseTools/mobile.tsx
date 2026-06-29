import React, { useState, useMemo } from "react";
import classNames from "classnames";
import { Popup, TextArea, SafeArea, ActionSheet } from "antd-mobile";
import { Button } from "antd";
import ProgressiveImage from "@/components/ProgressiveImage";
import { MarketingStyleArrow } from "./components/Icons";
import aplus from "@/utils/log";
import { $t } from "@/i18n";
import { useCaseToolsLogic } from "./hooks/useCaseToolsLogic";
import { UploadComponent } from "./components/UploadComponent";
import { getUploadIcon } from "./utils";
import { EnumToolType, TypeCaseToolsProps } from "./types";
import styles from "./mobile.module.scss";

const CaseToolsMobile: React.FC<TypeCaseToolsProps> = ({
  className,
  max,
  jumpPageParams,
  onClick,
}) => {
  const {
    isModalOpen,
    quickPortals,
    selectedTool,
    uploadedFiles,
    selectedLanguage,
    marketingStyle,
    marketingText,
    store,
    marketingTextAreaRef,
    hasQuickPortals,
    hasFile,
    allFilesUploaded,
    isMarketingToolValid,
    handleOpenModal,
    handleCloseModal,
    handleAfterClose,
    handleConfirmUpload,
    handleFilesUpload,
    handleFileDelete,
    handleMarketingTextChange,
    handleMarketingStyleChange,
    handleLanguageChange,
    handleQuickTemplateClick,
  } = useCaseToolsLogic({
    targetPage: "mobile-studio",
    jumpPageParams,
  });

  const [
    marketingStyleActionSheetVisible,
    setMarketingStyleActionSheetVisible,
  ] = useState(false);

  const marketingStyleActionSheetActions = useMemo(
    () =>
      (selectedTool?.extra?.options || []).map((item) => ({
        ...item,
        text: item.label,
        key: item.label,
      })),
    [selectedTool],
  );

  return (
    <>
      <div
        className={classNames(
          {
            [styles.quickPortals]: hasQuickPortals,
          },
          className,
        )}
      >
        <div
          className={styles.caseTools}
          data-spm="case-tools"
          data-role="case-tools"
        >
          {quickPortals
            ?.slice(0, max || quickPortals.length)
            .map((item, index) => {
              const { image, title } = item;
              return (
                <div
                  className={styles.caseTool}
                  key={index}
                  data-role="case-tool"
                  onClick={() => {
                    aplus.record("/alphashop.studio.home.short-click", "CLK", {
                      type: item.type,
                    });

                    if (onClick?.(item) === false) {
                      // 用户自定义click事件返回false，则不执行默认点击事件
                      return;
                    }
                    handleOpenModal(item);
                  }}
                >
                  <div
                    className={styles.caseToolTitle}
                    data-role="case-tool-title"
                  >
                    {title}
                  </div>
                  <img
                    className={styles.caseToolImage}
                    src={image}
                    data-role="case-tool-image"
                  />
                </div>
              );
            })}
        </div>
      </div>
      <Popup
        position="bottom"
        showCloseButton
        className={styles.popupContainer}
        visible={isModalOpen}
        onClose={handleCloseModal}
        afterClose={handleAfterClose}
      >
        {selectedTool && (
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{selectedTool.title}</div>
              <div className={styles.modalDescription}>
                {selectedTool.description}
              </div>
            </div>
            <div
              className={classNames(styles.modalBody, {
                [styles.withFile]: hasFile,
              })}
            >
              <div
                className={classNames(styles.uploadsContainer, {
                  [styles.singleUpload]:
                    selectedTool.uploads.length === 1 && !hasFile,
                  [styles.singleUploadWithFile]:
                    selectedTool.uploads.length === 1 && hasFile,
                  [styles.multipleUploads]: selectedTool.uploads.length !== 1,
                })}
              >
                {selectedTool.uploads.map((uploadConfig, index) => (
                  <UploadComponent
                    key={index}
                    preview={false}
                    uploadClassNames={{
                      root: styles.uploadComponent,
                      uploadIcon: styles.uploadIcon,
                      uploadText: styles.uploadText,
                      uploadArea: styles.uploadArea,
                      filePreviewContainer: styles.filePreviewContainer,
                      deleteButton: styles.deleteButton,
                    }}
                    store={store}
                    uploadConfig={uploadConfig}
                    uploadedFiles={uploadedFiles[index] || []}
                    onFilesUpload={(files) => handleFilesUpload(index, files)}
                    onFileDelete={(fileId) => handleFileDelete(index, fileId)}
                    uploadIcon={getUploadIcon(
                      selectedTool.type as EnumToolType,
                      index,
                    )}
                  />
                ))}
                {hasFile &&
                  selectedTool.type === EnumToolType.MARKETING_IMAGE && (
                    <div className={styles.marketingSection}>
                      <div className={styles.marketingSectionTitle}>
                        {$t(
                          "global-1688-ai-app.CaseTools.stg",
                          "选择营销图风格",
                        )}
                      </div>
                      <div
                        className={styles.marketingSectionSelectButton}
                        onClick={() =>
                          setMarketingStyleActionSheetVisible(true)
                        }
                      >
                        {marketingStyle ? (
                          <span className={styles.marketingStyleText}>
                            {marketingStyle}
                          </span>
                        ) : (
                          <span className={styles.placeholder}>请选择</span>
                        )}
                        <MarketingStyleArrow
                          className={styles.marketingSectionSelectArrow}
                        />
                      </div>
                      <ActionSheet
                        cancelText="取消"
                        closeOnMaskClick={false}
                        className={styles.marketingSectionSelect}
                        actions={marketingStyleActionSheetActions}
                        visible={marketingStyleActionSheetVisible}
                        onAction={(action) => {
                          handleMarketingStyleChange(action.key as string);
                          setMarketingStyleActionSheetVisible(false);
                        }}
                        onClose={() =>
                          setMarketingStyleActionSheetVisible(false)
                        }
                      />
                      <div className={styles.marketingSectionTitle}>
                        {$t(
                          "global-1688-ai-app.CaseTools.yxwainput",
                          "营销文案输入",
                        )}
                      </div>
                      <TextArea
                        className={styles.marketingSectionTextArea}
                        ref={marketingTextAreaRef}
                        autoSize={{
                          minRows: 3,
                          maxRows: 3,
                        }}
                        placeholder={selectedTool.extra?.placeholder}
                        value={marketingText}
                        onChange={(value) => {
                          handleMarketingTextChange(value);
                        }}
                      />
                    </div>
                  )}
              </div>

              {hasFile ? (
                <div className={styles.operationContainer}>
                  {selectedTool.type === EnumToolType.IMAGE_TRANSLATION && (
                    <div className={styles.imageTranslationContainer}>
                      <div className={styles.imageTranslationTitle}>
                        {$t(
                          "global-1688-ai-app.CaseTools.selectfyyy",
                          "选择翻译语言",
                        )}
                      </div>
                      <div className={styles.imageTranslationList}>
                        {(selectedTool?.extra?.options || []).map((item) => {
                          const { label, icon } = item;
                          const isActive = selectedLanguage === label;
                          return (
                            <div
                              key={label}
                              className={[
                                styles.imageTranslationItem,
                                isActive ? styles.active : "",
                              ].join(" ")}
                              onClick={() => handleLanguageChange(label)}
                            >
                              <ProgressiveImage
                                src={icon}
                                className={[
                                  styles.progressiveImage,
                                  styles.imageTranslationItemIcon,
                                ].join(" ")}
                                alt={label}
                              />
                              <div>{label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <Button
                    type="primary"
                    disabled={!allFilesUploaded || !isMarketingToolValid}
                    className={styles.modalUploadButton}
                    onClick={handleConfirmUpload}
                  >
                    {$t("global-1688-ai-app.CaseTools.qdupload", "确定上传")}
                  </Button>
                </div>
              ) : (
                <>
                  {selectedTool.quickTemplate && (
                    <div className={styles.exampleSection}>
                      <div className={styles.exampleTitle}>
                        <span>
                          {$t(
                            "global-1688-ai-app.CaseTools.fcl",
                            "快速尝试以下案例",
                          )}
                        </span>
                      </div>
                      <div className={styles.exampleImages}>
                        {selectedTool.quickTemplate?.map(
                          (imageArray, index) => {
                            return (
                              <div
                                className={styles.exampleImageContainer}
                                key={index}
                                onClick={() =>
                                  handleQuickTemplateClick(imageArray)
                                }
                              >
                                {(imageArray || []).map(
                                  (imageItem, mediaIndex) => {
                                    return (
                                      <ProgressiveImage
                                        key={mediaIndex}
                                        src={imageItem.url}
                                        className={[
                                          styles.progressiveImage,
                                          styles.exampleImage,
                                        ].join(" ")}
                                        alt={$t(
                                          "global-1688-ai-app.CaseTools.sl",
                                          `示例${index}-${mediaIndex}`,
                                          [index, mediaIndex],
                                        )}
                                      />
                                    );
                                  },
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.modalImage}>
              <ProgressiveImage
                src={selectedTool.modalImage}
                className={styles.progressiveImage}
              />
            </div>
          </div>
        )}
        <SafeArea position="bottom" />
      </Popup>
    </>
  );
};

export default CaseToolsMobile;

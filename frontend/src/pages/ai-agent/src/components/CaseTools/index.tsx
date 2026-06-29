import React from "react";
import { useSpm } from "ice";
import { Modal, Button, Select, Input } from "antd";
import View from "@alife/channel-fe-materials-react-appear";
import ProgressiveImage from "@/components/ProgressiveImage";
import aplus from "@/utils/log";
import { $t } from "@/i18n";
import { useCaseToolsLogic } from "./hooks/useCaseToolsLogic";
import { UploadComponent } from "./components/UploadComponent";
import { getUploadIcon } from "./utils";
import type { TypeCaseToolsProps } from "./types";
import { EnumToolType } from "./types";
import styles from "./index.module.scss";

const CaseTools: React.FC<TypeCaseToolsProps> = (props: any) => {
  const { className, max, jumpPageParams, onClick } = props;

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
  } = useCaseToolsLogic({ jumpPageParams });
  const [, spmB] = useSpm();

  const logmap = {
    MODEL_UPPER_BODY: `/alphashop.${spmB}.card.designmodel`,
    MARKETING_IMAGE: `/alphashop.${spmB}.card.designmktimg`,
    BACKGROUND_GENERATION: `/alphashop.${spmB}.card.designbgimg`,
    STYLE_TRANSFER: `/alphashop.${spmB}.card.designstyle`,
    IMAGE_TRANSLATION: `/alphashop.${spmB}.card.designtrans`,
    ...props.logmap,
  };

  return (
    <>
      <div
        className={[hasQuickPortals ? styles.quickPortals : "", className].join(
          " ",
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
                <View
                  className={styles.caseTool}
                  key={index}
                  data-role="case-tool"
                  onClick={() => {
                    aplus.record("/alphashop.studio.home.short-click", "CLK", {
                      type: item.type,
                    });

                    if (logmap[item.type]) {
                      aplus.record(logmap[item.type], "CLK");
                    }

                    if (onClick?.(item) === false) {
                      // 用户自定义click事件返回false，则不执行默认点击事件
                      return;
                    }
                    handleOpenModal(item);
                  }}
                  onFirstAppear={() => {
                    if (logmap[item.type]) {
                      aplus.record(logmap[item.type], "EXP");
                    }
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
                </View>
              );
            })}
        </div>
      </div>
      <Modal
        destroyOnHidden
        width={800}
        centered
        open={isModalOpen}
        title={null}
        footer={null}
        maskClosable={false}
        onOk={handleCloseModal}
        onCancel={handleCloseModal}
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
              className={`${styles.uploadsContainer} ${
                selectedTool.uploads.length === 1
                  ? styles.singleUpload
                  : styles.multipleUploads
              }`}
            >
              {selectedTool.uploads.map((uploadConfig, index) => (
                <UploadComponent
                  key={index}
                  uploadClassNames={{
                    root: styles.uploadComponent,
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
                      {$t("global-1688-ai-app.CaseTools.stg", "选择营销图风格")}
                    </div>
                    <Select
                      fieldNames={{ label: "label", value: "label" }}
                      className={styles.marketingSectionSelect}
                      options={selectedTool.extra?.options || []}
                      value={marketingStyle}
                      onChange={handleMarketingStyleChange}
                    />
                    <div className={styles.marketingSectionTitle}>
                      {$t(
                        "global-1688-ai-app.CaseTools.yxwainput",
                        "营销文案输入",
                      )}
                    </div>
                    <Input.TextArea
                      ref={marketingTextAreaRef}
                      autoSize={{
                        minRows: 4,
                        maxRows: 4,
                      }}
                      placeholder={selectedTool.extra?.placeholder}
                      value={marketingText}
                      onChange={(e) =>
                        handleMarketingTextChange(e.target.value)
                      }
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
                      {selectedTool.quickTemplate?.map((imageArray, index) => {
                        return (
                          <div
                            className={styles.exampleImageContainer}
                            key={index}
                            onClick={() => handleQuickTemplateClick(imageArray)}
                          >
                            {(imageArray || []).map((imageItem, mediaIndex) => {
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
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className={styles.modalImage}>
              <ProgressiveImage
                src={selectedTool.modalImage}
                className={styles.progressiveImage}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CaseTools;

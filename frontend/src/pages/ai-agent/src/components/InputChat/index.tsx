import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import View from "@alife/channel-fe-materials-react-appear";
import { Dropdown } from "antd";
import classNames from "classnames";
import useToast from "@/components/Toast";
import FileList from "./components/FileList";
import Loading from "./components/Loading";
import { UploadIcon } from "@/components/Icons";
import {
  OfferLinkIcon,
  SendIcon,
  PauseIcon,
  LoadingIcon,
  AddIcon,
} from "./components/Icons";
import SmartMode from "@/components/SmartMode";
import type {
  TypeFileItem,
  TypeImageFromUrl,
  TypeUploadItem,
  TypeInputChatProps,
  TypeContentItem,
} from "./types";
import { OFFER, Status } from "./types";
import {
  selectMultipleImages,
  validateImage,
  formatInvalidImagesMessage,
  createTypeFileItems,
  createImageItemFromUrl,
  simulateProgressForFiles,
  IMAGE,
  getImageDimensionErrorMessage,
  getImageDimensions,
  validateImageDimensions,
} from "./utils/fileSelector";
import { createPasteHandler } from "./utils/clipboardUtils";
import {
  initFromUrlParams,
  createOfferItem,
  extractLinksFromText,
  fetchImagesWithDimensions,
  fetchOffersWithDimensions,
} from "./utils";
import { useFileSelector } from "./hooks/useFileSelector";
import { useAutoResizeTextarea } from "./hooks/useAutoResizeTextarea";
import { useStore } from "@/stores/context";
import { TypeOfferMaterialResult } from "@/services/studio/queryOfferBy";
import { $t } from "@/i18n";
import aplus from "@/utils/log";
import styles from "./index.module.scss";

const MAX_IMAGE_COUNT = 20;

// 统一文案出口，避免写死和重复
const TEXTS = {
  imageLimitExceeded: (max: number) =>
    $t("global-1688-ai-app.InputChat.zSrom", `最多支持上传${max}张图片`, [max]),
  batchExceededImage: (max: number) =>
    $t(
      "global-1688-ai-app.InputChat.bpcnxxam",
      `批量上传超过数量限制（${max}张），已优先上传前${max}张图片`,
      [max, max],
    ),
  textareaPlaceholder: $t(
    "global-1688-ai-app.InputChat.placeholderComplex",
    "一句话批量生成/处理电商素材，例如“将上传的5张图片翻译为英文”",
  ),
  offerLink: $t("global-1688-ai-app.InputChat.productLink", "商品链接"),
  addImage: $t("global-1688-ai-app.InputChat.addImage", "图片"),
  smartMode: $t("global-1688-ai-app.InputChat.smartMode", "增强模式"),
} as const;

const defaultLogs = {
  sendMessageClick: {
    logKey: "/alphashop.input-chat.send",
  },
};

const InputChat = forwardRef((props: TypeInputChatProps, ref) => {
  const {
    isMobile,
    logMaps,
    inputChatData,
    status,
    placeholder,
    showUploadOffer = true,
    showUploadImage = true,
    uploadCompact = false,
    uploadCompactConfig = {},
    chatInputMinHeight = 40,
    chatInputMaxHeight = 110,
    sendButton,
    imagePreview,
    onSendMessage,
    onOfferLinkClick,
    onInputChataDataChange,
    onStatusChange,
  } = props;
  const [inputText, setInputText] = useState<string>("");
  const [brigeLoading, setBrigeLoading] = useState(false);
  const fileSelectorState = useFileSelector();
  const store = useStore();
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(
    inputText,
    chatInputMinHeight,
    chatInputMaxHeight,
  );
  // 标记图片批量超限，等待上传处理成功后再提示
  const imageExceededPendingRef = useRef(false);
  const autoSendRef = useRef(false);
  const inputChataDataRef = useRef<TypeUploadItem[]>([]);
  const inputChatRef = useRef<null | HTMLDivElement>(null);
  // 标记是否正在使用输入法
  const isComposingRef = useRef(false);
  // 追踪正在处理中的图片数量,用于防止连续粘贴时超过限制
  const processingImageCountRef = useRef(0);
  const toast = useToast();
  const DISABLED =
    !(showUploadOffer || showUploadImage) ||
    [Status.DISABLED, Status.LOADING, Status.RUNNING].includes(status);

  const handleInputChatDataChange = (data: TypeUploadItem[]) => {
    onInputChataDataChange?.(data);
  };

  const handleChangeStatus = (newStatus: Status) => {
    onStatusChange?.(newStatus);
  };

  // 统计已存在的图片数量(包括正在处理中的)
  const getExistingCounts = () => {
    const images = inputChataDataRef.current.filter(
      (it) => it.type === IMAGE,
    ).length;
    return { images: images + processingImageCountRef.current };
  };

  const { images: existedImages } = getExistingCounts();
  const sendDisabled = !inputText && !inputChatData.length;
  const uploadImageDisabled =
    DISABLED || brigeLoading || existedImages >= MAX_IMAGE_COUNT;

  // 统一的选择前过滤与告警（格式、大小、数量、尺寸校验）
  const beforeUpload = async (files: File[]): Promise<File[] | null> => {
    if (!files || files.length === 0 || uploadImageDisabled) return null;

    // 不允许同时上传多种文件类型
    const fileTypes = new Set(files.map((file) => file.type.split("/")[0]));
    if (fileTypes.size > 1) {
      toast.info(
        $t(
          "global-1688-ai-app.InputChat.multipleFileTypes",
          "不允许同时上传多种文件类型",
        ),
      );
      return null;
    }

    const { images: existedImages } = getExistingCounts();

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

    if (validFiles.length === 0) {
      return null;
    }

    // 2. 检查数量限制
    const remaining = Math.max(0, MAX_IMAGE_COUNT - existedImages);
    if (remaining <= 0) {
      toast.warning(TEXTS.imageLimitExceeded(MAX_IMAGE_COUNT));
      return null;
    }

    // 3. 先按数量裁剪,只对真正会被上传的图片进行尺寸校验
    // 避免对不在上传队列里的图片进行无意义的校验和提示
    const finalFiles = validFiles.slice(0, remaining);
    const shouldBlockInvalidSize = false; // 开关 决定是否拦截不符合尺寸要求的图片上传

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

      // 如果图片数量超过剩余可上传数量,标记超限
      if (validFiles.length > remaining) {
        imageExceededPendingRef.current = true;
      }

      return finalFiles;
    }
  };

  // 上传图片到服务器
  const uploadImageItems = async (
    items: TypeFileItem[],
  ): Promise<TypeFileItem[]> => {
    const uploadedItems = await Promise.all(
      items.map(async (item) => {
        if (item.type === IMAGE) {
          try {
            const url = await store.uploadImageFile(item.file);
            return { ...item, imagePreviewUrl: url } as TypeFileItem;
          } catch (e) {
            if (e._networkError) {
              toast.error(e.message);
            } else {
              toast.error(
                e.message ||
                  $t(
                    "global-1688-ai-app.InputChat.imageUploadFailed",
                    "图片上传失败",
                  ),
              );
            }
            return null;
          }
        }
        return item;
      }),
    );
    const result = uploadedItems.filter(Boolean) as TypeFileItem[];

    // 如果存在图片批量超限的标记，且本次上传成功（有结果），再提示
    if (imageExceededPendingRef.current && result.length === items.length) {
      imageExceededPendingRef.current = false;
      toast.warning(TEXTS.batchExceededImage(MAX_IMAGE_COUNT));
    }

    return result;
  };

  const uploadImage = async () => {
    try {
      const files = await selectMultipleImages({
        beforeUpload,
        instance: fileSelectorState.instance,
      });
      if (!files || files.length === 0) {
        return;
      }

      // 标记正在处理的图片数量
      processingImageCountRef.current += files.length;

      try {
        handleChangeStatus(Status.LOADING);
        setBrigeLoading(true);
        const [_, items] = await Promise.all([
          simulateProgressForFiles(files, fileSelectorState.instance),
          createTypeFileItems(files),
        ]);

        const readyItems = await uploadImageItems(items);
        if (readyItems.length) {
          if (logMaps?.uploadimg) {
            const imgUrls = readyItems
              .map((file) => file.imagePreviewUrl)
              .join(",");
            aplus.record(logMaps.uploadimg, "CLK", {
              imgurl: encodeURIComponent(imgUrls),
            });
          }
          handleInputChatDataChange([
            ...inputChataDataRef.current,
            ...readyItems,
          ]);
        }
      } finally {
        // 处理完成后减去数量
        processingImageCountRef.current -= files.length;
      }
    } catch (error) {
      console.error("上传图片失败", error);
    } finally {
      handleChangeStatus(Status.DEFAULT);
      setBrigeLoading(false);
    }
  };

  // 统一处理文件上传（只处理图片）
  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;

    // 统一校验：格式、大小、数量、尺寸（beforeUpload 会处理所有校验）
    const filtered = await beforeUpload(arr);
    if (!filtered || filtered.length === 0) {
      return;
    }

    // 标记正在处理的图片数量
    processingImageCountRef.current += filtered.length;

    try {
      handleChangeStatus(Status.LOADING);
      setBrigeLoading(true);
      const [_, items] = await Promise.all([
        simulateProgressForFiles(filtered, fileSelectorState.instance),
        createTypeFileItems(filtered),
      ]);

      const readyItems = await uploadImageItems(items);
      if (readyItems.length) {
        handleInputChatDataChange([
          ...inputChataDataRef.current,
          ...readyItems,
        ]);
      }
      handleChangeStatus(Status.DEFAULT);
      setBrigeLoading(false);
    } finally {
      // 处理完成后减去数量
      processingImageCountRef.current -= filtered.length;
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer) return;

    const { files, items } = e.dataTransfer;
    if (items && items.length > 0) {
      // 忽略非 file 的拖拽
      const hasFile = Array.from(items).some((it) => it.kind === "file");
      if (!hasFile) return;
    }

    handleFiles(files);
  };

  // 处理图片粘贴
  const handleImagePaste = async (files: File[]) => {
    // 如果没有文件或正在加载中，则不处理
    if (!files || files.length === 0 || DISABLED) {
      return;
    }

    try {
      // 使用现有的文件处理逻辑
      await handleFiles(files);
    } catch (error) {
      console.error("粘贴图片处理失败:", error);
    }
  };

  // 处理文本粘贴
  const handleTextPaste = (text: string) => {
    if (!text.trim()) return;

    const textarea = textareaRef.current as HTMLTextAreaElement;
    // 获取当前光标位置
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const currentText = textarea.value;

    // 在光标位置插入文本
    const newText =
      currentText.substring(0, start) + text + currentText.substring(end);
    const newCursorPos = start + text.length;

    // 更新文本
    setInputText(newText);

    // 在下一帧更新光标位置和滚动
    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        // 触发高度调整
        adjustHeight();
        // 滚动到光标位置（模拟浏览器默认行为）
        textarea.scrollTop = textarea.scrollHeight;
      }
    });
  };

  // 创建粘贴处理器的引用
  const pasteHandlerRef = useRef<ReturnType<typeof createPasteHandler> | null>(
    null,
  );

  const handleSend = async () => {
    if (sendDisabled) return;

    handleChangeStatus(Status.LOADING);

    // 记录首次提交agent
    store.userPrefer.recordFirstAgentSubmit();

    const transformData: any = inputChatData.reduce(
      (acc: any, item) => {
        if (item.type === OFFER) {
          acc[OFFER].push(item.offer);
        }
        if (item.type === IMAGE) {
          acc[IMAGE].push({
            id: item.id,
            url: item.imagePreviewUrl,
            width: item.width,
            height: item.height,
          });
        }
        return acc;
      },
      { [OFFER]: [], [IMAGE]: [] },
    );

    // 从输入文本中提取图片链接和商品链接，并获取去除链接后的剩余文本
    const { imageUrls, offerIds, remainingText } =
      extractLinksFromText(inputText);

    // 处理提取的图片链接
    const imageResults = await fetchImagesWithDimensions(imageUrls);
    transformData[IMAGE].push(...imageResults);

    // 处理提取的商品 ID
    const offerResults = await fetchOffersWithDimensions(offerIds);
    transformData[OFFER].push(...offerResults);

    const sendContent = {
      content: remainingText,
      files: transformData,
      agent: store.userPrefer.agent,
    };

    handleChangeStatus(Status.DEFAULT);

    if (logMaps?.send) {
      aplus.record(logMaps.send, "CLK", { query: remainingText });
    }

    if (onSendMessage) {
      onSendMessage(sendContent);
    } else {
      store.sendFromInput(sendContent);
      setInputText("");
      handleInputChatDataChange([]);
    }
  };

  const addTextToChat = (_content: string, append = true) => {
    const content = append ? `${inputText}${_content}` : _content;

    setInputText(content);
  };

  const addImagesToChat = (_items: TypeImageFromUrl[], append = true) => {
    if (uploadImageDisabled) return;

    const items = _items.map((item) => createImageItemFromUrl(item) as any);

    handleInputChatDataChange(append ? [...inputChatData, ...items] : items);
  };

  const addImagesFromFilesToChat = (items: TypeFileItem[], append = true) => {
    if (uploadImageDisabled) return;

    handleInputChatDataChange(append ? [...inputChatData, ...items] : items);
  };

  const addOffersToChat = (
    offers: TypeOfferMaterialResult[],
    append = true,
  ) => {
    if (DISABLED) return;

    const newOfferItems = (offers || []).map((offer) => createOfferItem(offer));
    handleInputChatDataChange(
      append ? [...inputChatData, ...newOfferItems] : newOfferItems,
    );
  };

  // 暴露给外部使用的方法
  useImperativeHandle(ref, () => ({
    // 添加文本到对话框
    addTextToChat,
    // 添加图片到对话框
    addImagesToChat,
    addImagesFromFilesToChat,
    // 添加 offer 到对话框
    addOffersToChat,
    // 统一的添加内容函数 - 根据type分别处理文字、图片、商品
    addContentToChat: (contentList: TypeContentItem[], append = true) => {
      const fileList: any = [];
      contentList.forEach((contentItem) => {
        const { type, data } = contentItem;
        switch (type) {
          case "text":
            addTextToChat(data, append);
            break;
          case "image":
            fileList.push(...data.map((item) => createImageItemFromUrl(item)));
            break;
          case "offer":
            fileList.push(...data.map((item) => createOfferItem(item)));
            break;
        }
      });

      // 附件数据受控
      handleInputChatDataChange(
        append ? [...inputChatData, ...fileList] : fileList,
      );
    },
    // 设置状态 - 通知外部更新状态
    setStatus: (newStatus: Status) => {
      handleChangeStatus(newStatus);
    },
  }));

  const handleMenuClick = (e) => {
    if (e.key === "offer") {
      onOfferLinkClick?.();
    } else if (e.key === "image") {
      uploadImage();
    }
  };

  useEffect(() => {
    // 从 URL 参数初始化输入框数据（支持 cacheId、keyword、images、offerIds）
    // cacheId和其它参数共存时以cacheId为准
    initFromUrlParams()
      .then((result) => {
        if (!result) return;

        const { inputText, items, autoSend } = result;

        // 批量添加到状态中
        setInputText(inputText);
        handleInputChatDataChange(items);

        // 标记是否允许自动发送
        if (autoSend) {
          autoSendRef.current = true;
        }
      })
      .catch(() => {
        // 静默处理
      });
  }, []);

  useEffect(() => {
    if (autoSendRef.current) {
      setTimeout(() => {
        handleSend();
        autoSendRef.current = false;
      }, 50);
    }
  }, [inputText, inputChatData, autoSendRef.current]);

  useEffect(() => {
    // 确保 DOM 元素存在后再创建和设置粘贴监听器
    if (inputChatRef.current && !pasteHandlerRef.current) {
      pasteHandlerRef.current = createPasteHandler({
        onImagePaste: handleImagePaste,
        onTextPaste: handleTextPaste,
        pasteDom: inputChatRef.current,
      });
      pasteHandlerRef.current.setup();
    }

    return () => {
      pasteHandlerRef.current?.cleanup();
    };
  }, []);

  useEffect(() => {
    const hasContent = inputText.trim().length > 0 || inputChatData.length > 0;

    // 只有在非加载状态时才更新状态，避免打断loading状态
    if (status !== Status.LOADING && status !== Status.RUNNING) {
      if (hasContent) {
        handleChangeStatus(Status.READY);
      } else {
        handleChangeStatus(Status.DEFAULT);
      }
    }
  }, [inputText, inputChatData, status]);

  useEffect(() => {
    inputChataDataRef.current = inputChatData?.length > 0 ? inputChatData : [];
  }, [inputChatData]);

  return (
    <div
      className={styles.inputChatContainer}
      ref={inputChatRef}
      data-tour="tour-step-4"
    >
      <div
        className={styles.inputChatInner}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className={styles.inputChat}>
          <FileList
            fileItems={inputChatData}
            onDelete={(id) => {
              handleInputChatDataChange(
                inputChatData.filter((it) => it.id !== id),
              );
            }}
            tailNode={
              fileSelectorState.isLoading || brigeLoading ? <Loading /> : null
            }
            imagePreview={imagePreview}
          />
          <textarea
            ref={textareaRef}
            // maxLength={1000}
            placeholder={placeholder || TEXTS.textareaPlaceholder}
            className={styles.inputChatTextarea}
            value={inputText}
            onInput={adjustHeight}
            onChange={(e) => {
              setInputText(e.target.value);
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onKeyDown={(e) => {
              // 回车自动发送对话内容，排斥特殊情况shift+回车，输入法状态下回车，非正在输出、禁用、loading状态下的回车
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !isComposingRef.current &&
                status === Status.READY
              ) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <div className={styles.operateContainer}>
          <SmartMode
            isMobile={isMobile}
            text={TEXTS.smartMode}
            disabled={DISABLED}
            logKey={logMaps?.enhanced}
          />
          {uploadCompact ? (
            <Dropdown
              destroyOnHidden
              placement="top"
              align={{
                offset: [0, -12],
              }}
              menu={{
                className: classNames(
                  styles.uploadMenu,
                  uploadCompactConfig?.menuClassName,
                ),
                items: [
                  showUploadOffer
                    ? {
                        key: "offer",
                        icon: <OfferLinkIcon className={styles.uploadIcon} />,
                        label: (
                          <View
                            className={styles.toolAddMenuItemLabel}
                            onFirstAppear={() => {
                              if (logMaps?.uploaditemurl) {
                                aplus.record(logMaps.uploaditemurl, "EXP");
                              }
                            }}
                          >
                            {TEXTS.offerLink}
                          </View>
                        ),
                      }
                    : null,
                  showUploadImage
                    ? {
                        key: "image",
                        icon: <UploadIcon className={styles.uploadIcon} />,
                        label: (
                          <View
                            className={styles.toolAddMenuItemLabel}
                            onFirstAppear={() => {
                              if (logMaps?.uploadimg) {
                                aplus.record(logMaps.uploadimg, "EXP");
                              }
                            }}
                          >
                            {TEXTS.addImage}
                          </View>
                        ),
                      }
                    : null,
                ],
                onClick: handleMenuClick,
              }}
              trigger={["click"]}
              disabled={DISABLED}
              {...uploadCompactConfig}
            >
              <div
                className={classNames({
                  [styles.upload]: true,
                  [styles.disabled]: DISABLED,
                })}
                data-role="uploadCompact"
              >
                <div className={styles.toolIcon}>
                  <AddIcon />
                </div>
                <span className={styles.toolLabel}>
                  {$t("global-1688-ai-app.studio-canvas.toolbar.add", "添加")}
                </span>
              </div>
            </Dropdown>
          ) : (
            <div className={styles.uploadContainer} data-tour="tour-step-3">
              {showUploadOffer && (
                <View
                  className={`${styles.upload} ${
                    DISABLED ? styles.disabled : ""
                  }`}
                  data-role="uploadOffer"
                  onClick={() => {
                    onOfferLinkClick?.();
                  }}
                  onFirstAppear={() => {
                    if (logMaps?.uploaditemurl) {
                      aplus.record(logMaps.uploaditemurl, "EXP");
                    }
                  }}
                >
                  <OfferLinkIcon className={styles.uploadIcon} />
                  <span className={styles.uploadText}>{TEXTS.offerLink}</span>
                </View>
              )}

              {showUploadImage && (
                <View
                  className={`${styles.upload} ${
                    uploadImageDisabled ? styles.disabled : ""
                  }`}
                  data-role="uploadImage"
                  onClick={() => {
                    if (uploadImageDisabled) return;
                    uploadImage();
                  }}
                  onFirstAppear={() => {
                    if (logMaps?.uploadimg) {
                      aplus.record(logMaps.uploadimg, "EXP");
                    }
                  }}
                >
                  <UploadIcon className={styles.uploadIcon} />
                  <span className={styles.uploadText}>{TEXTS.addImage}</span>
                </View>
              )}
            </div>
          )}

          {React.isValidElement(sendButton) ? (
            <View
              className={styles.customSendButton}
              onFirstAppear={() => {
                if (logMaps?.send) {
                  aplus.record(logMaps.send, "EXP");
                }
              }}
            >
              {React.cloneElement(sendButton as React.ReactElement<any>, {
                onClick: () => {
                  handleSend();
                },
                disabled: [Status.DEFAULT, Status.DISABLED].includes(status),
              })}
            </View>
          ) : (
            <View
              className={styles.send}
              data-role="send"
              onFirstAppear={() => {
                if (logMaps?.send) {
                  aplus.record(logMaps.send, "EXP");
                }
              }}
            >
              {/* 禁用状态 - 输入框为空，且没有图片/商品链接 */}
              {[Status.DEFAULT, Status.DISABLED].includes(status) && (
                <SendIcon className={styles.sendDisabled} />
              )}
              {/* 可发送状态 - 输入框有内容或有图片/商品链接 */}
              {status === Status.READY && (
                <SendIcon
                  className={styles.sendReady}
                  type="gradient"
                  onClick={handleSend}
                />
              )}
              {/* 运行状态 - 正在进行流式输出 */}
              {status === Status.RUNNING && (
                <PauseIcon
                  className={styles.sendPause}
                  onClick={() => {
                    handleChangeStatus(Status.PAUSED);
                  }}
                />
              )}
              {/* 加载状态 - 正在进行加载 */}
              {status === Status.LOADING && (
                <LoadingIcon
                  {...(store.isLightMode ? { type: "gradient" } : {})}
                  className={styles.rotateInfinite}
                />
              )}
            </View>
          )}
        </div>
      </div>
    </div>
  );
});

export default InputChat;

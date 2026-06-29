import React, { useState, useRef, useEffect } from "react";
import { Input, Select, Button } from "antd";
import { v4 as uuidv4 } from "uuid";
import Toast from "@/components/Toast";
import { CloseIcon } from "@/components/Icons/Close";
import { UploadIcon } from "@/components/Icons/Upload";
import BackArrowIcon from "@/components/Icons/BackArrowIcon";
import DustbinIcon from "@/components/Icons/DustbinIcon";
import { DownLoadIcon } from "@/components/Icons/CanvasSelectMenu";
import {
  createKnowledge as createKnowledgeService,
  getKnowledgeInfo as getKnowledgeInfoService,
  uploadFile as uploadFileService,
  uploadText as uploadTextService,
  parseImageFeature as parseImageFeatureService,
} from "@/services/studioKnowledge";
import { $t } from "@/i18n";
import styles from "./KnowledgeEditor.module.scss";

const maxImageCount = 20;
const maxFileCount = 5;
const acceptImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const acceptFileTypes = [
  "text/plain",
  "text/markdown",
  "application/json",
  "application/pdf",
];

// 知识库类型选项
const KNOWLEDGE_TYPE_OPTIONS = [
  {
    label: $t(
      "global-1688-ai-app.UserPrefer.Knowledge.imageKnowledge",
      "图片知识库",
    ),
    value: "image",
  },
  {
    label: $t(
      "global-1688-ai-app.UserPrefer.Knowledge.textKnowledge",
      "文本知识库",
    ),
    value: "text",
  },
];

interface TypeUploadedFile {
  id: string;
  name: string;
  contentType?: string;
  url?: string;
  metadata?: {
    type?: "imageFile" | "textFile" | "text";
    "Image-Feature"?: string;
    "Raw-Content"?: string;
    imageFeatureStatus?: "create" | "done" | "stop";
  };
  status: "uploading" | "success" | "failed";
}

interface TypeKnowledgeEditorProps {
  id?: string;
  containerContext: {
    activeTab: string;
    setActiveTab: (tab: string, data?: any) => void;
    getPostData: () => any;
  };
}

const uploadFiles = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await uploadFileService(formData);
  return res;
};

const mockImageList: TypeUploadedFile[] = [
  {
    id: "1",
    name: "图片1 - 已完成",
    url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "done",
      "Image-Feature": "tt",
    },
    status: "success",
  },
  {
    id: "11",
    name: "图片1 - 已完成",
    url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "done",
      "Image-Feature": "tt",
    },
    status: "success",
  },
  {
    id: "111",
    name: "图片1 - 已完成",
    url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "done",
      "Image-Feature": "tt",
    },
    status: "success",
  },
  {
    id: "1111",
    name: "图片1 - 已完成",
    url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "done",
      "Image-Feature": "tt",
    },
    status: "success",
  },
  {
    id: "11111",
    name: "图片1 - 已完成",
    url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "done",
      "Image-Feature": "tt",
    },
    status: "success",
  },
  {
    id: "2",
    name: "图片2 - 解析中",
    url: "https://img.alicdn.com/imgextra/i2/O1CN01h16w471dCC9Es2VNK_!!6000000003699-55-tps-1520-766.svg",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "create",
    },
    status: "success",
  },
  {
    id: "3",
    name: "图片3 - 已终止",
    url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "stop",
    },
    status: "success",
  },
  {
    id: "4",
    name: "图片4 - 加载中",
    url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "stop",
    },
    status: "uploading",
  },
];

const mockFileList: TypeUploadedFile[] = [
  {
    id: "1",
    name: "图片1 - 已完成",
    url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "done",
      "Image-Feature": "tt",
    },
    status: "success",
  },
  {
    id: "2",
    name: "图片2 - 解析中",
    url: "https://img.alicdn.com/imgextra/i2/O1CN01h16w471dCC9Es2VNK_!!6000000003699-55-tps-1520-766.svg",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "create",
    },
    status: "success",
  },
  {
    id: "3",
    name: "图片3 - 已终止",
    url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "stop",
    },
    status: "success",
  },
  {
    id: "4",
    name: "图片4 - 加载中",
    url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
    metadata: {
      type: "imageFile",
      imageFeatureStatus: "stop",
    },
    status: "uploading",
  },
];

const KnowledgeEditor: React.FC<TypeKnowledgeEditorProps> = (props) => {
  const { containerContext } = props;
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const toast = Toast();

  // 初始化表单数据
  const handleSetFormData = (data: any) => {
    let textContent = "";
    let fileList =
      (data?.kbType === "text" &&
        (data?.fileList?.filter?.((item: any) => {
          if (item?.metadata?.type !== "text") {
            return true;
          }
          textContent = item?.metadata?.["Raw-Content"] || "";
          return false;
        }) ||
          [])) ||
      [];

    return {
      kbId: data?.kbId || "",
      kbName: data?.kbName || "",
      kbType: data?.kbType || "image",
      kbDesc: data?.kbDesc || undefined,
      imageList: (data?.kbType === "image" && data?.fileList) || [],
      fileList,
      textContent,
    };
  };

  // 表单状态
  const editData = handleSetFormData(containerContext?.getPostData?.() || {});
  const id = editData?.kbId || "";
  const isEdit = !!id;
  const [name, setName] = useState(editData?.kbName || "");
  const [knowledgeType, setKnowledgeType] = useState<string>(
    editData?.kbType || "image",
  );
  const [desc, setDesc] = useState<string | undefined>(
    editData?.kbDesc || undefined,
  );
  const [imageList, setImageList] = useState<TypeUploadedFile[]>(
    editData?.imageList || [],
  );
  const [fileList, setFileList] = useState<TypeUploadedFile[]>(
    editData?.fileList || [],
  );
  const [textContent, setTextContent] = useState(editData?.textContent || "");

  const [errorField, setErrorField] = useState<{
    [key: string]: {
      key: string;
      name: string;
      message: string;
      children?: { key: string; name: string; message: string }[];
    };
  }>({});
  const [loading, setLoading] = useState(false);
  const showImageUploadButton = imageList?.length > 0;

  // 返回列表
  const handleBackList = () => {
    containerContext.setActiveTab("knowledge");
  };

  // 上传图片变化
  const handleImageUploadChange = async (e) => {
    const images = Array.from(e.target.files || []).slice(
      0,
      maxImageCount - imageList.length,
    ) as File[];
    const uploadedFiles: TypeUploadedFile[] = images.map((file: any, i) => {
      const imageItem: TypeUploadedFile = {
        id: uuidv4(),
        name: file.name,
        status: "uploading",
      };

      uploadFiles(file)
        .then((resItem: any) => {
          // 上传成功，更新图片状态
          setImageList((prev) => {
            prev.forEach((item) => {
              if (item.id === imageItem.id) {
                Object.assign(item, {
                  ...resItem,
                  status: "success",
                  metadata: {
                    ...resItem?.metadata,
                    imageFeatureStatus: "create",
                  },
                });
              }
            });
            return [...prev];
          });

          // 对图片进行解析提取特征
          parseImageFeatureService(resItem)
            .then((res) => {
              setImageList((prev) => {
                let isChanged = false;

                prev.forEach((item) => {
                  if (item.id === imageItem.id) {
                    // 用户手动中止图片标签提取后，忽略接口的返回结果
                    if (item.metadata?.imageFeatureStatus === "stop") {
                      return;
                    }

                    isChanged = true;
                    Object.assign(item, {
                      metadata: {
                        ...item?.metadata,
                        ...res?.metadata,
                        imageFeatureStatus: "done",
                      },
                    });

                    // 解析成功后，删除错误字段
                    setErrorField((prev) => {
                      delete prev?.[item.id];
                      return { ...prev };
                    });
                  }
                });
                return isChanged ? [...prev] : prev;
              });
            })
            .catch(() => {
              // 图片解析失败，更新状态
              setImageList((prev) => {
                prev.forEach((item) => {
                  if (item.id === imageItem.id) {
                    Object.assign(item, {
                      metadata: {
                        ...item?.metadata,
                        imageFeatureStatus: "done",
                      },
                    });
                  }
                });
                return [...prev];
              });
            });
        })
        .catch(() => {
          toast.error(
            $t(
              "global-1688-ai-app.UserPrefer.Knowledge.uploadFailed",
              "上传失败",
            ),
          );
          // 去掉上传失败的图片
          setImageList((prev) =>
            prev.filter((item) => item.id !== imageItem.id),
          );
        });

      return imageItem;
    });

    // 清空上传控件已选择的文件，避免下次选择同样的文件不触发onChange
    e.target.value = "";
    // 批量更新上传图片状态
    setImageList((prev) => [...uploadedFiles, ...prev]);
  };

  // 添加更多图片
  const handleTriggerImageUpload = () => {
    if (imageList.length >= maxImageCount) {
      toast.error(
        $t(
          "global-1688-ai-app.UserPrefer.Knowledge.maxImageCount",
          `最多上传${maxImageCount}张图片`,
          [maxImageCount],
        ),
      );
      return;
    }

    imageUploadRef.current?.click();
  };

  // 删除已上传图片
  const handleDeleteImage = (id: string) => {
    setImageList((prev) => prev.filter((file) => file.id !== id));
  };

  // 手动中止解析
  const handleStopParse = (id: string) => {
    setImageList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            metadata: {
              ...item?.metadata,
              imageFeatureStatus: "stop",
            },
          };
        }

        return item;
      }),
    );
  };

  // 上传文件变化
  const handleFileUploadChange = (e) => {
    const files = Array.from(e.target.files || []).slice(
      0,
      maxFileCount - fileList.length,
    ) as File[];
    const uploadedFiles: TypeUploadedFile[] = files.map((file: any, i) => {
      const fileItem: TypeUploadedFile = {
        id: uuidv4(),
        name: file.name,
        status: "uploading",
      };

      uploadFiles(file)
        .then((resItem: any) => {
          // 上传成功，更新图片状态
          setFileList((prev) => {
            prev.forEach((item) => {
              if (item.id === fileItem.id) {
                Object.assign(item, {
                  ...resItem,
                  status: "success",
                  metadata: {
                    ...resItem?.metadata,
                  },
                });
              }
            });
            return [...prev];
          });
        })
        .catch(() => {
          toast.error("上传失败");
          // 去掉上传失败的文件
          setFileList((prev) => prev.filter((item) => item.id !== fileItem.id));
        });

      return fileItem;
    });

    // 清空上传控件已选择的文件，避免下次选择同样的文件不触发onChange
    e.target.value = "";
    // 批量更新上传图片状态
    setFileList((prev) => [...uploadedFiles, ...prev]);
  };

  // 添加更多文件
  const handleTriggerFileUpload = () => {
    if (fileList.length >= maxFileCount) {
      toast.error(
        $t(
          "global-1688-ai-app.UserPrefer.Knowledge.maxFileCount",
          `最多上传${maxFileCount}个文件`,
          [maxFileCount],
        ),
      );
      return;
    }

    fileUploadRef.current?.click();
  };

  // 删除已上传文件
  const handleDeleteFile = (id: string) => {
    setFileList((prev) => prev.filter((file) => file.id !== id));
  };

  // 下载文件
  const handleDownloadFile = (id: string) => {
    const file = fileList.find((file) => file.id === id);
    if (file) {
      window.open(file.url, "_blank");
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    const postData: any = {
      kbId: id,
      kbName: name?.trim(),
      kbType: knowledgeType?.trim(),
      kbDesc: desc?.trim(),
      fileList: [],
    };
    const _textContent = textContent.trim();
    const validateErrors: {
      [key: string]: {
        key: string;
        name: string;
        message: string;
        children?: { key: string; name: string; message: string }[];
      };
    } = {};
    const scrollDOMList: string[] = [];

    setLoading(true);
    // 表单验证
    if (!postData.kbName) {
      validateErrors.name = {
        key: "name",
        name: $t(
          "global-1688-ai-app.UserPrefer.Knowledge.knowledgeName",
          "知识库名称",
        ),
        message: $t(
          "global-1688-ai-app.UserPrefer.Knowledge.pleaseEnterKnowledgeName",
          "请输入知识库名称",
        ),
      };

      scrollDOMList.push("name");
    }

    if (!postData.kbType) {
      validateErrors.knowledgeType = {
        key: "knowledgeType",
        name: $t(
          "global-1688-ai-app.UserPrefer.Knowledge.knowledgeType",
          "知识库类型",
        ),
        message: $t(
          "global-1688-ai-app.UserPrefer.Knowledge.pleaseSelectKnowledgeType",
          "请选择知识库类型",
        ),
      };
      scrollDOMList.push("knowledgeType");
    }

    if (knowledgeType === "image") {
      const imageValidateError: {
        [key: string]: { key: string; name: string; message: string };
      } = {};

      if (imageList.length === 0) {
        imageValidateError["imageList"] = {
          key: "imageList",
          name: $t(
            "global-1688-ai-app.UserPrefer.Knowledge.imageLabel",
            "图片标签",
          ),
          message: $t(
            "global-1688-ai-app.UserPrefer.Knowledge.pleaseUploadAtLeastOneFile",
            "请上传至少一个文件",
          ),
        };
        scrollDOMList.push("imageList");
      } else {
        imageList.forEach((item) => {
          if (!item.metadata?.["Image-Feature"]) {
            const imageId = `image-feature-${item.id}`;
            imageValidateError[imageId] = {
              key: imageId,
              name: $t(
                "global-1688-ai-app.UserPrefer.Knowledge.imageLabel",
                "图片标签",
              ),
              message: $t(
                "global-1688-ai-app.UserPrefer.Knowledge.imageLabelCannotBeEmpty",
                "图片标签不能为空",
              ),
            };
            scrollDOMList.push(imageId);
          } else {
            const postFileItem = {
              ...item,
              metadata: {
                ...item?.metadata,
              },
            };

            delete postFileItem.metadata?.imageFeatureStatus;
            postData.fileList.push(postFileItem);
          }
        });
      }

      if (Object.keys(imageValidateError).length > 0) {
        Object.assign(validateErrors, imageValidateError);
      }
    } else if (knowledgeType === "text") {
      if (!_textContent && fileList.length === 0) {
        validateErrors.textContent = {
          key: "textContent",
          name: $t("global-1688-ai-app.UserPrefer.Knowledge.content", "内容"),
          message: $t(
            "global-1688-ai-app.UserPrefer.Knowledge.contentCannotBeEmpty",
            "内容不能为空",
          ),
        };
      }

      postData.fileList = [...fileList];
    }

    // 滚动到错误字段，图片上传列表、文本上传列表、文本知识库内容输入框
    const scrollToErrorField = () => {
      // 从后向前依次把错误元素滚动到可视区域
      for (let i = scrollDOMList.length - 1; i >= 0; i--) {
        const sId = scrollDOMList[i];
        const errorFieldElement =
          sId && document.querySelector(`[data-name="${sId}"]`);

        if (errorFieldElement) {
          errorFieldElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    if (Object.keys(validateErrors).length > 0) {
      toast.error(
        $t(
          "global-1688-ai-app.UserPrefer.Knowledge.pleaseConfirmAllFields",
          `请确认${Object.values(validateErrors)
            .map((item) => item.name)
            .join("、")}输入完整后保存知识库`,
          [
            Object.values(validateErrors)
              .map((item) => item.name)
              .join("、"),
          ],
        ),
        {
          duration: 5,
        },
      );
      setErrorField(validateErrors);
      scrollToErrorField();
    } else {
      // 上传文本内容，生成file对象
      if (_textContent) {
        try {
          const resRawContent: any = await uploadTextService(_textContent);

          resRawContent.metadata = {
            ...resRawContent?.metadata,
            type: "text",
          };
          postData.fileList.unshift(resRawContent);
        } catch (error) {
          toast.error(
            $t(
              "global-1688-ai-app.UserPrefer.Knowledge.textContentUploadFailed",
              "文本内容上传失败，请稍后重试",
            ),
          );
          validateErrors.textContent = {
            key: "textContent",
            name: $t("global-1688-ai-app.UserPrefer.Knowledge.content", "内容"),
            message: $t(
              "global-1688-ai-app.UserPrefer.Knowledge.textContentUploadFailed",
              "文本内容上传失败，请稍后重试",
            ),
          };
          scrollDOMList.push("textContent");
          setLoading(false);
          setErrorField(validateErrors);
          scrollToErrorField();
          return;
        }
      }

      setErrorField({});

      try {
        const res: any = await createKnowledgeService(postData);
        if (res && res.kbId) {
          toast.success(
            $t(
              "global-1688-ai-app.UserPrefer.Knowledge.saveKnowledgeSuccess",
              "保存知识库成功",
            ),
          );
          handleBackList();
        } else {
          toast.error(
            $t(
              "global-1688-ai-app.UserPrefer.Knowledge.saveKnowledgeFailed",
              "保存知识库失败，请稍后重试",
            ),
          );
        }
      } catch (error) {
        toast.error(
          $t(
            "global-1688-ai-app.UserPrefer.Knowledge.saveKnowledgeFailed",
            "保存知识库失败，请稍后重试",
          ),
        );
      }
    }

    setLoading(false);
  };

  // 获取上传限制文案
  const getUploadLimitText = () => {
    if (knowledgeType === "image") {
      return $t(
        "global-1688-ai-app.UserPrefer.Knowledge.maxImageCount",
        `(最多上传${maxImageCount}张图片)`,
        [maxImageCount],
      );
    }
    return $t(
      "global-1688-ai-app.UserPrefer.Knowledge.maxFileCount",
      `(最多上传${maxFileCount}个文件)`,
      [maxFileCount],
    );
  };

  // 获取上传描述文案
  const getUploadDescText = () => {
    if (knowledgeType === "image") {
      return $t(
        "global-1688-ai-app.UserPrefer.Knowledge.uploadDescText",
        `上传格式支持PNG, JPG, JPEG, WEBP等格式。最多上传${maxImageCount}张图片`,
        [maxImageCount],
      );
    }
    return "";
  };

  useEffect(() => {
    if (knowledgeType !== "image") {
      setImageList([]);
    }

    if (knowledgeType !== "text") {
      setFileList([]);
    }

    setErrorField({});
  }, [knowledgeType]);

  useEffect(() => {
    if (id) {
      getKnowledgeInfoService(id).then((res: any) => {
        const editData = handleSetFormData(res);

        setName(editData?.kbName || "");
        setKnowledgeType(editData?.kbType || "image");
        setDesc(editData?.kbDesc || undefined);
        setImageList(editData?.imageList || []);
        setFileList(editData?.fileList || []);
        setTextContent(editData?.textContent || "");
      });
    }
  }, [id]);

  return (
    <div className={styles.container}>
      {/* 头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.backIcon} onClick={handleBackList}>
            <BackArrowIcon />
          </div>
          <span className={styles.headerTitle}>
            {$t("global-1688-ai-app.UserPrefer.knowledgeBase.add", "添加知识")}
          </span>
        </div>
      </div>

      {/* 表单内容 */}
      <div className={styles.formContent}>
        {/* 名称 + 类型 */}
        <div className={styles.rowGroup}>
          <div className={styles.colItem}>
            <span className={styles.labelLine}>
              <span className={styles.labelText}>
                {$t("global-1688-ai-app.UserPrefer.Knowledge.name", "名称")}{" "}
              </span>
              <span className={styles.requiredStar}>*</span>
            </span>
            <div className={styles.inputBox}>
              <Input
                value={name}
                maxLength={30}
                placeholder={$t(
                  "global-1688-ai-app.UserPrefer.Knowledge.namePlaceholder",
                  "更准确的名称能在使用时更快找到",
                )}
                data-name="name"
                status={errorField?.name ? "error" : undefined}
                onChange={(e) => {
                  delete errorField?.name;
                  setErrorField({ ...errorField });
                  setName(e.target.value);
                }}
              />
            </div>
          </div>
          <div className={styles.colItem}>
            <span className={styles.labelLine}>
              <span className={styles.labelText}>
                {$t(
                  "global-1688-ai-app.UserPrefer.Knowledge.knowledgeType",
                  "知识库类型",
                )}{" "}
              </span>
              <span className={styles.requiredStar}>*</span>
            </span>
            <div className={styles.selectBox}>
              <Select
                value={knowledgeType}
                disabled={isEdit}
                options={KNOWLEDGE_TYPE_OPTIONS}
                data-name="knowledgeType"
                status={errorField?.knowledgeType ? "error" : undefined}
                onChange={(value) => {
                  delete errorField?.knowledgeType;
                  setErrorField({ ...errorField });
                  setKnowledgeType(value);
                }}
              />
            </div>
          </div>
        </div>

        {/* 描述 */}
        <div className={styles.formGroup}>
          <span className={styles.labelLine}>
            <span className={styles.labelText}>
              {$t(
                "global-1688-ai-app.UserPrefer.Knowledge.description",
                "描述",
              )}
            </span>
          </span>
          <div className={styles.textAreaBox}>
            <Input.TextArea
              className={styles.textareaWithCount}
              value={desc}
              placeholder={$t(
                "global-1688-ai-app.UserPrefer.Knowledge.descriptionPlaceholder",
                "知识库描述",
              )}
              rows={2}
              maxLength={120}
              showCount
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>

        {/* 内容区域 */}
        {knowledgeType === "image" ? (
          <div className={styles.uploadGroup}>
            <div className={styles.uploadHeader}>
              <span className={styles.labelLine}>
                <span className={styles.labelText}>
                  {$t(
                    "global-1688-ai-app.UserPrefer.Knowledge.content",
                    "内容",
                  )}{" "}
                </span>
                <span className={styles.requiredStar}>*</span>
                <span className={styles.uploadLimit}>
                  {getUploadLimitText()}
                </span>
              </span>

              {showImageUploadButton && (
                <Button
                  className={styles.uploadBtn}
                  type="primary"
                  onClick={handleTriggerImageUpload}
                >
                  <UploadIcon />
                  {$t(
                    "global-1688-ai-app.UserPrefer.Knowledge.uploadImage",
                    "上传图片",
                  )}
                </Button>
              )}
            </div>

            {imageList.length === 0 ? (
              <div
                className={styles.uploadArea}
                data-error={errorField?.imageList ? "true" : undefined}
              >
                <div className={styles.uploadContent}>
                  <i className={styles.uploadIcon} />
                  <span className={styles.uploadDesc}>
                    {getUploadDescText()}
                  </span>
                </div>

                <input
                  className={styles.imageUploadInput}
                  ref={imageUploadRef}
                  type="file"
                  multiple
                  onChange={handleImageUploadChange}
                  accept={acceptImageTypes.join(",")}
                />
              </div>
            ) : (
              <div className={styles.uploadedImageList}>
                {imageList.map((file) => {
                  const roleId = `image-feature-${file.id}`;

                  return (
                    <div
                      key={file.id}
                      id={file.id}
                      className={styles.uploadedItem}
                    >
                      <div className={styles.uploadedItemImageWrapper}>
                        {file.status === "uploading" ? (
                          <div
                            className={styles.uploadedItemImagePlaceholder}
                          />
                        ) : (
                          <img
                            className={styles.uploadedItemImage}
                            src={file.url}
                            alt=""
                          />
                        )}
                        <div
                          className={styles.uploadedItemDelete}
                          onClick={() => handleDeleteImage(file.id)}
                        >
                          <CloseIcon size={12} />
                        </div>
                      </div>
                      <div className={styles.uploadedItemInfo}>
                        <div className={styles.labelLine}>
                          <span className={styles.labelText}>
                            {$t(
                              "global-1688-ai-app.UserPrefer.Knowledge.imageLabel",
                              "图片标签",
                            )}{" "}
                          </span>
                          <span className={styles.requiredStar}>*</span>
                        </div>

                        {/* 图片标签内容区域 */}
                        {file.metadata?.imageFeatureStatus === "create" ? (
                          <div
                            className={styles.imageLabelContainer}
                            data-name={roleId}
                            data-error={
                              errorField?.[roleId] ? "true" : undefined
                            }
                          >
                            <div className={styles.processingContent}>
                              <i className={styles.processingIcon} />
                              <span>AI解析中</span>
                            </div>
                            <span className={styles.divider} />
                            <div
                              className={styles.stopParseBtn}
                              onClick={() => handleStopParse(file.id)}
                            >
                              {$t(
                                "global-1688-ai-app.UserPrefer.Knowledge.stopParse",
                                "停止解析",
                              )}
                              <div className={styles.stopParseIcon}>
                                <BackArrowIcon />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Input.TextArea
                            className={styles.uploadedItemInput}
                            value={file?.metadata?.["Image-Feature"] || ""}
                            disabled={["uploading", "failed"].includes(
                              file.status,
                            )}
                            status={errorField?.[roleId] ? "error" : undefined}
                            onChange={(e) => {
                              delete errorField?.[roleId];
                              setErrorField({ ...errorField });

                              setImageList(
                                imageList.map((item) =>
                                  item.id === file.id
                                    ? {
                                        ...item,
                                        metadata: {
                                          ...item?.metadata,
                                          "Image-Feature": e.target.value,
                                        },
                                      }
                                    : item,
                                ),
                              );
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 放置一个隐藏的上传按钮 */}
                <input
                  ref={imageUploadRef}
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageUploadChange}
                  accept={acceptImageTypes.join(",")}
                />
              </div>
            )}
          </div>
        ) : (
          <div className={styles.textGroup}>
            <div className={styles.textHeader}>
              <span className={styles.labelLine}>
                <span className={styles.labelText}>
                  {$t(
                    "global-1688-ai-app.UserPrefer.Knowledge.content",
                    "内容",
                  )}{" "}
                </span>
                <span className={styles.requiredStar}>*</span>
                <span className={styles.uploadLimit}>
                  {getUploadLimitText()}
                </span>
              </span>

              <Button
                className={styles.uploadBtn}
                type="primary"
                onClick={handleTriggerFileUpload}
              >
                <UploadIcon />
                {$t(
                  "global-1688-ai-app.UserPrefer.Knowledge.uploadFile",
                  "上传文件",
                )}
              </Button>
              {/* 放置一个隐藏的上传按钮 */}
              <input
                ref={fileUploadRef}
                type="file"
                multiple
                style={{ display: "none" }}
                accept={acceptFileTypes.join(",")}
                onChange={handleFileUploadChange}
              />
            </div>

            {!!fileList.length && (
              <div className={styles.uploadedFileList}>
                {fileList.map((file) => (
                  <div key={file.id} className={styles.uploadedFileItem}>
                    <div
                      className={styles.uploadedFileItemLabel}
                      title={file.name}
                    >
                      {file.name}
                    </div>

                    <div className={styles.uploadedFileActions}>
                      <div
                        className={styles.uploadedFileActionItem}
                        onClick={() => handleDownloadFile(file.id)}
                      >
                        <DownLoadIcon
                          className={styles.uploadedFileActionIcon}
                        />
                        <span>
                          {$t(
                            "global-1688-ai-app.UserPrefer.Knowledge.download",
                            "下载",
                          )}
                        </span>
                      </div>

                      <div
                        className={styles.uploadedFileActionItem}
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <DustbinIcon
                          className={styles.uploadedFileActionIcon}
                        />
                        <span>
                          {$t(
                            "global-1688-ai-app.UserPrefer.Knowledge.delete",
                            "删除",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Input.TextArea
              className={styles.textArea}
              value={textContent}
              status={errorField?.textContent ? "error" : undefined}
              placeholder={$t(
                "global-1688-ai-app.UserPrefer.Knowledge.textContentPlaceholder",
                "请输入文本知识库内容，用于AI参考和学习",
              )}
              maxLength={2000}
              rows={10}
              onChange={(e) => {
                delete errorField?.textContent;
                setErrorField({ ...errorField });
                setTextContent(e.target.value);
              }}
            />
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className={styles.footer}>
        <Button
          type="primary"
          className={styles.submitBtn}
          disabled={loading}
          loading={loading}
          onClick={handleSubmit}
        >
          {$t(
            "global-1688-ai-app.UserPrefer.Knowledge.saveKnowledge",
            "保存知识库",
          )}
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeEditor;

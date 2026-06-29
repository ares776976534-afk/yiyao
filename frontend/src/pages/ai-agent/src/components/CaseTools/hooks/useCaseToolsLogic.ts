import { useState, useEffect, useRef } from "react";
import { useSpm } from "ice";
import type { TypeFileItem } from "@/components/InputChat/utils/fileSelector";
import { createImageItemFromUrl } from "@/components/InputChat/utils/fileSelector";
import {
  routeJump,
  getUrlSearchParams,
  replaceUrlSearchParams,
} from "@/utils/url";
import { useStore } from "@/stores/context";
import queryQuickPortal from "@/services/studio/queryQuickPortal";
import createChatCache from "@/services/studio/createChatCache";
import { $t } from "@/i18n";
import type { TypeToolConfig, TypeImageFromUrl } from "../types";
import { EnumToolType } from "../types";

const getDefaultValue = (tool: TypeToolConfig) => {
  const extra = tool?.extra;
  return extra?.default || extra?.options?.[0]?.label || "";
};

// 替换 {0} 占位符的函数
const replacePromptPlaceholder = (template: string, replacement: string) => {
  return template.replace(/\{0\}/g, replacement);
};

const transformI18nData = (data, $t) => {
  const transform = (obj) => {
    if (obj === null || typeof obj !== "object") return obj;

    if (obj.i18nKey !== undefined && obj.defaultValue !== undefined) {
      return $t(obj.i18nKey, obj.defaultValue);
    }

    if (Array.isArray(obj)) {
      const len = obj.length;
      const result = new Array(len);
      for (let i = 0; i < len; i++) {
        result[i] = transform(obj[i]);
      }
      return result;
    }

    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = transform(obj[key]);
      }
    }
    return result;
  };

  return transform(data);
};

interface TypeUseCaseToolsLogicOptions {
  /** 跳转页面路径，默认 'studio' */
  targetPage?: string;
  /** 跳转时额外的参数 */
  jumpPageParams?: Record<string, string>;
}

export const useCaseToolsLogic = (options?: TypeUseCaseToolsLogicOptions) => {
  const { targetPage = "studio", jumpPageParams } = options || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickPortals, setQuickPortals] = useState<TypeToolConfig[]>([]);
  const [selectedTool, setSelectedTool] = useState<TypeToolConfig | null>(null);
  // 改为二维数组，每个索引对应一个上传组件的文件列表
  const [uploadedFiles, setUploadedFiles] = useState<TypeFileItem[][]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [marketingStyle, setMarketingStyle] = useState<string>("");
  const [marketingText, setMarketingText] = useState("");
  const [prompt, setPrompt] = useState("");
  const store = useStore();
  const [spmA, spmB] = useSpm();
  const marketingTextAreaRef = useRef<any>(null);

  const handleSetPrompt = (tool: TypeToolConfig, defaultValue: string) => {
    if (tool.type === EnumToolType.IMAGE_TRANSLATION) {
      const newPrompt = replacePromptPlaceholder(
        tool?.prompt || "",
        defaultValue,
      );
      setPrompt(newPrompt);
    } else {
      setPrompt(tool?.prompt || "");
    }
  };

  const handleOpenModal = (tool: TypeToolConfig) => {
    const defaultValue = getDefaultValue(tool);
    if (tool.type === EnumToolType.MARKETING_IMAGE) {
      setMarketingStyle(defaultValue);
    } else if (tool.type === EnumToolType.IMAGE_TRANSLATION) {
      setSelectedLanguage(defaultValue);
    }
    handleSetPrompt(tool, defaultValue);
    setSelectedTool(tool);
    // 根据工具的上传组件数量初始化二维数组
    setUploadedFiles(new Array(tool.uploads.length).fill(null).map(() => []));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAfterClose = () => {
    setSelectedTool(null);
    setUploadedFiles([]);
    setSelectedLanguage("");
    setMarketingStyle("");
    setMarketingText("");
    setPrompt("");
  };

  const handleConfirmUpload = () => {
    handleCloseModal();

    createChatCache({
      query: prompt,
      attachments: {
        image: (uploadedFiles.flat(Infinity) as TypeFileItem[]).map((item) => {
          return {
            url: item.imagePreviewUrl,
            width: item.width,
            height: item.height,
          };
        }),
      },
    })
      .then((res) => {
        routeJump(targetPage, {
          cacheId: res,
          autoSend: "true",
          spm: `${spmA}.${spmB}.case-tools.${selectedTool?.type}`,
          ...(jumpPageParams || {}),
        });
      })
      .catch(() => {});
  };

  // 处理单个上传组件的文件上传
  const handleFilesUpload = (index: number, files: TypeFileItem[]) => {
    setUploadedFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles[index] = files;
      return newFiles;
    });
  };

  // 处理单个上传组件的文件删除
  const handleFileDelete = (index: number, fileId: string) => {
    setUploadedFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles[index] = newFiles[index].filter((file) => file.id !== fileId);

      // 如果所有文件都被删除了，重置语言选择
      if (newFiles.every((fileList) => fileList.length === 0)) {
        setSelectedLanguage(getDefaultValue(selectedTool as TypeToolConfig));
      }

      return newFiles;
    });
  };

  const handleQuickPortalForUrl = (quickPortals: TypeToolConfig[]) => {
    const urlParams = getUrlSearchParams();
    const { effect, effectValue } = urlParams;
    if (effect === "quickPortal" && effectValue) {
      const item = quickPortals.find((item) => item.type === effectValue);
      if (item) {
        replaceUrlSearchParams({
          effect: undefined,
          effectValue: undefined,
        });
        handleOpenModal(item);
      }
    }
  };

  // 处理营销文案变化
  const handleMarketingTextChange = (value: string) => {
    const { prompt } =
      selectedTool?.extra?.options?.find(
        (option: any) => option.label === marketingStyle,
      ) || {};
    // 使用模板字符串替换 {0} 占位符
    const newPrompt = replacePromptPlaceholder(prompt, value);
    setMarketingText(value);
    setPrompt(newPrompt);
  };

  // 处理营销风格变化
  const handleMarketingStyleChange = (value: string) => {
    setMarketingStyle(value);
    setMarketingText("");
  };

  // 处理语言选择变化
  const handleLanguageChange = (label: string) => {
    setSelectedLanguage(label);
    const newPrompt = replacePromptPlaceholder(
      selectedTool?.prompt || "",
      label,
    );
    setPrompt(newPrompt);
  };

  // 处理快捷模板点击
  const handleQuickTemplateClick = (imageArray: TypeImageFromUrl[]) => {
    if (!selectedTool) return;

    // 根据上传配置分配图片
    const newFiles: TypeFileItem[][] = selectedTool.uploads.map(() => []);

    imageArray.forEach((imageItem, mediaIndex) => {
      if (mediaIndex < selectedTool.uploads.length) {
        const fileItem = createImageItemFromUrl(imageItem) as TypeFileItem;
        newFiles[mediaIndex] = [fileItem];
      }
    });

    setUploadedFiles(newFiles);
  };

  useEffect(() => {
    queryQuickPortal().then((quickActions) => {
      const quickPortals = transformI18nData(quickActions || [], $t);
      setQuickPortals(quickPortals);
      handleQuickPortalForUrl(quickPortals);
    });
  }, []);

  useEffect(() => {
    if (marketingTextAreaRef.current) {
      marketingTextAreaRef.current.resizableTextArea?.textArea?.scrollTo(0, 0);
    }
  }, [marketingText]);

  const hasQuickPortals = quickPortals.length > 0;
  const hasFile = uploadedFiles.some((fileList) => fileList.length > 0);
  const allFilesUploaded = selectedTool
    ? uploadedFiles.every((fileList, index) => {
        const config = selectedTool.uploads[index];
        return config.multiple ? fileList.length > 0 : fileList.length === 1;
      })
    : false;

  // 营销风格工具需要额外判断营销文案是否为空
  const isMarketingToolValid =
    selectedTool?.type === EnumToolType.MARKETING_IMAGE
      ? marketingText.trim() !== ""
      : true;

  return {
    // 状态
    isModalOpen,
    quickPortals,
    selectedTool,
    uploadedFiles,
    selectedLanguage,
    marketingStyle,
    marketingText,
    prompt,
    store,
    spmA,
    spmB,
    marketingTextAreaRef,
    hasQuickPortals,
    hasFile,
    allFilesUploaded,
    isMarketingToolValid,

    // 方法
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
  };
};

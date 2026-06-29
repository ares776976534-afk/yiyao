import { message } from "antd";
import debounce from "lodash.debounce";
import { IMAGE_ACCEPT_TYPE, IMAGE_ACCEPT_MINI_TYPE } from "./fileSelector";

// 处理图片粘贴类型定义
export type TypePasteImageHandler = (files: File[]) => void;
export type TypePasteTextHandler = (text: string) => void;
export type TypeIsModalOpenCheck = () => boolean;

/**
 * 剪贴板工具类
 */
export class ClipboardUtils {
  /**
   * 从剪贴板事件中提取图片文件
   * @param event 剪贴板事件
   * @param acceptTypes 接受的图片类型，默认使用项目配置的图片类型
   * @returns 图片文件数组
   */
  static extractImageFilesFromClipboard(
    event: ClipboardEvent,
    acceptTypes: string[] = IMAGE_ACCEPT_TYPE
  ): File[] {
    const items = Array.from(event.clipboardData?.items || []);
    return items
      .filter((item: any) => acceptTypes.includes(item?.type))
      .map((item: any) => item.getAsFile())
      .filter((file) => file !== null);
  }

  /**
   * 从剪贴板事件中提取文本内容
   * @param event 剪贴板事件
   * @returns 文本内容
   */
  static extractTextFromClipboard(event: ClipboardEvent): string {
    return event.clipboardData?.getData("text/plain") || "";
  }

  /**
   * 从剪贴板事件中提取HTML内容
   * @param event 剪贴板事件
   * @returns HTML内容
   */
  static extractHtmlFromClipboard(event: ClipboardEvent): string {
    return event.clipboardData?.getData("text/html") || "";
  }

  /**
   * 解析HTML内容，提取文本和图片信息
   * @param htmlString HTML内容
   * @returns 解析结果包含文本、图片信息等
   */
  static parseHtmlContent(htmlString: string) {
    if (!htmlString) return { text: "", images: [], html: htmlString };

    try {
      // 使用DOMParser解析HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");

      // 移除不需要的元素
      const elementsToRemove = doc.querySelectorAll(
        "style, script, meta, link, head, title"
      );
      elementsToRemove.forEach((el) => el.remove());

      // 提取图片
      const imgElements = Array.from(doc.querySelectorAll("img"));
      const images = imgElements.map((img) => ({
        src: img.src,
      }));

      // 只从有意义的内容元素中提取文本
      const meaningfulElements = doc.querySelectorAll(
        "p, div, span, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, pre, article, section"
      );
      const textParts: string[] = [];

      if (meaningfulElements.length > 0) {
        // 如果有结构化的内容元素，只从这些元素中提取文本
        meaningfulElements.forEach((element) => {
          const text = element.textContent?.trim();
          if (text && text.length > 2) {
            textParts.push(text);
          }
        });
      } else {
        // 如果没有结构化元素，则从body中提取所有文本
        const bodyText =
          doc.body?.textContent?.trim() ||
          doc.documentElement?.textContent?.trim();
        if (bodyText && bodyText.length > 2) {
          textParts.push(bodyText);
        }
      }

      // 去重并简单过滤
      const uniqueTexts = [...new Set(textParts)].filter(
        (text) => !/^[\s\n\r\t]*$/.test(text)
      ); // 过滤纯空白

      const finalText = uniqueTexts.join("\n").trim();

      return {
        text: finalText,
        images,
        html: htmlString,
      };
    } catch (error) {
      console.warn("解析HTML失败，使用fallback方法:", error);
      return null;
    }
  }

  /**
   * 将网络图片URL转换为base64
   * @param url 图片URL
   * @returns Promise<string | null> base64字符串
   */
  static async urlToBase64(url: string): Promise<string | null> {
    if (!url || !url.startsWith("http")) {
      return null;
    }

    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) {
        console.warn("下载图片失败:", response.status);
        return null;
      }

      const blob = await response.blob();

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn("URL转base64失败:", error);
      return null;
    }
  }

  /**
   * 将base64图片转换为File对象
   * @param base64 base64字符串
   * @param filename 文件名
   * @returns File对象
   */
  static base64ToFile(base64: string, filename: string): File | null {
    if (!base64 || !base64.startsWith("data:image/")) {
      return null;
    }

    try {
      const [mimeData, base64Data] = base64.split(",");
      const mimeType = mimeData.match(/data:([^;]+)/)?.[1] || "";

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      return new File([byteArray], filename, { type: mimeType });
    } catch (error) {
      console.warn("解析base64图片失败:", error);
      return null;
    }
  }

  /**
   * 检查当前是否有输入框处于焦点状态
   * @returns 是否有输入框处于焦点状态
   */
  static isInputElementActive(): boolean {
    const activeElement = document.activeElement as HTMLElement | null;
    return (
      ["INPUT", "TEXTAREA"].includes(activeElement?.tagName || "") ||
      activeElement?.isContentEditable ||
      false
    );
  }

  /**
   * 从blob和图片URL中推断MIME类型和扩展名
   * @param blob Blob对象
   * @param imageUrl 图片URL
   * @returns { mimeType, extension }
   */
  static inferImageMimeType(
    blob: Blob,
    imageUrl: string
  ): { mimeType: string; extension: string } {
    let mimeType = blob.type || "";
    let extension = "png";

    // 如果blob.type有值且符合image/*格式
    if (mimeType && mimeType.startsWith("image/")) {
      extension = mimeType.split("/")[1] || "png";
      return { mimeType, extension };
    }

    // 尝试从URL后缀推断
    const urlExt = imageUrl.split(".").pop()?.toLowerCase();
    if (urlExt && IMAGE_ACCEPT_MINI_TYPE.includes(urlExt)) {
      // jpg需要转成jpeg（标准MIME类型是image/jpeg而不是image/jpg）
      extension = urlExt === "jpg" ? "jpeg" : urlExt;
      mimeType = `image/${extension}`;
      return { mimeType, extension };
    }

    // 兜底
    return { mimeType: "image/png", extension: "png" };
  }
}

/**
 * 创建粘贴事件处理器
 * @param options 配置选项
 * @returns 粘贴事件处理器和清理函数
 */
export const createPasteHandler = (options: {
  onImagePaste?: TypePasteImageHandler;
  onTextPaste?: TypePasteTextHandler;
  debounceDelay?: number; // 防抖延迟时间，默认200ms
  pasteDom?: HTMLDivElement | null;
}) => {
  const { onImagePaste, onTextPaste, debounceDelay = 100, pasteDom } = options;

  const handlePasteEvent = async (event: ClipboardEvent) => {
    // 获取粘贴的内容
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    let files: File[] = [];
    let text: string = "";

    // 检查剪贴板数据类型
    const hasHtml = clipboardData.types.includes("text/html");
    const hasPlainText = clipboardData.types.includes("text/plain");
    const hasImageFiles = Array.from(clipboardData.items || []).some((item) =>
      item.type.startsWith("image/")
    );

    if (hasImageFiles) {
      event.preventDefault();
      files = ClipboardUtils.extractImageFilesFromClipboard(event);
    } else if (hasHtml) {
      // 如果没有直接的File对象，但有HTML内容，则解析HTML里的图片
      // 例如：从网页复制带图片的富文本内容
      const htmlContent = ClipboardUtils.extractHtmlFromClipboard(event);
      const parsed = ClipboardUtils.parseHtmlContent(htmlContent);

      if (parsed && parsed.images.length > 0) {
        // 发现有图片，立即阻止默认事件，避免浏览器插入文本
        event.preventDefault();

        // 只有在真的有图片时才处理
        // 提取文本
        text = parsed.text;

        // 将所有图片转成File对象
        const imagePromises = parsed.images.map(async (img, index) => {
          const filename = `pasted-image-${index + 1}`;

          // 如果是网络图片,直接从blob转File
          if (img.src.startsWith("http")) {
            try {
              const response = await fetch(img.src, { mode: "cors" });
              if (!response.ok) {
                console.warn("下载网络图片失败:", img.src, response.status);
                return null;
              }
              const blob = await response.blob();

              // 推断MIME类型和扩展名
              const { mimeType, extension } = ClipboardUtils.inferImageMimeType(
                blob,
                img.src
              );

              return new File([blob], `${filename}.${extension}`, {
                type: mimeType,
              });
            } catch (error) {
              console.warn("网络图片转换失败:", img.src, error);
              return null;
            }
          }

          // 如果是base64图片,走base64转File逻辑
          if (img.src.startsWith("data:image/")) {
            const extension = img.src.split("/")[1]?.split(";")[0] || "png";
            return ClipboardUtils.base64ToFile(
              img.src,
              `${filename}.${extension}`
            );
          }

          // 其他情况返回null
          console.warn("无法识别的图片格式:", img.src);
          return null;
        });

        // 等待所有图片处理完成
        const processedFiles = await Promise.all(imagePromises);
        files = processedFiles.filter((file): file is File => file !== null);
      }
      // 如果HTML里没有图片，就当普通文本处理，走浏览器默认行为
    } else if (hasPlainText) {
      // 纯文本内容
      text = ClipboardUtils.extractTextFromClipboard(event);
    }

    const hasFiles = files && files.length > 0;
    const hasText = text.trim();

    // 处理图片
    if (hasFiles && onImagePaste) {
      onImagePaste(files);
    }

    // 纯文本粘贴交给浏览器默认行为
    if (hasText && onTextPaste && hasFiles) {
      onTextPaste(text);
    }
  };

  // 使用防抖处理器
  const debouncedHandlePasteEvent = debounce(handlePasteEvent, debounceDelay, {
    leading: true,
    trailing: false,
  });

  return {
    handlePasteEvent: debouncedHandlePasteEvent,
    setup: () => {
      if (pasteDom) {
        pasteDom.addEventListener("paste", debouncedHandlePasteEvent);
      }
    },
    cleanup: () => {
      if (pasteDom) {
        pasteDom.removeEventListener("paste", debouncedHandlePasteEvent);
      }
    },
  };
};

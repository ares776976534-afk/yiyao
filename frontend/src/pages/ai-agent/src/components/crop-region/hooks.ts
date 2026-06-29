import { useCallback } from "react";
import { ImageSize } from "./types";

// 等待图片完全加载并渲染的hook
export const useImageReady = () => {
  const waitForImageReady = useCallback(
    (imageRef: React.RefObject<HTMLImageElement>): Promise<ImageSize> => {
      return new Promise((resolve) => {
        if (!imageRef.current) {
          resolve({ width: 0, height: 0 });
          return;
        }

        const img = imageRef.current;

        const checkSize = () => {
          // 检查是否已经有显示尺寸
          if (img.width > 0 && img.height > 0) {
            resolve({ width: img.width, height: img.height });
            return;
          }

          // 使用requestAnimationFrame轮询，比setTimeout更精确
          requestAnimationFrame(checkSize);
        };

        // 如果图片已经加载完成，直接检查尺寸
        if (img.complete && img.naturalWidth > 0) {
          checkSize();
        } else {
          // 否则等待load事件
          const handleLoad = () => {
            img.removeEventListener("load", handleLoad);
            checkSize();
          };
          img.addEventListener("load", handleLoad);
        }
      });
    },
    []
  );

  return { waitForImageReady };
}; 
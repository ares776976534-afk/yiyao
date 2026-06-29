import { useState, useEffect, useMemo } from 'react';
import {
  TypeFileItem,
  FileSelector,
  createFileSelector
} from '../utils/fileSelector';

interface UseFileSelectorReturn {
  isSelecting: boolean;
  isLoading: boolean;
  progress: number;
  fileItems: TypeFileItem[];
  instance: FileSelector;
}

// React Hook 用于获取文件选择器状态
export const useFileSelector = (sharedInstance?: FileSelector): UseFileSelectorReturn => {
  const [state, setState] = useState<Omit<UseFileSelectorReturn, 'instance'>>({
    isSelecting: false,
    isLoading: false,
    progress: 0,
    fileItems: []
  });

  // 创建或使用传入的实例
  const instance = useMemo(() => {
    return sharedInstance || createFileSelector();
  }, [sharedInstance]);

  useEffect(() => {
    const unsubscribeState = (data: { isSelecting: boolean }) => {
      setState(prev => ({
        ...prev,
        isSelecting: data.isSelecting,
        // 当选择流程结束时，确保加载态复位
        isLoading: data.isSelecting ? prev.isLoading : false
      }));
    };

    const unsubscribeProgress = (data: { progress: number; fileItems?: TypeFileItem[] }) => {
      setState(prev => ({
        ...prev,
        progress: data.progress,
        fileItems: data.fileItems || [],
        // 仅在有实际进度进行中时标记为加载中
        isLoading: data.progress > 0 && data.progress < 100
      }));
    };

    instance.on('stateChange', unsubscribeState);
    instance.on('progress', unsubscribeProgress);

    return () => {
      instance.off('stateChange', unsubscribeState);
      instance.off('progress', unsubscribeProgress);
    };
  }, [instance]);

  return { ...state, instance };
};
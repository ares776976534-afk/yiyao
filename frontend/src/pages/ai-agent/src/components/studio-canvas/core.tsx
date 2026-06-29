/**
 * 位移和比例尺计算规则
 * 1. 画布机遇左上角移动和缩放
 * 2. 画布向外移动为负数，设置元素坐标要减去画布左上角的坐标
 * 3. 画布缩放后，使用getClientRect获取元素坐标和尺寸已经是原始值乘以缩放系数后的结果
 *    要保证参与运算的值都是相同比例尺下的值
 *    设置给元素的值要换算成1倍比例尺下的值
 *
 * 设画布移动P(x, y)，缩放比例为Z(x, y)，元素为A，getClientRect的值为A(x, y, width, height)
 * 希望把A沿着x轴移动x1，y轴移动y1，宽度增加w1，高度增加h1，计算画布实际要设置的值
 * x = (x1 - P.x) / 缩放系数
 * y = (y1 - P.y ) / 缩放系数
 * width = (width1 - A.width) / 缩放系数
 * height = (height1 - A.height) / 缩放系数
 *
 * 在2个横向排列的元素之间增加一个间距，在1倍比例下的间距是10，下一个元素的的x坐标
 * x = (上一个元素的x + 上一个元素的width) / 缩放系数 + 间距
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Menu } from "antd";
import { toJS } from "mobx";
window.toJS = toJS;
import { observer } from "mobx-react-lite";
import Konva from "konva";
import { Stage, Layer, Group, Rect, Transformer } from "react-konva";
import clonedeep from "lodash.clonedeep";
import debounce from "lodash.debounce";
import difference from 'lodash.difference';
import aplus from '@/utils/log';
import useDownloadConfirm from "@/components/DownloadConfirm";
import useToast from "@/components/Toast";
import LayerElement, { BaseElement } from "./elements";
import { getElementDefinition, deserializeElement } from "./elements/define";
import PortalContainer from "./elements/portalContainer";
import { ToolType } from "./toolbar";
import { CanvasContext } from "./context/canvas";
import { isMac } from "./utils";
import compareVersion from '@/utils/compareVersion';
import { generateId, isLayerData, isInNode, getSelectedState, findElementsById, findInElements, findElementNode as _findElementNode, findElementRect, getBoundingClientRect, isTransformer, findParentElement, flattenElementsByType, cloneElement } from "./utils/node";
import { calculateTotalBounds, calViewportRect } from "./utils/calc";
import { canvasFeatures } from '@/configs/studioDefaults';
import {
  TRANSFORMER_ANCHORS,
  type TypeLayer,
  type TypeInsertMethod,
  type LocateOptions,
  type LocateQueueItem,
} from "./types.d";
import themeUtil from "./theme";
import styles from "./index.module.scss";
import { $t } from '@/i18n';

interface DownloadItem {
  type: string;
  watermarkConfirm?: boolean;
  downloadName?: string;
  downloadData?: any;
}

const EnumAction = {
  click: 'click',
  move: 'move',
  drag: 'drag',
  select: 'select',
};

const canvasVersion = canvasFeatures.currentVersion;

const safeParse = (json: string, defaultValue: any = null) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return defaultValue;
  }
};

const getDefaultRect = () => { return { x: 0, y: 0, width: 0, height: 0 } };

// 触摸板和苹果鼠标是点按滚动一体的，拖拽结束松手的一瞬间手指可能会和设备有接触摩擦造成滚动判定，会出现拖拽后界面移动的问题，设定在冷却期内不进行滚动判定
const dragCoolDownForWheel = 100;

// 鼠标状态，按下、抬起、双击
const pointerState = {
  longPressTime: 800,
  doubleClickTime: 500,
  timeList: [] as { time: number; type: string }[],
  timeoutId: -1,
  currentId: '',

  pointerDown(id) {
    if (!id || this.currentId !== id) {
      this.timeList = [];
    }

    this.currentId = id;
    this.timeList.push({
      time: Date.now(),
      type: 'pointerDown',
    });

    // 超过doubleClickTime后还没有第二次点击动作，点击判定结束，清除所有记录
    clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => {
      this.timeList = [];
      this.currentId = '';
    }, this.doubleClickTime);
  },
  pointerUp(id) {
    // 按下和抬起的id不同，或者前一次动作不是按下，清空记录并且不记录本次抬起的动作
    if (!id || this.currentId !== id || this.timeList[this.timeList.length - 1]?.type !== 'pointerDown') {
      this.timeList = [];
      return;
    }

    this.timeList.push({
      time: Date.now(),
      type: 'pointerUp',
    });
  },

  checkClickList(id) {
    // 按下和抬起的id不同，清空记录并且不记录本次抬起的动作
    if (!id || this.currentId !== id) {
      this.timeList = [];
      return [];
    }

    const list = [];
    const timeList = this.timeList || [];

    /**
     * 对所有点击进行判定
     * 1. 分别取出pointerDown -> pointerUp -> pointerDown -> pointerUp
     *   1.1. 有2组pointerDown
     *     1.1.1 .用第2个pointerUp的时间减去第一个pointerDown，如果在doubleClickTime范围内则认为是双击，移除这4个点击记录。数组不为空，继续重复第1步。
     *     1.1.2. 超过doubleClickTime认为第一组是一次单击，移除第1组点击。数组不为空，继续重复第1步。
     *   1.2. 如果只有1个pointerDown，认为是单击，等待下一次点击
     * 
     * 
     * 2. sketch、mgdone的双击判定是以第二次按下为准，减少一次抬起的动作，pointerDown -> pointerUp -> pointerDown
     */
    const chain = ['pointerDown', 'pointerUp', 'pointerDown']; // ['pointerDown', 'pointerUp', 'pointerDown', 'pointerUp']
    const pointerList = [] as { index: number; time: number; type: string }[];

    for (let i = 0; i < timeList.length && chain.length > 0; i++) {
      const p = timeList[i];

      if (p.type === chain[0]) {
        pointerList.push({
          index: i,
          ...p,
        });
        chain.shift();
      }
    }

    if (pointerList.length > 1) {
      const first = pointerList[0];
      const firstPointerUp = pointerList[1];
      const last = pointerList[pointerList.length - 1];
      const timeDiff = last.time - first.time;

      if (timeDiff <= this.doubleClickTime) {
        list.push('doubleClick');
        timeList?.splice(0, last.index);
      } else {
        list.push('single click');
        if (firstPointerUp?.type === 'pointerUp') {
          timeList?.splice(0, firstPointerUp.index);
        } else {
          timeList?.splice(0, first.index);
        }
      }

    } else if (pointerList.length === 1) {
      list.push('click');
    }

    return list;
  }
};

// 画布记忆数据格式定义
interface MemoryData {
  memoryId?: string;
  memoryState?: 'loading' | 'ready' | 'error';
  memoryData?: any;
  version?: string;
  pendingAddElements?: any[];
  historyAddElements: any[];
}

// 画布入参格式定义
export interface CanvasProps {
  width?: number;
  height?: number;
  elements?: TypeLayer[];
  rowGap?: number;
  columnGap?: number;
  scale?: number;
  maxScale?: number;
  minScale?: number;
  scaleStep?: number;
  position?: { x: number; y: number };
  activeTool?: ToolType;

  locateConfig?: {
    margin?: number | string;
    marginTop?: number | string;
    marginBottom?: number | string;
    marginRight?: number | string;
    marginLeft?: number | string;
    duration?: number;
    autoSelect?: boolean;
  };

  backgroundElement?: React.ReactNode;

  // 历史记录配置
  diffMemory?: boolean;
  memoryId?: string;
  enableHistory?: boolean;
  maxHistorySize?: number;

  // 焦点区域配置
  viewport?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  onAutoSave?: (memoryId: string, canvasData: any) => void;
  onLoadMemoryData?: (memoryId: string) => Promise<any>;

  onViewportChange?: (viewport: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onScaleChange?: (scale: number) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onElementsChange?: (elements: TypeLayer[]) => void;
  onElementSelect?: (elementId?: string[]) => void;
  onSelect?: (elementIds?: string[]) => void;
  onHistoryChange?: (canvasHistory: string[], index: number) => void;
  // 请求外部切换工具（如文本插入后切回select）
  onRequestToolChange?: (tool: ToolType) => void;
  // 待插入的元素模板（由外部传入，例如工具栏定义的文本样式）
  pendingElementTemplate?: TypeLayer;
  // 插入后由内部调用，通知外部消费并清空模板
  onConsumePendingElement?: () => void;
}

// 焦点区域接口
export interface ViewportRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface AddElementOptions {
  diffMemory?: boolean;
  memoryId?: string;
  insertMethod?: "block" | "inline";
  batchInsertMethod?: "block" | "inline";
  locateAnimation?: boolean;
  autoLocate?: boolean;
  locateOptions?: LocateOptions;
}

// 画布引用接口，暴露给外部调用的方法
export interface CanvasRef {
  locate: (
    target?: string | string[] | "selected",
    options?: LocateOptions
  ) => void;
  zoomToFit: () => void;
  stage: () => Konva.Stage | null | undefined;
  toJSON: () => string;
  fromJSON: (json: any) => void;
  getAnimateState: () => { isScaling: boolean; isTransforming: boolean };
  // 新增的内置导入导出功能
  exportCanvas: () => string | undefined;
  importCanvas: (file?: any) => Promise<any>;
  addElement: (
    newElement: TypeLayer | TypeLayer[],
    options?: AddElementOptions | string
  ) => void;
  copyElement: () => void;
  removeElement: (element: string | TypeLayer) => void;
  resetElements: (elements: TypeLayer[], recordHistory?: boolean) => void;
  // 新增的历史记录管理API
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToHistory: (elements?: TypeLayer[]) => void;
  clearHistory: () => void;
  zoomIn: (step?: number) => void;
  zoomOut: (step?: number) => void;
  zoomTo: (newScale?: number) => void;
}

// 画布序列化数据接口
export interface CanvasJSON {
  version: string;
  elements: TypeLayer[];
  viewport?: ViewportRect;
  scale: number;
  position: { x: number; y: number };
  canvas: {
    width: number;
    height: number;
  };
  /**历史记录
   * 所有添加过画布的元素，包含删除过的
   */
  history: {
    historyAddElements: TypeLayer[]
  },
  metaData: {
    createdAt: string;
    updatedAt: string;
    name?: string;
    description?: string;
  };
}

const defaults = {
  locateConfig: {
    margin: 0,
    marginTop: '22.5%',
    marginBottom: '22.5%',
    marginRight: '15%',
    marginLeft: '15%',
    duration: 300,
    autoSelect: true,
  },
}

// 选择变换器
const SelectorTransformer = forwardRef((props: any, ref: any) => {
  return (
    <Transformer
      ref={ref}
      forceUpdate={true}
      rotateEnabled={false}
      flipEnabled={false}
      borderStrokeWidth={2}
      borderStroke={themeUtil.var('--color-canvas-element-selected')}
      anchorStrokeWidth={2}
      anchorStroke={themeUtil.var('--color-canvas-element-selected')}
      enabledAnchors={TRANSFORMER_ANCHORS as any}
      {...props}
    />
  );
});

const Canvas = observer(
  forwardRef<CanvasRef, CanvasProps>(
    (
      {
        viewport,
        width,
        height,
        maxScale = 4,
        minScale = 0.01,
        scaleStep = 0.05, // 缩放步长
        rowGap = 20,
        columnGap = 20,
        locateConfig = defaults.locateConfig,
        enableHistory = true,
        diffMemory = false,
        memoryId,
        onAutoSave,
        onLoadMemoryData,
        onViewportChange,
        onScaleChange,
        onPositionChange,
        onElementsChange,
        onElementSelect,
        onSelect,
        onKeyDown,
        onKeyUp,
        onHistoryChange,
        onRequestToolChange,
        pendingElementTemplate,
        onConsumePendingElement,
      },
      ref
    ) => {
      const [menus, setMenus] = useState<any[]>([]);

      const downloadConfirm = useDownloadConfirm();
      const canvasContext = useContext(CanvasContext);

      const {
        selectedIds, setSelectedIds,
        contextMenuElementId, setContextMenuElementId,
        position, setPosition,
        scale, setScale,
        canvasHistory, setCanvasHistory,
        historyIndex, setHistoryIndex,
        activeTool,
        // 抓手模式
        isGrabbing, setIsGrabbing,
        // 正在拖动
        isDragging, setIsDragging,
        // 正在画选区
        isDrawingRect, setIsDrawingRect,
        // 正在变形
        isTransforming, setIsTransforming,
        // 正在缩放
        isScaling, setIsScaling,
        // 正在移动
        isMoving, setIsMoving,
        elementState,
      } = canvasContext;

      const quikChange =
        isGrabbing ||
        isDragging ||
        isDrawingRect ||
        isTransforming ||
        isScaling ||
        isMoving;

      const containerRef = useRef<HTMLDivElement>(null);
      const scalingTimerRef = useRef<number | null>(null);
      const movingTimerRef = useRef<number | null>(null);
      const menuRef = useRef();
      // 不需要响应的数据
      const dataRef = useRef<MemoryData>({ pendingAddElements: [], historyAddElements: [] });
      window.dataRef = dataRef;

      // 设置鼠标按下的对象，用作鼠标拖动时判断用户的行为
      const mouseDownTargetRef = useRef<{ x: number, y: number, target: any, captureTarget: any, pointerId?: number, action: string, clickedOnEmpty?: boolean }>();

      // 光标位置数据对象
      const cursorRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

      const stageRef = useRef<Konva.Stage>(null);
      const layerRef = useRef<Konva.Layer>(null);
      const dragLayerRef = useRef<Konva.Layer>(null);
      const drawLayerRef = useRef<Konva.Layer>(null);
      const transformerRef = useRef<Konva.Transformer>(null);
      const selectTransformRef = useRef<Konva.Layer>(null);
      const menuParentRef = useRef<Konva.Transformer>();

      window.transformerRef = transformerRef;

      const toast = useToast();

      // 局部状态 start

      // 拖拽结束冷却状态
      const [isDragEndCooldown, setIsDragEndCooldown] = useState(false);

      const [containerSize, setContainerSize] = useState({
        width: width || 0,
        height: height || 0,
      });

      // 挨个定位的动画队列
      // const [locateQueue, setLocateQueue] = useState<LocateQueueItem[]>([]);

      // 画选区
      const [showEventLayer, setShowEventLayer] = useState(false);
      const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, width: number, height: number }>(
        getDefaultRect()
      );

      // 复制粘贴图层的数据，不能放在剪贴板里，不需要受控
      const [copyPasteData] = useState<{ data?: any }>({ data: {} });
      // 局部状态 end

      // 获取Stage实例
      const getStage = useCallback(() => {
        (window as any).stage = stageRef.current?.getStage();
        return stageRef.current?.getStage();
      }, [stageRef.current]);

      const isSelected = useCallback((id?: string) => {
        return elementState.canSelect && id && selectedIds?.includes(id) || false;
      }, [selectedIds]);

      // 序列化画布数据
      const toJSON = useCallback(
        (_els?: TypeLayer[]): string => {
          const scale = canvasContext.scale || 1;
          const position = canvasContext.position || { x: 0, y: 0 };
          const now = new Date().getTime();

          const els = cloneElement(_els || canvasContext?.elements, true, (node: TypeLayer) => {
            delete node.loading;
          });

          const jsonData = {
            /**
             * version: 1.1.0
             * 新增 historyAddElements 字段，用于记录画布历史上通过addElement添加的所有元素
             * version: 1.1.1
             */
            version: dataRef.current.version || '',
            elements: els,
            viewport,
            scale,
            position,
            canvas: {
              width: containerSize.width,
              height: containerSize.height,
            },
            history: {
              historyAddElements: dataRef.current.historyAddElements || [],
            },
            metaData: {
              createdAt: now,
              updatedAt: now,
            },
          };

          // 首次保存画布，写入版本号；非首次数据的版本号保持不变
          if (!dataRef.current.memoryData?.metaData?.createdAt) {
            jsonData.version = canvasVersion;
            dataRef.current.version = canvasVersion;
            dataRef.current.memoryData = jsonData;
          }

          return JSON.stringify(jsonData);
        },
        [
          canvasContext,
          isSelected,
          viewport,
          scale,
          position,
          containerSize,
          dataRef,
        ]
      );

      // 把画布数据导出为json文件
      const exportCanvas = useCallback(() => {
        try {
          const jsonData = toJSON();
          const blob = new Blob([jsonData], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");

          link.href = url;
          link.download = `canvas-export-${new Date().getTime()}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          return url;
        } catch (error) {
          return;
        }
      }, [toJSON]);

      const triggerSave = useCallback(debounce((_data?: string) => {
        if (diffMemory && dataRef.current?.memoryState !== 'ready') {
          return;
        }

        onAutoSave?.(dataRef.current?.memoryId as string, _data || toJSON());
      }, 200), [diffMemory, dataRef.current, toJSON, onAutoSave]);

      const setStagePosition = useCallback((newPosition: { x: number, y: number }) => {
        setPosition(newPosition);
        triggerSave?.();
        onPositionChange?.(newPosition);
      }, [setPosition, triggerSave, onPositionChange]);

      const setStageScale = useCallback((newScale: number) => {
        setScale(newScale);
        triggerSave?.();
        onScaleChange?.(newScale);
      }, [setScale, triggerSave, onScaleChange]);

      // 添加新的历史记录点
      const addToHistory = useCallback(
        (_newElements: TypeLayer[]) => {
          if (!enableHistory) return;

          const newElements = _newElements || canvasContext.elements;
          const { canvasHistory, historyIndex } = canvasContext;
          const elementData = toJSON(newElements);

          // 移除当前位置之后的所有历史记录（当有新的操作时）
          const newHistory = canvasHistory.slice(0, historyIndex + 1);

          // 添加新的元素状态到历史记录
          newHistory.push(elementData);
          setCanvasHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
          onHistoryChange?.(newHistory, newHistory.length - 1);
          triggerSave?.(elementData);
        },
        [
          historyIndex,
          enableHistory,
          canvasContext,
          toJSON,
          triggerSave,
          onHistoryChange,
        ]
      );

      // 重设画布元素，并加入历史
      const resetElements = useCallback(
        (_newElements: TypeLayer[], recordHistory = true) => {
          const newElements = _newElements?.length > 0 ? _newElements : [];

          if (recordHistory) {
            // 添加历史记录
            addToHistory(newElements);
          }
          canvasContext.setElements(newElements);

          // 通知父组件元素已更新
          onElementsChange?.(newElements);
        },
        [canvasContext, onElementsChange, addToHistory]
      );

      /**
       * 设置选中状态
       * @param elementIds 左键单击选中的元素
       * @param contextMenuId 右键单击选中的元素
       */
      const handleElementSelect = useCallback(
        (_elementIds?: string[], _contextMenuId?: any) => {
          const newSelectedIds = _elementIds || [];
          const { selectedIds, contextMenuElementId } = canvasContext;

          if (newSelectedIds.length !== selectedIds.length || difference(selectedIds, newSelectedIds).length > 0) {

            onElementSelect?.(newSelectedIds);
            setSelectedIds(newSelectedIds);
          }

          if (_contextMenuId !== contextMenuElementId) {
            setContextMenuElementId(_contextMenuId);
          }
        },
        [canvasContext, onElementSelect]
      );

      // 把JSON数据转成画布元素
      const fromJSON = useCallback(
        (_json: any) => {
          try {
            const defaultJSON = {};
            const json =
              typeof _json === "string"
                ? safeParse(_json, defaultJSON)
                : _json || defaultJSON;
            let els = json?.elements || [];

            // 反序列化处理
            els = els.map(deserializeElement);

            // 恢复焦点区域
            json.viewport && onViewportChange?.(json.viewport);

            // 恢复缩放和位置
            json.scale && setStageScale(json.scale);

            // 恢复位置
            json.position && setStagePosition(json.position);

            // 清除选中状态
            handleElementSelect([]);

            // 设置画布历史上通过addElement添加的所有元素
            dataRef.current.version = json?.version;
            dataRef.current.historyAddElements = json?.history?.historyAddElements || [];

            // 不记录到画布历史中
            resetElements(els, false);
          } catch (error) { }
        },
        [
          canvasContext,
          onElementsChange,
          onViewportChange,
          setStageScale,
          setStagePosition,
          onElementSelect,
          addToHistory,
          resetElements,
          handleElementSelect,
        ]
      );

      // 导入画布数据
      const importCanvas = useCallback((file?: any) => {
        return new Promise((resolve) => {
          if (file === "file") {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.style.display = "none";

            input.onchange = (event) => {
              const selectedFile = (event.target as HTMLInputElement)
                .files?.[0];
              if (selectedFile) {
                // 直接处理选中的文件
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const content = e.target?.result as string;

                    fromJSON(content);
                    resolve(true);
                  } catch (error) {
                    resolve(false);
                  }
                };
                reader.onerror = () => {
                  resolve({ success: false, error: "File read error" });
                };
                reader.readAsText(selectedFile);
              } else {
                resolve({ success: false, error: "No file selected" });
              }
              // 清理DOM元素
              document.body.removeChild(input);
            };

            input.oncancel = () => {
              resolve({
                success: false,
                error: "File selection cancelled",
              });
              // 清理DOM元素
              document.body.removeChild(input);
            };

            // 添加到DOM并触发点击
            document.body.appendChild(input);
            input.click();
            return;
          }

          fromJSON(file);
          resolve(true);
        });
      }, [fromJSON]);

      /**撤销/重做操作还原画布数据
       * 画布的缩放和位置保持当前状态
       * 
       * @param index 历史记录索引
       * @returns 是否成功
       */
      const restoreCanvas = useCallback((snapshotObject) => {
        // 清除选中状态
        handleElementSelect([]);

        // 不记录到画布历史中
        resetElements(snapshotObject.elements, false);
      }, [enableHistory, canvasHistory, historyIndex, handleElementSelect, resetElements]);

      // 撤销操作
      const undo = useCallback(() => {
        const { canvasHistory, historyIndex } = canvasContext;
        if (!enableHistory || historyIndex < 0) {
          return false;
        }

        const newIndex = historyIndex - 1;
        const snapshot = canvasHistory[newIndex];

        setHistoryIndex(newIndex);
        // 恢复到上一个历史记录点的元素状态
        const snapshotObject = snapshot ? safeParse(snapshot, {}) : {};

        // 还原画布，不能把撤销操作加入历史
        restoreCanvas(snapshotObject);
        triggerSave?.(snapshot);
        onHistoryChange?.(canvasHistory, newIndex);
        return true;
      }, [
        enableHistory,
        canvasHistory,
        historyIndex,
        restoreCanvas,
        handleElementSelect,
        triggerSave,
        onHistoryChange,
      ]);

      // 重做操作
      const redo = useCallback(() => {
        const { canvasHistory, historyIndex } = canvasContext;

        if (!enableHistory || historyIndex >= canvasHistory.length - 1) {
          return false;
        }

        const newIndex = historyIndex + 1;
        const snapshot = canvasHistory[newIndex];

        setHistoryIndex(newIndex);
        // 恢复到下一个历史记录点的元素状态
        const elementsToRestore = safeParse(canvasHistory[newIndex], {});

        // 还原画布，不能把撤销操作加入历史
        restoreCanvas(elementsToRestore);
        triggerSave?.(snapshot);
        onHistoryChange?.(canvasHistory, newIndex);
        return true;
      }, [
        enableHistory,
        canvasHistory,
        historyIndex,
        restoreCanvas,
        handleElementSelect,
        triggerSave,
        onHistoryChange,
      ]);

      // 清除历史记录
      const clearHistory = useCallback(() => {
        setCanvasHistory([]);
        setHistoryIndex(-1);
        onHistoryChange?.([], -1);
      }, [onHistoryChange]);

      // 检查是否可以撤销
      const canUndo = useMemo(() => {
        return enableHistory && historyIndex >= 0 && canvasHistory.length > 0;
      }, [enableHistory, canvasHistory, historyIndex]);

      // 检查是否可以重做
      const canRedo = useMemo(() => {
        return enableHistory && historyIndex < canvasHistory.length - 1 && canvasHistory.length > 0;
      }, [enableHistory, canvasHistory, historyIndex]);

      // 删除图层
      const removeElement = useCallback(
        (_s: TypeLayer | TypeLayer[] | string | string[]) => {
          let arr = Array.isArray(_s) ? _s : [_s];
          let els = canvasContext.elements;
          let selectedIds = canvasContext.selectedIds;
          let changed = false;

          arr.forEach((s) => {
            if (typeof s === "string") {
              s = { id: s } as TypeLayer;
            }

            // 只保留不删除的元素
            els = els.filter((el) => {
              if (el.id === s.id) {
                // 标记有删除操作
                changed = true;
                return false;
              }
              return true;
            });

            // 已选中的元素被删除后，清空选中状态
            selectedIds = selectedIds.filter((id) => id !== s.id);
          });

          // 有删除操作才更新数据状态
          if (changed) {
            canvasContext.setElements(els);
            canvasContext.setSelectedIds(selectedIds);
            onElementsChange?.(els);
            addToHistory(els);
          }
        },
        [canvasContext, onElementsChange, addToHistory]
      );

      // 深度查找指定元素，返回父元素和自己的索引
      const deepGetEl = (id, els, parentId = '') => {
        for (let i = 0; i < els.length; i++) {
          const el = els[i];
          if (el.id === id) {
            return {
              source: el,
              i,
              parent: els,
              parentId,
            };
          }
          if (el.children && Array.isArray(el.children)) {
            // 递归查找子元素
            const result = deepGetEl(id, el.children, el.id);
            if (result) {
              return result;
            }
          }
        }
        // 如果在当前层级没有找到，返回 null
        return null;
      };

      /**
       * 把图层移动到指定分组
       * @param sourceId 要移动的图层id
       * @param options 配置参数
       *          options.targetId 移动到指定的图层id，为空表示在当前父元素下移动层级；-1表示移动到画布根元素上
       *          options.zIndex 指定移动后设置的层级。
       *             first，默认值，添加到指定元素的最顶上
       *             last，添加到指定元素的最底部
       *             数字，可以指定具体的数值，值如果超出兄弟节点的边界，取边界值。比如目标元素内部有5个子元素，可以插入的位置是-1到5（包含）
       *          options.point: { x: number, y: number } 指定移动到父元素内部的坐标。如果不指定，需要计算出合适的坐标来保证移动到父容器后在全局视图下位置保持不变。
       */
      const moveElement = useCallback(
        (
          sourceId: string | TypeLayer,
          options: {
            targetId?: string | number;
            zIndex?: string | number;
            point?: { x: number; y: number };
          } = {}
        ) => {
          const { targetId, zIndex = "first", point } = options;

          const els = [...canvasContext.elements];

          // 当前的元素
          let sourceEl: any = null;
          // 当前元素在父元素中的位置
          let sourceInd: number = -1;
          // 当前元素的父元素
          let parentEl: any = els;

          if (typeof sourceId === "string") {
            // 找到目标元素, 可能是分组内的子元素
            const { source, parent, i } = deepGetEl(sourceId, els);
            sourceEl = source;
            parentEl = parent;
            sourceInd = i;
          } else {
            // 新建图层移动到指定位置
            sourceEl = sourceId;
          }

          if (!sourceEl) {
            return;
          }

          // 计算新的坐标位置
          let newX = sourceEl.x || 0;
          let newY = sourceEl.y || 0;

          if (point) {
            // 如果指定了坐标，直接使用
            newX = point.x;
            newY = point.y;
          }

          // 创建更新后的元素
          const updatedElement = {
            ...sourceEl,
            x: newX,
            y: newY,
          };

          // 获取指定分组
          let targetEl: any;
          // 移动到根画布元素
          if (targetId === -1) {
            targetEl = els;
          } else if (targetId) {
            if (sourceId === targetId) {
              return;
            }
            const { source } = deepGetEl(targetId, els);
            if (!source.children) {
              return;
            }
            targetEl = source.children;
          } else {
            // targetId为空在元素的父元素下移动
            targetEl = parentEl;
          }

          // 删掉原有的
          if (sourceInd > -1) {
            parentEl.splice(sourceInd, 1);
          }

          // 添加新的
          if (zIndex === "first") {
            targetEl.push(updatedElement);
          } else if (zIndex === "last") {
            targetEl.unshift(updatedElement);
          } else if (typeof zIndex === "number") {
            let index = zIndex;
            const len = targetEl.length;
            index = Math.max(0, index);
            index = Math.min(len, index);
            targetEl.splice(index, 0, updatedElement);
          }

          // 更新画布状态
          resetElements(els);
        },
        [canvasContext, resetElements]
      );

      // 获取新图层插入位置（使用工具函数）
      const getNewPosition = useCallback(
        (
          newELement,
          method: TypeInsertMethod = "block",
          target?: string | TypeLayer
        ) => {
          let targetElement: TypeLayer | undefined;
          const stage = getStage();
          // const currentScale = 1;
          const currentScale = stage?.scaleX() || 1;
          const position = stage?.position() || { x: 0, y: 0 };
          const positionX = position.x;
          const positionY = position.y;
          const stageWidth = stage?.width() || 0;
          const stageHeight = stage?.height() || 0;
          const elements =
            canvasContext?.elements.filter((el) => el.visible !== false) || [];
          const selectedIds = canvasContext?.selectedIds || [];
          const newElementSize = {
            width: newELement.width || 0,
            height: newELement.height || 0,
          };

          // 确定目标元素
          if (typeof target === "string") {
            targetElement = elements.find((el) => el.id === target);
          } else if (target) {
            targetElement = target;
          }

          // 目标不存在，使用选中的元素作为目标
          if (!targetElement) {
            if (selectedIds.length) {
              const selectedElement = elements.find(
                (el) => selectedIds.includes(el.id as string)
              );
              if (selectedElement && selectedElement.visible !== false) {
                targetElement = selectedElement;
              }
            }
          }

          // 没有选中的元素，找页面上最底部的元素
          if (!targetElement) {
            const bottomElement = elements.sort(
              (a, b) => (b.y || 0) - (a.y || 0)
            )[0];
            if (bottomElement) {
              targetElement = bottomElement;
            }
          }


          // 如果画布上没有任何图层，返回焦点区域中心
          if (!targetElement) {
            const { centerX, centerY } = calViewportRect(
              { width: stageWidth, height: stageHeight },
              viewport
            );

            return {
              x:
                (centerX - newElementSize.width / 2) - positionX / currentScale,
              y:
                (centerY - newElementSize.height / 2) - positionY / currentScale,
            };
          }

          // 获取目标元素的边界框
          let targetBounds = calculateTotalBounds([targetElement], stage);
          /**
           * block模式：插入到目标图层下一行，左对齐
           * inline模式：插入到目标图层右边，顶对齐
           */
          const isBlock = method === "block";
          const padding = (isBlock ? rowGap : columnGap) * currentScale;

          /**
           * 1. 设定参照对象target（{ x: number, y: number }），新元素 el = { width: number, height: number }
           *
           * block插入模式：
           * 1. 设定参照对象target（{ x: number, y: number }），新元素 el = { width: number, height: number }
           * 2. 设置插入点P，x = target.x, y = target.y + target.height + 间距，right = P.x + el.width, bottom = P.y + el.height
           * 3. 遍历所有存在的元素集合E（暂时不考虑在子容器中插入新元素，只遍历根元素），找出所有与P有重叠的元素集合E1，不重叠的集合覆盖E作为下次遍历的剩余元素
           *   3.1. 集合E1为空，即插入的位置上没有别的元素，这个位置可用，返回P
           *   3.2. 集合E1不为空（即插入的位置上有别的元素），计算集合E1中所有元素的右边界，得出一个新的参照对象target2，把target2.left设置为原始target.left，用target2覆盖target对象，重复2、3步骤
           *
           *
           * inline插入模式
           * 2. 设置插入点P，x = target.x + target.width + 间距，y = target.y, right = P.x + el.width, bottom = P.y + el.height
           * 3. 遍历所有存在的元素集合E（暂时不考虑在子容器中插入新元素，只遍历根元素），找出所有与P有重叠的元素集合E1，不重叠的集合覆盖E作为下次遍历的剩余元素
           *   3.1. 集合E1为空，即插入的位置上没有别的元素，这个位置可用，返回P
           *   3.2. 集合E1不为空（即插入的位置上有别的元素），计算集合E1中所有元素的右边界，得出一个新的参照对象target2，把target2.top设置为原始target.top，用target2覆盖target对象，重复2、3步骤
           */
          let E = elements;
          let E1: TypeLayer[]; // 重叠的元素
          let E2: TypeLayer[] = []; // 不重叠的元素
          let P;

          // 循环处理与目标位置重叠的元素，找到最终插入点
          do {
            E1 = [];
            E2 = [];
            P = {
              x: isBlock
                ? targetBounds.x
                : targetBounds.x + targetBounds.width + padding,
              y: isBlock
                ? targetBounds.y + targetBounds.height + padding
                : targetBounds.y,
              width: newElementSize.width,
              height: newElementSize.height,
              right: isBlock
                ? targetBounds.x + newElementSize.width
                : targetBounds.x +
                targetBounds.width +
                padding +
                newElementSize.width,
              bottom: isBlock
                ? targetBounds.y +
                targetBounds.height +
                padding +
                newElementSize.height
                : targetBounds.y + newElementSize.height,
            };

            // 检测待插入的元素是否与已有元素重叠
            E.forEach((element) => {
              const P2 = getBoundingClientRect(stage?.findOne(`#${element.id}`)) || {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
              };
              P2.x = P2.x;
              P2.y = P2.y;

              // 判断P与elementBounds是否重叠
              if (
                P.x < P2.x + P2.width &&
                P.x + P.width > P2.x &&
                P.y < P2.y + P2.height &&
                P.y + P.height > P2.y
              ) {
                E1.push(element);
              } else {
                E2.push(element);
              }
            });

            if (E1.length === 0) {
              break;
            }

            const targetBounds2 = calculateTotalBounds(E1, stage);
            targetBounds2.x = targetBounds2.x;
            targetBounds2.y = targetBounds2.y;

            if (isBlock) {
              targetBounds2.x = targetBounds.x;
            } else {
              targetBounds2.y = targetBounds.y;
            }

            targetBounds = targetBounds2;
            E = E2;
          } while (E1.length);

          P.x = (P.x - positionX) / currentScale;
          P.y = (P.y - positionY) / currentScale;
          P.right = (P.right - positionX) / currentScale;
          P.bottom = (P.bottom - positionY) / currentScale;

          P.width = P.width / currentScale;
          P.height = P.height / currentScale;

          return P;
        },
        [
          getStage,
          canvasContext,
          viewport,
          containerSize,
          position,
          rowGap,
          columnGap,
        ]
      );

      /**
       * 添加新元素
       * @param newElement: TypeLayer | TypeLayer[] 新元素，可以是单个或者数组
       * @param insertMethod 第一个元素的插入方式
       *         'block'，垂直排列
       *         'inline'，水平排列
       *         {x: number, y: number}， 指定具体坐标排列
       *         'point': 按元素对象内部设置的坐标排列
       * @param otherInsertMethod 批量元素的插入方式，默认第一个元素使用指定的插入方式，后面的元素以钱一个元素为参照物使用inline排列
       */
      const addElement = useCallback(
        (
          _newElement: TypeLayer | TypeLayer[],
          arg1?: any
        ) => {
          // 解构arg1参数
          let _firstInsertMethod: TypeInsertMethod = "block";
          let _otherInsertMethod: TypeInsertMethod = "block";
          let locateAnimation = true;
          let autoLocate = true;
          let _memoryId = undefined;
          let forceMemory = false;

          if (typeof arg1 === 'object') {
            _firstInsertMethod = arg1.hasOwnProperty('insertMethod') ? arg1.insertMethod : _firstInsertMethod;
            _otherInsertMethod = arg1.hasOwnProperty('batchInsertMethod') ? arg1.batchInsertMethod : _otherInsertMethod;
            locateAnimation = arg1.hasOwnProperty('locateAnimation') ? arg1.locateAnimation : locateAnimation;
            autoLocate = arg1.hasOwnProperty('autoLocate') ? arg1.autoLocate : autoLocate;
            _memoryId = arg1.hasOwnProperty('memoryId') ? arg1.memoryId : _memoryId;
            // 开启了画布记忆功能，添加组件才使用是否强制校验画布记忆功能
            forceMemory = diffMemory ? (arg1.hasOwnProperty('diffMemory') ? arg1.diffMemory : forceMemory) : false;
          } else if (typeof arg1 === 'string') {
            _firstInsertMethod = arg1 as TypeInsertMethod;
          }

          const locateList: LocateQueueItem[] = [];
          let els: TypeLayer[] = [];

          /**添加到定位队列中
           * @param item: TypeLayer 要定位的元素
           * @param targetEl: TypeLayer 定位关联的目标元素
           * @param _options: LocateOptions 定位选项
           */
          const handleAddToLocateQueue = (item: TypeLayer, targetEl?: TypeLayer, _options?: LocateOptions) => {
            const o = {
              relativeElement: targetEl,
              duration: locateAnimation ? defaults.locateConfig.duration : 0,
              ..._options,
            };

            locateList.push({
              target: item,
              ...(targetEl ? {
                options: {
                  ...o,
                  // 内存中的元素虚拟一个获得边界的方法，用于定位
                  getMemoryRect(_el, scale = 1, pos = { x: 0, y: 0 }) {
                    const positionX = pos.x || 0;
                    const positionY = pos.y || 0;

                    return {
                      x: (_el.x || 0) * scale + positionX,
                      y: (_el.y || 0) * scale + positionY,
                      width: (_el.width || 0) * scale,
                      height: (_el.height || 0) * scale,
                    };
                  },
                }
              } : { options: o })
            });
          };

          /**
           * 处理新元素
           * @param newElement: TypeLayer | TypeLayer[] 新元素，可以是单个或者数组
           * @param firstInsertMethod 第一个元素的插入方式
           * @param otherInsertMethod 批量元素的插入方式，默认第一个元素使用指定的插入方式，后面的元素以钱一个元素为参照物使用inline排列
           * @param autoLocate 是否自动定位
           */
          const handleELements = (newElement: TypeLayer | TypeLayer[], firstInsertMethod: TypeInsertMethod, otherInsertMethod: TypeInsertMethod | ((el: TypeLayer, index: number) => TypeInsertMethod), autoLocate = true) => {
            const newElements = Array.isArray(newElement)
              ? newElement
              : [newElement];

            if (!newElements.length) {
              return;
            }

            let i = -1;

            newElements.forEach((item, itemIndex) => {
              // 从画布历史中判断要插入的元素是否之前插入过
              const { version, historyAddElements } = dataRef.current || {};

              if (forceMemory && (compareVersion(version, '>=', canvasFeatures.canvasMemory.version) ? [...historyAddElements, ...canvasContext.elements] : canvasContext.elements)?.some((_item) => _item.id && item.id && _item.id === item.id)) {
                /**跳过已插入过画布的元素
                 * TODO
                 * 已插入的元素再次插入，并且该元素在画布上，更新画布对应的元素
                 */
                return;
              }

              i++;

              let insertMethod = i === 0 ? firstInsertMethod : ((typeof otherInsertMethod === 'function' ? (otherInsertMethod(item, i)) : otherInsertMethod) || 'inline');
              let targetEl;

              // 一次性添加多个元素，第一个元素按照insertMethod排列，后续元素按照参照前一个元素排列
              if ('relative' === insertMethod) {
                targetEl = newElements[0];
              } else if (['block', 'inline'].includes(insertMethod as string)) {
                // inline模式以前一个元素为参照，其它模式以第一个元素为参照
                targetEl = newElements['inline' === insertMethod ? i - 1 : (i > 0 ? 0 : -1)];
              }

              if (!item.id) {
                const id = generateId();
                item.id = id;
              }

              if (!item.hasOwnProperty('draggable')) {
                item.draggable = true;
              }

              if (!item.displayName) {
                item.displayName = `${getElementDefinition(item.type)?.displayName || '未命名'}: ${item.id}`;
              }

              if (!item.icon) {
                item.icon = getElementDefinition(item.type)?.icon || '';
              }

              if (item.type === 'relativeFragments') {
                // 虚拟分组，优先定位第一个元素确定画布的位置和缩放比例，接下来添加的元素不用挨个定位，最后再定位整体
                handleELements(item.children, insertMethod, 'relative', false);
                // 定位虚拟分组的背景图层
                const bundleBackgroundIds = item.children?.map?.(_ => _.id);

                // 定位最底下图层，不自动选中
                // const bundleBackground = item.children?.[0];
                // if (bundleBackground) {
                //   handleAddToLocateQueue(bundleBackground, target, { insertMethod, autoSelect: false });
                // }

                // 定位所有虚拟分组图层
                if (bundleBackgroundIds) {
                  handleAddToLocateQueue(bundleBackgroundIds, targetEl, { insertMethod, autoLocate });
                }
                return;
              }

              els.push(item);
              addToHistory(els);

              // 添加到布局队列中
              handleAddToLocateQueue(item, targetEl, { insertMethod, autoLocate });
            });
          };

          // 执行添加动作
          const handleExecute = () => {
            handleELements(_newElement, _firstInsertMethod, _otherInsertMethod, autoLocate);

            if (locateList?.length) {
              canvasContext.addToLocateQueue(locateList);
            }
          };

          if (forceMemory) {
            if (dataRef.current.memoryId && _memoryId && dataRef.current.memoryId !== _memoryId) {
              toast.error('添加的数据和画布数据id不一致，请刷新后重试');
            } else {
              if (dataRef.current.memoryState === 'ready') {
                handleExecute();
              } else {
                // 没有memoryId或者有memoryId但是数据还在提取中，把本次添加动作放入待执行队列中，等记忆数据加载完成后自动执行

                // 从待添加的队列中查找是否已经存在本次添加的元素
                const isPending = dataRef.current.pendingAddElements?.some?.((_isInPending, _argElement) => {
                  const _pendingEls = Array.isArray(_argElement) ? _argElement : [_argElement];
                  const _els = Array.isArray(_newElement) ? _newElement : [_newElement];

                  return _pendingEls.some?.(_pendingEl => _els.some?.(_el => _el.id === _pendingEl.id));
                });

                if (!isPending) {
                  dataRef.current.pendingAddElements?.push?.([_newElement, arg1]);
                }
              }
            }
          } else {
            handleExecute();
          }
        },
        [
          diffMemory,
          canvasContext,
          dataRef.current,
          onElementsChange,
          addToHistory,
        ]
      );

      // 加载画布记忆数据
      const loadMemoryData = useCallback(async (memoryData) => {
        if (memoryData.memoryId) {
          memoryData.memoryState = 'loading';
          try {
            const res = await onLoadMemoryData?.(memoryData.memoryId);

            if (res.success) {
              memoryData.memoryState = 'ready';
              memoryData.memoryData = res.data || {
                elements: [],
              };

              memoryData.memoryData.elements = [
                ...(toJS(canvasContext.elements) || []),
                ...(memoryData.memoryData.elements || []),
              ];
              fromJSON(memoryData.memoryData);

              // 把待添加队列里的内容添加到画布
              dataRef.current.pendingAddElements?.forEach((pendingItem) => {
                const [_newElement, arg1] = pendingItem;
                const arg = typeof arg1 === 'string' ? { insertMethod: arg1 } : arg1;

                addElement(_newElement, { ...arg, diffMemory: true });
              });
              dataRef.current.pendingAddElements = [];
            } else {
              memoryData.memoryState = 'error';
            }
          } catch (e) {
            memoryData.memoryState = 'error';
          }
        }
      }, [importCanvas, addElement, onLoadMemoryData]);

      // 更新元素属性
      const updateElement = useCallback(
        (_target: any, attributes?: any) => {
          const els = toJS(canvasContext.elements);
          const targets = Array.isArray(_target) ? _target : [{ id: _target, ...attributes }];

          targets.forEach((target) => {
            const el = findInElements(els, target.id);

            if (el) {
              Object.assign(el, target);
            }
          });

          resetElements(els);

          // 画布有时细微的数据变化不更新，需要清除Layer的缓存
          // layerRef.current?.clearCache();
        },
        [canvasContext, resetElements, layerRef.current]
      );

      /**
       * 复制新图层
       * @param sourceId 要复制的图层id
       * @param options 配置参数
       *          options.targetId 移动到指定的图层id，为空表示在当前父元素下移动层级；-1表示移动到画布根元素上
       *          options.zIndex 指定移动后设置的层级。
       *             first，默认值，添加到指定元素的最顶上
       *             last，添加到指定元素的最底部
       *             数字，可以指定具体的数值，值如果超出兄弟节点的边界，取边界值。比如目标元素内部有5个子元素，可以插入的位置是-1到5（包含）
       *          options.point: { x: number, y: number } 指定移动到父元素内部的坐标。如果不指定，需要计算出合适的坐标来保证移动到父容器后在全局视图下位置保持不变。
       */
      const copyElement = useCallback(
        (
          sourceId: string,
          options: {
            targetId?: string | number;
            zIndex?: string | number;
            point?: { x: number; y: number };
          } = {}
        ) => {
          const elements = canvasContext.elements;

          // 第一步，复制出新的图层
          const targetEl = elements.find((v) => v.id === sourceId);

          const resetId = (el) => {
            const id = generateId();
            const newEl = {
              ...el,
              id,
            };

            if (!el.displayName) {
              newEl.displayName = `${getElementDefinition(el.type)?.displayName || '未命名'}: ${id}`;
            }

            if (!newEl.icon) {
              newEl.icon = getElementDefinition(newEl.type)?.icon || '';
            }

            if (Array.isArray(el.children)) {
              newEl.children = el.children.map((child: any) => resetId(child));
            }

            return newEl;
          };

          const JSTargetEl = toJS(targetEl);
          const newEl = resetId(clonedeep(JSTargetEl));

          addElement(newEl, { insertMethod: 'inline' });
        },
        [canvasContext, moveElement, addElement]
      );

      // 选中所有元素
      const selectAllElements = useCallback(() => {
        const elements = canvasContext.elements;
        const selectedIds = elements.map((el: TypeLayer) => el.id as string);
        handleElementSelect(selectedIds);
      }, [canvasContext, handleElementSelect]);

      // 获取元素相对于画布的x, y
      const getRelativePosition = (elements: TypeLayer[], elementId: string) => {
        // 递归函数：查找元素并累加坐标
        const findAndAccumulate = (
          elementList: any[],
          targetId: string,
          accumulatedX = 0,
          accumulatedY = 0
        ): { found: boolean; x: number; y: number } => {
          for (const el of elementList) {
            if (el.id === targetId) {
              // 找到目标元素，返回累加的坐标加上自身坐标
              return {
                found: true,
                x: accumulatedX + (el.x || 0),
                y: accumulatedY + (el.y || 0),
              };
            }

            // 如果有子元素，递归查找
            if (el.children && Array.isArray(el.children)) {
              const result = findAndAccumulate(
                el.children,
                targetId,
                accumulatedX + (el.x || 0),
                accumulatedY + (el.y || 0)
              );
              if (result.found) {
                return result;
              }
            }
          }

          return { found: false, x: 0, y: 0 };
        };

        const result = findAndAccumulate(elements, elementId);

        return {
          relativeX: result.x,
          relativeY: result.y,
        };
      };

      /**
       * 把多个元素合并成一个分组
       */
      const groupElements = useCallback(
        (_groupElements: TypeLayer | TypeLayer[]) => {
          const elements = [...canvasContext.elements];
          const groupElements = Array.isArray(_groupElements)
            ? _groupElements
            : [_groupElements];

          // 获取指定图层的边界坐标
          const lastElement = groupElements[groupElements.length - 1];
          const { i: lastElementIndex, parent: lastElementParent, parentId: lastElementParentId } = deepGetEl(
            lastElement.id,
            elements
          );

          // 计算出最后一个元素父节点相对画布的x, y
          const { relativeX, relativeY } = getRelativePosition(elements, lastElementParentId);

          // 创建一个新分组，把指定的元素加入进去, 每个元素x,y改为相对父节点的坐标，最后一个元素x, y不变
          const id = generateId();
          const newGroup = {
            type: "group",
            id,
            displayName: `${getElementDefinition('group')?.displayName || '未命名'}: ${id}`,
            icon: getElementDefinition('group')?.icon || '',
            children: groupElements.map((el: TypeLayer) => {
              // 计算元素相对画布的x, y
              const { relativeX: elRelativeX, relativeY: elRelativeY } = getRelativePosition(elements, el.id);

              return {
                ...el,
                x: elRelativeX - relativeX,
                y: elRelativeY - relativeY,
              };
            }),
          };

          // 把新分组插入原本最后一个图层的位置上
          lastElementParent.splice(lastElementIndex, 1, newGroup);

          // 把指定的其他从原本的父节点中删除
          groupElements.forEach((el: TypeLayer, index) => {
            const { parent, i } = deepGetEl(el.id, elements);
            if (index !== groupElements.length - 1) {
              parent.splice(i, 1);
            }
          });

          // 更新elements触发重渲染
          resetElements(elements);
        },
        [stageRef, canvasContext, resetElements]
      );

      /**
       * 解散指定的分组
       */
      const ungroupElements = useCallback(
        (_groupElements: TypeLayer | TypeLayer[]) => {
          const elements = [...canvasContext.elements];
          const groupElements = Array.isArray(_groupElements)
            ? _groupElements
            : [_groupElements];

          groupElements.forEach((el: TypeLayer) => {
            if (el.children) {
              const { parent, i, source } = deepGetEl(el.id, elements);

              if (parent) {
                parent.splice(i, 1, ...source.children.map((child: TypeLayer) => {
                  return {
                    ...child,
                    x: (child.x || 0) + (el.x || 0),
                    y: (child.y || 0) + (el.y || 0),
                  };
                }));
              }
            }
          });

          // 更新elements触发重渲染
          resetElements(elements);
        },
        [stageRef, canvasContext, resetElements]
      );

      // 根据id查找图层元素节点
      const findElementNode = useCallback((id: string | string[]) => {
        return _findElementNode(id, getStage());
      }, [getStage]);

      // 更新变换器
      const updateTransformer = useCallback((_nodes?: Konva.Node[]) => {
        if (!elementState.canSelect) {
          return;
        }

        const nodes = _nodes || transformerRef.current?.nodes();
        if (nodes) {
          transformerRef.current?.nodes([...nodes]);
        }
      }, [transformerRef.current]);

      // 动画函数，动画过程不用记录历史
      const animateToPosition = useCallback(
        (
          targetScale: number,
          targetPosition: { x: number; y: number },
          duration: number = 0
        ) => {
          const stage = getStage();
          if (!stage) return Promise.resolve(true);

          const startScale = scale;
          const startPosition = position;
          const startTime = Date.now();

          return new Promise((resolve) => {
            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 1;

              // 使用缓动函数实现平滑动画效果
              const easeProgress = 1 - Math.pow(1 - progress, 2); // easeOutCubic(progress);

              const currentScale = startScale + (targetScale - startScale) * easeProgress;
              const currentPosition = {
                x:
                  startPosition.x +
                  (targetPosition.x - startPosition.x) * easeProgress,
                y:
                  startPosition.y +
                  (targetPosition.y - startPosition.y) * easeProgress,
              };

              // 通知缩放变化
              setStageScale(currentScale);

              // 通知位置变化
              setStagePosition(currentPosition);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                resolve(true);
              }
            };

            if (duration > 0) {
              requestAnimationFrame(animate);
            } else {
              animate();
            }
          });
        },
        [getStage, scale, position, setStageScale, setStagePosition]
      );

      // 定位方法实现，定位过程不记录历史
      const locate = useCallback((target?: string | string[] | TypeLayer, options?: LocateOptions) => {
        const {
          autoSelect = defaults.locateConfig.autoSelect,
          duration = defaults.locateConfig.duration,
          margin = defaults.locateConfig.margin,
          marginTop = defaults.locateConfig.marginTop,
          marginBottom = defaults.locateConfig.marginBottom,
          marginRight = defaults.locateConfig.marginRight,
          marginLeft = defaults.locateConfig.marginLeft,
          absoluteOffsetX,
          absoluteOffsetY,
          getMemoryRect,
        } = options || {};

        const stage = getStage();
        const currentScale = stage?.scaleX() || 1;
        const position = stage?.position() || { x: 0, y: 0 };
        const stageWidth = (stage?.width() || 0);
        const stageHeight = stage?.height() || 0;
        const elements = canvasContext?.elements.filter(el => el.visible !== false) || [];
        const _maxScale = 1;

        const toLocateMargin = (size: undefined | number | string, defaultSize: number | string, stageSize: number) => {
          let s = size === undefined ? defaultSize : size;

          if (typeof s === 'string') {
            if (s.endsWith('%')) {
              s = parseFloat(s) / 100 * stageSize;
            }
            s = parseFloat(s as string);
          }

          return s;
        };
        let _marginTop = toLocateMargin(marginTop, margin, stageHeight);
        let _marginRight = toLocateMargin(marginRight, margin, stageWidth);
        let _marginBottom = toLocateMargin(marginBottom, margin, stageHeight);
        let _marginLeft = toLocateMargin(marginLeft, margin, stageWidth);

        const _absoluteOffsetX = absoluteOffsetX || 0;
        const _absoluteOffsetY = absoluteOffsetY || 0;

        return Promise.resolve().then(() => {
          let targetElements: TypeLayer[] = [];
          let newScale = currentScale;

          // 定位当前选中的所有元素
          if (!target) {
            targetElements = elements.filter(el => selectedIds.includes(el.id as string));
          } else if (typeof target === 'string') {
            const element = stage?.findOne(`#${target}`);

            if (element) {
              targetElements = [element as any];
            } else {
              const el = elements.find(el => el.id === target);
              // 如果元素存在于elements数组中，但是在画布上找不到，说明元素还没有被渲染到画布中，不处理
              if (el) {
                targetElements = [el];
              }
            }
          } else if (Array.isArray(target)) {
            targetElements = elements.filter(el =>
              el.id && target.includes(el.id) && el.visible !== false,
            );
          } else if (target) {
            targetElements = [target];
          }

          if (!target) {
            targetElements = elements.filter(el => el.visible !== false);
          }

          // 画布上没有元素，把画布还原到1倍缩放
          if (targetElements.length === 0) {
            setStageScale?.(1);
            return;
          }

          // 计算目标边界框
          const bounds = getMemoryRect ? getMemoryRect(target, currentScale, position) : calculateTotalBounds(targetElements, stage);
          if (!bounds) return Promise.reject(new Error($t("global-1688-ai-app.studio-canvas.core.myzdmbys", "没有找到目标元素")));

          // 设定元素展示为画布宽度的70%，高度为55%
          const {
            width: focusWidth,
            height: focusHeight,
            centerX,
            centerY
          } = calViewportRect({
            width: stageWidth,
            height: stageHeight,
            scale: currentScale
          }, viewport);

          const availableWidth = focusWidth - _marginLeft - _marginRight - Math.abs(_absoluteOffsetX);
          const availableHeight = focusHeight - _marginTop - _marginBottom - Math.abs(_absoluteOffsetY);

          /**
           * 宽高适配规则
           * 1. 设定宽高的最小可视值为vWidth和vHeight
           * 2. 按屏幕可视区域尺寸和元素自身尺寸计算出缩放比例 newScale
           * 3. 元素过小，newScale放大不能超过元素自身的2.5倍，太大模糊
           * 4. 元素太大，newScale缩小到屏幕能容纳的程度，但是不能低于minScale
           * 4. 缩放边界控制在minScale和maxScale之间
           */
          const vWidth = availableWidth;
          const vHeight = availableHeight;

          // 检查图层是否超出画布容器
          const layerExceedsContainer = bounds.width > availableWidth || bounds.height > availableHeight;
          const boundWidth = bounds.width / currentScale;
          const boundHeight = bounds.height / currentScale;
          const scaleX = availableWidth / boundWidth;
          const scaleY = availableHeight / boundHeight;

          if (layerExceedsContainer) {
            // 规则ii: 图层宽高任一大于画布容器，缩小画布到宽高都刚好能展示全，但不低于最小缩放下限
            newScale = Math.max(Math.min(scaleX, scaleY), minScale);
          } else {
            // 图层宽高都小于画布容器，放大画布到宽高都刚好能展示全，但不高于缩放上限
            newScale = Math.min(scaleX, scaleY, _maxScale);
          }

          // 缩放比在合理的范围，但是宽高都小于最低尺寸，使用最低尺寸和原尺寸计算出比值，比值合理就采用
          if (newScale >= minScale && newScale <= _maxScale && vWidth > boundWidth * newScale && vHeight > boundHeight * newScale) {
            // 原尺寸中宽高较大的值使用最小尺寸(原尺寸是分母，较大的值比出来的结果更小)，比例尺最大不超过maxScale
            newScale = Math.min((vWidth / boundWidth), (vHeight / boundHeight), maxScale);
          }

          // newScale = 1;

          // 计算目标的中心点（在元素坐标系中）
          const targetCenterX = (bounds.x + bounds.width / 2) / currentScale;
          const targetCenterY = (bounds.y + bounds.height / 2) / currentScale;

          const newPosition = {
            x: centerX - (targetCenterX - position.x / currentScale) * newScale + (_absoluteOffsetX + _marginLeft - _marginRight) / 2,
            y: centerY - (targetCenterY - position.y / currentScale) * newScale + (_absoluteOffsetY + _marginTop - _marginBottom) / 2
          };

          // 选中定位元素
          if (autoSelect && elementState.canSelect) {
            const _elementIds = targetElements.map(el => typeof el.id === 'function' ? (el.id as any)?.() : el.id as string);
            setSelectedIds(_elementIds);
          }

          // 执行定位
          if (duration > 0) {
            return animateToPosition(newScale, newPosition, duration);
          } else {
            // 立即设置
            setStageScale?.(newScale);
            setStagePosition(newPosition);
          }
        })
      }, [getStage, canvasContext, selectedIds, viewport, minScale, maxScale, animateToPosition, setStageScale, setStagePosition, setSelectedIds]);

      // 适配所有元素
      const zoomToFit = useCallback(() => {
        locate();
      }, [locate]);

      // 清除画布，保留历史记录、缩放、坐标
      const clear = useCallback(() => {
        canvasContext.setElements([]);
        handleElementSelect();
        setCanvasHistory([]);
        setHistoryIndex(0);
      }, [canvasContext, handleElementSelect]);

      // 缩放画布，不记录历史
      const zoomTo = useCallback(
        (newScale = 1) => {
          // 不可低于最小缩放比例，不可高于最大缩放比例
          if (newScale < minScale) {
            newScale = minScale;
          } else if (newScale > maxScale) {
            newScale = maxScale;
          }

          /**
           * 实现中心缩放
           * 1. 计算出缩放后的中心点
           * 2. 计算缩放前后2个中心点的差值
           * 3. 画布当前位置加上这个差值
           */
          const stage = getStage();
          const stageWidth = stage?.width() || 0;
          const stageHeight = stage?.height() || 0;
          const { centerX, centerY } = calViewportRect(
            { width: stageWidth, height: stageHeight },
            viewport
          );
          const newPosition = {
            x: centerX - ((centerX - position.x) / scale) * newScale,
            y: centerY - ((centerY - position.y) / scale) * newScale,
          };
          animateToPosition(newScale, newPosition);
        },
        [scale, minScale, maxScale, scaleStep, getStage, viewport, position, animateToPosition]
      );

      // 放大画布
      const zoomIn = useCallback(
        (step: number = scaleStep) => {
          zoomTo(scale + step);
        },
        [zoomTo, scale, scaleStep]
      );

      // 缩小画布
      const zoomOut = useCallback(
        (step: number = scaleStep) => {
          zoomTo(scale - step);
        },
        [zoomTo, scale, scaleStep]
      );

      // 是否正在执行过渡动画，如缩放、位移等
      const getAnimateState = useCallback(() => {
        return {
          isScaling,
          isTransforming,
        };
      }, [isScaling, isTransforming]);

      // 处理画布拖拽结束事件，拖拽和缩放画布本身都不加入历史记录
      const handleStageDragMove = useCallback(
        (e: Konva.KonvaEventObject<DragEvent>) => {
          if (!elementState.canDrag) {
            return;
          }

          // 先处理拖拽过程中的位置更新
          if (activeTool === "hand") {
            const stage = e.target.getStage();
            if (stage) {
              // 获取画布的新位置
              const newPosition = stage.position();
              // 更新位置：优先使用外部回调，否则使用内部状态
              setStagePosition(newPosition);
            }
          }
        },
        [activeTool, addToHistory]
      );

      // 处理画布拖拽结束事件，拖拽和缩放画布本身都不加入历史记录
      const handleStageDragEnd = useCallback(
        (e: Konva.KonvaEventObject<DragEvent>) => {
          if (!elementState.canDrag) {
            return;
          }

          // 先处理拖拽过程中的位置更新
          if (activeTool === "hand") {
            const stage = e.target.getStage();
            if (stage) {
              // 获取画布的新位置
              const newPosition = stage.position();
              // 更新位置：优先使用外部回调，否则使用内部状态
              setStagePosition(newPosition);
            }
          }

          // 设置拖拽结束冷却状态，100毫秒后恢复
          setIsDragEndCooldown(true);
          setTimeout(() => {
            setIsDragEndCooldown(false);
          }, dragCoolDownForWheel);
        },
        [activeTool, addToHistory]
      );

      // 处理鼠标按下事件
      const handleMouseDown = useCallback(
        (e: Konva.KonvaEventObject<PointerEvent>) => {
          const { evt, target } = e;
          const isShift = evt.shiftKey;
          const isClick = evt.button === 0; // 左键
          const isContextMenu = evt.button === 2; // 右键
          const stage = getStage()!;
          const elements = canvasContext.elements;
          const currentElement = findParentElement(target as Konva.Group);
          const isTransformerNode = isTransformer(target as Konva.Group);
          const isMultiSelect = selectedIds?.length > 1;
          let _selectedIds: any[] = [];
          let _contextMenuId: any = undefined;

          // 清空整个页面的用户鼠标选中
          window.getSelection()?.removeAllRanges();

          // 抓手模式
          if (activeTool === "hand") {
            setIsGrabbing(true);
            return;
          }

          // 形变操作：缩放、旋转、反转等形变操作后不处理
          if (isTransformerNode) {
            return;
          }

          // 文本工具：在点击位置插入文本
          if (activeTool === "text") {
            if (!elementState.canInsertText) {
              return;
            }

            const pointer = stage.getPointerPosition();
            if (pointer) {
              // 将屏幕坐标转换为画布坐标（去掉平移与缩放影响）
              const scaleFactor = stage.scaleX() || 1;
              const canvasX = (pointer.x - stage.x()) / scaleFactor;
              const canvasY = (pointer.y - stage.y()) / scaleFactor;

              // 使用外部传入的模板
              const newElement: TypeLayer = {
                ...(pendingElementTemplate || {}),
                x: canvasX,
                y: canvasY,
              } as any;

              // 直接按坐标插入
              let els: TypeLayer[] = [];
              const elWithId = { ...newElement } as TypeLayer;
              if (!elWithId.id) {
                const id = generateId();
                elWithId.id = id;
              }
              if (!elWithId.displayName) {
                elWithId.displayName = `${getElementDefinition(elWithId.type)?.displayName || '未命名'}: ${elWithId.id}`;
              }

              if (!elWithId.icon) {
                elWithId.icon = getElementDefinition(elWithId.type)?.icon || '';
              }
              els = [...elements, elWithId];
              canvasContext.setElements(els);
              onElementsChange?.(els);
              addToHistory(els);

              // 取消选择其他并选中新建元素
              handleElementSelect(elWithId.id ? [elWithId.id] : []);

              // 通知外部模板已被消费
              onConsumePendingElement?.();

              // 插入完成后请求外部将工具切回选择
              onRequestToolChange?.("select");
            }

            handleElementSelect();
          }

          const _mouseDownTarget = {
            x: evt.x,
            y: evt.y,
            target,
            captureTarget: containerRef.current,
            action: EnumAction.click,
            clickedOnEmpty: false,
          };

          if (currentElement) {
            // 点击在图层元素上
            const _elementId = currentElement.attrs.id;
            const nodeType = currentElement.attrs.type;
            const isEnabled = canvasContext.isElementEnabled(nodeType);

            if (!isEnabled) {
              return;
            }

            const targetState = getSelectedState(target as Konva.Group, selectedIds);
            // const inShadowElement = isInNode(currentElement, 'ShadowElement');

            if (isClick) {
              pointerState.pointerDown(_elementId);
            }

            const [clickType] = pointerState.checkClickList(_elementId);

            console.log('handleMouseDown', `selectedId: ${_elementId}，targetState: ${JSON.stringify(targetState.selectedState)}, clickType: ${clickType}`);

            if (0 === targetState.selectedState) {
              // 有父元素，但是所有父元素都没有被选中，点击按下后选中最外层的父元素
              const _parentId = targetState.parentNodes?.[targetState.parentNodes.length - 1]?.attrs.id;
              _selectedIds = _parentId ? [_parentId] : [];

              if (isContextMenu) {
                _contextMenuId = _parentId;
              }
            } else if ([-1, 3, 4].includes(targetState.selectedState)) {
              // 无父元素，或者自身被选中，或者同级兄弟节点被选中，点击自身可以被选中

              // 如果是右键选择，只保留自身选中
              if (isContextMenu) {
                _selectedIds = [_elementId];
                _contextMenuId = _elementId;
              } else {
                // 无父元素，或者同级兄弟节点被选中，继续保持多选状态；反之只选中当前元素
                _selectedIds = selectedIds?.includes(_elementId) ? selectedIds : [_elementId];

                /**自身已经被选中的情况下
                 * 1. 如果按下的是shift键，取消自身的选中状态
                 * 2. 如果当前是多选状态，按下后判定为拖动图层
                 */
                if (3 === targetState.selectedState) {
                  if (isShift) {
                    _selectedIds = selectedIds?.filter(id => id !== _elementId) || [];
                  } else if (_selectedIds.length > 1) {
                    _mouseDownTarget.action = EnumAction.drag;
                  }
                } else {
                }
              }
            } else if (1 === targetState.selectedState) {
              /**选择模式，保留单击选中和双击选中两种模式
               * 分支1，单击选中：直接父元素被选中，单击自身可以设置选中状态
               * 分支2，双击选中：直接父元素被选中，双击自身才可以设置选中状态
               */
              const selectMode = 1;

              // 分支1，单击选中模式
              if (selectMode === 1) {
                // 直接父元素被选中，单击可选中自身
                _selectedIds = [_elementId];

                if (isContextMenu) {
                  _contextMenuId = _selectedIds[0];
                }
              } else {
                // 分支2，双击选中模式
                // 直接父元素被选中，点击仍然保持当前选中状态
                _selectedIds = [targetState.selectedNode?.attrs.id as string];

                if (isContextMenu) {
                  _contextMenuId = _selectedIds[0];
                }

                // 直接父元素被选中，双击可选中自身
                if (clickType === 'doubleClick') {
                  _selectedIds = [_elementId];
                }
              }
            } else if (2 === targetState.selectedState) {
              // 非直接父元素被选中，点击仍然保持被选中的父元素状态
              const _parentId = targetState.selectedNode?.attrs.id;

              _selectedIds = _parentId ? [_parentId] : [];

              if (isContextMenu) {
                _contextMenuId = _parentId;
              }
            }
          } else {
            // 点在画布的空白处
            _mouseDownTarget.clickedOnEmpty = true;
            _selectedIds = [];

            // 在全局空白处右键
            if (isContextMenu) {
              _contextMenuId = -1;
            }
          }

          // 禁止选中模式下点击
          if (_mouseDownTarget.action === EnumAction.click && !elementState.canSelect) {
            return;
          }

          // 禁止拖拽模式下点击
          if (_mouseDownTarget.action === EnumAction.drag && !elementState.canDrag) {
            return;
          }

          handleElementSelect(_selectedIds, _contextMenuId);
          mouseDownTargetRef.current = isContextMenu ? undefined : _mouseDownTarget;
        },
        [selectedIds, activeTool, containerRef.current, getStage, handleElementSelect, onRequestToolChange, onConsumePendingElement]
      );

      const handleMouseMove = useCallback(
        (e: Konva.KonvaEventObject<PointerEvent>) => {
          const { evt, pointerId } = e;
          const stage = getStage();
          let action = EnumAction.move;
          const mouseDownTarget = mouseDownTargetRef.current;

          // 抓手模式鼠标点击移动不做处理，只读状态不可画选区也不可拖动元素
          if (activeTool === "hand" || !stage || !mouseDownTarget) {
            return;
          }

          // 鼠标在空白区域按下并且发生移动行为，判定为画选区行为
          if (mouseDownTarget.clickedOnEmpty || mouseDownTarget.action === EnumAction.select) {
            if (!elementState.canSelect) {
              return;
            }

            // 需要捕获鼠标对象
            if (mouseDownTarget.pointerId !== pointerId) {
              mouseDownTarget.pointerId = pointerId;
              mouseDownTarget.captureTarget?.setPointerCapture?.(pointerId);
            }

            // stage的x和y是绝对值，不受位移和缩放影响
            const width = evt.x - mouseDownTarget.x;
            const height = evt.y - mouseDownTarget.y;

            action = EnumAction.select;

            if (!showEventLayer) {
              setShowEventLayer(true);
            }

            setSelectionRect({
              x: (mouseDownTarget.x - position.x) / scale,
              y: (mouseDownTarget.y - position.y) / scale,
              width: width / scale,
              height: height / scale
            });

            if (!isDrawingRect) {
              setIsDrawingRect(true);
            }
          } else {
            // 拖拽模式
            if (!elementState.canDrag) {
              return;
            }

            action = EnumAction.drag;
            if (!isDragging) {
              setIsDragging(true);
            }
          }

          if (mouseDownTarget.action !== action) {
            mouseDownTarget.action = action;
          }
        },
        [isDrawingRect, isDragging, getStage, activeTool, mouseDownTargetRef, showEventLayer, position, scale]
      );

      // 处理鼠标抬起事件（结束抓取状态）
      const handleMouseUp = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
        // 点击动作target是认知中的实际点击的Konva元素，点击发生拖动行为后target是stage
        const { evt, target, pointerId } = e;
        const isClick = evt.button === 0; // 左键
        const isContextMenu = evt.button === 2; // 右键
        const stage = target.getStage()!;
        const drawingRect = drawLayerRef.current?.findOne('#drawing-rect')?.getClientRect() || getDefaultRect();
        let _selectedIds: string[] = selectedIds;
        const minSize = 4; // 选框的最小面积，低于这个面积忽略
        const mouseDownTarget = mouseDownTargetRef.current;

        // 没有鼠标按下的对象，不处理抬起事件。右键抬起事件不处理
        if (!mouseDownTarget) {
          return;
        }

        // 鼠标按下的对象存在，但是该对象不存在于画布的DOM中，说明点击的对象不是Stage对象，并且已经因为重绘脱离上下文了
        const isTargetInContext = mouseDownTarget?.target && mouseDownTarget.target.parent;
        let currentElement;

        if (isTargetInContext) {
          currentElement = findParentElement(target as Konva.Group);

          if (isClick) {
            pointerState.pointerUp(currentElement?.attrs.id);
          }
        }

        // 画选区模式，松手后选中区域的元素
        if (mouseDownTarget?.action === EnumAction.select && drawingRect.width * drawingRect.height >= minSize) {
          // 获取和鼠标选区相交的元素
          const elements = canvasContext.elements.filter(el => el.visible !== false && canvasContext.isElementEnabled(el.type));

          // 检查所有根元素中和选区相交的元素
          const intersectingElements: TypeLayer[] = elements.filter((el: TypeLayer) => {
            if (!el.id) {
              return false;
            }

            const elRect = getBoundingClientRect(stage?.findOne(`#${el.id}`)) || getDefaultRect();

            // return Konva.Util.haveIntersection(drawingRect, elRect);

            return elRect.x < drawingRect.x + drawingRect.width &&
              elRect.x + elRect.width > drawingRect.x &&
              elRect.y < drawingRect.y + drawingRect.height &&
              elRect.y + elRect.height > drawingRect.y;
          });

          // 提取选中元素的id
          _selectedIds = intersectingElements.map(el => el.id as string);

          // 设置选中元素
          handleElementSelect(_selectedIds);
        }

        // 释放鼠标捕获
        if (mouseDownTarget && mouseDownTarget.pointerId) {
          mouseDownTarget?.captureTarget?.releasePointerCapture?.(mouseDownTarget.pointerId);
        }
        mouseDownTargetRef.current = undefined;

        // 退出抓取状态
        if (isGrabbing) {
          setIsGrabbing(false);
        }

        // 退出拖拽状态
        if (isDragging) {
          setIsDragging(false);
        }

        // 退出画选区状态
        if (isDrawingRect) {
          setIsDrawingRect(false);
        }

        // 清空选区框
        setSelectionRect(getDefaultRect());
        // 隐藏选区图层
        setShowEventLayer(false);

        // 松手后设置冷却时间，避免触发滚动操作发生位移
        setIsDragEndCooldown(true);
        setTimeout(() => {
          setIsDragEndCooldown(false);
        }, dragCoolDownForWheel);
      }, [getStage, isGrabbing, isDragging, isDrawingRect, selectedIds, mouseDownTargetRef, selectionRect, drawLayerRef.current, canvasContext, handleElementSelect, getStage]);

      // 鼠标超出边界，对鼠标移动事件进行捕获
      const handlePoinerMoveCapture = useCallback((e: PointerEvent) => {
        if (!mouseDownTargetRef.current?.target || (mouseDownTargetRef?.current?.action === EnumAction.click && !elementState.canSelect) || (mouseDownTargetRef?.current?.action === EnumAction.drag && !elementState.canDrag)) {
          return;
        }

        handleMouseMove({ evt: e, pointerId: e.pointerId, target: getStage() } as Konva.KonvaEventObject<PointerEvent>);
      }, [mouseDownTargetRef, getStage, handleMouseMove]);

      // 鼠标超出边界，对鼠标松开事件进行捕获
      const handlePoinerUpCapture = useCallback((e: PointerEvent) => {
        if (!mouseDownTargetRef.current?.captureTarget || (mouseDownTargetRef?.current?.action === EnumAction.click && !elementState.canSelect) || (mouseDownTargetRef?.current?.action === EnumAction.drag && !elementState.canDrag)) {
          return;
        }

        handleMouseUp({ evt: e, pointerId: e.pointerId, target: getStage() } as Konva.KonvaEventObject<PointerEvent>);
      }, [mouseDownTargetRef, getStage, handleMouseUp]);

      // 处理元素拖拽结束事件
      const handleElementDragEnd = useCallback(
        (elementId: string, attributes: any = {}) => {
          if (!elementState.canDrag) {
            return;
          }

          // 设置拖拽结束冷却状态
          setIsDragEndCooldown(true);
          setTimeout(() => {
            setIsDragEndCooldown(false);

            // 更新当前元素以及所有父元素的尺寸信息
            updateElement(elementId, attributes);
          }, dragCoolDownForWheel);
        },
        [canvasContext, onElementsChange, enableHistory, addToHistory, updateElement]
      );

      // 处理鼠标滚轮缩放
      const handleWheel = useCallback(
        (e: Konva.KonvaEventObject<WheelEvent>) => {
          const { deltaX, deltaY, ctrlKey, metaKey } = e.evt;

          // 获取画布信息
          const stage = e.target?.getStage();
          const scaleFactor = stage?.scaleX() || 1;
          const stageWidth = stage?.width() || 0;
          const stageHeight = stage?.height() || 0;

          // 在拖拽结束冷却期间禁止滚轮事件，避免触摸板误触
          if (!stage || isDragEndCooldown) {
            return;
          }

          // 在触摸板上双指捏合缩放触发的是wheel事件，并且event.ctrlKey会变为true(不论windows还是mac系统)
          const isScale = ctrlKey || (isMac ? metaKey : false);

          // 缩放模式
          if (isScale) {
            // 在抓手工具抓取过程中禁止缩放，避免冲突
            if (!elementState.canScale || (activeTool === "hand" && isGrabbing)) {
              return;
            }

            // 阻止浏览器默认的滚动和缩放行为
            e.evt.preventDefault();

            // 获取鼠标在画布中的位置
            const pointer = stage.getPointerPosition();

            // 检查鼠标是否在焦点区域内，如果不在，则以焦点区域中心为缩放中心
            const isPointerInViewport =
              !!pointer &&
              pointer.x <= stageWidth &&
              pointer.y <= stageHeight;

            // 计算焦点区域中心点
            const { centerX, centerY } = calViewportRect(
              { width: stageWidth, height: stageHeight },
              viewport
            );

            let scaleCenter;
            if (isPointerInViewport) {
              // 鼠标在焦点区域内，以鼠标位置为缩放中心
              scaleCenter = {
                x: (pointer.x - stage.x()) / scaleFactor,
                y: (pointer.y - stage.y()) / scaleFactor,
              };
            } else {
              // 鼠标在焦点区域外，以焦点区域中心为缩放中心
              scaleCenter = {
                x: (centerX - stage.x()) / scaleFactor,
                y: (centerY - stage.y()) / scaleFactor,
              };
            }

            // 取deltaX和deltaY幅度大的那个方向值。负数是放大，正数是缩小
            const scaleDerection = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;

            const _scaleStep = 0.01; // 手指缩放灵敏度
            const newScale =
              scaleDerection > 0
                ? scaleFactor - _scaleStep * Math.min(1, scaleDerection)
                : scaleFactor - _scaleStep * Math.max(-1, scaleDerection);

            // 控制缩放边界
            const clampedScale = Math.max(
              minScale,
              Math.min(maxScale, newScale)
            );

            // 计算新的画布位置，保持缩放中心位置不变
            let newPos;
            if (isPointerInViewport) {
              // 以鼠标位置为中心缩放
              newPos = {
                x: pointer.x - scaleCenter.x * clampedScale,
                y: pointer.y - scaleCenter.y * clampedScale,
              };
            } else {
              // 以焦点区域中心为中心缩放
              newPos = {
                x: centerX - scaleCenter.x * clampedScale,
                y: centerY - scaleCenter.y * clampedScale,
              };
            }

            stage?.scale({ x: clampedScale, y: clampedScale });
            // 更新画布位置：优先使用外部回调，否则使用内部状态
            stage?.position(newPos);

            // 标记开始缩放（隐藏菜单），并在一段时间无新事件时恢复
            if (!isScaling) {
              setIsScaling(true);
            }
            if (scalingTimerRef.current) {
              window.clearTimeout(scalingTimerRef.current);
            }

            scalingTimerRef.current = window.setTimeout(() => {
              setIsScaling(false);

              // 更新缩放比例：优先使用外部回调，否则使用内部状态
              setStageScale(clampedScale);

              // 更新画布位置：优先使用外部回调，否则使用内部状态
              setStagePosition(newPos);
            }, 200);
          } else {
            // 移动模式
            if (!elementState.canMove) {
              return;
            }

            if (!isMoving) {
              setIsMoving(true);
            }

            // 禁用画布自身的滚动，不阻止浏览器默认的滚动行为，让画布变成普通元素走正常文档流的滚动
            e.evt.preventDefault();

            // 获取当前画布位置
            const currentPosition = stage.position();
            const moveSpeed = 1; // 基础移动速度

            // 计算新的画布位置
            const newPosition = {
              x: currentPosition.x - deltaX * moveSpeed,
              y: currentPosition.y - deltaY * moveSpeed,
            };

            stage?.position(newPosition);

            if (movingTimerRef.current) {
              window.clearTimeout(movingTimerRef.current);
            }

            movingTimerRef.current = window.setTimeout(() => {
              setIsMoving(false);
              // 更新画布位置：优先使用外部回调，否则使用内部状态
              setStagePosition(newPosition);
            }, 200);
          }
        },
        [
          activeTool,
          isGrabbing,
          isDragEndCooldown,
          viewport,
          getStage,
          setStageScale,
          isScaling,
        ]
      );

      // 点击菜单事件
      const handleMenuClick = async (args: { key: string }, ...oo) => {
        const { key } = args;
        const menuItem = menus.find(menu => menu.key === key);
        const ids = toJS(selectedIds);

        // 打点
        if (menuItem?.logmap?.logKey) {
          aplus.record(menuItem?.logmap?.logKey, "CLK");
        }

        switch (key) {
          case "copy":
            ids?.forEach(id => {
              canvasContext?.copyElement(id);
            });
            return;
          case "delete":
            canvasContext?.removeElement(ids);
            return;
          case "levelUpAll":
            ids?.forEach(id => {
              canvasContext?.moveElement(id, { zIndex: "first" });
            });
            return;
          case "levelDownAll":
            ids?.forEach(id => {
              canvasContext?.moveElement(id, { zIndex: "last" });
            });
            return;
          case "download":
            const downloadContents = {
              downloadList: [] as DownloadItem[],
              aiImgageUrlList: [] as any,
              userImageUrlList: [] as any,
              videoUrlList: [] as any,
              productModelList: [] as any,
              watermarkConfirm: false, // 是否可选水印选项
            };

            const downloadRefs = ids?.map?.(id => {
              const _ref = canvasContext?.getRef?.(id);
              const {
                type,
                watermark,
                downloadData,
              } = _ref?.getData?.() || {};

              if (_ref && downloadData) {
                const downloadItem: DownloadItem = {
                  type,
                  watermarkConfirm: false,
                  downloadName: "",
                  downloadData,
                };

                downloadContents.downloadList.push(downloadItem);

                if (type === "image") {
                  if (watermark) {
                    downloadContents.aiImgageUrlList.push(downloadData);
                    downloadContents.watermarkConfirm = true;
                    downloadItem.watermarkConfirm = true;
                  } else {
                    downloadContents.userImageUrlList.push(downloadData);
                  }
                } else if (type === "video") {
                  downloadContents.videoUrlList.push(downloadData);
                  // AI视频强制水印无法去掉，不需要设置水印选项
                } else if (type === "offer") {
                  downloadContents.productModelList.push(downloadData);
                }

                return _ref;
              }
            }).filter(Boolean);

            // 批量下载
            const hasDownloadContent = downloadContents.downloadList?.length > 0;

            if (hasDownloadContent) {
              try {
                // 执行下载确认流程
                await downloadConfirm.confirm({
                  downloadContents,
                  onDownloadStart() {
                    // 开启所有图层的loading
                    downloadRefs?.forEach?.(_ref => {
                      _ref?.loading?.(true);
                    });
                  },
                  onDownloadComplete() {
                    // 关闭所有图层的loading
                    downloadRefs?.forEach?.(_ref => {
                      _ref?.loading?.(false);
                    });
                  }
                });
              } catch (e) { }
            }

            return;
        }

        canvasContext.getRef(selectedIds[0] as string)?.onMenuClick?.(args, ids);
      };

      // 暴露方法给父组件
      useImperativeHandle(
        ref,
        (): any => {
          const exportRef = {
            get elements() {
              return canvasContext.elements;
            },
            selectedIds,
            isGrabbing,
            isDragging,
            isDrawingRect,
            locate,
            zoomToFit,
            get stage() {
              return getStage() as any;
            },
            addElement,
            updateElement,
            selectAllElements,
            copyElement,
            moveElement,
            removeElement,
            resetElements,
            clear,
            toJSON,
            fromJSON,
            getAnimateState,
            groupElements,
            ungroupElements,
            findElementNode,
            findInElements,
            findElementsById,
            flattenElementsByType,
            undo,
            redo,
            get canUndo() {
              return enableHistory && historyIndex >= 0 && canvasHistory.length > 0;
            },
            canRedo,
            addToHistory,
            clearHistory,
            canvasHistory,
            historyIndex,
            zoomIn,
            zoomOut,
            zoomTo,
            exportCanvas,
            importCanvas,

            updateTransformer,
            handleElementSelect,
            handleElementDragEnd,
          };

          return exportRef;
        },
        [
          canvasContext,
          selectedIds,
          isGrabbing,
          isDragging,
          isDrawingRect,
          locate,
          zoomToFit,
          getStage,
          addElement,
          updateElement,
          selectAllElements,
          copyElement,
          moveElement,
          removeElement,
          resetElements,
          clear,
          toJSON,
          fromJSON,
          getAnimateState,
          groupElements,
          ungroupElements,
          findElementNode,
          findInElements,
          findElementsById,
          flattenElementsByType,
          undo,
          redo,
          canUndo,
          canRedo,
          enableHistory,
          addToHistory,
          clearHistory,
          canvasHistory,
          historyIndex,
          zoomIn,
          zoomOut,
          zoomTo,
          exportCanvas,
          importCanvas,

          updateTransformer,
          handleElementSelect,
          handleElementDragEnd,
        ]
      );

      // 监听memoryId的变化
      useEffect(() => {
        if (dataRef.current.memoryId !== memoryId) {
          // sessionId没生成前可能临时存储了画布元素，这里要保留不清空
          dataRef.current.pendingAddElements = dataRef.current.memoryId ? [] : dataRef.current.pendingAddElements || [];
          dataRef.current.memoryId = memoryId;
          dataRef.current.version = '';
          dataRef.current.memoryState = 'loading';
          dataRef.current.memoryData = null;
          dataRef.current.historyAddElements = [];
          loadMemoryData(dataRef.current);
        }
      }, [memoryId, dataRef.current]);

      // 监听键盘事件
      useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          // 处理删除键删除选中元素
          // Windows: Delete键, Mac: Backspace键
          // 如果是有焦点的对象触发它自身的删除行为(输入框、可编辑元素)，画布监听的全局删除则不处理
          const target = event.target as HTMLElement;

          // 当前对象是可输入对象，不处理键盘快捷键
          if (
            ['input', 'textarea'].includes(target?.tagName.toLowerCase()) ||
            ['', 'true'].includes(target?.getAttribute('contenteditable')!)
          ) {
            return;
          }

          const isCtrl = event.ctrlKey;
          const isCmd = event.metaKey;
          const isAltOrOption = event.altKey;
          const isShift = event.shiftKey;
          const isCtrlOrCmd = isMac ? isCmd && !isCtrl : isCtrl && !isCmd;

          if (elementState.canShortcut) {
            if (event.key === "Delete" || event.key === "Backspace") {
              event.preventDefault(); // 阻止默认行为
              event.stopPropagation();
              removeElement(selectedIds);
            }

            // ctrl+c / cmd+c - 复制图层
            else if (event.code === "KeyC" && isCtrlOrCmd && !isShift && !isAltOrOption) {
              const emptySelection = !getSelection?.()?.getRangeAt?.(0)?.cloneContents()?.children?.length;

              if (emptySelection) {
                return;
              }

              if (selectedIds.length > 0) {
                event.preventDefault();
                // 把复制的图层数据存入剪贴板
                const selectedElements = findElementsById(canvasContext.elements, selectedIds);
                const copyData = JSON.parse(JSON.stringify(selectedElements));

                copyPasteData.data = {
                  from: 'studio-canvas',
                  type: 'copy',
                  data: copyData,
                };
              } else {
                delete copyPasteData.data;
              }
            }

            // ctrl+v / cmd+v - 粘贴图层
            else if (event.code === "KeyV" && isCtrlOrCmd && !isShift && !isAltOrOption) {
              // 获取鼠标的坐标
              event.preventDefault();
              // 从剪贴板中读取数据
              const clipboardData = copyPasteData?.data;

              if (clipboardData) {
                try {
                  if (clipboardData.from === 'studio-canvas' && clipboardData.type === 'copy' && clipboardData.data) {
                    const copyData = clipboardData.data;
                    const { x = 0, y = 0 } = copyData[0] || {};

                    const newCopyData = cloneElement(copyData, true, (element: TypeLayer, depth) => {
                      element.id = '';
                      delete element.loading;

                      if (depth === 0) {
                        element.x = (element.x || 0) - x;
                        element.y = (element.y || 0) - y;
                      }
                    });

                    addElement({
                      type: 'relativeFragments',
                      children: newCopyData,
                    } as TypeLayer);
                  }
                } catch (error) { }
              };
            }

            // ctrl+Z / cmd+Z - 撤销
            else if (event.code === "KeyZ" && isCtrlOrCmd && !isShift && !isAltOrOption) {
              event.preventDefault();
              // 调用Canvas的undo方法
              undo();
            }

            // ctrl+shift+Z / ctrl+y / cmd+shift+Z / cmd+y - 重做
            else if ((event.code === "KeyZ" && isCtrlOrCmd && isShift && !isAltOrOption) || (event.code === "KeyY" && isCtrlOrCmd && !isShift && !isAltOrOption)) {
              event.preventDefault();
              // 调用Canvas的redo方法
              redo();
            }

            // ctrl+a / cmd+a - 全选
            else if (event.code === "KeyA" && isCtrlOrCmd && !isShift && !isAltOrOption) {
              event.preventDefault();
              selectAllElements();
            }

            // ctrl++ / cmd++ - 放大
            else if ((event.code === "Equal" || event.code === "NumpadAdd") && isCtrlOrCmd) {
              event.preventDefault();
              zoomIn();
            }

            // ctrl+- / cmd+- - 缩小
            else if (
              (event.code === "Minus" || event.code === "NumpadSubtract") && isCtrlOrCmd
            ) {
              event.preventDefault();
              zoomOut();
            }

            // ctrl+0 / cmd+0 - 适应画布
            else if (
              (event.code === "Digit0" || event.code === "Numpad0") && isCtrlOrCmd
            ) {
              event.preventDefault();
              zoomToFit();
            }
          }

          // 处理其他键盘事件
          onKeyDown?.(event);
        };

        const handleKeyUp = (event: KeyboardEvent) => {
          onKeyUp?.(event);
        };

        // 监听全局键盘事件
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
          document.removeEventListener("keydown", handleKeyDown);
          document.removeEventListener("keyup", handleKeyUp);
        };
      }, [selectedIds, undo, redo, zoomIn, zoomOut, zoomToFit, onKeyDown, onKeyUp, addElement, removeElement, findElementsById, selectAllElements]);

      // 添加元素挨个定位的动画队列
      const isLocatingRef = useRef(false);
      useEffect(() => {
        const queue = canvasContext.locateQueue;
        const element = queue[0];

        if (queue.length === 0 || isLocatingRef.current || !element?.target) {
          return;
        }

        const locateOptions = element.options || {} as LocateOptions;
        const { insertMethod = 'block', relativeElement, autoLocate } = locateOptions;
        const item = element.target as TypeLayer;
        // const targetElements = (Array.isArray(element.target) ? element.target : [element.target]) as TypeLayer[];

        isLocatingRef.current = true;

        // targetElements.forEach((item) => {
        // 计算当前元素的位置
        let _position = { x: item.x || 0, y: item.y || 0 };
        const targetEl = relativeElement ? {
          ...relativeElement,
          insertMethod,
          getMemoryRect(_el, scale = 1, pos = { x: 0, y: 0 }) {
            const positionX = (pos.x || 0);
            const positionY = pos.y || 0;

            return {
              x: (_el.x || 0) * scale + positionX,
              y: (_el.y || 0) * scale + positionY,
              width: (_el.width || 0) * scale,
              height: (_el.height || 0) * scale,
            };
          }
        } : undefined;

        // 一次性添加多个元素，第一个元素按照insertMethod排列，后续元素按照参照前一个元素排列
        if (['block', 'inline', 'relative'].includes(insertMethod as string)) {
          // inline模式以前一个元素为参照，其它模式以第一个元素为参照
          if ('relative' === insertMethod && targetEl) {
            // 指定一个元素作为相对元素，自身坐标和相对元素进行叠加，类似子容器在父容器中relative的定位关系
            const stage = getStage();
            const relativeElementPosition = stage?.findOne?.(`#${targetEl.id}`)?.position() || { x: 0, y: 0 };

            _position.x = (relativeElementPosition.x || 0) + (item.x || 0);
            _position.y = (relativeElementPosition.y || 0) + (item.y || 0);
          } else {
            _position = getNewPosition(item, insertMethod, targetEl);
          }
        } else if ((insertMethod as any)?.hasOwnProperty('x') && (insertMethod as any)?.hasOwnProperty('y')) {
          _position.x = (insertMethod as any)?.x || 0;
          _position.y = (insertMethod as any)?.y || 0;
        }

        item.x = _position.x;
        item.y = _position.y;

        const els = [...canvasContext.elements];

        if (isLayerData(item)) {
          els.push(item);
        }

        canvasContext.setElements(els);
        onElementsChange?.(els);

        const historyAddElements = dataRef.current.historyAddElements || [];
        if (historyAddElements.every(_item => _item.id !== item.id)) {
          dataRef.current.historyAddElements = [...historyAddElements, { id: item.id }];
        }

        if (autoLocate) {
          setTimeout(() => {
            locate(item, locateOptions).finally(() => {
              canvasContext.shiftLocateQueue();
              isLocatingRef.current = false;
            });
          }, 10);
        } else {
          canvasContext.shiftLocateQueue();
          isLocatingRef.current = false;
        }
        // });

      }, [canvasContext.locateQueue.length, getStage, getNewPosition]);

      // 选中框
      useEffect(() => {
        if (!elementState.canSelect) {
          return;
        }
        const stage = getStage();
        const types: string[] = [];

        // 检查选中的元素是否可见
        const els = selectedIds.map((sId) => {
          const elDOM = stage?.findOne(`#${sId}`);
          if (elDOM) {
            const sType = elDOM.attrs.type;
            if (!types.includes(sType)) {
              types.push(sType);
            }
            return findElementRect(elDOM as Konva.Group);
          }
        }).filter(el => !!el);

        // 如果有选中的元素且元素可见且不在抓取状态下，显示变换框
        if (
          els.length &&
          transformerRef.current &&
          !(activeTool === "hand" && isGrabbing)
        ) {
          const transformer = transformerRef.current;
          // 将选中的元素绑定到变换框
          transformer.nodes(els);

          menuParentRef.current = transformer;

          // 获取选中元素的类型，出对应菜单
          if (els.length && types.length === 1) {
            const definition = getElementDefinition(types[0]);
            // 图层菜单
            const _menus: any[] = definition?.getMenu?.(els?.length > 0) || [];
            // 基础菜单
            const _baseElementMenus: any[] = BaseElement?.getMenu?.(els?.length > 0) || []
            // 图层菜单和基础菜单之间增加分割线
            if (_menus.length && _baseElementMenus.length) {
              _menus.push({
                type: 'divider',
              });
            }

            const layerMenus = [
              ..._menus,
              ..._baseElementMenus,
            ];

            setMenus(() => {
              layerMenus.forEach((menu) => {
                if (menu?.logmap?.logKey) {
                  aplus.record(menu?.logmap?.logKey, "EXP");
                }
              });

              return layerMenus;
            });
          } else {
            setMenus([]);
          }
        } else if (transformerRef.current) {
          // 没有选中元素、元素不可见或在抓取状态下，清空变换框
          transformerRef.current.nodes([]);
          setMenus([]);
        }
      }, [selectedIds, getStage, activeTool, isGrabbing, canvasContext]);

      // 切换到文本工具时，清空当前选中
      useEffect(() => {
        if (activeTool === "text" && selectedIds.length) {
          handleElementSelect();
        }
      }, [activeTool, handleElementSelect, selectedIds]);

      // 捕获超出画布的鼠标移动事件
      useEffect(() => {
        document.addEventListener?.("pointermove", handlePoinerMoveCapture);
        document.addEventListener?.("pointerup", handlePoinerUpCapture);

        return () => {
          document.removeEventListener?.("pointermove", handlePoinerMoveCapture);
          document.removeEventListener?.("pointerup", handlePoinerUpCapture);
        };
      }, [handlePoinerMoveCapture, handlePoinerUpCapture]);

      // 监听容器大小变化
      useEffect(() => {
        if (!containerRef.current) {
          return;
        }

        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            setContainerSize(entry.contentRect);
          }
        });

        resizeObserver.observe(containerRef.current);

        // 初始设置
        const rect = containerRef.current.getBoundingClientRect();

        setContainerSize(rect);

        return () => {
          resizeObserver.disconnect();

          if (scalingTimerRef.current) {
            window.clearTimeout(scalingTimerRef.current);
            scalingTimerRef.current = null;
          }
        };
      }, []);

      // 渲染元素
      const renderElement = (elProps: TypeLayer) => {
        if (!elProps.id) {
          const id = generateId();
          elProps.id = id;
        }

        if (!elProps.displayName) {
          elProps.displayName = `${getElementDefinition(elProps.type)?.displayName || '未命名'}: ${elProps.id}`;
        }

        if (!elProps.icon) {
          elProps.icon = getElementDefinition(elProps.type)?.icon || '';
        }

        return <LayerElement key={elProps.id} {...elProps} />;
      };

      return (
        <div
          ref={containerRef}
          className={`${styles.canvas} ${activeTool === "hand"
            ? isGrabbing
              ? styles["grabbing-tool"]
              : styles["hand-tool"]
            : activeTool === "text"
              ? styles["text-tool"]
              : styles["select-tool"]
            }`}
          onContextMenu={(e) => {
            e.preventDefault();
          }}
          onPointerMove={(e) => {
            cursorRef.current = {
              x: e.clientX,
              y: e.clientY,
            };
          }}
        >
          {/* 画布内容层 - Konva Stage 容器 */}
          <Stage
            ref={stageRef}
            className={`${styles.stage}`}
            width={containerSize.width}
            height={containerSize.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable={activeTool === "hand"}
            onDragMove={handleStageDragMove}
            onDragEnd={handleStageDragEnd}
            onWheel={handleWheel}
            onPointerDown={handleMouseDown}
            onPointerMove={handleMouseMove}
            onPointerUp={handleMouseUp}
          >
            <Layer id="mainLayer" ref={layerRef}>
              {/* 画布元素 */}
              {canvasContext.elements.map(renderElement)}
            </Layer>

            <Layer id="dragLayer" ref={dragLayerRef}>
              {/* 拖拽层 */}

              {/* 
              <Group
                id="g1"
                x={700}
                y={100}
                clipHeight={200}
              >
                <Rect id="r1" width={200} height={300} fill="red" />
              </Group>
              <Group
                id="g2"
                x={700}
                y={100}
              >
                <Rect id="r2" width={200} height={300} fill="blue" />
              </Group>
             */}
            </Layer>

            {/* 选中层 - 可形变 */}
            <Layer id="transformLayer">
              {/* 变换器 */}
              {!canvasContext.isEditing && (
                <SelectorTransformer
                  id="transformer"
                  ref={transformerRef}
                  onTransformStart={(e) => {
                    setIsTransforming(true);
                  }}
                  onTransformEnd={(e) => {
                    setIsTransforming(false);
                    const elements = toJS(canvasContext.elements);
                    canvasContext.resetElements(elements);
                  }}
                  onTransform={(e) => {
                    // 缩放、旋转、反转等形变操作后更新组件数据，并记录历史
                    let attrs = e.target.attrs;

                    if (attrs.customType === 'BaseElementRect') {
                      const rectAttrs = attrs;
                      const baseElement = e.target.parent?.children?.find((el) => el.attrs.customType === 'BaseElement')
                      attrs = baseElement?.attrs;

                      baseElement?.position({ x: (rectAttrs.x || 1), y: (rectAttrs.y || 1) });
                      baseElement?.scale({ x: (rectAttrs.scaleX || 1), y: (rectAttrs.scaleY || 1) });
                      baseElement?.rotation((rectAttrs.rotation || 0));
                      baseElement?.skew({ x: (rectAttrs.skewX || 0), y: (rectAttrs.skewY || 0) });
                    }

                    const elements = toJS(canvasContext.elements);
                    const el = findInElements(elements, attrs.id);

                    if (el) {
                      Object.assign(el, attrs);
                    }
                    canvasContext.resetElements(elements, false);
                  }}
                />
              )}
            </Layer>

            {/* 选中层 - 不可形变，仅选中 */}
            {/* <Layer id="selectedLayer">
              {!canvasContext.isEditing && (
                <SelectorTransformer
                  id="transformer"
                  ref={selectTransformRef}
                />
              )}
            </Layer> */}

            {/* 菜单层 */}
            <Layer id="menuLayer">
              <PortalContainer
                className="studio-element-menu"
                ref={menuRef}
                parentRef={menuParentRef}
                open={(!quikChange && selectedIds?.length > 0 && menus?.length > 0)}
                transformFunc={(points) => {
                  return {
                    left: (points.rt.x + 10) + 'px',
                    top: (points.rt.y) + 'px',
                  };
                }}
              >
                <Menu
                  selectable={false}
                  onClick={handleMenuClick}
                  items={menus}
                />
              </PortalContainer>
            </Layer>

            {/* 
                画选区时出现在最上层避免鼠标动作碰到渲染层的元素被中断，平时不可见
                Layer要一直铺满整个画布，当stage的position变化时，Layer的position要同步变化延长画布的区域
             */}
            {
              showEventLayer && (
                <Layer
                  id="drawLayer"
                  ref={drawLayerRef}
                  x={position.x > 0 ? -position.x / scale : 0}
                  y={position.y > 0 ? -position.y / scale : 0}
                >
                  {/* 
                      Layer无法自动撑开，用Rect作为占位元素撑开Layer
                      stage的移动和缩放会扩大画布，占位元素的尺寸要一起变化扩充整个画布，保证鼠标操作不会偏离占位元素
                   */}
                  <Rect
                    id="drawing-area"
                    width={(containerSize.width - (position.x > 0 ? -position.x : position.x)) / scale}
                    height={(containerSize.height - (position.y > 0 ? -position.y : position.y)) / scale}
                  // fill="rgba(255, 0, 0, 0.3)"
                  />

                  {/* 绘制选区 */}
                  <Rect
                    id="drawing-rect"
                    x={selectionRect.x - (position.x > 0 ? -position.x / scale : 0)}
                    y={selectionRect.y - (position.y > 0 ? -position.y / scale : 0)}
                    width={selectionRect.width}
                    height={selectionRect.height}
                    fill={themeUtil.var('--color-canvas-element-drawing-rect')}
                    stroke={themeUtil.var('--color-canvas-element-drawing-border')}
                    strokeWidth={scale > 1 ? 1 : (1 / scale || 1)}
                  />
                </Layer>
              )
            }
          </Stage>
        </div>
      );
    }
  )
);

Canvas.displayName = "Canvas";

export default Canvas;
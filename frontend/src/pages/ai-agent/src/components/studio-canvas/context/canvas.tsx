import { createContext } from "react";
import { makeAutoObservable, toJS, observable } from "mobx";
import Konva from 'konva';
import getElementTaskResult from "@/services/studio/getElementTaskResult";
import { TypeLayer, LocateQueueItem } from '../types.d';

interface TypeProcessingTask {
  id: string;
  type: string;
  callback?: (result: any) => any;
}

export interface TypeCanvasContext {
  canvasRef: any;

  locateQueue: LocateQueueItem[];

  selectedIds: string[];
  contextMenuElementId?: string;
  position: { x: number, y: number };
  scale: number;
  canvasHistory: string[];
  historyIndex: number;
  activeTool: string;
  isEditing: boolean;
  isGrabbing: boolean;
  isDragging: boolean;
  isDrawingRect: boolean;
  isTransforming: boolean;
  isScaling: boolean;
  isMoving: boolean;

  elementState: {
    canHover: boolean;
    canClick: boolean;
    canClickMenu: boolean;
    canContextMenu: boolean;
    canSelect: boolean;
    canDrag: boolean;
    canInsertText: boolean;
    canMove: boolean;
    canGrab: boolean;
    canScale: boolean;
    canShortcut: boolean;
    showToolbar: boolean;
    showLayerPanel: boolean;
  };

  get canvas(): any;
  get stage(): any;
  get layer(): any;
  get dragLayer(): any;
  get transformLayer(): any;
  get drawLayer(): any;
  get transformer(): any;
  get elements(): TypeLayer[];
  get canUndo(): boolean;
  get canRedo(): boolean;

  setSelectedIds: (selectedIds?: string[]) => void;
  resetCanvas: () => void;
  setContextMenuElementId: (contextMenuElementId?: string) => void;
  setContextMenuPoint: (contextMenuPoint: { x: number, y: number }) => void;
  setElements: (elements: TypeLayer[]) => void;
  
  setPosition: (position: { x: number, y: number }) => void;
  setScale: (scale: number) => void;
  setCanvasHistory: (canvasHistory: string[]) => void;
  setHistoryIndex: (historyIndex: number) => void;
  setActiveTool: (activeTool: string) => void;
  setIsEditing: (editStatus: boolean) => void;
  setIsGrabbing: (isGrabbing: boolean) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsDrawingRect: (isDrawingRect: boolean) => void;
  setIsTransforming: (isTransforming: boolean) => void;
  setIsScaling: (isScaling: boolean) => void;
  setIsMoving: (isMoving: boolean) => void;

  locate: (...args: any) => void;
  addElement: (...args: any[]) => void;
  updateElement: (elementId: any, attributes?: any) => void;
  copyElement: (sourceId: string, options?: { targetId?: string | number, zIndex?: string | number, point?: { x: number, y: number } }) => void,
  removeElement: (id: TypeLayer | TypeLayer[] | string | string[]) => void,
  moveElement: (sourceId: string, options?: { targetId?: string | number, zIndex?: string | number, point?: { x: number, y: number } }) => void,
  resetElements: (elements: TypeLayer[], recordHistory?: boolean) => void,
  selectAllElements: () => void,
  groupElements: (elements: TypeLayer[]) => void,
  ungroupElements: (elements: TypeLayer[]) => void,
  updateTransformer: (nodes?: Konva.Node[]) => void,
  findElementNode: (id: string | string[]) => any;
  findInElements: (id: string) => any;
  findElementsById: (elements: TypeLayer[], id: string | string[]) => any;
  flattenElementsByType: (elements: TypeLayer[], includeTypes?: string[]) => any;
  flattenSelectedElementsByType: () => any;

  undo: () => boolean;
  redo: () => boolean;
  addToHistory: (elements?: TypeLayer[]) => void;
  clearHistory: () => void;
  zoomIn: (step?: number) => void;
  zoomOut: (step?: number) => void;
  zoomTo: (newScale?: number) => void;
  zoomToFit: () => void;
  getAnimateState: () => { isScaling: boolean; isTransforming: boolean };
  toJSON: () => string;
  fromJSON: (json: any) => void;
  importCanvas: (...args: any) => void;
  exportCanvas: (...args: any) => void;

  handleElementSelect: (elementId: string | null) => void;
  handleElementDragEnd: (elementId: string, attributes: any) => void;

  setCanvasRef: (canvasRef: any) => void;
  setRef: (id: string, ref: any) => void;
  getRef: (id: string) => any;
  setState: (state: any) => void;
  setEnableElements: (enableElements: string[]) => void;
  setDisableElements: (disableElements: string[]) => void;
  isElementEnabled: (type?: string) => boolean;

  addToLocateQueue: (items: LocateQueueItem[]) => void;
  shiftLocateQueue: () => LocateQueueItem | undefined;

  // 添加一个正在处理中的素材任务，如图片高清、图片去水印、抠图、翻译等
  addProcessingTask: (task: TypeProcessingTask) => void;
  removeProcessingTask: (id: string) => void;
  getProcessingTaskResult: (id: string) => any | undefined;
  tasksTick: () => void;
}

export class CanvasStore {
  _elements: TypeLayer[] = [];
  canvasRef;

  selectedIds: string[] = [];
  contextMenuElementId?: string;
  contextMenuPoint: { x: number, y: number } = { x: 0, y: 0 };
  position: { x: number, y: number } = { x: 0, y: 0 };
  scale = 1;
  canvasHistory: string[] = [];
  historyIndex = -1;
  activeTool = 'select';
  isEditing = false;
  isGrabbing = false;
  isDragging = false;
  isDrawingRect = false;
  isTransforming = false;
  isScaling = false;
  isMoving = false;

  elementState = {
    canHover: true,
    canClick: true,
    canClickMenu: true,
    canContextMenu: true,
    canSelect: true,
    canDrag: true,
    canInsertText: true,
    canMove: true,
    canGrab: true,
    canScale: true,
    canShortcut: true,
    showToolbar: true,
    showLayerPanel: true,
  };

  enableElements: string[] = [];
  disableElements: string[] = [];

  locateQueue: LocateQueueItem[] = [];

  _refs: {} = {};
  _processingTimeoutId?: number;
  _processingTasks: TypeProcessingTask[] = [];

  get elements() {
    return this._elements || [];
  }

  get canvas() {
    return this.canvasRef?.current;
  }

  get stage() {
    return this.canvas?.stage;
  }

  get layer() {
    return this.stage?.findOne('#mainLayer');
  }

  get dragLayer() {
    return this.stage?.findOne('#dragLayer');
  }

  get drawLayer() {
    return this.stage?.findOne('#drawLayer');
  }

  get transformLayer() {
    return this.stage?.findOne('#transformLayer');
  }

  get transformer() {
    return this.stage?.findOne('#transformer');
  }

  get canUndo() {
    return this.historyIndex >= 0 && this.canvasHistory.length > 0;
  }

  get canRedo() {
    return this.historyIndex < this.canvasHistory.length - 1 && this.canvasHistory.length > 0;
  }

  constructor() {
    makeAutoObservable(this, {
      // 排除不需要观察的成员变量和方法
      _refs: false, // 图层元素存储的自身对象不需要实时监听
      _processingTimeoutId: false,
      _processingTasks: false, // 正在处理中的素材任务不需要实时监听
      // _elements 已经在上面手动创建为浅观察数组，这里排除自动观察，避免重复处理
      // _elements: false,
    });
  }

  setCanvasRef = (canvasRef: any) => {
    this.canvasRef = canvasRef;
  }

  setSelectedIds = (selectedIds: string[]) => {
    this.selectedIds = selectedIds || [];
  }

  setContextMenuElementId = (contextMenuElementId?: string) => {
    this.contextMenuElementId = contextMenuElementId;

    if (!contextMenuElementId) {
      this.contextMenuPoint = { x: 0, y: 0 };
    }
  }

  setContextMenuPoint = (contextMenuPoint: { x: number, y: number }) => {
    this.contextMenuPoint = contextMenuPoint;
  }

  resetCanvas = () => {
    this._elements = [];
    this.selectedIds = [];
    this.contextMenuElementId = undefined;
    this.contextMenuPoint = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.scale = 1;
    this.canvasHistory = [];
    this.historyIndex = -1;
    this.activeTool = 'select';
  }

  setElements = (elements: TypeLayer[]) => {
    // this._elements = elements;
    // return;
    // 保持浅观察特性：清空数组后添加新元素，或重新创建浅观察数组
    if (this._elements && Array.isArray(this._elements)) {
      this._elements.length = 0;
      this._elements.push(...(elements || []));
    } else {
      this._elements = observable.array<TypeLayer>(elements || [], { deep: false });
    }
  }

  setPosition = (position: { x: number, y: number } = { x: 0, y: 0 }) => {
    this.position = position;
  }

  setScale = (scale: number = 1) => {
    this.scale = scale;
  }

  setCanvasHistory = (canvasHistory: string[]) => {
    this.canvasHistory = canvasHistory || [];
  }

  setHistoryIndex = (historyIndex: number = -1) => {
    this.historyIndex = historyIndex;
  }

  setActiveTool = (activeTool: 'select') => {
    this.activeTool = activeTool;
  }

  setIsEditing = (editStatus: boolean) => {
    this.isEditing = editStatus;
  }

  setIsGrabbing = (isGrabbing: boolean) => {
    this.isGrabbing = isGrabbing;
  }

  setIsDragging = (isDragging: boolean) => {
    this.isDragging = isDragging;
  }

  setIsDrawingRect = (isDrawingRect: boolean) => {
    this.isDrawingRect = isDrawingRect;
  }

  setIsTransforming = (isTransforming: boolean) => {
    this.isTransforming = isTransforming;
  }

  setIsScaling = (isScaling: boolean) => {
    this.isScaling = isScaling;
  }

  setIsMoving = (isMoving: boolean) => {
    this.isMoving = isMoving;
  }

  undo = () => {
    return this.canvas?.undo();
  }

  redo = () => {
    return this.canvas?.redo();
  }

  importCanvas = (...args: any) => {
    return this.canvas?.importCanvas(...args);
  }

  exportCanvas = (...args: any) => {
    return this.canvas?.exportCanvas(...args);
  }

  addToHistory = (elements?: TypeLayer[]) => {
    return this.canvas?.addToHistory(elements);
  }

  clearHistory = () => {
    return this.canvas?.clearHistory();
  }

  zoomIn = (step?: number) => {
    return this.canvas?.zoomIn(step);
  }

  zoomOut = (step?: number) => {
    return this.canvas?.zoomOut(step);
  }

  zoomTo = (newScale?: number) => {
    return this.canvas?.zoomTo(newScale);
  }

  zoomToFit = () => {
    return this.canvas?.zoomToFit();
  }

  getAnimateState = () => {
    return this.canvas?.getAnimateState();
  }

  toJSON = () => {
    return this.canvas?.toJSON();
  }

  fromJSON = (json: any) => {
    return this.canvas?.fromJSON(json);
  }

  locate = (...args: any) => {
    return this.canvas?.locate(...args);
  }

  addElement = (...args: any[]) => {
    return this.canvas?.addElement(...args);
  }
  updateElement = (elementId: string, attributes?: any) => {
    return this.canvas?.updateElement(elementId, attributes);
  }
  moveElement = (sourceId: string, options?: { targetId?: string | number, zIndex?: string | number, point?: { x: number, y: number } }) => {
    return this.canvas?.moveElement(sourceId, options);
  }
  copyElement = (sourceId: string, options?: { targetId?: string | number, zIndex?: string | number, point?: { x: number, y: number } }) => {
    return this.canvas?.copyElement(sourceId, options);
  }
  removeElement = (id: TypeLayer | TypeLayer[] | string | string[]) => {
    return this.canvas?.removeElement(id);
  }
  selectAllElements = () => {
    return this.canvas?.selectAllElements();
  }
  resetElements = (elements: TypeLayer[], recordHistory?: boolean) => {
    return this.canvas?.resetElements(elements, recordHistory);
  }
  groupElements = (elements: TypeLayer[]) => {
    return this.canvas?.groupElements(elements);
  }
  ungroupElements = (elements: TypeLayer[]) => {
    return this.canvas?.ungroupElements(elements);
  }
  updateTransformer = (nodes?: Konva.Node[]) => {
    return this.canvas?.updateTransformer(nodes);
  }

  handleElementSelect = (elementId: string | null) => {
    return this.canvas?.handleElementSelect(elementId);
  }
  handleElementDragEnd = (elementId: string, attributes: any) => {
    return this.canvas?.handleElementDragEnd(elementId, attributes);
  }

  findElementNode = (id: string | string[]) => {
    return this.canvas?.findElementNode?.(id);
  }

  findInElements = (id: string) => {
    return this.canvas?.findInElements(toJS(this.elements), id);
  }

  setRef = (id: string, ref: any) => {
    this._refs[id] = ref;
  }

  getRef = (id: string) => {
    return this._refs[id];
  }

  setState = (state: any) => {
    Object.assign(this.elementState, state);
  }

  setEnableElements = (enableElements: string[]) => {
    this.enableElements = enableElements;
  }

  setDisableElements = (disableElements: string[]) => {
    this.disableElements = disableElements;
  }

  isElementEnabled = (type: string = '') => {
    const { enableElements, disableElements } = this;

    if (enableElements?.length > 0 && disableElements?.length > 0) {
      return enableElements.includes(type) && !disableElements.includes(type);
    }

    if (enableElements?.length > 0) {
      return enableElements.includes(type);
    }

    if (disableElements?.length > 0) {
      return !disableElements.includes(type);
    }

    return true;
  }

  findElementsById = (elements: TypeLayer[], id: string | string[]) => {
    return this.canvas?.findElementsById(toJS(elements), id);
  }

  // 对指定的元素分组并且打平返回
  flattenElementsByType = (elements: TypeLayer[], includeTypes: string[] = [
    'group',
    'video',
    'offer'
  ]) => {
    return this.canvas?.flattenElementsByType(elements, includeTypes);
  }

  flattenSelectedElementsByType = () => {
    return this.canvas?.flattenElementsByType(this.findElementsById(toJS(this.elements), this.selectedIds));
  };

  addToLocateQueue = (items: LocateQueueItem[]) => {
    this.locateQueue.push(...items);
  }

  shiftLocateQueue = () => {
    return this.locateQueue.shift();
  }

  // 添加一个正在处理中的素材任务，如图片高清、图片去水印、抠图、翻译等
  addProcessingTask = (task: TypeProcessingTask) => {
    const existingTask = this._processingTasks.find((t) => t.id === task.id);

    if (existingTask) {
      // 存在的任务更新回调函数
      existingTask.callback = task.callback;
    } else {
      this._processingTasks.push(task);
    }

    if (!this._processingTimeoutId) {
      this._processingTimeoutId = setTimeout(() => {
        this.getProcessingTaskResult();
      }, 2000) as unknown as number;
    }
  }

  removeProcessingTask = (id: string) => {
    this._processingTasks = this._processingTasks.filter((task) => task.id !== id);
  }

  getProcessingTaskResult = () => {
    const taskIds = this._processingTasks?.map(item => item.id);

    if (!taskIds?.length) {
      return;
    }

    getElementTaskResult(taskIds).then(result => {
      result?.forEach?.((item: any) => {
        if (item.status === 'finish') {
          const task = this._processingTasks.find((task) => task.id === item.taskId);

          if (task) {
            task.callback?.(item?.result?.result);
          }

          this.removeProcessingTask(item.taskId);
        }
      });
      this._processingTimeoutId = undefined;

      if (this._processingTasks.length) {
        this._processingTimeoutId = setTimeout(() => {
          this.getProcessingTaskResult();
        }, 2000) as unknown as number;
      }
    });
  }
}

export const CanvasContext = createContext<TypeCanvasContext>(
  new CanvasStore()
);

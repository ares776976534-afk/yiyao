import { Selection } from "./types";
import { MIN_SELECTION_SIZE, HANDLE_SIZE, HANDLE_TOLERANCE } from "./constants";

// Canvas绘制工具
export class CanvasDrawer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private selection: Selection = { x: 0, y: 0, width: 0, height: 0 };
  private isDragging = false;
  private isResizing = false;
  private resizeHandle = "";
  private dragStart = { x: 0, y: 0 };
  private onSelectionChange?: (selection: Selection) => void;

  // 绑定的事件处理器引用
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;
  private boundMouseLeave: (e: MouseEvent) => void;

  constructor(
    canvas: HTMLCanvasElement,
    onSelectionChange?: (selection: Selection) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.onSelectionChange = onSelectionChange;

    // 绑定事件处理器
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundMouseLeave = this.handleMouseLeave.bind(this);

    this.setupEventListeners();
  }

  setSelection(selection: Selection) {
    this.selection = { ...selection };
    this.draw();
  }

  private setupEventListeners() {
    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("mouseup", this.boundMouseUp);
    this.canvas.addEventListener("mouseleave", this.boundMouseLeave);
  }

  private getMousePos(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private getResizeHandle(pos: { x: number; y: number }): string {
    const { x, y, width, height } = this.selection;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // 检查四个角
    if (
      Math.abs(pos.x - x) < HANDLE_TOLERANCE &&
      Math.abs(pos.y - y) < HANDLE_TOLERANCE
    )
      return "nw";
    if (
      Math.abs(pos.x - (x + width)) < HANDLE_TOLERANCE &&
      Math.abs(pos.y - y) < HANDLE_TOLERANCE
    )
      return "ne";
    if (
      Math.abs(pos.x - x) < HANDLE_TOLERANCE &&
      Math.abs(pos.y - (y + height)) < HANDLE_TOLERANCE
    )
      return "sw";
    if (
      Math.abs(pos.x - (x + width)) < HANDLE_TOLERANCE &&
      Math.abs(pos.y - (y + height)) < HANDLE_TOLERANCE
    )
      return "se";

    // 检查四个边的中点
    if (
      Math.abs(pos.x - centerX) < HANDLE_TOLERANCE &&
      Math.abs(pos.y - y) < HANDLE_TOLERANCE
    )
      return "n";
    if (
      Math.abs(pos.x - centerX) < HANDLE_TOLERANCE &&
      Math.abs(pos.y - (y + height)) < HANDLE_TOLERANCE
    )
      return "s";
    if (
      Math.abs(pos.x - x) < HANDLE_TOLERANCE &&
      Math.abs(pos.y - centerY) < HANDLE_TOLERANCE
    )
      return "w";
    if (
      Math.abs(pos.x - (x + width)) < HANDLE_TOLERANCE &&
      Math.abs(pos.y - centerY) < HANDLE_TOLERANCE
    )
      return "e";

    return "";
  }

  private isInSelection(pos: { x: number; y: number }): boolean {
    const { x, y, width, height } = this.selection;
    return (
      pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height
    );
  }

  private handleMouseDown(e: MouseEvent) {
    const pos = this.getMousePos(e);
    const handle = this.getResizeHandle(pos);

    if (handle) {
      this.isResizing = true;
      this.resizeHandle = handle;
    } else if (this.isInSelection(pos)) {
      this.isDragging = true;
    }

    this.dragStart = pos;
    
    // 阻止默认行为，防止拖拽时选中文本等
    e.preventDefault();
  }

  private handleMouseMove(e: MouseEvent) {
    const pos = this.getMousePos(e);

    if (this.isResizing) {
      this.handleResize(pos);
    } else if (this.isDragging) {
      this.handleDrag(pos);
    } else {
      this.updateCursor(pos);
    }
  }

  private handleMouseUp(e: MouseEvent) {
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = "";
    this.canvas.style.cursor = "default";
  }

  private handleMouseLeave(e: MouseEvent) {
    // 鼠标离开canvas时，结束所有拖拽操作
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = "";
    this.canvas.style.cursor = "default";
  }

  private handleDrag(pos: { x: number; y: number }) {
    const deltaX = pos.x - this.dragStart.x;
    const deltaY = pos.y - this.dragStart.y;

    const newX = Math.max(
      0,
      Math.min(
        this.canvas.width - this.selection.width,
        this.selection.x + deltaX
      )
    );
    const newY = Math.max(
      0,
      Math.min(
        this.canvas.height - this.selection.height,
        this.selection.y + deltaY
      )
    );

    this.selection.x = newX;
    this.selection.y = newY;
    this.dragStart = pos;

    this.draw();
    this.onSelectionChange?.(this.selection);
  }

  private handleResize(pos: { x: number; y: number }) {
    let { x, y, width, height } = this.selection;

    switch (this.resizeHandle) {
      // 四个角的缩放
      case "nw":
        width += x - pos.x;
        height += y - pos.y;
        x = pos.x;
        y = pos.y;
        break;
      case "ne":
        width = pos.x - x;
        height += y - pos.y;
        y = pos.y;
        break;
      case "sw":
        width += x - pos.x;
        height = pos.y - y;
        x = pos.x;
        break;
      case "se":
        width = pos.x - x;
        height = pos.y - y;
        break;
      // 四个边中点的缩放
      case "n":
        height += y - pos.y;
        y = pos.y;
        break;
      case "s":
        height = pos.y - y;
        break;
      case "w":
        width += x - pos.x;
        x = pos.x;
        break;
      case "e":
        width = pos.x - x;
        break;
    }

    // 限制最小尺寸和边界
    width = Math.max(MIN_SELECTION_SIZE, width);
    height = Math.max(MIN_SELECTION_SIZE, height);
    x = Math.max(0, Math.min(this.canvas.width - width, x));
    y = Math.max(0, Math.min(this.canvas.height - height, y));

    this.selection = { x, y, width, height };
    this.draw();
    this.onSelectionChange?.(this.selection);
  }

  private updateCursor(pos: { x: number; y: number }) {
    const handle = this.getResizeHandle(pos);
    if (handle) {
      // 为不同的控制点设置对应的光标样式
      const cursorMap: { [key: string]: string } = {
        'nw': 'nwse-resize',  // 左上角：西北-东南双向对角线箭头 ↖↘
        'ne': 'nesw-resize',  // 右上角：东北-西南双向对角线箭头 ↗↙
        'sw': 'nesw-resize',  // 左下角：东北-西南双向对角线箭头 ↗↙
        'se': 'nwse-resize',  // 右下角：西北-东南双向对角线箭头 ↖↘
        'n': 'ns-resize',     // 上边中点：上下双向箭头 ↕
        's': 'ns-resize',     // 下边中点：上下双向箭头 ↕
        'w': 'ew-resize',     // 左边中点：左右双向箭头 ↔
        'e': 'ew-resize',     // 右边中点：左右双向箭头 ↔
      };
      this.canvas.style.cursor = cursorMap[handle] || 'default';
    } else if (this.isInSelection(pos)) {
      this.canvas.style.cursor = "move";
    } else {
      this.canvas.style.cursor = "default";
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制遮罩
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 清除选区
    const { x, y, width, height } = this.selection;
    this.ctx.clearRect(x, y, width, height);

    // 绘制选区边框
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    // 绘制缩放控制点
    this.ctx.fillStyle = "#fff";
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const handles = [
      // 四个角
      { x: x - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2 }, // nw
      { x: x + width - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2 }, // ne
      { x: x - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2 }, // sw
      { x: x + width - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2 }, // se
      // 四个边中点
      { x: centerX - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2 }, // n
      { x: centerX - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2 }, // s
      { x: x - HANDLE_SIZE / 2, y: centerY - HANDLE_SIZE / 2 }, // w
      { x: x + width - HANDLE_SIZE / 2, y: centerY - HANDLE_SIZE / 2 }, // e
    ];

    handles.forEach((handle) => {
      this.ctx.fillRect(handle.x, handle.y, HANDLE_SIZE, HANDLE_SIZE);
    });
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("mouseup", this.boundMouseUp);
    this.canvas.removeEventListener("mouseleave", this.boundMouseLeave);
  }
} 
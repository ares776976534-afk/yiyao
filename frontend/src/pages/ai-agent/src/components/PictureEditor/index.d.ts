export interface TypeCommonProps {
  open: boolean;
  onClose: () => void;
  // 禁用canvas绘制
  disableCanvas?: boolean;
}

// clip
export interface TypeCropResult {
  blob: Blob;
  coordinates: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
  cropArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TypeCropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TypeImageState {
  element: HTMLImageElement | null;
  displayWidth: number;
  displayHeight: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface TypeResizeHandle {
  type: string;
  x: number;
  y: number;
  cursor: string;
}

export interface TypeClipProps extends TypeCommonProps {
  imageUrl: string;
  onOk: (result: TypeCropResult) => void;
}


// modify
export interface TypeModifyProps extends TypeCommonProps {
  disableCanvas?: boolean;
  open?: boolean;
  type: "modify" | "clear";
  text?: string;
  onOk: ({ text, rle }: { text?: string; rle: string }) => void;
}

// changeText
export interface TypeChangeTextProps extends TypeCommonProps {
  onOk: (result: string) => void; // 结果为JSON字符串，包含base64、坐标和blob信息
}

// translateOffer
export interface TypeTranslateOfferProps {
  editRect?: any;
  open: boolean;
  type: "translate" | "optimize";
  onOk: (result: any) => void;
  onClose: () => void;
  type?: "translate" | "optimize";
}
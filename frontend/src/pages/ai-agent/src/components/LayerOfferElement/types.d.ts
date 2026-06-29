import { TypeLayer } from "@/components/studio-canvas/types.d";

export interface SkuData {
  offerId: number;
  firstCateName: string;
  secondCateName: string;
  thirdCateName: string;
  title: string;
  images: string[];
  productAttribute: { attributeName: string; value: string }[];
  productSkuInfos: {
    skuId: number;
    skuAttributes: {
      attributeName: string;
      value: string;
      skuImageUrl: string | null;
    }[];
  }[];
  detailImages: string[] | null;
}

export interface OrganizedSkuData {
  [key: string]: SkuAttribute[];
}

export interface SkuAttribute {
  name: string;
  imageUrl?: string | null;
  image?: HTMLImageElement; // 添加图片对象
  imageSize?: { width: number; height: number }; // 添加预计算的图片尺寸
  refKey?: string; // 添加ref key用于文本高度计算
}

export interface AttributeItem {
  attributeName: string;
  value: string;
}

export interface ImageGridDimensions {
  width: number;
  height: number;
  gridWidth: number; // 图片网格的宽度
  gridHeight: number; // 图片网格的高度
  rows: number;
  cols: number;
}

// 布局方向类型
export type LayoutDirection = "vertical" | "horizontal";

// 定义组件类型，扩展ForwardRefExoticComponent以支持自定义属性
export interface LayerOfferElementType
  extends React.ForwardRefExoticComponent<
    LayerOfferElementProps & React.RefAttributes<unknown>
  > {
  icon?: string;
  displayName?: string;
  getMenu?: () => any[];
  replaceModule?: (relateData: any, canvasContext: any) => string | undefined;
  fromJSON?: (elementData: any) => any;
}

export interface LayerOfferElementProps extends TypeLayer {}

export interface UseOfferElementProps {
  offerData: any;
}

export interface EditRect {
  lt: { x: number; y: number };
  rt: { x: number; y: number };
  lb: { x: number; y: number };
  rb: { x: number; y: number };
}

export enum EnumEditeState {
  null = "null",
  translate = "translate",
  optimize = "optimize",
}

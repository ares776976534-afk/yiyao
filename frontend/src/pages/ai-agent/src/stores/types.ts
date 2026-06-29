import type { TypeLayer } from "../components/studio-canvas/types.d";
import { EnumImageAction, EnumTextAction } from "../components/studio-canvas/types.d";
import { TypeOfferMaterialResult } from "@/services/studio/queryOfferBy";

export interface TypeSendPayload {
  content: string;
  files?: any[];
}

export interface TypeFileService {
  uploadImageBase64ReturnUrl: (base64: string) => Promise<string>;
  uploadImageFile: (file: File) => Promise<string>;
}

export interface TypeChatService {
  // 预留：根据业务扩展，例如发送消息、拉取历史、流式响应等
  // send?: (payload: TypeSendPayload) => Promise<void>;
}
export interface TypeOfferService {
  queryOfferBy: (offerIdList: Array<string | number>) => Promise<TypeOfferMaterialResult[]>;
}
export interface TypeStoreServices {
  // 模块化服务：推荐按模块注入，便于扩展
  file: TypeFileService;
  chat?: TypeChatService;
  offer: TypeOfferService;
}

// AI改图仅需图层的基础信息
export type TypeAiEditLayerInfo = Pick<
  TypeLayer,
  'id' | 'type' | 'x' | 'y' | 'width' | 'height' | 'rotation' | 'scaleX' | 'scaleY'
>;

// 图片动作载荷（与文字动作彻底分离）
export interface TypeImageActionPayload {
  action: EnumImageAction;
  layer: TypeAiEditLayerInfo;
}

// 文字动作载荷（预留，与图片分离）
export interface TypeTextActionPayload {
  action: EnumTextAction;
  layer: TypeAiEditLayerInfo;
}

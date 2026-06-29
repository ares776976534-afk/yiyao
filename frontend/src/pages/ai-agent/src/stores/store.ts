import { makeAutoObservable, toJS, observable } from "mobx";
import type {
  TypeInputChatRef,
  TypeImageFromUrl,
  TypeFileItem,
} from "@/components/InputChat/types";
import type { TypeOfferMaterialResult } from "@/services/studio/queryOfferBy";
import { calcOfferInfoSize } from "@/components/LayerOfferElement/calcOffer";
import type {
  TypeSendPayload,
  TypeStoreServices,
  TypeAiEditLayerInfo,
  TypeImageActionPayload,
} from "./types";
import { EnumImageAction } from "@/components/studio-canvas/types.d";
import { UserPreferStore } from "./userPreferStore";

export class Store {
  userInfo: any = null;
  outbox: TypeSendPayload[] = [];
  aiOutbox: TypeImageActionPayload[] = [];
  canvas: any;
  inputChat: TypeInputChatRef;
  sessionId: string;
  distributeMode: boolean = false;
  distributeLayerIds: string[] = [];
  canvasIds: string[] = [];
  userPrefer: UserPreferStore;
  private services: TypeStoreServices;

  constructor(services: TypeStoreServices) {
    this.services = services;
    this.userPrefer = new UserPreferStore();
    makeAutoObservable(
      this,
      { outbox: observable.shallow, aiOutbox: observable.shallow },
      { autoBind: true }
    );
  }

  get isCustomUser() {
    return this.userInfo?.userTags?.includes("1");
  }

  get isDarkMode() {
    return this.userPrefer.preferences.common.theme === "dark";
  }

  get isLightMode() {
    return this.userPrefer.preferences.common.theme === "light";
  }

  get theme() {
    return this.userPrefer.preferences.common.theme;
  }

  setUserInfo(userInfo: any) {
    this.userInfo = userInfo;
  }

  async sendFromInput(payload: TypeSendPayload) {
    const snapshot = toJS(payload);
    this.outbox.push(snapshot);
  }

  // 透传 file 服务，避免业务层直接依赖具体实现
  async uploadImageBase64ReturnUrl(base64: string): Promise<string> {
    return this.services.file.uploadImageBase64ReturnUrl(base64);
  }

  async uploadImageFile(file: File): Promise<string> {
    return this.services.file.uploadImageFile(file);
  }

  // 透传 offer 服务
  async queryOfferBy(offerIdList: Array<string>) {
    return this.services.offer.queryOfferBy(offerIdList);
  }

  popOutbox(): TypeSendPayload | undefined {
    return this.outbox.shift();
  }

  // 发送AI改图消息（附带图层基础信息）
  async sendAiEdit(layer: TypeAiEditLayerInfo) {
    const payload: TypeImageActionPayload = {
      action: EnumImageAction.AiEdit,
      layer,
    };
    this.aiOutbox.push(toJS(payload));
  }

  popAiOutbox(): TypeImageActionPayload | undefined {
    return this.aiOutbox.shift();
  }

  setCanvas(canvas: any) {
    this.canvas = canvas;
  }

  setInputChat(inputChat: TypeInputChatRef) {
    this.inputChat = inputChat;
  }

  addImgElement(
    element: Record<string, any> | Record<string, any>[],
    from = 'assistant', // 调用方是AI还是用户，'assistant' | 'user'
  ) {
    let params = (Array.isArray(element) ? element : [element])?.map((item) => {
      const { media_id, ...rest } = item;

      return {
        ...rest,
        ...(media_id ? { id: media_id } : {}),
        type: "image",
        attributes: {
          src: item.media_cover_url,
          watermark: !!media_id,
        },
      };
    });

    this.canvas?.addElement(params, { memoryId: this.sessionId, diffMemory: true, insertMethod: 'block', batchInsertMethod: from === 'user' ? 'inline' : 'block' });
  }

  addVideoElement(
    element: Record<string, any> | Record<string, any>[],
    from = 'assistant', // 调用方是AI还是用户，'assistant' | 'user'
  ) {
    const params = (Array.isArray(element) ? element : [element])?.map(
      (item) => {
        const { media_id, ...rest } = item;

        return {
          ...rest,
          ...(media_id ? { id: media_id } : {}),
          type: "video",
          attributes: {
            poster: item.media_cover_url,
            src: item.media_url,
            watermark: !!media_id,
          },
        };
      }
    );
    
    this.canvas?.addElement(params, { memoryId: this.sessionId, diffMemory: true, insertMethod: 'block', batchInsertMethod: from === 'user' ? 'inline' : 'block' });
  }

  addOfferElement(
    element: Record<string, any> | Record<string, any>[],
    from = 'assistant', // 调用方是AI还是用户，'assistant' | 'user'
  ) {
    const el = Array.isArray(element) ? element : [element];

    const params = el.map((item) => {
      const offerModuleSize = calcOfferInfoSize(item);
      const { id, mediaId } = item;
      const finalId = id ?? mediaId;

      return {
        type: "offer",
        ...(finalId ? { id: finalId } : {}),
        width: offerModuleSize?.width || 0,
        height: offerModuleSize?.height || 0,
        attributes: {
          offerData: {
            ...item,
            width: offerModuleSize?.width || 0, // 默认宽度
            height: offerModuleSize?.height || 0, // 默认高度
            _offerModuleSize: offerModuleSize,
          },
        },
      };
    });
    
    this.canvas?.addElement(params, { memoryId: this.sessionId, diffMemory: true, insertMethod: 'block', batchInsertMethod: from === 'user' ? 'inline' : 'block' });
  }

  locateElement(id: string) {
    return this.canvas?.locate?.(id);
  }

  addTextToChat(text: string, append = true) {
    this.inputChat?.addTextToChat(text, append);
  }

  addImagesToChat(images: TypeImageFromUrl[]) {
    this.inputChat?.addImagesToChat(images);
  }

  addImagesFromFilesToChat(images: TypeFileItem[], append = true) {
    this.inputChat?.addImagesFromFilesToChat(images, append);
  }

  addVideoToChat(videos) {}

  addOffersToChat(offers: TypeOfferMaterialResult[]) {
    this.inputChat?.addOffersToChat(offers);
  }

  setSessionId(id: string) {
    this.sessionId = id;
  }

  setDistributeMode(mode: boolean) {
    this.distributeMode = mode;

    if (mode !== true) {
      this.distributeLayerIds = [];
    }
  }

  setDistributeLayerIds(ids: string[]) {
    this.distributeLayerIds = ids;
  }
}

export const createStore = (services: TypeStoreServices) => new Store(services);

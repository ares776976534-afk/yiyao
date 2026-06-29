import { makeAutoObservable } from 'mobx';
import { StatusEnum } from '@/pages/select-product/config';
import { transformRawData } from '@/pages/select-product/components/LeftComponents';

// SelectProduct Store
export class SelectProductStore {
  /** ******************* 全局状态 ******************** */
  // 是否已提交表单
  isFormSubmitted: boolean = false;

  // 选品状态
  status: StatusEnum = StatusEnum.INIT;

  blockData: any[] = [];

  userRequest: any = {};

  setUserRequest(request: any) {
    const _raw = transformRawData(request);
    this.userRequest = transformRawData(_raw?.rawData);
  }

  getUserRequest(): any {
    return this.userRequest;
  }

  setBlockData(data: any) {
    this.blockData = [...this.blockData, data];
  }

  getBlockData(): any {
    return this.blockData;
  }

  // 设置表单提交状态
  setFormSubmitted(submitted: boolean) {
    this.isFormSubmitted = submitted;
  }

  setStatus(status: StatusEnum) {
    this.status = status;
  }

  getStatus(): StatusEnum {
    return this.status;
  }

  // keyward tab 数据
  tabHistory: any = new Map();

  tabLoadingIndex: number = -1;

  setTabHistory(key: string, value: any) {
    this.tabHistory.set(key, value);
  }

  hasTabHistory(index): any {
    return this.tabHistory.has(index);
  }

  getTabHistory(index): any {
    return this.tabHistory.get(index);
  }

  setTabLoadingIndex(index: number) {
    this.tabLoadingIndex = index;
  }

  /** ******************* 会话维度状态 ******************** */
  // 格式化后的请求数据
  formattedPayload: any = null;
  // 设置格式化后的请求数据
  setFormattedPayload(payload: any) {
    this.formattedPayload = payload;
  }
  // 获取格式化后的请求数据
  getFormattedPayload(): any {
    return this.formattedPayload;
  }

  sessionId: string = '';

  setSessionId(id: string) {
    this.sessionId = id;
  }
  getSessionId(): string {
    return this.sessionId;
  }

  taskId: string = '';
  setTaskId(id: string) {
    this.taskId = id;
  }
  getTaskId(): string {
    return this.taskId;
  }

  // 最新的错误消息（用于处理 ERROR 状态的 MODULE_HEADER）
  lastError: any = null;
  setLastError(error: any) {
    this.lastError = error;
  }
  getLastError(): any {
    return this.lastError;
  }
  clearLastError() {
    this.lastError = null;
  }

  taskStatus: {
    canCopy: boolean
    canStop: boolean
  } = {
    canCopy: false,
    canStop: false,
  };
  setTaskStatus(status: {
    canCopy: boolean
    canStop: boolean
  }) {
    this.taskStatus = status;
  }
  getTaskStatus(): {
    canCopy: boolean
    canStop: boolean
  } {
    return this.taskStatus;
  }
  clearTaskStatus() {
    this.taskStatus = {
      canCopy: false,
      canStop: false,
    };
  }

  constructor() {
    makeAutoObservable(this, {
    }, { autoBind: true });
  }
}

// 创建store实例
export const createSelectProductStore = () => new SelectProductStore();

import type { EnumPostMessageType } from './constants';

export interface TypeTagOption {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  supportedLanguages?: string[];
}

export interface TypePostMessage {
  namespace: string;
  type: EnumPostMessageType;
  payload?: Record<string, unknown>;
}

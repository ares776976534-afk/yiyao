import { isMac } from './platform';

export interface TypeShortcuts {
  [k: string]: string | string[] | string[][];
}

// 基础按键常量
export const KeyCode = {
  // 字母键
  A: 'KeyA', B: 'KeyB', C: 'KeyC', D: 'KeyD', E: 'KeyE',
  F: 'KeyF', G: 'KeyG', H: 'KeyH', I: 'KeyI', J: 'KeyJ',
  K: 'KeyK', L: 'KeyL', M: 'KeyM', N: 'KeyN', O: 'KeyO',
  P: 'KeyP', Q: 'KeyQ', R: 'KeyR', S: 'KeyS', T: 'KeyT',
  U: 'KeyU', V: 'KeyV', W: 'KeyW', X: 'KeyX', Y: 'KeyY', Z: 'KeyZ',

  // 数字键
  DIGIT_0: 'Digit0', DIGIT_1: 'Digit1', DIGIT_2: 'Digit2',
  DIGIT_3: 'Digit3', DIGIT_4: 'Digit4', DIGIT_5: 'Digit5',
  DIGIT_6: 'Digit6', DIGIT_7: 'Digit7', DIGIT_8: 'Digit8', DIGIT_9: 'Digit9',

  // 功能键
  F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6',
  F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',

  // 特殊按键
  ESCAPE: 'Escape', TAB: 'Tab', CAPS_LOCK: 'CapsLock',
  SHIFT_LEFT: 'ShiftLeft', SHIFT_RIGHT: 'ShiftRight',
  CONTROL_LEFT: 'ControlLeft', CONTROL_RIGHT: 'ControlRight',
  ALT_LEFT: 'AltLeft', ALT_RIGHT: 'AltRight',
  META_LEFT: 'MetaLeft', META_RIGHT: 'MetaRight',
  SPACE: 'Space', ENTER: 'Enter', BACKSPACE: 'Backspace', DELETE: 'Delete',

  // 方向键
  ARROW_UP: 'ArrowUp', ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft', ARROW_RIGHT: 'ArrowRight',

  // 导航键
  HOME: 'Home', END: 'End', PAGE_UP: 'PageUp', PAGE_DOWN: 'PageDown',

  // 符号键
  MINUS: 'Minus', EQUAL: 'Equal', BRACKET_LEFT: 'BracketLeft',
  BRACKET_RIGHT: 'BracketRight', BACKSLASH: 'Backslash',
  SEMICOLON: 'Semicolon', QUOTE: 'Quote', BACKQUOTE: 'Backquote',
  COMMA: 'Comma', PERIOD: 'Period', SLASH: 'Slash',
} as const;

// 修饰键常量
export const ModifierKeys = {
  SHIFT: 'Shift',
  CONTROL: 'Control',
  ALT: 'Alt',
  META: 'Meta', // Command (Mac) / Windows
} as const;

export const adeptKeyMap = {
  control: {
    label: isMac ? 'Command' : 'Ctrl',
    symbol: isMac ? '⌘' : 'Ctrl',
    value: isMac ? 'Meta' : 'Control',
  },
  alt: {
    label: isMac ? 'Option' : 'Alt',
    symbol: isMac ? '⌥' : 'Alt',
    value: isMac ? 'Alt' : 'Alt',
  },
  shift: {
    label: isMac ? 'Shift' : 'Shift',
    symbol: isMac ? '⇧' : 'Shift',
    value: isMac ? 'Shift' : 'Shift',
  },
};

// 定义按键类型
export type KeyCodeType = typeof KeyCode[keyof typeof KeyCode];
export type ModifierKeyType = typeof ModifierKeys[keyof typeof ModifierKeys];

// 定义快捷键类型
export type ShortcutKey = KeyCodeType | ModifierKeyType;
export type Shortcut = ShortcutKey | ShortcutKey[];

// 常用快捷键组合
export const Shortcuts = {
  // 文件操作
  NEW: ['Control', 'KeyN'] as ShortcutKey[],
  OPEN: ['Control', 'KeyO'] as ShortcutKey[],
  SAVE: ['Control', 'KeyS'] as ShortcutKey[],
  SAVE_AS: ['Control', 'Shift', 'KeyS'] as ShortcutKey[],
  PRINT: ['Control', 'KeyP'] as ShortcutKey[],
  CLOSE: ['Control', 'KeyW'] as ShortcutKey[],

  // 编辑操作
  UNDO: ['Control', 'KeyZ'] as ShortcutKey[],
  REDO: ['Control', 'KeyY'] as ShortcutKey[],
  CUT: ['Control', 'KeyX'] as ShortcutKey[],
  COPY: ['Control', 'KeyC'] as ShortcutKey[],
  PASTE: ['Control', 'KeyV'] as ShortcutKey[],
  SELECT_ALL: ['Control', 'KeyA'] as ShortcutKey[],
  FIND: ['Control', 'KeyF'] as ShortcutKey[],
  REPLACE: ['Control', 'KeyH'] as ShortcutKey[],

  // 视图操作
  ZOOM_IN: ['Control', 'Equal'] as ShortcutKey[],
  ZOOM_OUT: ['Control', 'Minus'] as ShortcutKey[],
  ZOOM_RESET: ['Control', 'Digit0'] as ShortcutKey[],
  FULLSCREEN: 'F11' as ShortcutKey,

  // 画布操作
  DELETE_ELEMENT: 'Delete' as ShortcutKey,
  DUPLICATE: ['Control', 'KeyD'] as ShortcutKey[],
  GROUP: ['Control', 'KeyG'] as ShortcutKey[],
  UNGROUP: ['Control', 'Shift', 'KeyG'] as ShortcutKey[],

  // 工具切换
  SELECT_TOOL: 'KeyV' as ShortcutKey,
  MOVE_TOOL: 'KeyM' as ShortcutKey,
  TEXT_TOOL: 'KeyT' as ShortcutKey,
  SHAPE_TOOL: 'KeyS' as ShortcutKey,
  PEN_TOOL: 'KeyP' as ShortcutKey,
  BRUSH_TOOL: 'KeyB' as ShortcutKey,
  ERASER_TOOL: 'KeyE' as ShortcutKey,
  ZOOM_TOOL: 'KeyZ' as ShortcutKey,
  HAND_TOOL: 'KeyH' as ShortcutKey,
} as const;

// Mac特定的快捷键
export const MacShortcuts = {
  NEW: ['Meta', 'KeyN'] as ShortcutKey[],
  OPEN: ['Meta', 'KeyO'] as ShortcutKey[],
  SAVE: ['Meta', 'KeyS'] as ShortcutKey[],
  SAVE_AS: ['Meta', 'Shift', 'KeyS'] as ShortcutKey[],
  UNDO: ['Meta', 'KeyZ'] as ShortcutKey[],
  REDO: ['Meta', 'Shift', 'KeyZ'] as ShortcutKey[],
  CUT: ['Meta', 'KeyX'] as ShortcutKey[],
  COPY: ['Meta', 'KeyC'] as ShortcutKey[],
  PASTE: ['Meta', 'KeyV'] as ShortcutKey[],
  SELECT_ALL: ['Meta', 'KeyA'] as ShortcutKey[],
} as const;

// 类型定义
export type ShortcutType = typeof Shortcuts[keyof typeof Shortcuts];
export type MacShortcutType = typeof MacShortcuts[keyof typeof MacShortcuts];

// 按键事件接口
export interface KeyEvent {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  repeat: boolean;
}

// 快捷键匹配器
export class ShortcutMatcher {
  static matches(event: KeyEvent, shortcut: string | string[]): boolean {
    const keys = Array.isArray(shortcut) ? shortcut : [shortcut] as string[];
    
    const hasCtrl = keys.includes('Control') || keys.includes('Meta');
    const hasShift = keys.includes('Shift');
    const hasAlt = keys.includes('Alt');
    const hasMeta = keys.includes('Meta');
    
    if (hasCtrl && !event.ctrlKey) return false;
    if (hasShift && !event.shiftKey) return false;
    if (hasAlt && !event.altKey) return false;
    if (hasMeta && !event.metaKey) return false;
    
    const mainKey = keys.find(key => 
      !['Control', 'Shift', 'Alt', 'Meta'].includes(key)
    );
    
    return mainKey ? event.code === mainKey : false;
  }
}

// 按键工具函数
export const KeyUtils = {
  getKeyDisplayName(code: string): string {
    const displayNames: Record<string, string> = {
      [KeyCode.CONTROL_LEFT]: 'ctrl',
      [KeyCode.META_LEFT]: '⌘',
      [KeyCode.SHIFT_LEFT]: 'Shift',
      [KeyCode.ALT_LEFT]: 'Alt',
      [KeyCode.ESCAPE]: 'Esc',
      [KeyCode.ENTER]: '↵',
      [KeyCode.BACKSPACE]: '⌫',
      [KeyCode.DELETE]: 'Del',
      [KeyCode.SPACE]: 'Space',
      [KeyCode.ARROW_UP]: '↑',
      [KeyCode.ARROW_DOWN]: '↓',
      [KeyCode.ARROW_LEFT]: '←',
      [KeyCode.ARROW_RIGHT]: '→',
    };
    
    return displayNames[code] || code.replace('Key', '').replace('Digit', '');
  },

  formatShortcut(shortcut: ShortcutType | MacShortcutType): string {
    const keys = Array.isArray(shortcut) ? shortcut : [shortcut];
    return keys.map(key => this.getKeyDisplayName(key)).join(' + ');
  },
};

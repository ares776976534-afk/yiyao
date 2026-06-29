/** 拖放项 webkit 扩展（Chromium） */
export type TypeClawChatDataTransferItem = DataTransferItem & {
  webkitGetAsEntry?: () => FileSystemEntry | null;
};

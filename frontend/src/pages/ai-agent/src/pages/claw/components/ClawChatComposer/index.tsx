import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { SendIcon } from '@/components/InputChat/components/Icons';
import aplus from '@/utils/log';
import SkillConfigModal from '../SkillConfigModal';
import { clawSkillListStore } from '../stores/clawSkillListStore';
import { collectDroppedPathReferences, hasFileKindPayload } from './dropUtils';
import { buildClawUserMessageWire } from '../clawUserMessageWire';
import type {
  TypeClawAttachmentItem,
  TypeClawChatComposerProps,
  TypeClawChatComposerRef,
} from './types';
import styles from './index.module.scss';

const SKILL_ICON_URL = 'https://img.alicdn.com/imgextra/i4/O1CN01HRYpdN1JhzLnBpBne_!!6000000001061-55-tps-20-20.svg';
const PAUSE_ICON_URL = 'https://img.alicdn.com/imgextra/i3/O1CN01bAUKS11HHJ2zVNSjb_!!6000000000732-55-tps-36-36.svg';
const UPLOAD_ICON_URL = 'https://img.alicdn.com/imgextra/i3/O1CN01tmlikS1pzSAH3luE1_!!6000000005431-55-tps-16-16.svg';

function serializeRoot(root: HTMLElement | null): string {
  if (!root) return '';
  let out = '';
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? '';
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    if (el.tagName === 'BR') {
      out += '\n';
      return;
    }
    el.childNodes.forEach(walk);
  };
  root.childNodes.forEach(walk);
  return out.replace(/\u200b/g, '').trim();
}

function isEmptyRoot(root: HTMLElement | null): boolean {
  if (!root) return true;
  const text = root.innerText.replace(/\u200b/g, '').replace(/\n/g, '').trim();
  return text === '';
}

function defaultAttachmentsFromFiles(files: File[]): TypeClawAttachmentItem[] {
  return files.map((file) => {
    const path = file.webkitRelativePath || file.name;
    const trimmed = path.replace(/^\/+/, '');
    return {
      id: crypto.randomUUID(),
      label: `@${trimmed}`,
    };
  });
}

const ClawChatComposerInner = forwardRef<
  TypeClawChatComposerRef,
  TypeClawChatComposerProps
>(function ClawChatComposer(props, ref) {
  const {
    connected = false,
    isRunning = false,
    placeholder = '',
    onSend,
    onStop,
    onDraftChange,
    onUploadFiles,
    onAttachmentsChange,
  } = props;

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<TypeClawAttachmentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPh, setShowPh] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);

  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;

  const syncPlaceholder = useCallback(() => {
    const el = editorRef.current;
    setShowPh(isEmptyRoot(el));
  }, []);

  const notifyDraft = useCallback(() => {
    syncPlaceholder();
    const empty =
      attachmentsRef.current.length === 0 && isEmptyRoot(editorRef.current);
    onDraftChange?.({ isEmpty: empty });
  }, [onDraftChange, syncPlaceholder]);

  useEffect(() => {
    onAttachmentsChange?.(attachments);
  }, [attachments, onAttachmentsChange]);

  useEffect(() => {
    aplus.record('/alphashop.clawchat.skilllist', 'EXP');
    aplus.record('/alphashop.clawchat.submit', 'EXP');
  }, []);

  useEffect(() => {
    clawSkillListStore.fetchSkillList();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getSerialized: () => {
        const text = serializeRoot(editorRef.current).replace(/\u200b/g, '').trimEnd();
        const items = attachmentsRef.current;
        const urlItems = items.filter(
          (item): item is TypeClawAttachmentItem & { fileUrl: string } =>
            Boolean(item.fileUrl),
        );
        const pathOnly = items.filter((item) => !item.fileUrl);
        const prefix = pathOnly.map((item) => item.label).join(' ');
        const bodyText = [prefix, text].filter(Boolean).join(' ').trim();
        return buildClawUserMessageWire(
          bodyText,
          urlItems.map((item) => ({ label: item.label, fileUrl: item.fileUrl })),
        );
      },
      clear: () => {
        setAttachments([]);
        const el = editorRef.current;
        if (el) {
          el.innerHTML = '';
        }
        notifyDraft();
      },
      focus: () => {
        editorRef.current?.focus();
      },
    }),
    [notifyDraft],
  );

  useEffect(() => {
    notifyDraft();
  }, [attachments, connected, notifyDraft]);

  const effectiveDisabled = !connected || isRunning || uploading;

  const handleInput = () => {
    notifyDraft();
  };

  const handleBeforeInput = (event: React.FormEvent<HTMLDivElement>) => {
    const ie = event.nativeEvent as InputEvent;
    if (
      typeof ie.inputType === 'string' &&
      ie.inputType.startsWith('format')
    ) {
      event.preventDefault();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    notifyDraft();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (!uploading) {
        onSend?.();
      }
      return;
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDragEnter = (event: React.DragEvent) => {
    if (effectiveDisabled) return;
    if (!hasFileKindPayload(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
    editorRef.current?.focus();
  };

  const handleDragOver = (event: React.DragEvent) => {
    if (effectiveDisabled) return;
    if (!hasFileKindPayload(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    const { dataTransfer } = event;
    if (dataTransfer) {
      dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    const related = event.relatedTarget as Node | null;
    if (related && (event.currentTarget as HTMLElement).contains(related)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  const uploadFilesBatch = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setUploading(true);
      try {
        const nextItems = onUploadFiles
          ? await onUploadFiles(files)
          : defaultAttachmentsFromFiles(files);
        setAttachments((prev) => [...prev, ...nextItems]);
      } finally {
        setUploading(false);
      }
      notifyDraft();
    },
    [onUploadFiles, notifyDraft],
  );

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const list = event.target.files;
    const files = list ? Array.from(list) : [];
    event.target.value = '';
    await uploadFilesBatch(files);
  };

  const handleDrop = async (event: React.DragEvent) => {
    if (effectiveDisabled) return;
    if (!hasFileKindPayload(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);

    const dt = event.dataTransfer;
    const files = Array.from(dt.files ?? []);

    if (files.length > 0) {
      await uploadFilesBatch(files);
      return;
    }

    const refs = await collectDroppedPathReferences(dt);
    if (refs.length === 0) return;

    const pathItems: TypeClawAttachmentItem[] = refs.map((token) => {
      const raw = token.replace(/^@/, '');
      const wire = token.startsWith('@') ? token : `@${raw}`;
      return {
        id: crypto.randomUUID(),
        label: wire,
      };
    });
    setAttachments((prev) => [...prev, ...pathItems]);
    notifyDraft();
  };

  const canSend = connected && !isRunning && !uploading && !(
    attachments.length === 0 && isEmptyRoot(editorRef.current)
  );

  return (
    <div
      className={`${styles.inputBox} ${dragOver ? styles.composerShellDrag : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`${styles.composerShell}`}
      >
        {attachments.length > 0 ? (
          <div className={styles.attachmentsRow}>
            {attachments.map((item) => (
              <span key={item.id} className={styles.refPill}>
                <span className={styles.refPillText} title={item.label}>
                  {item.label}
                </span>
                <button
                  type="button"
                  className={styles.refPillClose}
                  aria-label="删除附件"
                  onClick={() => removeAttachment(item.id)}
                >
                  <i className={styles.refPillCloseIcon} />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div
          ref={editorRef}
          className={`${styles.editor} ${effectiveDisabled ? styles.editorDisabled : ''}`}
          contentEditable={!effectiveDisabled}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          data-placeholder={placeholder}
          data-show-placeholder={showPh ? 'true' : 'false'}
          onInput={handleInput}
          onBeforeInput={handleBeforeInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className={styles.fileInputHidden}
            aria-hidden="true"
            onChange={handleFileInputChange}
          />
          <button
            type="button"
            className={styles.skillBadge}
            disabled={effectiveDisabled}
            onClick={() => {
              aplus.record('/alphashop.clawchat.upload', 'CLK');
              fileInputRef.current?.click();
            }}
          >
            <img src={UPLOAD_ICON_URL} alt="上传" className={styles.uploadIcon} />
          </button>

          <button
            type="button"
            className={styles.skillBadge}
            onClick={() => {
              aplus.record('/alphashop.clawchat.skilllist', 'CLK');
              setSkillModalOpen(true);
            }}
          >
            <div className={styles.skillInner}>
              <img className={styles.skillIcon} src={SKILL_ICON_URL} alt="" />
              <span className={styles.skillLabel}>技能</span>
            </div>
            <span className={styles.skillCount}>{clawSkillListStore.enabledSkillCount}</span>
          </button>
        </div>

        <div
          onClick={() => {
            aplus.record('/alphashop.clawchat.submit', 'CLK');
          }}
        >
          {isRunning ? (
            <img src={PAUSE_ICON_URL} alt="停止" className={styles.stopBtn} onClick={onStop} />
          ) : (
            canSend ? (
              <SendIcon
                className={styles.sendBtn}
                type="gradient"
                aria-label="发送"
                onClick={onSend}
              />
            ) : (
              <SendIcon
                className={styles.sendBtn}
                data-disabled
                aria-label="发送已禁止"
                onClick={onSend}
              />
            )
          )}
        </div>
      </div>
      <SkillConfigModal open={skillModalOpen} onClose={() => setSkillModalOpen(false)} />
    </div>
  );
});

export const ClawChatComposer = observer(ClawChatComposerInner);

export type { TypeClawAttachmentItem } from './types';

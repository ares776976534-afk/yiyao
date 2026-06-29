import React, { useRef, useEffect, useState } from 'react';
import styles from './index.module.css';
import { $t } from '@/i18n';
import { appVersionType, AppVersionType } from '@/utils/env';

const isGlobal = appVersionType === AppVersionType.GLOBAL;


interface InputAreaProps {
  onChange?: (value: string) => void;
  placeholder?: string;
  handleEnter?: () => void;
  value?: string;
  parentContainerRef?: React.RefObject<HTMLDivElement> | null;
  defaultValue?: string;
  onFocus?: () => void;
}

export default ({
  value,
  onChange = () => { },
  placeholder = $t("global-1688-ai-app.select-product.ChatInput.InputArea.ncn", "你可以向我继续提问..."),
  handleEnter = () => { },
  parentContainerRef = null,
  defaultValue = '',
  onFocus,
}: InputAreaProps) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  const handleChange = () => {
    if (contentEditableRef.current) {
      const text = contentEditableRef.current.innerText;
      onChange?.(text);

      if (!isComposing) {
        const htmlContent = contentEditableRef.current.innerHTML;
        if (htmlContent.includes('<') && htmlContent.includes('>') && htmlContent !== text) {
          document.execCommand('selectAll', false);
          document.execCommand('insertText', false, text);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 需要判断输入法
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleEnter();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text || !contentEditableRef.current) return;

    // 使用更安全的方式插入文本，保持输入法上下文
    if (document.queryCommandSupported('insertText')) {
      // 使用浏览器原生的命令插入文本
      document.execCommand('insertText', false, text);
    } else {
      // 如果不支持insertText命令，则使用替代方案
      // 获取当前选区
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      // 删除选中内容并插入纯文本
      const range = selection.getRangeAt(0);
      range.deleteContents();

      // 使用文本节点插入内容
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      // 将光标移动到插入的文本后面
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // 手动触发handleChange以更新状态
    setTimeout(handleChange, 0);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // 处理点击inputContent区域的事件
  const handleInputContentClick = (e: MouseEvent) => {
    // 如果点击的是内容区域，但不是可编辑的div本身
    if (e.target instanceof Node && e.target !== contentEditableRef.current && contentEditableRef.current) {
      // 让可编辑的div获得焦点
      contentEditableRef.current.focus();

      // 使用更安全的方式设置光标位置
      try {
        const selection = window.getSelection();
        if (!selection) return;

        if (contentEditableRef.current.childNodes.length > 0) {
          // 如果有文本节点，则将光标设置到文本末尾
          const lastNode = contentEditableRef.current.childNodes[contentEditableRef.current.childNodes.length - 1];
          const range = document.createRange();
          range.selectNodeContents(lastNode);
          range.collapse(false); // false表示将光标设置到节点的末尾
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // 如果没有文本节点，则创建一个空范围
          const range = document.createRange();
          range.setStart(contentEditableRef.current, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (e) {
        console.error('Failed to set cursor position', e);
      }
    }
  };

  useEffect(() => {
    if (contentEditableRef.current && value === '') {
      contentEditableRef.current.innerText = '';
    }
  }, [value]);

  useEffect(() => {
    if (contentEditableRef.current && defaultValue !== '') {
      contentEditableRef.current.innerText = defaultValue;
    }
  }, [defaultValue]);

  useEffect(() => {
    if (parentContainerRef?.current) {
      parentContainerRef.current.addEventListener('click', handleInputContentClick);
      parentContainerRef.current.addEventListener('compositionstart', handleCompositionStart);
      parentContainerRef.current.addEventListener('compositionend', handleCompositionEnd);
      return () => {
        parentContainerRef.current?.removeEventListener('click', handleInputContentClick);
        parentContainerRef.current?.removeEventListener('compositionstart', handleCompositionStart);
        parentContainerRef.current?.removeEventListener('compositionend', handleCompositionEnd);
      };
    }
    return () => { };
  }, [parentContainerRef]);

  const handleFocus = () => {
    onFocus?.();
  };

  return (
    <div
      ref={contentEditableRef}
      contentEditable
      className={styles.textInput}
      style={{display: isGlobal ? 'block' : 'inline-block'}}
      onInput={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
      data-placeholder={placeholder}
      suppressContentEditableWarning
    />
  );
};
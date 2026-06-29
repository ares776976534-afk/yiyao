import React, { useMemo, useState, type ReactNode, type CSSProperties } from 'react';
import { DoubleLeftIcon, ChevronUpIcon } from '@/components/Icons';
import { $t } from '@/i18n';

export type AccordionItem = {
  key: string;
  title: ReactNode;
  content: ReactNode | (() => ReactNode);
  icon?: ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  activeKeys?: string[]; // 受控
  defaultActiveKeys?: string[]; // 非受控初始值
  onChange?: (nextKeys: string[]) => void;
  accordion?: boolean; // 是否单开
  className?: string;
  gap?: number; // 面板间距，默认 16
};

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // eslint-disable-next-line no-console
    console.error('Accordion content error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: '#a61d24' }}>{$t("global-1688-ai-app.SelectProduct.Accordion.cnsr", "内容出错，请稍后重试。")}</div>
      );
    }
    return this.props.children as any;
  }
}

export const Accordion = ({
  items,
  activeKeys,
  defaultActiveKeys,
  onChange,
  accordion = false,
  className,
  gap = 16,
}: AccordionProps) => {
  const isControlled = Array.isArray(activeKeys);
  const [internalKeys, setInternalKeys] = useState<string[]>(defaultActiveKeys || []);
  const currentKeys = isControlled ? (activeKeys as string[]) : internalKeys;

  const containerStyle = useMemo<CSSProperties>(
    () => ({ width: '100%', display: 'flex', flexDirection: 'column', rowGap: gap }),
    [gap],
  );

  const toggle = (key: string) => {
    const open = currentKeys.includes(key);
    let nextKeys: string[];
    if (open) {
      nextKeys = currentKeys.filter((existingKey) => existingKey !== key);
    } else {
      nextKeys = accordion ? [key] : [...currentKeys, key];
    }
    if (!isControlled) setInternalKeys(nextKeys);
    onChange?.(nextKeys);
  };

  return (
    <div className={className} style={containerStyle}>
      {items.map((item) => {
        const open = currentKeys.includes(item.key);
        return (
          <div
            key={item.key}
            className={`border-[1px] border-[#F3F3F6] rounded-[16px] ${open ? 'bg-[#FBFBFD]' : 'bg-white'}`}
          >
            <button
              type="button"
              onClick={() => toggle(item.key)}
              className="w-full flex items-center justify-between px-[16px] py-[12px] text-left"
            >
              <div className="flex items-center">
                {item.icon}
                <span className={item.icon ? 'ml-2' : ''}>{item.title}</span>
              </div>
              {/* <span className="ml-auto text-[#7B7B8D] text-[14px]">{open ? '' : '展开查看'}</span> */}
              {open ? (
                <ChevronUpIcon className="ml-2 text-[#7B7B8D]" size={11} />
              ) : (
                <DoubleLeftIcon className="ml-2 text-[#7B7B8D]" size={11} />
              )}
            </button>
            <div className={`pl-[16px] pr-[16px] pb-[16px] ${open ? 'block' : 'hidden'} transition-all duration-300`}>
              <ErrorBoundary>{typeof item.content === 'function' ? (item.content as any)() : item.content}</ErrorBoundary>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;

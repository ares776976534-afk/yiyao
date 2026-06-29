import React, { ReactNode } from 'react';
import { $t } from '@/i18n';

export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: any }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('AccordionItem content error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="text-red-500 p-4 border border-red-200 rounded">{$t("global-1688-ai-app.SelectProduct.ErrorBoundary.cnsr", "内容出错，请稍后重试。")}</div>
      );
    }
    return this.props.children as any;
  }
}
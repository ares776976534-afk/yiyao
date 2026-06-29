import React, { useEffect, useRef, useMemo } from 'react';
import { $t } from '@/i18n';

interface TypeAutoTriggerRightPanelProps {
  onMoreClick?: (rightSideType: string, rightSideData: any) => void;
  RightComponent?: React.ComponentType<any>;
  shouldShowRightPanel?: boolean;
  rightSideType?: string;
  cardId?: string;
  detail?: any;
  readonly?: boolean;
}

/**
 * 自动触发右侧面板显示的组件
 * 当 LeftComponent 为 null 时使用此组件，不渲染任何 UI，只负责触发右侧面板的显示
 */
const AutoTriggerRightPanel: React.FC<TypeAutoTriggerRightPanelProps> = ({
  onMoreClick,
  RightComponent,
  shouldShowRightPanel,
  rightSideType,
  cardId,
  detail,
  readonly = false,
}) => {
  const hasAutoOpenedRef = useRef(false);

  // 确定实际使用的 rightSideType
  const actualRightSideType = useMemo(() => {
    return (shouldShowRightPanel && 'INQUIRY_REQUIREMENT_FORM') ||
           (rightSideType && rightSideType !== '' ? rightSideType : undefined) ||
           'INQUIRY_REQUIREMENT_FORM';
  }, [shouldShowRightPanel, rightSideType]);

  // 当需要显示右侧面板时，自动触发（只在第一次且 shouldShowRightPanel 为 true 时）
  useEffect(() => {
    // 检查所有必要条件：shouldShowRightPanel 为 true，所有必要的 props 都存在，且还没触发过
    const shouldTrigger = shouldShowRightPanel &&
                         actualRightSideType &&
                         RightComponent &&
                         onMoreClick &&
                         !hasAutoOpenedRef.current;

    // 调试日志
    if (shouldShowRightPanel) {
      console.log('[AutoTriggerRightPanel] shouldShowRightPanel is true', {
        rightSideType,
        actualRightSideType,
        hasRightComponent: !!RightComponent,
        hasOnMoreClick: !!onMoreClick,
        hasAutoOpened: hasAutoOpenedRef.current,
        shouldTrigger,
      });
    }

    if (shouldTrigger) {
      hasAutoOpenedRef.current = true;
      console.log('[AutoTriggerRightPanel] 自动拉起右侧面板', { actualRightSideType, cardId });
      // 使用 requestAnimationFrame 确保 DOM 已经渲染完成，然后再延迟一点
      requestAnimationFrame(() => {
        setTimeout(() => {
          onMoreClick(actualRightSideType, {
            RightComponent,
            title: $t("global-1688-ai-app.inquiry.FormatList.LeftComponents.AutoTriggerRightPanel.xom", "询盘需求确认"),
            cardId,
            detail,
            readonly, // 根据 detail 是否有值决定是否只读
          });
        }, 200);
      });
    }
  }, [
    shouldShowRightPanel,
    actualRightSideType,
    RightComponent,
    onMoreClick,
    cardId,
    detail,
    readonly,
    rightSideType,
  ]);

  // 不渲染任何 UI
  return null;
};

export default AutoTriggerRightPanel;


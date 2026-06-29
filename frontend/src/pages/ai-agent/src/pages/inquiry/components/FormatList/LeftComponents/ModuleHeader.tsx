import React, { useEffect } from 'react';
import styles from './ModuleHeader.module.css';
import { $t } from '@/i18n';

interface TypeModuleHeaderProps {
  title: string;
  status: 'IN_PROGRESS' | 'FINISHED';
  moduleName?: string;
  shouldShowRightPanel?: boolean;
  rightSideType?: string;
  RightComponent?: React.ComponentType<any>;
  onMoreClick?: (rightSideType: string, rightSideData: any) => void;
  cardId?: string;
}

const ModuleHeader: React.FC<TypeModuleHeaderProps> = ({
  title,
  status,
  shouldShowRightPanel,
  rightSideType,
  RightComponent,
  onMoreClick,
  cardId,
}) => {
  const isInProgress = status === 'IN_PROGRESS';

  // 当需要显示右侧面板时，自动触发
  useEffect(() => {
    if (
      shouldShowRightPanel &&
      rightSideType &&
      RightComponent &&
      onMoreClick
    ) {
      // 延迟一下确保组件已经挂载完成
      const timer = setTimeout(() => {
        onMoreClick(rightSideType, {
          RightComponent,
          title: $t("global-1688-ai-app.inquiry.FormatList.LeftComponents.ModuleHeader.xom", "询盘需求确认"),
          cardId,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    shouldShowRightPanel,
    rightSideType,
    RightComponent,
    onMoreClick,
    cardId,
  ]);

  return (
    <div className={styles.moduleHeader}>
      <div className={styles.headerContent}>
        {/* {isInProgress && <div className={styles.statusIndicator} />} */}
        <div className={styles.titleContainer}>
          <div className={styles.title}>{title}</div>
        </div>
      </div>
    </div>
  );
};

export default ModuleHeader;

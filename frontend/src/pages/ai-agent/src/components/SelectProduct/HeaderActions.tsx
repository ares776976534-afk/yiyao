import React from 'react';
import { Button } from 'antd';
import { FullscreenIcon, CloseIcon, ShareIcon, DownloadIcon, ExternalLink } from '@/components/Icons';
import { useChatHistory } from '@/pages/select-product/components/ChatHistory/useChatHistory';
import styles from './headerActions.module.css';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { $t } from '@/i18n';
import FeedbackCard from './FeedbackCard';
import { MaximizeIcon, MinimizeIcon, NewCloseIcon } from '@/components/Icon';

// oppScene 到 LOG_KEY 的映射
const OPP_SCENE_TO_LOG_KEY: Record<string, string> = {
  algo: LOG_KEYS.GENERAL_AGENT.LP.EXPORT_REPORT,
  new_product_discovery: LOG_KEYS.NEW_PRODUCT_AGENT.LP.EXPORT_REPORT,
  product_improvement: LOG_KEYS.IMPROVE_AGENT.LP.EXPORT_REPORT,
  country_market_migration: LOG_KEYS.COUNTRY_AGENT.LP.EXPORT_REPORT,
  platform_market_migration: LOG_KEYS.PLATFORM_AGENT.LP.EXPORT_REPORT,
};
export interface FeedbackProps {
  selectedOptions: { label: string; value: string }[];
  feedbackText: string;
}
export type HeaderActionsProps = {
  onExportReport?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onFullscreen?: () => void;
  onClose?: () => void;
  className?: string;
  showDownload?: boolean; // 优先级高于是否传入 onDownload
  showShare?: boolean; // 优先级高于是否传入 onShare
  showFullscreen?: boolean; // 优先级高于是否传入 onFullscreen
  showClose?: boolean; // 优先级高于是否传入 onClose
  iconSize?: number;
  fullscreen?: boolean;
  showExportReport?: boolean;
  exportLoading?: boolean; // 导出报告的loading状态
  sessionId?: string;
  taskId?: string;
  oppScene?: string; // 用于区分不同agent的埋点
};

const HeaderActions: React.FC<HeaderActionsProps> = ({
  fullscreen,
  onExportReport,
  onDownload,
  onShare,
  onFullscreen,
  onClose,
  className,
  showDownload,
  showShare,
  showFullscreen,
  showClose,
  iconSize = 16,
  showExportReport,
  exportLoading = false,
  sessionId,
  taskId,
  oppScene,
}) => {
  const { shareCode } = useChatHistory();
  const shouldShowDownload = typeof showDownload === 'boolean' ? showDownload : Boolean(onDownload);
  const shouldShowShare = typeof showShare === 'boolean' ? showShare : Boolean(onShare);
  const shouldShowFullscreen = typeof showFullscreen === 'boolean' ? showFullscreen : Boolean(onFullscreen);
  const shouldShowClose = typeof showClose === 'boolean' ? showClose : Boolean(onClose);
  const shouldShowExportReport = typeof showExportReport === 'boolean' ? showExportReport : Boolean(onExportReport);

  return (
    <div className={`flex items-center ${className || ''} relative`}>
      <FeedbackCard sessionId={sessionId} taskId={taskId} />
      {(shouldShowExportReport && !shareCode) && (
        <>
          <Button
            type="primary"
            icon={<DownloadIcon />}
            style={{ marginRight: 12 }}
            onClick={() => {
              onExportReport?.();
              // 埋点：导出报告，根据 oppScene 区分不同 agent
              const logKey = oppScene && OPP_SCENE_TO_LOG_KEY[oppScene];
              if (logKey) {
                log.record(logKey as `/${string}.${string}.${string}`, 'CLK', {
                  oppScene: oppScene || '',
                });
              }
            }}
            ghost
            loading={exportLoading}
            disabled={exportLoading}
            className={styles.exportReportBtn}
          >
            {exportLoading ? $t("global-1688-ai-app.SelectProduct.HeaderActions.exportz", "导出中...") : $t("global-1688-ai-app.SelectProduct.HeaderActions.exportbg", "导出报告")}
          </Button>
        </>
      )}
      {shouldShowDownload && (
        <Button
          shape="round"
          icon={<DownloadIcon size={iconSize} />}
          style={{ marginRight: 12 }}
          onClick={onDownload}
        >{$t("global-1688-ai-app.SelectProduct.HeaderActions.download", "下载")}</Button>
      )}

      {shouldShowShare && (
        <ShareIcon
          size={iconSize}
          style={{ marginRight: 12, cursor: 'pointer' }}
          onClick={onShare}
        />
      )}

      {shouldShowFullscreen && (
        fullscreen ? (
          <div
            style={{ marginRight: 12, cursor: 'pointer' }}
            onClick={onFullscreen}
            className={`${styles.commonStyle}`}
          >
            <MaximizeIcon />
          </div>
        ) : (
          <div className={`${styles.fullscreen} ${styles.commonStyle}`} onClick={onFullscreen}>
            <MinimizeIcon />
          </div>
        )
      )}

      {shouldShowClose && (
        <div className={styles.commonStyle} onClick={onClose}>
          <NewCloseIcon />
        </div>

      )}
    </div>
  );
};

export default HeaderActions;

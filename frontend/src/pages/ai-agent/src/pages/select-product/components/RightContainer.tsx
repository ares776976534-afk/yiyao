import React, { type PropsWithChildren, useState, useRef } from "react";
import HeaderBar from "@/components/SelectProduct/HeaderBar";
import { downloadReport } from "../services";
import { message } from "antd";
import { ErrorBoundary } from "@/components/SelectProduct/ErrorBoundary";
import { $t } from "@/i18n";

type TypeRightContainerProps = PropsWithChildren<{
  rightSideType: string;
  rightSideData: any;
  setRightSideType: (rightSideType: string) => void;
  setLeftSideType: (leftSideType: string) => void;
  leftSideType: string;
  onActionClick: (sideType: string, data: any) => void;
  isReplay: boolean;
  showReplayResult: boolean;
  setShowReplayResult: (show: boolean) => void;
  userRequest?: any;
  moduleStatus?: string;
}>;

export const RightContainer: React.FC<TypeRightContainerProps> = ({
  rightSideType,
  rightSideData,
  setRightSideType,
  setLeftSideType,
  leftSideType,
  onActionClick,
  isReplay,
  showReplayResult,
  setShowReplayResult,
  userRequest,
}) => {
  const {
    title,
    SlotTitle,
    subtitle,
    RightComponent,
    taskId,
    oppScene,
    sessionId,
    onExportReport: onExportReportFn,
    moduleStatus,
    Tooltip,
  } = rightSideData;
  const showKeyword = rightSideData?.keywordList?.find(
    (item: any) => item.keyword === rightSideData?.defaultShowKeyword
  )?.showKeyword;
  const [exportLoading, setExportLoading] = useState(false);
  // console.log('onExportReportFn', onExportReportFn);
  const onExportReport = () => {
    if (exportLoading) return; // 防止重复点击
    setExportLoading(true);
    downloadReport({
      title,
      taskId,
      oppScene,
      sessionId,
    })
      .then((res) => {
        const { success, msg, downloadUrl } = res;
        if (success) {
          setExportLoading(false);
          window.open(downloadUrl);
        } else {
          setExportLoading(false);
          message.error(
            msg ||
            $t(
              "global-1688-ai-app.select-product.RightContainer.exportFailed",
              "导出失败"
            )
          );
        }
      })
      .catch((error) => {
        setExportLoading(false);
        message.error("导出失败，请重试");
      })
      .finally(() => {
        setExportLoading(false);
      });
  };
  // 判断是否为 inquiry 相关的右侧面板类型
  const isInquiryRightPanel =
    rightSideType === "INQUIRY_REQUIREMENT_FORM" ||
    rightSideType === "INQUIRY_PROGRESS" ||
    rightSideType === "REPORT_CONTENT";

  // 填写进度状态（仅用于 INQUIRY_REQUIREMENT_FORM）
  const [formProgress, setFormProgress] = useState(0);

  // 导出报告函数（从 ReportContent 组件获取）
  const exportReportFnRef = useRef<(() => Promise<void>) | null>(null);
  const [exportReportLoading, setExportReportLoading] = useState(false);

  // 处理导出报告点击
  const handleExportReportClick = async () => {
    if (exportReportFnRef.current && !exportReportLoading) {
      setExportReportLoading(true);
      try {
        await exportReportFnRef.current();
      } finally {
        setExportReportLoading(false);
      }
    }
  };
  if (RightComponent) {
    if (typeof window !== 'undefined' && (rightSideType === 'REPORT_CARD' || rightSideType === 'REPORT_CONTENT')) {
      console.log('[RightContainer] REPORT render', {
        rightSideType,
        cardId: rightSideData?.cardId,
        rawDataType: typeof rightSideData?.rawData,
        rawDataLength: typeof rightSideData?.rawData === 'string' ? rightSideData.rawData.length : 0,
        keys: rightSideData ? Object.keys(rightSideData) : [],
      });
    }
    return (
      <div
        className={
          " bg-[#FFFFFF] rounded-[16px] border border-[#F3F3F6] shadow-[0px_2px_24px_0px_rgba(0,0,0,0.03)] p-[20px] w-full flex flex-col"
        }
      >
        <HeaderBar
          slotTitle={
            SlotTitle ? (
              <SlotTitle {...rightSideData} moduleStatus={moduleStatus} />
            ) : null
          }
          sessionId={sessionId}
          taskId={taskId}
          oppScene={oppScene}
          tooltip={Tooltip ? <Tooltip /> : null}
          title={title}
          subtitle={subtitle}
          subtitlePosition={rightSideType === "REPORT_CONTENT" ? "right" : "left"}
          subtitleClassName={
            rightSideType === "REPORT_CONTENT" && subtitle
              ? "rounded-[6px] bg-[#FFFFFF] box-border border border-[#6E50FF] px-[10px] py-[6px] font-['PingFang SC'] text-[13px] font-normal leading-[18px] tracking-normal text-[#6E50FF] cursor-pointer"
              : undefined
          }
          subtitleOnClick={
            rightSideType === "REPORT_CONTENT" && subtitle ? handleExportReportClick : undefined
          }
          subtitleLoading={
            rightSideType === "REPORT_CONTENT" && subtitle ? exportReportLoading : false
          }
          fullscreen={!leftSideType}
          customRightContent={
            // INQUIRY_REQUIREMENT_FORM 时显示填写进度（只读模式下不显示）
            rightSideType === "INQUIRY_REQUIREMENT_FORM" &&
              !rightSideData?.readonly ? (
              <div className="flex items-baseline">
                <span className="text-[14px] text-[#7C7F9A] mr-[4px]">
                  {$t(
                    "global-1688-ai-app.select-product.RightContainer.txjd",
                    "填写进度:"
                  )}
                </span>
                <span className="font-['AlibabaSans102'] text-[20px] text-[#6150FF] font-bold">
                  {formProgress}%
                </span>
              </div>
            ) : undefined
          }
          actions={{
            // onDownload,
            // onShare,
            // inquiry 页面隐藏展开/关闭按钮
            ...(isInquiryRightPanel
              ? {}
              : {
                onFullscreen: () => {
                  if (leftSideType) {
                    setLeftSideType("");
                  } else {
                    setLeftSideType("full");
                  }
                },
                onClose: () => {
                  setLeftSideType("left");
                  setRightSideType("");
                },
              }),
            ...(showKeyword || onExportReportFn
              ? { onExportReport: (onExportReportFn === true ? onExportReport : onExportReportFn) || onExportReport }
              : {}),
          }}
          className="mb-[20px]"
        />
        <div className="overflow-y-auto h-[calc(100vh-100px)] w-full">
          <ErrorBoundary>
            <RightComponent
              moduleStatus={moduleStatus}
              isReplay={isReplay}
              key={rightSideType === 'REPORT_CARD' ? `${rightSideType}-${rightSideData?.cardId ?? ''}` : rightSideType}
              {...rightSideData}
              onActionClick={onActionClick}
              showReplayResult={showReplayResult}
              setShowReplayResult={setShowReplayResult}
              onProgressChange={
                rightSideType === "INQUIRY_REQUIREMENT_FORM"
                  ? setFormProgress
                  : undefined
              }
              onExportReady={
                rightSideType === "REPORT_CONTENT"
                  ? (exportFn: () => Promise<void>) => {
                      exportReportFnRef.current = exportFn;
                    }
                  : undefined
              }
            />
          </ErrorBoundary>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

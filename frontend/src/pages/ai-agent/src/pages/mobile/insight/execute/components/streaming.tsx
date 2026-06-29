import useChatStream from '@/pages/select-product/hooks/useChatStream'
import { useSelectProductStore } from "@/stores/select-product";
import React, { useCallback, type ReactNode, useEffect, useState, useRef } from "react";
import { commonRecord } from "@/utils/log";
import { TaskCard } from './index';
import handleReplaceUrlToSeesion from '@/utils/replaceSeesion';
import { useChatHistory } from "@/pages/select-product/components/ChatHistory/useChatHistory";
import './index.css';
import Navigation from "./navigation";
import styles from './streaming.module.scss';
import { useNavigateWithScroll } from "@/hooks/useNavigateWithScroll";
import { serviceBaseUrl, selApiBaseUrl } from "@/utils/env";
import { StatusEnum } from '@/pages/select-product/config';
import { v4 as uuidv4 } from "uuid";
import TaskProgress from "./taskProgress";
import { useSourceFrom } from "@/hooks/useUtils";

interface TypeStreamingProps {
  reqComponent: React.ReactNode;
  fetchUrl: string;
  productFormatList: any;
  title: string;
  onBack?: any;
  disableChatHistory?: boolean;
  showTaskProgress?: boolean;
}

const Streaming = ({
  reqComponent,
  fetchUrl,
  productFormatList,
  title,
  onBack,
  disableChatHistory = false,
  showTaskProgress = true,
}: TypeStreamingProps) => {
  const sourceFrom = useSourceFrom();
  const {
    blocks,
    getStream,
    isStreaming,
    sessionId,
    setIsReplay,
    clearBlocks,
    setShowReplayResult,
    setSessionId,
    setTaskId,
    pushBlock,
    isReplay,
    processStatus,
    hasRequestError
  } = useChatStream(productFormatList, { replayInterval: 300 });
  const navigator = useNavigateWithScroll();
  const [rightSideData, setRightSideData] = useState<any>({});
  const selectProductStore = useSelectProductStore();
  const [visible, setVisible] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [sortSelectedToFirst, setSortSelectedToFirst] = useState(false); // 是否将选中项排到第一位
  const { chatHistorySessionId, shareCode } = useChatHistory();
  const wasStreamingRef = useRef(false);
  const handleSelectKeyword = useCallback((keyword: string, fromKeywordsTable?: boolean) => {
    setSelectedKeyword(keyword);
    setSortSelectedToFirst(!!fromKeywordsTable);
  }, []);

  const onMaskClick = () => {
    setVisible(false)
  }
  // useEffect(() => {
  //   if (selectProductStore.isFormSubmitted) {
  //     const { __submit_type__, ...params } = selectProductStore.getFormattedPayload();
  //     getStream({ fetchUrl, params });
  //   }
  // }, [selectProductStore.isFormSubmitted]);
  const handlePushUserInput = (data: any) => {
    pushBlock({
      cardId: `user_input_${uuidv4()}`,
      cardType: "USER_REQUEST",
      collapsible: false,
      defaultExpanded: true,
      eventType: "USER_INPUT",
      sessionId: sessionId,
      showIcon: false,
      rawData: data,
      textType: "info",
      timestamp: new Date().getTime(),
      title: '结果输出',
    });
  };
  useEffect(() => {
    if (
      selectProductStore.isFormSubmitted &&
      (!chatHistorySessionId || disableChatHistory) &&
      !shareCode
    ) {
      if (wasStreamingRef.current) {
        return;
      }
      wasStreamingRef.current = true;
      const { __submit_type__, ...params } =
        selectProductStore.getFormattedPayload();
      if (__submit_type__ === "user_input") {
        handlePushUserInput(params);
      }
      getStream({ fetchUrl, params });
    } else if (!selectProductStore.isFormSubmitted) {
      wasStreamingRef.current = false;
    }
  }, [selectProductStore.isFormSubmitted]);
  const renderBlock = useCallback((block: any): ReactNode => {
    const isAccordion = block.cardType === "MODULE";
    if (isAccordion) {
      const { accordionContent, moduleName, cardId, needHide, icon } = block;
      return (
        <TaskCard
          title={moduleName}
          icon={icon || ''}
        >
          {accordionContent?.map((contentBlock) => {
            if (!contentBlock || contentBlock.hide === true) return null;
            const { LeftComponent } = contentBlock;
            if (LeftComponent) {
              return (
                <div key={contentBlock.cardId} className={`plan-content-item plan-content-item-${contentBlock.cardType}`}>
                  <LeftComponent
                    {...contentBlock}
                    getStream={getStream}
                    type='mobile'
                    onMoreClick={(
                      _rightSideType,
                      _rightSideData,
                      moduleStatusParmas,
                    ) => {
                      switch (_rightSideType) {// 选择关键词
                        case "SELECT_KEYWORDS":
                          commonRecord(
                            `选择关键词`
                          );
                          getStream({
                            fetchUrl,
                            params: {
                              ...selectProductStore.getFormattedPayload(),
                              ..._rightSideData,
                              extInfos: {
                                executeStatus: "new",
                              },
                            },
                          });
                          break;
                      }
                    }}
                  />
                </div>
              )
            } else {
              return null;
            }
          })}
        </TaskCard>
      )
    } else {
      const { LeftComponent } = block;
      if (LeftComponent) {
        return (
          <LeftComponent
            key={block.cardId}
            {...block}
            getStream={getStream}
            type='mobile'
            selectedKeyword={selectedKeyword}
            onSelectKeyword={handleSelectKeyword}
            sortSelectedToFirst={sortSelectedToFirst}
            onMoreClick={(
              _rightSideType,
              _rightSideData,
              moduleStatusParmas,
            ) => {
              switch (_rightSideType) {
                case "REPORT_CARD":
                  setVisible(true);
                  setRightSideData(_rightSideData);
                  break;
                // 选择关键词
                case "SELECT_KEYWORDS":
                  commonRecord(
                    `选择关键词`
                  );
                  getStream({
                    fetchUrl,
                    params: {
                      ...selectProductStore.getFormattedPayload(),
                      ..._rightSideData,
                      extInfos: {
                        executeStatus: "new",
                      },
                    },
                  });
                  break;
                default:
                  break;
              }
            }}
          />
        );
      } else {
        return null;
      }
    }
  }, [selectedKeyword, handleSelectKeyword, sortSelectedToFirst]);
  const renderComponent = useCallback((rightSideData: any): ReactNode => {
    const { RightComponent } = rightSideData;
    return (
      <RightComponent
        {...rightSideData}
        selectedKeyword={selectedKeyword}
        onSelectKeyword={handleSelectKeyword}
        visible={visible}
        onMaskClick={onMaskClick}
      />
    )
  }, [visible, selectedKeyword, handleSelectKeyword]);
  useEffect(() => {
    if (isStreaming && sessionId && !shareCode && !chatHistorySessionId) {
      handleReplaceUrlToSeesion(sessionId);
    }
  }, [isStreaming, sessionId]);

  useEffect(() => {
    if (isStreaming) {
      wasStreamingRef.current = true;
    }
    if (wasStreamingRef.current && !isStreaming && blocks.length > 0) {
      const reportBlock = blocks.find(b => b?.cardType === 'REPORT_CARD');
      if (reportBlock) {
        setVisible(true);
        setRightSideData(reportBlock);
      }
      wasStreamingRef.current = false;
    }
  }, [isStreaming, blocks]);
  const handleReplaySession = (_sessionId: string) => {
    handleInit({});
    selectProductStore.setFormSubmitted(true);
    getStream({
      fetchUrl: `${serviceBaseUrl}/opp/history/replay`,
      params: {
        sessionId: _sessionId,
        requestType: sourceFrom,
      },
    });
  };

  const handleReplayShareCode = (shareCode: string) => {
    handleInit({ clearReplay: false });
    selectProductStore.setFormSubmitted(true);
    getStream({
      fetchUrl: `${serviceBaseUrl}/opp/share/replayByShareCode`,
      params: {
        shareCode,
      },
    });
  };
  const handleInit = (opt?: { clearReplay?: boolean }) => {
    clearBlocks(opt);
    setShowReplayResult(false);
    setSessionId("");
    setTaskId("");
    selectProductStore.setFormSubmitted(false);
    selectProductStore.setStatus(StatusEnum.INIT);
  };
  useEffect(() => {
    if (shareCode) {
      setIsReplay(true);
      handleReplayShareCode(shareCode);
    } else if (chatHistorySessionId && !disableChatHistory) {
      handleReplaySession(chatHistorySessionId);
    }
    if (!chatHistorySessionId && !shareCode) {
      if (!disableChatHistory) {
        handleInit();
        setIsReplay(false);
      }
    }
  }, [chatHistorySessionId, shareCode]);
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigator("/mobile/home", { replace: true });
    }
  }
  return (
    <div className={styles.streaming}>
      <Navigation title={title} onBack={handleBack} sessionId={sessionId} />
      <div className={styles.main_content}>
        {reqComponent}
        {blocks.map((block) => block?.hide === true ? null : renderBlock(block))}
        {rightSideData?.RightComponent && renderComponent(rightSideData)}
      </div>
      {showTaskProgress && !isReplay && (
        <div className={styles.taskProgressWrapper}>
          <TaskProgress
            processStatus={processStatus}
            isStreaming={isStreaming}
            hasRequestError={hasRequestError}
            AnalyzeMoreKeywords={() => {
              commonRecord(
                `分析更多关键词`
              );
              getStream({
                fetchUrl: `${selApiBaseUrl}/opp/sel/api/get-keyword-list`,
                params: {
                  requestId: processStatus.sessionId,
                },
              });
            }}
          />
        </div>
      )}
    </div>
  )
};

export default Streaming;
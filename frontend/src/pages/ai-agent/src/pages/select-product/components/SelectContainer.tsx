import { useState, useMemo, useEffect, useRef } from "react";
import { message } from "antd";
import { LeftContainer } from "./LeftContainer";
import { RightContainer } from "./RightContainer";
import {
  HotDetailModal,
  ComparedDetailModal,
  ProductReportBoard,
} from "./RightComponents";
import { inquiryApiBaseUrl, selApiBaseUrl, serviceBaseUrl } from "@/utils/env";
import useChatStream from "../hooks/useChatStream";
import { useSelectProductStore } from "@/stores/select-product";
import {
  ReviewDetailModal,
  ImproveDetailModal,
  AnalysisDetailModal,
  ImproveReportBoard,
} from "./ImproveComponents";
import Layout from "./Layout";
import {
  CompareDetailModal,
  MigratedDetailModal,
  PlatformReportBoard,
} from "./PlatformComponents";
import { useNavigateWithScroll } from "@/hooks/useNavigateWithScroll";
import { v4 as uuidv4 } from "uuid";
import ChatHistory from "./ChatHistory";
import { useChatHistory } from "./ChatHistory/useChatHistory";
import { useSearchParams } from "ice";
import DebugMode from "./DebugMode";
import { StatusEnum } from "../config";
import { commonRecord } from "@/utils/log";
import { $t } from "@/i18n";
import { useFullScreen, useSourceFrom } from "@/hooks/useUtils";

interface SelectContainerProps {
  showBanner?: boolean;
  reqComponent: React.ReactNode;
  formatFnList: ((data: any, blocks: any[]) => any)[];
  fetchUrl: string;
  title?: string;
  showChatInput?: boolean;
  contentStyle?: React.CSSProperties;
  showTaskProgress?: boolean;
  leftPannelOpenStyle?: string;
  chatInput?: any;
  disableChatHistory?: boolean;
  chatHistory?: any;
  AccordionItemComponent?: React.ComponentType<{
    title: string;
    isExpanded: boolean;
    shouldStream: boolean;
    onChange: (expanded: boolean) => void;
    className?: string;
    children: React.ReactNode;
    status?: "IN_PROGRESS" | "FINISHED";
  }>;
  showUserInfo?: boolean;
  onBack?: any;
  showMakeSimilar?: boolean;
  chatHistoryOptions?: {
    btnText?: string;
    titleText?: string;
    historyLogKey?: string;
  };
  // 当右侧没有内容时，是否保持左侧卡片靠左对齐（而不是居中）
  keepLeftAlignedWhenNoRight?: boolean;
  // 自定义左侧容器的gap值
  gap?: string;
  containerStyle?: string;
  // 是否显示底部遮罩样式
  showLeftBottomMask?: boolean;
  // 自定义分享提示文案
  shareDescription?: string;
}

const Loading = () => {
  return (
    <div className="flex justify-center items-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[61px] h-[45px]">
      <img src="https://img.alicdn.com/imgextra/i1/O1CN01imFHUU1q2CW1kP190_!!6000000005437-54-tps-244-180.apng" alt="loading" className="w-full h-full" />
    </div>
  );
};

const SelectContainer = ({
  reqComponent,
  formatFnList,
  fetchUrl,
  title,
  showChatInput,
  showTaskProgress,
  contentStyle = {},
  leftPannelOpenStyle = "",
  chatInput = null,
  chatHistory = null,
  AccordionItemComponent,
  disableChatHistory = false,
  showUserInfo = true,
  showBanner,
  onBack = null,
  showMakeSimilar = true,
  chatHistoryOptions = {
    btnText: $t(
      "global-1688-ai-app.select-product.SelectContainer.dhls",
      "对话历史"
    ),
    titleText: $t(
      "global-1688-ai-app.select-product.SelectContainer.xplsjl",
      "选品历史记录"
    ),
  },
  keepLeftAlignedWhenNoRight = false,
  gap,
  containerStyle: _containerStyle = "",
  showLeftBottomMask = true,
  shareDescription,
}: SelectContainerProps) => {
  const [_streamingKeys, setStreamingKeys] = useState<string[]>([]);
  const [leftSideType, setLeftSideType] = useState<string>("left");
  const navigator = useNavigateWithScroll();
  const [rightSideType, setRightSideType] = useState<string>("");
  const [rightSideData, setRightSideData] = useState<any>({});
  const [rightSideCardId, setRightSideCardId] = useState<string>("");

  const [hotDetailModalOpen, setHotDetailModalOpen] = useState<boolean>(false);
  const [hotDetailData, setHotDetailData] = useState<any>({});
  const [comparedDetailModalOpen, setComparedDetailModalOpen] =
    useState<boolean>(false);
  const [comparedDetailData, setComparedDetailData] = useState<any>({});
  const [reviewDetailModalOpen, setReviewDetailModalOpen] =
    useState<boolean>(false);
  const [reviewDetailData, setReviewDetailData] = useState<any>({});
  const [analysisDetailModalOpen, setAnalysisDetailModalOpen] =
    useState<boolean>(false);
  const [analysisDetailData, setAnalysisDetailData] = useState<any>({});
  const [compareDetailModalOpen, setCompareDetailModalOpen] =
    useState<boolean>(false);
  const [compareDetailData, setCompareDetailData] = useState<any>({});
  const [migratedDetailModalOpen, setMigratedDetailModalOpen] =
    useState<boolean>(false);
  const [migratedDetailData, setMigratedDetailData] = useState<any>({});

  const [improveDetailModalOpen, setImproveDetailModalOpen] =
    useState<boolean>(false);
  const [improveDetailData, setImproveDetailData] = useState<any>({});

  const fullScreen = useFullScreen();
  const sourceFrom = useSourceFrom();

  const [moduleStatus, setModuleStatus] = useState<string>("");

  const initRef = useRef(false);

  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const urlSearchMode = searchParams.get('searchMode');

  const { chatHistorySessionId, shareCode } = useChatHistory();

  const _title = leftSideType && !rightSideType ? title : undefined;
  const containerStyle = _title && !fullScreen ? "h-[calc(100%-64px)]" : "h-full";

  const { leftPannelStyle, rightPannelStyle, containerJustify } =
    useMemo(() => {
      // 当启用 keepLeftAlignedWhenNoRight 且左侧有内容但右侧没有时，保留占位空间，让左侧卡片保持在左侧
      const shouldKeepLeftAligned =
        keepLeftAlignedWhenNoRight && leftSideType && !rightSideType;
      return {
        leftPannelStyle: leftSideType
          ? rightSideType
            ? "h-full w-[400px]"
            : `${!fullScreen ? "h-[calc(100vh-64px)]" : "h-full"} w-full ${leftPannelOpenStyle}`
          : "w-[0px] h-[0px] pr-[0px]",
        rightPannelStyle: rightSideType
          ? "flex-1 p-[16px_16px_16px_0] h-full animate-right-panel-open"
          : shouldKeepLeftAligned
            ? "flex-1 pointer-events-none"
            : "animate-right-panel-hidden h-[inherit]",
        containerJustify: shouldKeepLeftAligned
          ? "justify-start"
          : "justify-center",
      };
    }, [
      leftSideType,
      rightSideType,
      leftPannelOpenStyle,
      keepLeftAlignedWhenNoRight,
    ]);

  const {
    getStream,
    blocks,
    expandedPanelKeys,
    setExpandedPanelKeys,
    pushBlock,
    isStreaming,
    processStatus,
    sessionId,
    clearBlocks,
    replayStatus,
    isReplay,
    setIsReplay,
    showReplayResult,
    setShowReplayResult,
    setSessionId,
    setTaskId,
    userRequest,
    hasRequestError,
  } = useChatStream(formatFnList, { replayInterval: 300 });

  const selectProductStore = useSelectProductStore();
  const {
    hasTabHistory,
    setTabHistory,
    tabLoadingIndex,
    setTabLoadingIndex,
    getTabHistory,
    status: chatStatus,
  } = selectProductStore;

  // 处理流式展示状态变化
  const handleStreamingChange = (newStreamingKeys: string[]) => {
    setStreamingKeys(newStreamingKeys);
  };

  const handleExpandedChange = (key: string) => {
    if (expandedPanelKeys.includes(key)) {
      setExpandedPanelKeys(
        expandedPanelKeys.filter((keyItem) => keyItem !== key)
      );
    } else {
      setExpandedPanelKeys([...expandedPanelKeys, key]);
    }
  };

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
      title: $t(
        "global-1688-ai-app.select-product.SelectContainer.resultOutput",
        "结果输出"
      ),
    });
  };

  const handleChatSubmit = (data: any) => {
    handlePushUserInput(data);
    getStream({
      fetchUrl: fetchUrl || `${selApiBaseUrl}/opp/sel/api/algo/execute`,
      params: {
        ...data,
      },
    });
  };

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

  const handleDebugMode = () => {
    const _debugMode = searchParams.get("__debugMode__") || false;

    setDebugMode(_debugMode === "true");
  };

  const handleInit = (opt?: { clearReplay?: boolean }) => {
    clearBlocks(opt);
    setRightSideType("");
    setShowReplayResult(false);
    setSessionId("");
    setTaskId("");
    selectProductStore.setFormSubmitted(false);
    selectProductStore.setStatus(StatusEnum.INIT);
  };

  const handleReplaceUrlToSeesion = (_sessionId) => {
    let searchParams = new URLSearchParams(window.location.search);
    // 修改参数值
    searchParams.set("__chat_history_session__", _sessionId);
    searchParams.delete("__share_code__");
    searchParams.delete("__chat_input_cache_id__");
    searchParams.delete("__chat_input__");
    searchParams.delete("__is_make_similar__");
    // 创建一个新的 URL，但不替换当前的 URL，也不刷新页面
    let newUrl = `${window.location.origin}${window.location.pathname
      }?${searchParams.toString()}`;
    // 使用 pushState 替换当前的 URL，但不刷新页面
    window.history.pushState({}, "", newUrl);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigator("/home", { replace: true });
    }
  };

  useEffect(() => {
    if (
      selectProductStore.isFormSubmitted &&
      (!chatHistorySessionId || disableChatHistory) &&
      !shareCode
    ) {
      if (initRef.current) {
        return;
      }
      initRef.current = true;
      const { __submit_type__, ...params } =
        selectProductStore.getFormattedPayload();
      if (__submit_type__ === "user_input") {
        handlePushUserInput(params);
      }

      // mockData.forEach((item) => {
      //   pushBlock(item);
      // });
      // window.__pushBlock__ = pushBlock;
      // 如果URL中带有searchMode参数，则添加到负载中
      const finalParams = urlSearchMode ? { ...params, searchMode: urlSearchMode } : params;
      getStream({ fetchUrl, params: finalParams });
    } else if (!selectProductStore.isFormSubmitted) {
      initRef.current = false;
    }
  }, [selectProductStore.isFormSubmitted]);

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

  useEffect(() => {
    if (isStreaming && sessionId && !shareCode && !chatHistorySessionId) {
      handleReplaceUrlToSeesion(sessionId);
    }
  }, [isStreaming, sessionId]);

  useEffect(() => {
    // checkAuthAndLogin();
    handleDebugMode();
  }, []);
  return (
    <Layout
      title={_title}
      contentStyle={contentStyle}
      sessionId={sessionId}
      initFn={handleInit}
      showUserInfo={showUserInfo}
      showBanner={showBanner}
      onBack={handleBack}
    >
      {isStreaming && blocks.length === 0 && <Loading />}
      <div
        className={`${_containerStyle} flex ${containerJustify} items-start ${chatStatus === StatusEnum.RUNNING ? "bg-[#F9F9FC]" : "bg-[#FFF]"} ${containerStyle}`}
      >
        <div
          className={`overflow-y-auto ${leftPannelStyle} `}
        >
          {/* 左侧面板 */}
          <LeftContainer
            title={leftSideType && rightSideType ? title : undefined}
            onBack={handleBack}
            blocks={blocks}
            onStreamingChange={handleStreamingChange}
            onExpandedChange={handleExpandedChange}
            expandedKeys={expandedPanelKeys}
            className="w-full"
            reqComponent={reqComponent}
            isLoading={isStreaming}
            selectProductStore={selectProductStore}
            replayShareCodeFn={handleReplayShareCode}
            hasRequestError={hasRequestError}
            onMoreClick={(
              _rightSideType,
              _rightSideData,
              moduleStatusParmas,
            ) => {
              setModuleStatus(moduleStatusParmas || "");
              switch (_rightSideType) {
                case "HOT_DETAIL_MODAL":
                  commonRecord(`查看热销商品详情`);
                  setHotDetailModalOpen(true);
                  setHotDetailData(_rightSideData);
                  break;
                case "COMPARED_DETAIL_MODAL":
                  commonRecord(
                    `查看同款详情`);
                  setComparedDetailModalOpen(true);
                  setComparedDetailData(_rightSideData);
                  break;
                // 改进助手分析详情
                case "ANALYSIS_DETAIL_MODAL":
                  commonRecord(
                    `查看分析详情`
                  );
                  setAnalysisDetailModalOpen(true);
                  setAnalysisDetailData(_rightSideData);
                  break;
                case "MIGRATED_COMPARED_DETAIL_MODAL":
                  commonRecord(
                    `查看同款详情`
                  );
                  setCompareDetailModalOpen(true);
                  setCompareDetailData(_rightSideData);
                  break;
                case "MIGRATED_DETAIL_MODAL":
                  commonRecord(
                    `查看迁移详情`
                  );
                  setMigratedDetailModalOpen(true);
                  setMigratedDetailData(_rightSideData);
                  break;
                // 选择关键词
                case "SELECT_KEYWORDS":
                  setCompareDetailModalOpen(false);
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
                // 修改表单
                case "MODIFYFROM_CARD":
                  commonRecord(
                    `修改表单`
                  );
                  getStream({
                    fetchUrl,
                    params: {
                      ...selectProductStore.getFormattedPayload(),
                      ..._rightSideData,
                      extInfos: {
                        executeStatus: "resume",
                      },
                      searchMode: "KEYWORD_TEXT_ACCURATELY_SEARCH",
                    },
                  });
                  break;
                // 分析更多关键词
                case "ANALYSIS_MORE_KEYWORDS":
                  commonRecord(
                    `分析更多关键词`
                  );
                  getStream({
                    fetchUrl: `${selApiBaseUrl}/opp/sel/api/get-keyword-list`,
                    params: _rightSideData,
                  });
                  break;
                default:
                  setRightSideType(_rightSideType);
                  setRightSideData(_rightSideData);
                  break;
              }
              setRightSideCardId(_rightSideData.cardId || "");
            }}
            rightSideType={rightSideType}
            onChatSubmit={handleChatSubmit}
            showChatInput={showChatInput}
            isStreaming={isStreaming}
            processStatus={processStatus}
            showTaskProgress={showTaskProgress}
            rightSideData={rightSideData}
            rightSideCardId={rightSideCardId}
            getStream={getStream}
            chatInput={chatInput}
            sessionId={sessionId}
            AccordionItemComponent={AccordionItemComponent}
            replayStatus={replayStatus}
            isReplay={isReplay}
            showReplayResult={showReplayResult}
            setShowReplayResult={setShowReplayResult}
            userRequest={userRequest}
            showMakeSimilar={showMakeSimilar}
            gap={gap}
            showLeftBottomMask={showLeftBottomMask}
            shareDescription={shareDescription}
          />
        </div>

        {/* 右侧面板 */}
        <div
          className={`overflow-hidden pl-[16px] flex translate-x-[100%] ${rightPannelStyle}`}
        >
          <RightContainer
            moduleStatus={moduleStatus}
            rightSideType={rightSideType}
            setRightSideType={setRightSideType}
            rightSideData={rightSideData}
            leftSideType={leftSideType}
            isReplay={isReplay}
            setLeftSideType={setLeftSideType}
            showReplayResult={showReplayResult}
            setShowReplayResult={setShowReplayResult}
            onActionClick={(sideType, data) => {
              switch (sideType) {
                case "SUBMIT_INQUIRY_REQUIREMENT":
                  commonRecord(
                    `提交询盘需求`
                  );
                  getStream({
                    fetchUrl: `${inquiryApiBaseUrl}/api/inquiry/task/stream`,
                    params: {
                      data: {
                        ...data,
                      },
                      sessionId,
                    },
                  });
                  // 处理询盘需求表单提交
                  // import('@/pages/inquiry/services').then(({ postTask }) => {
                  //   postTask(data).then((res: any) => {
                  //     if (res?.data?.taskId) {
                  //       // 提交成功，触发后续 SSE 流（如果需要）
                  //       // 这里可以根据实际需求决定是否需要触发新的 SSE 请求
                  //       message.success('询盘任务已提交');
                  //       getStream({
                  //         fetchUrl: `${inquiryApiBaseUrl}/api/inquiry/task/stream`,
                  //         params: {
                  //           taskId: res?.data?.taskId,
                  //         },
                  //       });
                  //     } else {
                  //       message.error('创建询盘任务失败');
                  //     }
                  //   }).catch((err: any) => {
                  //     message.error(err.msg || '创建询盘任务失败');
                  //   });
                  // });
                  break;
                case "HOT_DETAIL_MODAL":
                  commonRecord(
                    `查看热销商品详情`
                  );
                  setHotDetailModalOpen(true);
                  setHotDetailData(data);
                  break;
                case "COMPARED_DETAIL_MODAL":
                  commonRecord(
                    `查看同款详情`
                  );
                  setComparedDetailModalOpen(true);
                  setComparedDetailData(data);
                  break;
                case "SWICH_KEYWORD": {
                  const { keyword, index, keywordList, type } = data;
                  commonRecord(
                    `切换关键词`
                  );
                  let RightComponent;
                  switch (type) {
                    case "platform":
                      RightComponent = PlatformReportBoard;
                      break;
                    case "improve":
                      RightComponent = ImproveReportBoard;
                      break;
                    case "product":
                      RightComponent = ProductReportBoard;
                      break;
                    default:
                      RightComponent = ProductReportBoard;
                      break;
                  }
                  if (hasTabHistory(index)) {
                    if (index === tabLoadingIndex) {
                      setRightSideType("REPORT_CARD");
                      setRightSideData({
                        ...getTabHistory(index),
                        RightComponent: RightComponent,
                      });
                    } else {
                      const _message = {
                        type: "TAB_SWITCH",
                        data: {
                          keyword,
                        },
                      };

                      const event = new MessageEvent("message", {
                        data: _message,
                        origin: window.location.origin,
                      });
                      window.dispatchEvent(event);
                    }
                  } else {
                    if (tabLoadingIndex !== -1) {
                      message.info(
                        $t(
                          "global-1688-ai-app.select-product.SelectContainer.ysds",
                          "有报告正在生成中，请等待当前报告生成结束"
                        )
                      );
                    } else {
                      getStream({
                        fetchUrl,
                        params: {
                          ...selectProductStore.getFormattedPayload(),
                          searchMode: "KEYWORD_TEXT_ACCURATELY_SEARCH",
                          searchContexts: [
                            {
                              contentType: "text",
                              productKeyword: keyword,
                            },
                          ],
                        },
                      });

                      setTabLoadingIndex(index);
                      setTabHistory(index, data);
                      setRightSideType("REPORT_CARD");
                      setRightSideData((pre) => {
                        return {
                          keywordList: keywordList?.map((item) => {
                            // eslint-disable-next-line @ali/no-unused-vars
                            const {
                              supplyInfo: _supplyInfo,
                              demandInfo: _demandInfo,
                              salesInfo: _salesInfo,
                              profitInfo: _profitInfo,
                              ...rest
                            } = item;
                            return rest;
                          }),
                          title: pre?.title,
                          defaultShowKeyword: keyword,
                          RightComponent: RightComponent,
                        };
                      });
                    }
                  }
                  break;
                }
                case "COMMENT_DETAIL_MODAL":
                  commonRecord(
                    `查看改进详情`
                  );
                  setImproveDetailModalOpen(true);
                  setImproveDetailData(data);
                  break;
                case "REVIEW_DETAIL_MODAL":
                  commonRecord(
                    `查看review详情`
                  );
                  setReviewDetailData(data);
                  setReviewDetailModalOpen(true);
                  break;
                case "ANALYSIS_DETAIL_MODAL":
                  commonRecord(
                    `查看分析详情`
                  );
                  setAnalysisDetailModalOpen(true);
                  setAnalysisDetailData(data);
                  break;
                case "MIGRATED_DETAIL_MODAL":
                  commonRecord(
                    `查看迁移详情`
                  );
                  setMigratedDetailModalOpen(true);
                  setMigratedDetailData(data);
                  break;
                case "MIGRATED_COMPARED_DETAIL_MODAL":
                  commonRecord(
                    `查看同款详情`
                  );
                  setCompareDetailModalOpen(true);
                  setCompareDetailData(data);
                  break;
              }
            }}
            userRequest={userRequest}
          />
        </div>

        <HotDetailModal
          open={hotDetailModalOpen}
          onClose={() => {
            setHotDetailModalOpen(false);
          }}
          data={hotDetailData}
        />

        <ComparedDetailModal
          open={comparedDetailModalOpen}
          onClose={() => {
            setComparedDetailModalOpen(false);
          }}
          data={comparedDetailData}
        />

        <ImproveDetailModal
          open={improveDetailModalOpen}
          onClose={() => {
            setImproveDetailModalOpen(false);
          }}
          data={improveDetailData}
        />

        <ReviewDetailModal
          open={reviewDetailModalOpen}
          onClose={() => {
            setReviewDetailModalOpen(false);
          }}
          data={reviewDetailData}
        />

        <AnalysisDetailModal
          open={analysisDetailModalOpen}
          onClose={() => {
            setAnalysisDetailModalOpen(false);
          }}
          data={analysisDetailData}
        />

        <CompareDetailModal
          open={compareDetailModalOpen}
          onClose={() => {
            setCompareDetailModalOpen(false);
          }}
          data={compareDetailData}
        />

        <MigratedDetailModal
          open={migratedDetailModalOpen}
          onClose={() => {
            setMigratedDetailModalOpen(false);
          }}
          data={migratedDetailData}
        />
      </div>
      {!rightSideType && chatHistory && (
        <>
          <div className="absolute top-[20px] left-[24px] z-[2]">
            <ChatHistory
              scence={chatHistory}
              btnText={chatHistoryOptions?.btnText}
              titleText={chatHistoryOptions?.titleText}
              historyLogKey={chatHistoryOptions?.historyLogKey}
            />
          </div>
          {/* <LanguageSettings /> */}
        </>
      )}
      {debugMode && <DebugMode pushBlock={pushBlock} />}
    </Layout>
  );
};

export default SelectContainer;

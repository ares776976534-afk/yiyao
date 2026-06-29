import React, {
  useState,
  useCallback,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { AccordionItem } from "./LeftComponents/AccordionItem";
import { ErrorBoundary } from "@/components/SelectProduct/ErrorBoundary";
import Navigation from "@/components/ChatFlow/Navigation";
import TaskProgress from "@/components/ChatFlow/TaskProgress";
import ChatInput from "./ChatInput";
import { ReplayStatus } from "../hooks/useChatStream";
import ReplayStatusBar from "./ReplayStatusBar";
import styles from "./leftContainer.module.css";
import { useFullScreen } from "@/hooks/useUtils";
import "./index.css";
export interface TypeContainerProps {
  blocks: any[];
  onStreamingChange?: (streamingKeys: string[]) => void;
  onExpandedChange?: (key: string) => void;
  expandedKeys: string[];
  className?: string;
  reqComponent: React.ReactNode;
  /**
   * 点击更多按钮回调
   * @param rightSideType 右侧类型
   * @param rightSideData 右侧数据
   * @param moduleStatus 模块状态(只有卡片是module类型时才有这个参数)
   */
  onMoreClick: (
    rightSideType: string,
    rightSideData: any,
    moduleStatus?: string
  ) => void;
  rightSideType: string;
  onChatSubmit: (data: any) => void;
  title?: string;
  onBack?: () => void;
  isLoading?: boolean; // 新增加载状态
  showChatInput?: boolean;
  isStreaming: boolean;
  processStatus?: any;
  showTaskProgress?: boolean;
  rightSideData?: any;
  rightSideCardId?: string;
  getStream: (params: any) => void;
  chatInput?: any;
  sessionId?: string;
  AccordionItemComponent?: React.ComponentType<{
    title: string;
    isExpanded: boolean;
    shouldStream: boolean;
    onChange: (expanded: boolean) => void;
    className?: string;
    children: ReactNode;
    status?: "IN_PROGRESS" | "FINISHED";
  }>;
  replayStatus?: ReplayStatus;
  isReplay?: boolean;
  showReplayResult?: boolean;
  setShowReplayResult?: (show: boolean) => void;
  selectProductStore?: any;
  replayShareCodeFn?: (shareCode: string) => void;
  userRequest?: any;
  showMakeSimilar?: boolean;
  hasRequestError?: boolean;
  gap?: string; // 自定义gap值，默认为16px
  showLeftBottomMask?: boolean; // 是否显示底部遮罩样式，默认为true
  shareDescription?: string; // 自定义分享提示文案
}

export interface TypeContainerState {
  openedOnceMap: Record<string, boolean>;
  streamingKeys: string[];
}

// 动态省略号组件
// const DynamicDots: React.FC = () => {
//   const [dots, setDots] = useState('');

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setDots(prev => {
//         if (prev === '...') return '';
//         return prev + '.';
//       });
//     }, 500); // 每500ms变化一次

//     return () => clearInterval(interval);
//   }, []);

//   return <span>思考中{dots}</span>;
// };

export const LeftContainer: React.FC<TypeContainerProps> = ({
  blocks,
  onStreamingChange,
  onExpandedChange,
  expandedKeys,
  className = "",
  reqComponent,
  onMoreClick,
  rightSideType,
  onChatSubmit,
  title,
  onBack,
  isLoading = false,
  showChatInput,
  isStreaming,
  processStatus,
  showTaskProgress = true,
  rightSideData,
  rightSideCardId,
  getStream,
  chatInput,
  sessionId,
  AccordionItemComponent = AccordionItem,
  replayStatus,
  isReplay,
  showReplayResult,
  setShowReplayResult,
  selectProductStore,
  replayShareCodeFn,
  userRequest,
  showMakeSimilar = true,
  hasRequestError = false,
  gap = '16px', // 默认gap为16px
  showLeftBottomMask = true, // 默认显示底部遮罩样式
  shareDescription,
}) => {
  const [state, setState] = useState<TypeContainerState>({
    openedOnceMap: {},
    streamingKeys: [],
  });
  const fullScreen = useFullScreen();
  // 使用ref来存储待执行的回调，避免在渲染过程中调用
  const pendingCallbacks = useRef<{
    streamingChange?: string[];
    expandedChange?: string[];
  }>({});
  const CustomChatInput = chatInput;
  // 处理折叠面板状态变化
  const handleAccordionChange = useCallback(
    (key: string, isExpanded: boolean) => {
      let newStreamingKeys: string[] = [...state.streamingKeys];

      if (isExpanded) {
        newStreamingKeys = newStreamingKeys.filter((k) => k === key);

        // 检查是否是首次打开，如果是则加入流式展示
        if (!state.openedOnceMap[key]) {
          newStreamingKeys = [key];
          setState((prevState) => ({
            ...prevState,
            openedOnceMap: { ...prevState.openedOnceMap, [key]: true },
            streamingKeys: newStreamingKeys,
          }));
          // 通知父组件展开状态变化
          onExpandedChange?.(key);
          onStreamingChange?.(newStreamingKeys);
        } else {
          // 不是首次打开，也通知流式展示状态变化
          setState((prevState) => ({
            ...prevState,
            streamingKeys: newStreamingKeys,
          }));
          onExpandedChange?.(key);
          onStreamingChange?.(newStreamingKeys);
        }
      } else {
        // 收起：通知父组件收起当前面板
        newStreamingKeys = [];
        setState((prevState) => ({
          ...prevState,
          streamingKeys: newStreamingKeys,
        }));
        onExpandedChange?.(key);
        onStreamingChange?.(newStreamingKeys);
      }
    },
    [
      state.openedOnceMap,
      state.streamingKeys,
      onExpandedChange,
      onStreamingChange,
    ],
  );

  const renderBlock = useCallback(
    (block: any, parentModuleCardId?: string): ReactNode => {
      if (block?.cardType === "GROUP") {
        const { title: groupTitle, groupContent } = block;
        const simulateStream = parentModuleCardId != null
          ? !state.openedOnceMap[parentModuleCardId]
          : false;
        return (
          <div className="block-type-GROUP">
            {groupTitle ? <div>{groupTitle}</div> : null}
            {Array.isArray(groupContent) &&
              groupContent.map((contentBlock) => {
                if (!contentBlock || contentBlock.hide === true) return null;
                const { LeftComponent } = contentBlock;
                if (!LeftComponent) return null;
                return (
                  <ErrorBoundary key={contentBlock.cardId}>
                    <div
                      className={`plan-content-item plan-content-item-${contentBlock.cardType}`}
                    >
                      {contentBlock.cardType === "MARKDOWN_TEXT" ? (
                        <LeftComponent
                          {...contentBlock}
                          isReplay={isReplay}
                          simulateStream={simulateStream}
                          onMoreClick={onMoreClick}
                          rightSideType={rightSideType}
                          getStream={getStream}
                          rightSideCardId={rightSideCardId}
                          showReplayResult={showReplayResult}
                          setShowReplayResult={setShowReplayResult}
                          userRequest={userRequest}
                        />
                      ) : (
                        <LeftComponent
                          moduleStatus={undefined}
                          isReplay={isReplay}
                          {...contentBlock}
                          onMoreClick={(
                            rightSideTypeParams: string,
                            rightSideDataParams: any,
                          ) =>
                            onMoreClick?.(
                              rightSideTypeParams,
                              rightSideDataParams,
                              undefined,
                            )
                          }
                          rightSideType={rightSideType}
                          getStream={getStream}
                          rightSideCardId={rightSideCardId}
                          showReplayResult={showReplayResult}
                          setShowReplayResult={setShowReplayResult}
                          userRequest={userRequest}
                        />
                      )}
                    </div>
                  </ErrorBoundary>
                );
              })}
          </div>
        );
      }
      const isAccordion = block.cardType === "MODULE";
      const isExpanded = expandedKeys.includes(block.cardId);
      const shouldStream = state.streamingKeys.includes(block.cardId);
      if (isAccordion) {
        const { accordionContent, moduleName, cardId, needHide } = block;

        // 从 accordionContent 中找到 MODULE_HEADER 的 status
        const moduleHeader = accordionContent?.find(
          (item: any) => item?.cardType === "MODULE_HEADER",
        );
        const status = moduleHeader?.status;

        return (
          <AccordionItemComponent
            key={cardId}
            title={moduleName || ""}
            isExpanded={isExpanded}
            shouldStream={shouldStream}
            onChange={(expanded) => handleAccordionChange(cardId, expanded)}
            status={status}
            hide={needHide}
            icon={block.icon}
          >
            {accordionContent &&
              Array.isArray(accordionContent) &&
              accordionContent.length > 0 && (
                <ErrorBoundary>
                  {accordionContent?.map((contentBlock) => {
                    if (!contentBlock || contentBlock.hide === true) return null;
                    if (contentBlock.cardType === "GROUP") {
                      const { groupContent } = contentBlock;
                      if (!Array.isArray(groupContent)) return null;
                      return (
                        <React.Fragment key={contentBlock.cardId}>
                          {groupContent.map((child) => {
                            if (!child || child.hide === true) return null;
                            const { LeftComponent } = child;
                            if (!LeftComponent) return null;
                            return (
                              <div
                                key={child.cardId}
                                className={`plan-content-item plan-content-item-${child.cardType}`}
                              >
                                {child.cardType === "MARKDOWN_TEXT" ? (
                                  <LeftComponent
                                    {...child}
                                    isReplay={isReplay}
                                    simulateStream={!state.openedOnceMap[block.cardId]}
                                    onMoreClick={onMoreClick}
                                    rightSideType={rightSideType}
                                    getStream={getStream}
                                    rightSideCardId={rightSideCardId}
                                    showReplayResult={showReplayResult}
                                    setShowReplayResult={setShowReplayResult}
                                    userRequest={userRequest}
                                  />
                                ) : (
                                  <LeftComponent
                                    moduleStatus={status}
                                    isReplay={isReplay}
                                    {...child}
                                    onMoreClick={(
                                      rightSideTypeParams: string,
                                      rightSideDataParams: any,
                                    ) => {
                                      onMoreClick?.(
                                        rightSideTypeParams,
                                        rightSideDataParams,
                                        status,
                                      );
                                    }}
                                    rightSideType={rightSideType}
                                    getStream={getStream}
                                    rightSideCardId={rightSideCardId}
                                    showReplayResult={showReplayResult}
                                    setShowReplayResult={setShowReplayResult}
                                    userRequest={userRequest}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      );
                    }
                    const { LeftComponent } = contentBlock;
                    if (LeftComponent) {
                      return (
                        <div
                          key={contentBlock.cardId}
                          className={`plan-content-item plan-content-item-${contentBlock.cardType}`}
                        >
                          {contentBlock.cardType === "MARKDOWN_TEXT" ? (
                            <LeftComponent
                              {...contentBlock}
                              isReplay={isReplay}
                              simulateStream={
                                !state.openedOnceMap[block.cardId]
                              }
                              onMoreClick={onMoreClick}
                              rightSideType={rightSideType}
                              getStream={getStream}
                              rightSideCardId={rightSideCardId}
                              showReplayResult={showReplayResult}
                              setShowReplayResult={setShowReplayResult}
                              userRequest={userRequest}
                            />
                          ) : (
                            <LeftComponent
                              moduleStatus={status}
                              isReplay={isReplay}
                              {...contentBlock}
                              onMoreClick={(
                                rightSideTypeParams: string,
                                rightSideDataParams: any,
                              ) => {
                                onMoreClick?.(
                                  rightSideTypeParams,
                                  rightSideDataParams,
                                  status,
                                );
                              }}
                              rightSideType={rightSideType}
                              getStream={getStream}
                              rightSideCardId={rightSideCardId}
                              showReplayResult={showReplayResult}
                              setShowReplayResult={setShowReplayResult}
                              userRequest={userRequest}
                            />
                          )}
                        </div>
                      );
                    } else {
                      return null;
                    }
                  })}
                </ErrorBoundary>
              )}
          </AccordionItemComponent>
        );
      } else {
        const { LeftComponent } = block;
        if (LeftComponent) {
          // 从rightSideData中提取当前正在查看的关键词
          const currentViewingKeyword = rightSideData?.defaultShowKeyword;

          return (
            <LeftComponent
              key={block.cardId}
              {...block}
              isReplay={isReplay}
              isStreaming={isStreaming}
              getStream={getStream}
              onMoreClick={onMoreClick}
              onChatSubmit={onChatSubmit}
              rightSideType={rightSideType}
              rightSideData={rightSideData}
              rightSideCardId={rightSideCardId}
              currentViewingKeyword={currentViewingKeyword}
              showReplayResult={showReplayResult}
              setShowReplayResult={setShowReplayResult}
              userRequest={userRequest}
            />
          );
        } else {
          return null;
        }
      }
    },
    [
      expandedKeys,
      state.streamingKeys,
      handleAccordionChange,
      state.openedOnceMap,
      rightSideType,
      rightSideData,
      rightSideCardId,
      onMoreClick,
      onChatSubmit,
      isStreaming,
      getStream,
      AccordionItemComponent,
      isReplay,
      showReplayResult,
      setShowReplayResult,
      userRequest,
    ],
  );

  const handleChatSubmit = (data: any) => {
    onChatSubmit(data);
  };

  // 监听窗口大小变化
  const handleOnResize = () => {
    const dom = document.getElementById("left-container");
    const lastBlock = document.getElementsByClassName("last-block");
    const preBlock = lastBlock[0]?.previousElementSibling?.classList.contains(
      "block-type-USER_INPUT_PLAIN_TEXT",
    )
      ? lastBlock[0]?.previousElementSibling
      : null;
    if (dom) {
      const commonHeight = 136 + 56;
      const clientHeight = preBlock
        ? dom.clientHeight - preBlock.clientHeight
        : dom.clientHeight;
      document.documentElement.style.setProperty(
        "--left-container-height",
        `${clientHeight - commonHeight}px`,
      );
    }
  };

  const containerStyle = title && !fullScreen ? "h-[calc(100vh-64px)]" : "";

  // 使用useEffect来执行回调，避免在渲染过程中调用
  useEffect(() => {
    if (pendingCallbacks.current.streamingChange) {
      onStreamingChange?.(pendingCallbacks.current.streamingChange);
      pendingCallbacks.current.streamingChange = undefined;
    }
    if (pendingCallbacks.current.expandedChange) {
      onExpandedChange?.(pendingCallbacks.current.expandedChange[0] || "");
      pendingCallbacks.current.expandedChange = undefined;
    }

    handleOnResize();

    window.addEventListener("resize", handleOnResize);
    return () => {
      window.removeEventListener("resize", handleOnResize);
    };
  }, []);

  const isShowReplayStatusBar =
    isReplay &&
    replayStatus !== ReplayStatus.NONE &&
    selectProductStore.isFormSubmitted;

  useEffect(() => {
    handleOnResize();
  }, [blocks]);

  return (
    <div
      className={`flex flex-col ${className} ${blocks.length === 0 ? "no-blocks-following" : ""
        } relative h-[inherit]`}
    >
      {title && !fullScreen && (
        <Navigation
          title={title}
          onBack={onBack}
          style={{ position: "sticky", top: 0, zIndex: 3 }}
          sessionId={sessionId}
          sharePopoverStyle={{
            padding: !rightSideType ? "20px 0 0 0" : "20px 0 0 0",
          }}
          shareDescription={shareDescription}
        />
      )}
      <div
        className={`px-[20px] flex-1 flex flex-col overflow-auto gap-[6px] ${showChatInput ? "pb-[170px]" : ""
          } left-container-wrapper ${rightSideType ? "w-[400px]" : "w-full items-center"} ${containerStyle}`}
        id="left-container"
        
      >

        <div className={`${rightSideType ? "w-[360px]" : "w-[800px]"}`}>
          {reqComponent}
        </div>
        {/* blocks内容 */}
        {
          blocks.map((block, index) => {
            return block?.hide === true ? null : (
              <div
                key={block.cardId}
                className={`block-item ${index === blocks.length - 1 ? "last-block" : ""
                  } ${blocks.length === 1 ? "single-block" : ""} block-type-${block.cardType
                  } block-status-${block.thinkingStatus} shrink-0 ${rightSideType ? "w-[360px]" : "w-[800px]"}`}
              >
                {renderBlock(block)}
              </div>
            );
          })
        }
      </div>
      {isShowReplayStatusBar && !fullScreen && (
        <div
          style={{
            paddingLeft: rightSideType ? "16px" : "0",
            width: rightSideType ? "400px" : "800px",
            margin: `0 ${rightSideType ? "0" : "auto"}`,
            position: "relative",
            zIndex: 1,
          }}
          className={`${styles.leftBottomMask} after:!z-[-1]`}
        >
          <ReplayStatusBar
            status={replayStatus}
            showReplayResult={showReplayResult}
            setShowReplayResult={setShowReplayResult}
            replayFn={replayShareCodeFn}
            userRequest={userRequest}
            showMakeSimilar={showMakeSimilar}
          />
        </div>
      )}
      {showTaskProgress && !isReplay && (
        <TaskProgress
          processStatus={processStatus}
          isStreaming={isStreaming}
          hasRequestError={hasRequestError}
          AnalyzeMoreKeywords={() => {
            onMoreClick("ANALYSIS_MORE_KEYWORDS", {
              requestId: processStatus.sessionId,
            });
          }}
        />
      )}
      {showChatInput && !isReplay && (
        <div
          className={`absolute bottom-[0] left-[0] right-[0] mb-[16px] flex justify-center ${rightSideType ? "px-[20px] justify-start" : "px-[20px]"}`}
        >
          <div
            className={`${rightSideType ? "w-[360px]" : "w-[800px]"} ${styles.leftBottomMask} ${showLeftBottomMask ? "" : styles.notBeforeMask}`}
            style={{
              borderRadius: "24px",
            }}
          >
            {CustomChatInput ? (
              <CustomChatInput
                onSubmit={handleChatSubmit}
                isStreaming={isStreaming}
                fancy={false}
              />
            ) : (
              <ChatInput
                onSubmit={(data) => handleChatSubmit({ query: data.inputValue || data })}
                isStreaming={isStreaming}
                fancy={false}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

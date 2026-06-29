import { useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import classNames from "classnames";
// import * as clipboard from "clipboard-polyfill";
import { Bubble } from "@ant-design/x";
import {
  TextBubble,
  PlanningBubble,
  KnowledgeBubble,
  DesignBubble,
  AnalyzerBubble,
  UserBubble,
  MultiImageBubble,
  StepCardBubble,
  OfferBubble,
  ImageChooseBubble,
} from "./bubbles";
import { SuccessIcon, LoadingIcon, StoppedIcon } from "./icons";
import HearBeatIcon from "../icons/HearBeatIcon";
import AssistantIcon from "../icons/images";
import { useStore } from "@/stores/context";
import { $t } from "@/i18n";
import {
  ROLE_CONSTANTS,
  MESSAGE_TYPE_CONSTANTS,
  BUBBLE_TYPE_CONSTANTS,
  STATUS_CONSTANTS,
} from "../../constants";
import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";

const noContentStyles = {
  border: "none",
  color: "#fff",
  padding: 0,
  minHeight: 0,
};

interface ContentProps {
  logKey?: string;
  bubbles: any[];
  isMobile?: boolean;
  isShared?: boolean;
  containerClassName?: string;
  heartbeatVisible?: boolean;
  onUserCardResponse?: (userInput: {
    resumePoint?: string;
    chooseStatus: "accept" | "refuse";
    chooseIndex?: number | number[];
  }) => void;
}

export default forwardRef(function Content(props: ContentProps, ref) {
  const {
    logKey,
    heartbeatVisible = false,
    bubbles = [],
    isMobile = false,
    containerClassName = "",
    isShared = false,
    onUserCardResponse,
  } = props;

  // 根据 isMobile 选择样式
  const styles = isMobile ? mobileStyles : pcStyles;

  const bubulesRef = useRef<any>([]);
  const store = useStore();

  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      bubulesRef.current.scrollTo({
        offset: bubulesRef.current.nativeElement?.scrollHeight,
        behavior: "auto",
      });
    },
    // 暴露滚动容器 DOM，用于 useAutoScroll 绑定事件
    get nativeElement() {
      return bubulesRef.current?.nativeElement;
    },
  }));

  const items = bubbles.map((item, index) => {
    // 使用唯一 ID 作为 key，避免使用纯索引导致 React 渲染问题
    const uniqueKey =
      item._bubbleId ||
      (item.card_detail?.taskId
        ? `${item.card_detail.taskId}_${index}`
        : `bubble_${index}`);

    const bubleItem: {
      key: string;
      role: string;
      content: any;
      avatar?: any;
      styles?: any;
    } = {
      key: uniqueKey,
      role: item.role,
      content: item.card_detail,
    };
    // ai回答的第一条数据需要展示头像和header
    if (
      item.role === ROLE_CONSTANTS.ASSISTANT &&
      (index === 0 || bubbles[index - 1].role === ROLE_CONSTANTS.USER) &&
      item.card_detail.type !== MESSAGE_TYPE_CONSTANTS.DESIGN
    ) {
      bubleItem.avatar = {
        icon: <AssistantIcon />,
        style: { width: "max-content", height: 20 },
      };
    }

    if (item.role === ROLE_CONSTANTS.HEARTBEAT) {
      bubleItem.avatar = {
        icon: (
          <HearBeatIcon
            text={$t("global-1688-ai-app.ChatContent.content.skz", "思考中...")}
          />
        ),
        style: { width: "max-content", height: 20 },
      };
    }

    if (
      item.role === ROLE_CONSTANTS.ASSISTANT &&
      item.card_detail.type === MESSAGE_TYPE_CONSTANTS.TEXT
    ) {
      bubleItem.styles = {
        content: {
          ...noContentStyles,
        },
      };
    }

    return bubleItem;
  });

  const roles = useMemo(
    () => ({
      user: {
        placement: STATUS_CONSTANTS.END,
        messageRender: (content) => {
          return (
            <UserBubble content={content} isMobile={isMobile} logKey={logKey} />
          );
        },
        styles: {
          content: {
            ...noContentStyles,
            marginTop: "8px",
            marginBottom: "8px",
          },
        },
      },
      assistant: {
        placement: STATUS_CONSTANTS.START,
        styles: {
          content: noContentStyles,
        },
        messageRender: (content) => {
          const { type } = content;
          let comp: any;
          switch (type) {
            case MESSAGE_TYPE_CONSTANTS.TEXT:
            case MESSAGE_TYPE_CONSTANTS.TEXT_STREAM:
              comp = <TextBubble content={content} isMobile={isMobile} />;
              break;
            case MESSAGE_TYPE_CONSTANTS.DESIGN_ANALYZER:
              comp = <AnalyzerBubble content={content} isMobile={isMobile} />;
              break;
            case MESSAGE_TYPE_CONSTANTS.DESIGN:
              comp = <DesignBubble content={content} isMobile={isMobile} />;
              break;
            case MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA:
            case MESSAGE_TYPE_CONSTANTS.MULTI_MEDIA_CONTENT:
              comp = <MultiImageBubble content={content} isMobile={isMobile} />;
              break;
            case MESSAGE_TYPE_CONSTANTS.KNOWLEDGE:
              comp = <KnowledgeBubble content={content} isMobile={isMobile} />;
              break;
            case MESSAGE_TYPE_CONSTANTS.PLAN:
            case MESSAGE_TYPE_CONSTANTS.PLAN_STREAM:
              comp = <PlanningBubble content={content} isMobile={isMobile} />;
              break;
            case BUBBLE_TYPE_CONSTANTS.STEP_CARD:
              comp = <StepCardBubble content={content} isMobile={isMobile} />;
              break;
            case MESSAGE_TYPE_CONSTANTS.OFFER:
              comp = (
                <OfferBubble
                  content={content}
                  isMobile={isMobile}
                  isShared={isShared}
                />
              );
              break;
            case MESSAGE_TYPE_CONSTANTS.IMAGE_CHOOSE:
              comp = (
                <ImageChooseBubble
                  content={content}
                  isMobile={isMobile}
                  isShared={isShared}
                  onUserResponse={onUserCardResponse}
                />
              );
              break;
            default:
              comp = <TextBubble content={content} isMobile={isMobile} />;
              break;
          }

          return (
            <div
              // onClick={() => {
              //   if (store?.userInfo?.userTags?.includes("2")) {
              //     clipboard.writeText(content.taskId).catch(() => {});
              //   }
              // }}
            >
              {comp}
            </div>
          );
        },
      },
      taskEndStatus: {
        placement: STATUS_CONSTANTS.START,
        styles: {
          content: noContentStyles,
        },
        messageRender: (content) => {
          const { type } = content;

          let textProps = {};
          switch (type) {
            case STATUS_CONSTANTS.ALL_DONE:
              textProps = {
                style: { color: "var(--done-color)", lineHeight: "20px" },
                icon: <SuccessIcon color="var(--done-color)" />,
              };
              break;
            case STATUS_CONSTANTS.STOPPING:
              textProps = {
                style: {
                  lineHeight: "20px",
                },
                icon: (
                  <div className={styles.loadingIconWrap}>
                    <LoadingIcon />
                  </div>
                ),
              };
              break;
            case STATUS_CONSTANTS.STOP_BY_USER:
              textProps = {
                style: {
                  lineHeight: "20px",
                },
                icon: <StoppedIcon />,
              };
              break;
          }

          return (
            <TextBubble {...textProps} content={content} isMobile={isMobile} />
          );
        },
      },
      heartbeat: {
        placement: STATUS_CONSTANTS.START,
        styles: {
          content: noContentStyles,
        },
        messageRender: () => {
          return null;
        },
      },
    }),
    [
      isMobile,
      isShared,
      onUserCardResponse,
      store?.userInfo?.userTags,
      styles.loadingIconWrap,
    ],
  );

  return (
    <div className={classNames(styles.contentWrapper, containerClassName)}>
      <Bubble.List
        ref={bubulesRef}
        autoScroll
        className={classNames(styles.contentContainer, {
          [styles.hasHeartbeat]: heartbeatVisible,
        })}
        roles={roles}
        items={items}
      />
      {heartbeatVisible && (
        <div className={styles.heartbeatWrapper}>
          <HearBeatIcon
            text={$t("global-1688-ai-app.ChatContent.content.skz", "思考中...")}
          />
        </div>
      )}
    </div>
  );
});

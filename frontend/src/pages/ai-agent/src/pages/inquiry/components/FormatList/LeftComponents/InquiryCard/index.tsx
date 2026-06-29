import React, { useEffect, useMemo, useCallback, useState } from "react";
import { TypeInquiryRequirementCard } from "../../types";
import styles from "./index.module.css";
import CountdownTimer from "../../CountdownTimer";
// import { Xunpan } from "@/components/Icon";
import { Button, Tooltip, message } from "antd";
import { $t } from "@/i18n";
import { stopTask } from '@/pages/inquiry/services';
import { useSelectProductStore } from "@/stores/select-product";
import { observer } from "mobx-react-lite";
import EndMissionModal from '@/pages/inquiry/components/EndMissionModal';
import { getStatus } from "@/pages/select-product/services";

const stopImg = 'https://img.alicdn.com/imgextra/i1/O1CN01S5ryqR29SkBUu33IZ_!!6000000008067-2-tps-48-48.png';

interface TypeInquiryRequirementProps
  extends Omit<TypeInquiryRequirementCard, "cardType"> {
  cardType?: "INQUIRY_REQUIREMENT" | "INQUIRY_PROGRESS" | "INQUIRY_REPORT";
  onMoreClick?: (rightSideType: string, rightSideData: any) => void;
  RightComponent?: React.ComponentType<any>;
  shouldShowRightPanel?: boolean;
  rightSideType?: string;
  readonly?: boolean; // 是否只读模式
  rightSideCardId?: string;
  finishTime?: number;
  moduleStatus?: string;
  SlotTitle?: React.ComponentType<any>; // 副标题组件
}

const InquiryCard: React.FC<TypeInquiryRequirementProps> = observer((props) => {
  const {
    detail,
    onMoreClick,
    RightComponent,
    cardId,
    cardType,
    finishTime,
    // shouldShowRightPanel,
    rightSideCardId,
    rightSideType,
    readonly = false,
    moduleStatus,
    sessionId
  } = props;
  const { taskStatus, setTaskStatus } = useSelectProductStore();
  const [open, setOpen] = useState(false);
  // const hasAutoOpenedRef = useRef(false);
  // 优先根据 cardType 推断（数据源更可靠），如果 cardType 不存在则使用 rightSideType，最后使用默认值
  // 支持三种类型：'INQUIRY_REQUIREMENT_FORM' | 'INQUIRY_PROGRESS' | 'REPORT_CONTENT'
  const actualRightSideType = useMemo(() => {
    // 优先根据 cardType 推断（因为 cardType 是数据源，更可靠）
    if (cardType === "INQUIRY_PROGRESS") {
      return "INQUIRY_PROGRESS";
    }
    if (cardType === "INQUIRY_REPORT") {
      return "REPORT_CONTENT";
    }
    if (cardType === "INQUIRY_REQUIREMENT") {
      return "INQUIRY_REQUIREMENT_FORM";
    }
    // 如果 cardType 不存在或不在预期范围内，使用 rightSideType
    if (rightSideType && rightSideType !== "") {
      return rightSideType;
    }
    // 默认值
    return "INQUIRY_REQUIREMENT_FORM";
  }, [rightSideType, cardType]);

  const handleMoreClick = useCallback(() => {
    onMoreClick?.(actualRightSideType, props);
  }, [onMoreClick, props, actualRightSideType]);

  // 判断当前卡片是否激活（右侧面板是否打开）
  const isActive = useMemo(() => {
    return rightSideCardId === cardId;
  }, [rightSideCardId, cardId]);

  useEffect(() => {
    handleMoreClick();
  }, []);

  useEffect(() => {
    // 为了能自动更新右侧的内容，需要手动触发
    if (
      detail &&
      (actualRightSideType === "INQUIRY_PROGRESS" ||
        actualRightSideType === "INQUIRY_REQUIREMENT_FORM") &&
      isActive
    ) {
      handleMoreClick();
    }
  }, [detail, actualRightSideType, isActive]);

  const handleClick = () => {
    if (onMoreClick && RightComponent) {
      // 优先使用 props 中的 title，如果没有则根据类型使用默认值
      const title = props.title || (
        actualRightSideType === "REPORT_CONTENT"
          ? $t(
            "global-1688-ai-app.inquiry.FormatList.LeftComponents.InquiryCard.AIxpbg",
            "AI询盘报告",
          )
          : $t(
            "global-1688-ai-app.inquiry.FormatList.LeftComponents.InquiryCard.xom",
            "询盘需求确认",
          )
      );
      onMoreClick(actualRightSideType, {
        RightComponent,
        title,
        SlotTitle: props.SlotTitle, // 传递 SlotTitle，保持副标题显示
        cardId,
        detail,
        readonly, // 根据 detail 是否有值决定是否只读
      });
    }
  };

  // 根据 actualRightSideType 判断卡片类型（用于 UI 显示）
  const isInquiryProgress = actualRightSideType === "INQUIRY_PROGRESS";
  const isInquiryReport = actualRightSideType === "REPORT_CONTENT";
  const isInquiryRequirement =
    actualRightSideType === "INQUIRY_REQUIREMENT_FORM";

  // 添加调试日志
  // useEffect(() => {
  //   console.log('[InquiryCard] 渲染信息', {
  //     cardType,
  //     rightSideType,
  //     actualRightSideType,
  //     isInquiryProgress,
  //     isInquiryReport,
  //     isInquiryRequirement,
  //   });
  // }, [cardType, rightSideType, actualRightSideType, isInquiryProgress, isInquiryReport, isInquiryRequirement]);

  // 根据类型选择右侧图片URL
  const rightImageUrl = useMemo(() => {
    if (isInquiryProgress) {
      return "https://img.alicdn.com/imgextra/i1/O1CN01HtzywC1x6VXyFyoye_!!6000000006394-2-tps-480-252.png";
    }
    if (isInquiryReport) {
      return "https://img.alicdn.com/imgextra/i2/O1CN01wgtxGA1XBNkhUZLRY_!!6000000002885-2-tps-480-252.png";
    }
    // 默认（INQUIRY_REQUIREMENT_FORM）保持原有URL
    return "https://img.alicdn.com/imgextra/i3/O1CN018raJ3b24Lo5UAOdr0_!!6000000007375-2-tps-480-252.png";
  }, [isInquiryProgress, isInquiryReport]);

  // 从 itemInfo 中获取图片（仅 INQUIRY_REQUIREMENT_FORM 时显示）
  const imgFileKey = detail?.itemInfo?.imgFileKey;
  const shouldShowAvatarOverlay = isInquiryRequirement && imgFileKey;

  // 渲染标题内容
  const renderTitle = () => {
    if (isInquiryProgress) {
      useEffect(() => { 
        if (!sessionId) {
          return;
        }
        getStatus(sessionId).then((res) => {
          const {msg = '系统异常', success, data} = res
          if (success) {
            setTaskStatus(data);
          } else {
            message.error(msg);
          }
        }).catch((err) => {
          message.error(err?.message || '系统异常')
        })
      }, [sessionId])
      const canStop = taskStatus?.canStop ?? false;
      return (
        <>
          <div className={styles.title}>
            <img className={styles.titleInquiryProgressIcon} src="https://img.alicdn.com/imgextra/i1/O1CN01w0otiw1Riv3rVix3F_!!6000000002146-2-tps-80-80.png" alt="" />
            <span>
              {$t(
                "global-1688-ai-app.inquiry.FormatList.LeftComponents.InquiryCard.xpjz",
                "询盘进展",
              )}
            </span>
          </div>
          {canStop && (
            <Tooltip placement="bottom" title='终止任务' overlayInnerStyle={{
              borderRadius: 8,
              padding: '8px 12px',
            }}>
              <div className={styles.stopImgContent} onClick={handleOk}>
                <img className={styles.stopImg} src={stopImg} alt="" srcSet="" />
              </div>
            </Tooltip>
          )}
        </>
      );
    }
    if (isInquiryReport) {
      return (
        <div className={styles.titleWithIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            fill="none"
            version="1.1"
            width="20"
            height="20"
            viewBox="0 0 20 20"
          >
            <g>
              <g>
                <path
                  d="M1.875,11.875L5.53536,13.167259999999999C5.91699,13.30199,6.20978,13.61316,6.32105,14.00228L7.5,18.125L8.67895,14.00228C8.79022,13.61316,9.08301,13.30199,9.46464,13.167259999999999L13.125,11.875L9.46464,10.582740000000001C9.08301,10.44801,8.79022,10.13684,8.67895,9.747720000000001L7.5,5.625L6.32105,9.747720000000001C6.20978,10.13684,5.91699,10.44801,5.53536,10.582740000000001L1.875,11.875Z"
                  fill="#1B1C1D"
                  fillOpacity="1"
                />
              </g>
              <g>
                <path
                  d="M11.25,6.25L13.62149,7.15421L14.375,10L15.12851,7.15421L17.5,6.25L15.12851,5.34579L14.375,2.5L13.62149,5.34579L11.25,6.25Z"
                  fill="#6E50FF"
                  fillOpacity="1"
                />
              </g>
            </g>
          </svg>
          <span className={styles.titleText}>
            {$t(
              "global-1688-ai-app.inquiry.FormatList.LeftComponents.InquiryCard.AIxpbg",
              "AI询盘报告",
            )}
          </span>
        </div>
      );
    }
    // 默认（INQUIRY_REQUIREMENT_FORM）
    return (
      <div className={styles.title}>
        <img className={styles.titleInquiryRequirementIcon} src="https://img.alicdn.com/imgextra/i1/O1CN010XisSQ22EooeJbn5W_!!6000000007089-2-tps-80-80.png" alt="" />
        <span>
          {$t(
            "global-1688-ai-app.inquiry.FormatList.LeftComponents.InquiryCard.xpxq",
            "询盘需求",
          )}
        </span>
      </div>
    );
  };
  const handleOk = () => {
    setOpen(true);
   
  }
  const handleStop = () => {
    if (sessionId) {
      stopTask({
        taskId: sessionId,
      }).then((res) => {
        const { success, msg = '系统异常' } = res;
        if (success) {
          message.success('终止任务成功');
          setOpen(false);
          setTaskStatus({ ...taskStatus, canStop: false });
        } else {
          message.error(msg);
        }
      }).catch((err) => {
        message.error(err?.message || '请求失败，请稍后重试');
      });
    }
  }
  const onClose = () => {
    setOpen(false);
  }
  return (
    <div
      className={`${styles.inquiryRequirement} ${isActive && moduleStatus !== "FINISHED" ? styles.active : styles.inquiryRequirementNotHover
        }`}
      onClick={() => {
        // if (moduleStatus === "FINISHED") return;
        // handleClick();
      }}
    >
      <div className={`${styles.cardContent} ${moduleStatus !== "FINISHED" ? styles.notFinishedCardContent : ""}`}>
        {actualRightSideType !== "INQUIRY_REQUIREMENT_FORM" && (
          <img
            src="https://img.alicdn.com/imgextra/i4/O1CN01K7zgYv1YJSLnmSNf1_!!6000000003038-2-tps-1336-512.png"
            className="absolute left-0 top-0"
            style={{ width: "334px", height: "128px" }}
          />
        )}
        <div className={`${styles.leftContent} ${moduleStatus !== "FINISHED" ? styles.notFinishedLeftContent : ""}`}>
          {/* <Xunpan type={actualRightSideType} /> */}
          {renderTitle()}
          {moduleStatus !== "FINISHED" && (
            <CountdownTimer finishTime={finishTime} />
          )}
        </div>
        {!isActive && cardType !== 'INQUIRY_REPORT' && <Button className={styles.viewDetailsBtn} onClick={handleClick}>
          {$t("global-1688-ai-app.inquiry.FormatList.LeftComponents.InquiryCard.viewDetails", "查看详情")}
        </Button>}
        {!isActive && cardType === 'INQUIRY_REPORT' && <Button className={styles.fillViewDetailsBtn} type="primary" onClick={handleClick}>
          {$t("global-1688-ai-app.inquiry.FormatList.LeftComponents.InquiryCard.viewDetails", "查看详情")}
        </Button>}
        {isActive && <Button type="primary" className={styles.viewIngDetailsBtn}>
          {$t("global-1688-ai-app.select-business.ColorfulCard.zzview", "正在查看")}
        </Button>}
        <div className={styles.imageContainer}>
          <img
            src={rightImageUrl}
            alt={$t(
              "global-1688-ai-app.inquiry.FormatList.LeftComponents.InquiryCard.xpxq",
              "询盘需求",
            )}
            className={styles.image}
          />
          {shouldShowAvatarOverlay && (
            <img src={imgFileKey} alt="" className={styles.avatarOverlay} />
          )}
        </div>
      </div>
      <EndMissionModal open={open} onClose={onClose} handleOk={handleStop} />
    </div>
  );
});

export default InquiryCard;


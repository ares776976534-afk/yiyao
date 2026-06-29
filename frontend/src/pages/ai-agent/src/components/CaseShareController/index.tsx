import { useEffect, useState } from "react";
import { useSpm } from "ice";
import { Button } from "antd";
import View from "@alife/channel-fe-materials-react-appear";
import {
  PlayIcon,
  PausedIcon,
  RefreshIcon,
  ShareIcon,
  SameIcon,
} from "./icons";
import { ProcessStatus } from "../ChatContent";
import useShare from "@/components/Share";
import aplus from "@/utils/log";
import { routeJump } from "@/utils/url";
import styles from "./index.module.scss";
import { $t } from "@/i18n";

interface TypeCaseShareControllerProps {
  className?: string;
  shareCode: string;
  shareStatus: ProcessStatus;
  style?: React.CSSProperties;
  jumpPageParams?: any;
  logmap?: Record<string, string>;
  onPlay: () => void;
  onRePlay: () => void;
  onPause: () => void;
  jumpToResult: () => void;
  onDOTheSame: () => void;
}

export default function CaseShareController(
  props: TypeCaseShareControllerProps
) {
  const {
    className,
    shareCode,
    shareStatus,
    style,
    jumpPageParams,
    onPlay,
    onPause,
    jumpToResult,
    onDOTheSame,
    onRePlay,
  } = props;

  const [play, setPlay] = useState(true);
  const [playEnd, setPlayEnd] = useState(false);
  const { getShareUrl, createShareModal } = useShare({
    jumpPageParams,
  });
  const [spmA, spmB] = useSpm();

  const logmap = {
    replay: `/alphashop.${spmB}.showcase.designpb`,
    share: `/alphashop.${spmB}.showcase.designshare`,
    dosame: `/alphashop.${spmB}.showcase.designsame`,
    ...props.logmap,
  };


  // 看回放直接跳到分享页面
  const handlePlay = async () => {
    routeJump(
      "share",
      {
        shareCode,
        spm: `${spmA}.${spmB}.watch-replay`,
        ...(jumpPageParams || {}),
      },
      {
        openInNewTab: true,
      }
    );
  };

  useEffect(() => {
    // DEFAULt, PROCESSING, COMPLETED, PAUSED
    switch (shareStatus) {
      case ProcessStatus.DEFAULT:
      case ProcessStatus.PROCESSING:
        setPlayEnd(false);
        setPlay(true);
        break;
      case ProcessStatus.PAUSED:
        setPlay(false);
        break;
      case ProcessStatus.COMPLETED:
        setPlay(false);
        setPlayEnd(true);
        break;
    }
  }, [shareStatus]);

  return (
    <div
      className={`${styles.caseShareController} ${className}`}
      style={{ ...style }}
    >
      <View
        onFirstAppear={() => {
          aplus.record(logmap.replay, "EXP");
        }}
      >
        <Button className={styles.btnGroup} onClick={handlePlay}>
          <span className={styles.btnPlayIcon}>
            {/* {playEnd ? <RefreshIcon className={styles.icon} /> : play ? <PausedIcon className={styles.icon} /> : <PlayIcon className={styles.icon} />} */}
            <PlayIcon className={styles.icon} />
          </span>
          <span className={styles.btnPlayText}>
            {$t("global-1688-ai-app.CaseShareController.khf", "看回放")}
          </span>
        </Button>
      </View>

      <View
        onFirstAppear={() => {
          aplus.record(logmap.share, "EXP");
        }}
      >
        <Button
          className={[styles.btnGroup, styles.share].join(" ")}
          onClick={() => {
            aplus.record(logmap.share, "CLK", {
              shareCode,
            });
            createShareModal(undefined, shareCode);
          }}
        >
          <ShareIcon />
          <span>
            {$t("global-1688-ai-app.CaseShareController.share", "分享")}
          </span>
        </Button>
      </View>

      <View
        onFirstAppear={() => {
          aplus.record(logmap.dosame, "EXP");
        }}
      >
        <Button
          type="primary"
          className={[styles.btnGroup, styles.doTheSame].join(" ")}
          onClick={() => {
            aplus.record(logmap.dosame, "CLK", {
              shareCode,
            });
            onDOTheSame?.();
          }}
        >
          <SameIcon className={styles.sameIcon} />
          {$t("global-1688-ai-app.share.trySame", "体验同款")}
        </Button>
      </View>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSpm } from "ice";
import { Button } from "antd";
import View from "@alife/channel-fe-materials-react-appear";
import aplus from "@/utils/log";
import { PlayIcon, PausedIcon, RefreshIcon, SameIcon } from "./icons";
import { ProcessStatus } from "../ChatContent";
import styles from "./index.module.scss";
import { $t } from "@/i18n";

interface TypeShareControllerProps {
  shareStatus: ProcessStatus;
  onPlay: () => void;
  onRePlay: () => void;
  onPause: () => void;
  jumpToResult: () => void;
  onDOTheSame: () => void;
  style?: React.CSSProperties;
}

export default function ShareController(props: TypeShareControllerProps) {
  const {
    shareStatus,
    onPlay,
    onPause,
    jumpToResult,
    onDOTheSame,
    onRePlay,
    style,
  } = props;

  const [play, setPlay] = useState(true);
  const [playEnd, setPlayEnd] = useState(false);
  // const [allowDoTheSame, setAllowDoTheSame] = useState(false);
  const [spmA, spmB] = useSpm();

  const handlePlay = () => {
    if (playEnd) {
      // 调用重播
      onRePlay?.();
      return;
    }
    if (play) {
      onPause?.();
    } else {
      onPlay?.();
    }
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
    <div className={styles.shareController} style={{ ...style }}>
      <div className={styles.btnPlay} onClick={handlePlay}>
        {playEnd ? (
          <RefreshIcon className={styles.icon} />
        ) : play ? (
          <PausedIcon className={styles.icon} />
        ) : (
          <PlayIcon className={styles.icon} />
        )}
      </div>

      <div className={styles.divider} />

      <div className={styles.btnGroup}>
        <Button
          className={styles.jumpToResult}
          style={{ cursor: playEnd ? "not-allowed" : "pointer" }}
          onClick={() => {
            jumpToResult();
            setPlay(false);
            setPlayEnd(true);
          }}
        >
          {$t("global-1688-ai-app.ShareController.tzdresult", "跳转到结果")}
        </Button>
        <View
          onFirstAppear={() => {
            aplus.record(`/alphashop.${spmB}.dosame`, "EXP");
          }}
        >
          <Button
            type="primary"
            className={styles.doTheSame}
            onClick={() => {
              aplus.record(`/alphashop.${spmB}.dosame`, "CLK");
              onDOTheSame?.();
            }}
          >
            <SameIcon className={styles.sameIcon} />
            {$t("global-1688-ai-app.share.trySame", "体验同款")}
          </Button>
        </View>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import durantion from "dayjs/plugin/duration";
import styles from "./index.module.scss";
import classNames from "classnames";
import { $t } from "@/i18n";
dayjs.extend(durantion);
const CountdownTimer: React.FC<{
  finishTime?: number;
  rightSideType?: string;
  moduleStatus?: string;
}> = (props) => {
  const { finishTime, rightSideType, moduleStatus } = props;
  const timmerRef = useRef(0);
  const [durantionTimeStr, setDurantionTimeStr] = useState("");

  useEffect(() => {
    if (finishTime && Number(finishTime) > 0 && moduleStatus !== "FINISHED") {
      const diffTime = Number(finishTime) - new Date().getTime();
      if (diffTime > 0) {
        setDurantionTimeStr(dayjs.duration(diffTime).format("HH:mm:ss"));
        timmerRef.current = window.setInterval(() => {
          const tempDiffTime = Number(finishTime) - new Date().getTime();
          if (tempDiffTime > 0) {
            setDurantionTimeStr(
              dayjs.duration(tempDiffTime).format("HH:mm:ss")
            );
          } else {
            clearInterval(timmerRef.current);
            setDurantionTimeStr("");
          }
        }, 1000);
      } else {
        clearInterval(timmerRef.current);
        setDurantionTimeStr("");
      }
    } else {
      clearInterval(timmerRef.current);
      setDurantionTimeStr("");
    }

    return () => {
      clearInterval(timmerRef.current);
    };
  }, [finishTime]);

  const isInquierProgress = rightSideType === "INQUIRY_PROGRESS";

  return durantionTimeStr ? (
    <span
      className={classNames(styles.finishTime, {
        [styles.inquierProgressFinishTime]: isInquierProgress,
      })}
    >
      {isInquierProgress ? (
        <>
          {$t(
            "global-1688-ai-app.inquiry.FormatList.CountdownTimer.bcxpjy",
            "本次询盘将于"
          )}
          <span className={styles.finishTimeText}>{durantionTimeStr}</span>
          {$t(
            "global-1688-ai-app.inquiry.FormatList.CountdownTimer.hend",
            "后结束"
          )}
        </>
      ) : (
        <>
          {/* {$t("global-1688-ai-app.inquiry.FormatList.CountdownTimer.y", "于")}  */}
          <span className={styles.finishTimeText}>{durantionTimeStr}</span>
          {$t(
            "global-1688-ai-app.inquiry.FormatList.CountdownTimer.hend",
            "后结束"
          )}
        </>
      )}
    </span>
  ) : null;
};

export default CountdownTimer;

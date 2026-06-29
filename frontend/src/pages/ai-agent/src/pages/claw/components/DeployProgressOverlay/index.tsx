import React, { useState, useEffect, useRef } from 'react';
import type { TypeDeployProgressOverlayProps, TypeDeployProgressStage } from './types';
import styles from './index.module.scss';

const DEFAULT_STAGES: TypeDeployProgressStage[] = [{ time: 7000, process: 90 }];

function getProgressAtElapsed(
  elapsedMs: number,
  stages: TypeDeployProgressStage[],
): number {
  let acc = 0;
  let prevProcess = 0;
  for (let i = 0; i < stages.length; i++) {
    const { time, process } = stages[i];
    const segEnd = acc + time;
    if (elapsedMs <= segEnd) {
      const t = time <= 0 ? 1 : (elapsedMs - acc) / time;
      return prevProcess + (process - prevProcess) * Math.min(1, t);
    }
    acc = segEnd;
    prevProcess = process;
  }
  return stages.length > 0 ? stages[stages.length - 1].process : 0;
}

const DeployProgressOverlay: React.FC<TypeDeployProgressOverlayProps> = ({
  visible,
  apiSuccess,
  onComplete,
  stages = DEFAULT_STAGES,
}) => {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const completeCalledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      completeCalledRef.current = false;
      return;
    }
    startTimeRef.current = Date.now();
    setProgress(0);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    if (apiSuccess) {
      setProgress(100);
      const t = setTimeout(() => {
        if (!completeCalledRef.current) {
          completeCalledRef.current = true;
          onCompleteRef.current();
        }
      }, 500);
      return () => clearTimeout(t);
    }

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = getProgressAtElapsed(elapsed, stages);
      setProgress(p);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, apiSuccess, stages]);

  if (!visible) return null;

  const title = progress >= 100 ? '部署成功' : '正在部署中';
  const displayPercent = Math.round(Math.min(100, progress));

  return (
    <div className={styles.overlay} role="alert" aria-busy={progress < 100}>
      <div className={styles.card}>
        <div className={styles.content}>
          <span className={styles.title}>{title}</span>
          <div className={styles.progressBlock}>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{ width: `${displayPercent}%` }}
              />
            </div>
            <span className={styles.percent}>{displayPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeployProgressOverlay;
export type { TypeDeployProgressOverlayProps, TypeDeployProgressStage };

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

import {
  EnumStackEmergeFrom,
  EnumStackRotateDirection,
  type TypeProps,
} from './types';

import styles from './index.module.scss';

const DEFAULT_IMG =
  'https://img.alicdn.com/imgextra/i3/O1CN01KBVC3m1VtgpbSlkaK_!!6000000002711-2-tps-1024-1024.png';

function createDefaultDataSource(): ReactNode[] {
  return Array.from({ length: 4 }, (unused, index) => (
    <img
      key={index}
      src={DEFAULT_IMG}
      alt=""
      style={{ width: 80, height: 80 }}
    />
  ));
}

export {

  EnumStackEmergeFrom,
  EnumStackRotateDirection,
}

/** 堆叠：越靠前 slot 越大、越靠上；单位 px / 比例由常量控制 */
const STACK_OFFSET_Y = 10;
const STACK_SCALE_STEP = 0.08;
const EMERGE_EXTRA_Y = 20;

const DEFAULT_INTERVAL_MS = 1000;
const DEFAULT_EMERGE_MS = 300;

const STACK_TRANSITION = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 28,
};

function rotateBackToFront(order: number[]): number[] {
  if (order.length <= 1) {
    return order;
  }
  const last = order[order.length - 1];
  return [last, ...order.slice(0, -1)];
}

function rotateFrontToBack(order: number[]): number[] {
  if (order.length <= 1) {
    return order;
  }
  const [first, ...rest] = order;
  return [...rest, first];
}

function buildInitialOrder(length: number): number[] {
  return Array.from({ length }, (unused, index) => index);
}

export default function Loading(props: TypeProps) {
  const {
    dataSource = [],
    intervalMs = DEFAULT_INTERVAL_MS,
    emergeDurationMs = DEFAULT_EMERGE_MS,
    stackRotateDirection = EnumStackRotateDirection.BACK_TO_FRONT,
    stackEmergeFrom = EnumStackEmergeFrom.TOP,
  } = props;


  const itemCount = dataSource.length;

  const [order, setOrder] = useState<number[]>(() =>
    buildInitialOrder(dataSource.length),
  );
  const [phase, setPhase] = useState<'idle' | 'emerge'>('idle');

  useEffect(() => {
    setOrder(buildInitialOrder(dataSource.length));
  }, [dataSource.length]);

  useEffect(() => {
    if (itemCount < 2) {
      return undefined;
    }

    let cancelled = false;
    let emergeTimer: ReturnType<typeof setTimeout> | null = null;
    let cycleTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextCycle = () => {
      cycleTimer = setTimeout(() => {
        if (cancelled) {
          return;
        }
        setPhase('emerge');
        emergeTimer = setTimeout(() => {
          if (cancelled) {
            return;
          }
          setOrder((prev) => {
            if (stackRotateDirection === EnumStackRotateDirection.FRONT_TO_BACK) {
              return rotateFrontToBack(prev);
            }
            return rotateBackToFront(prev);
          });
          setPhase('idle');
          scheduleNextCycle();
        }, emergeDurationMs);
      }, intervalMs);
    };

    scheduleNextCycle();

    return () => {
      cancelled = true;
      if (emergeTimer !== null) {
        clearTimeout(emergeTimer);
      }
      if (cycleTimer !== null) {
        clearTimeout(cycleTimer);
      }
    };
  }, [
    itemCount,
    intervalMs,
    emergeDurationMs,
    stackRotateDirection,
  ]);

  return (
    <div className={styles.container}>
      {order.map((dataIndex, slot) => {
        const isEmergingSlot =
          stackRotateDirection === EnumStackRotateDirection.FRONT_TO_BACK
            ? slot === 0
            : slot === itemCount - 1;
        const emergeDeltaY =
          stackEmergeFrom === EnumStackEmergeFrom.BOTTOM
            ? EMERGE_EXTRA_Y
            : -EMERGE_EXTRA_Y;
        const baseY = -slot * STACK_OFFSET_Y;
        const emerge =
          phase === 'emerge' && isEmergingSlot ? emergeDeltaY : 0;
        const scale = 1 - slot * STACK_SCALE_STEP;
        const translateYPx = baseY + emerge;

        return (
          <motion.div
            key={dataIndex}
            className={styles.item}
            animate={{
              y: translateYPx,
              scale,
              zIndex: itemCount - slot,
            }}
            transition={STACK_TRANSITION}
          >
            {dataSource[dataIndex]}
          </motion.div>
        );
      })}
    </div>
  );
}

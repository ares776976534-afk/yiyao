import { useRef, forwardRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Html } from "react-konva-utils";
import styles from "./element.module.scss";

const calcEditRect = (rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  const lt = { x: rect.x, y: rect.y };
  const rt = { x: rect.x + rect.width, y: rect.y };
  const lb = { x: rect.x, y: rect.y + rect.height };
  const rb = { x: rect.x + rect.width, y: rect.y + rect.height };

  return { lt, rt, lb, rb };
};

/** Stage 逻辑坐标 → 相对 stage.container 的 CSS 像素（只乘比例，与画布同一参照） */
const scaleKonvaRectToContainerPx = (
  stage: { width: () => number; height: () => number },
  containerEl: HTMLElement,
  konvaRect: { x: number; y: number; width: number; height: number },
) => {
  const box = containerEl.getBoundingClientRect();
  const sw = stage.width();
  const sh = stage.height();
  const scaleX = sw > 0 ? box.width / sw : 1;
  const scaleY = sh > 0 ? box.height / sh : 1;

  return {
    x: konvaRect.x * scaleX,
    y: konvaRect.y * scaleY,
    width: konvaRect.width * scaleX,
    height: konvaRect.height * scaleY,
  };
};

/** 挂 document.body 时：视口 CSS 像素 + fixed */
const scaleKonvaRectToViewport = (
  stage: { width: () => number; height: () => number },
  containerEl: HTMLElement,
  konvaRect: { x: number; y: number; width: number; height: number },
) => {
  const box = containerEl.getBoundingClientRect();
  const sw = stage.width();
  const sh = stage.height();
  const scaleX = sw > 0 ? box.width / sw : 1;
  const scaleY = sh > 0 ? box.height / sh : 1;

  return {
    x: box.left + konvaRect.x * scaleX,
    y: box.top + konvaRect.y * scaleY,
    width: konvaRect.width * scaleX,
    height: konvaRect.height * scaleY,
  };
};

export default forwardRef(function LoadingMask(props: any, ref) {
  const {
    className,
    style = {},
    parentRef,
    open = true,
    children,
    transformFunc,
  } = props;

  const rectRef = useRef<any>(null);
  const rectCacheRef = useRef<any>(null);

  const mountTarget =
    parentRef?.current?.getStage?.()?.container?.() ?? document.body;

  const handleRect = (attrs: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
  }) => {
    if (rectRef.current && parentRef?.current) {
      const raw = parentRef.current.getClientRect?.();
      if (!raw) {
        return;
      }

      const stage = parentRef.current.getStage?.();
      const containerEl = stage?.container?.() ?? null;
      const domParent = rectRef.current.parentElement;
      const onStageContainer =
        !!containerEl && !!domParent && domParent === containerEl;

      let pixelRect: { x: number; y: number; width: number; height: number };
      let positionValue: "absolute" | "fixed";

      if (stage && containerEl) {
        if (onStageContainer) {
          pixelRect = scaleKonvaRectToContainerPx(stage, containerEl, raw);
          positionValue = "absolute";
        } else {
          pixelRect = scaleKonvaRectToViewport(stage, containerEl, raw);
          positionValue = "fixed";
        }
      } else {
        pixelRect = raw;
        positionValue = "fixed";
      }

      const newEditRect = calcEditRect(pixelRect);

      const defaultTransformFunc = (points: any) => {
        return {
          left: `${points.lt.x}px`,
          top: `${points.lt.y}px`,
          width: `${points.rt.x - points.lt.x}px`,
          height: `${points.lb.y - points.lt.y}px`,
        };
      };

      const rect = transformFunc
        ? transformFunc(newEditRect, attrs)
        : defaultTransformFunc(newEditRect);

      const styleObject = {
        position: positionValue,
        ...rect,
        ...style,
      };

      Object.keys(styleObject).forEach((key) => {
        rectRef.current.style.setProperty(key, styleObject[key]);
      });

      rectCacheRef.current = {
        transform: attrs,
        points: newEditRect,
      };
    } else {
      rectCacheRef.current = {
        delayAttrs: attrs,
      };
    }
  };

  useLayoutEffect(() => {
    const pending =
      rectCacheRef.current?.transform ?? rectCacheRef.current?.delayAttrs;
    if (pending && rectRef.current && parentRef?.current) {
      handleRect(pending);
    }
  }, [mountTarget]);

  useEffect(() => {
    if (rectCacheRef.current?.delayAttrs) {
      handleRect(rectCacheRef.current.delayAttrs);
    }
  }, [rectRef.current, parentRef?.current]);

  return (
    open && (
      <Html
        transformFunc={(attrs: any) => {
          handleRect(attrs);
          return attrs;
        }}
      >
        {createPortal(
          <div
            data-root="studio"
            className={`${styles.portalContainer}${
              className ? ` ${className}` : ""
            }`}
            ref={(node) => {
              rectRef.current = node;

              if (ref) {
                ref.current = node;
              }

              const pending =
                rectCacheRef.current?.transform ??
                rectCacheRef.current?.delayAttrs;
              if (pending) {
                handleRect(pending);
              }
            }}
            style={style}
          >
            {children}
          </div>,
          mountTarget,
        )}
      </Html>
    )
  );
});

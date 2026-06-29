/**
 * 分组图层
 * 内置布局系统
 */
import { useEffect, useContext, useRef, forwardRef } from "react";
import type Konva from 'konva';
import { IconGroup } from "../icons";
import { CanvasContext, type TypeCanvasContext } from "../context/canvas";
import { getElementDefinition } from './define';
import BaseElement from "./element";
import { generateId, findParentElement } from '../utils/node';
import { calcLayout } from '../utils/calcLayout';
import { TypeLayer } from "../types.d";
import { $t } from '@/i18n';

const GroupElement = forwardRef((props: TypeLayer, ref: any) => {
  const { children, ...elProps } = props || {};
  const { id } = elProps || {};
  const baseRef = useRef<Konva.Group>(null);

  const canvasContext = useContext(CanvasContext);

  window.baseRef = baseRef;
  // 计算
  const resizeElement = () => {
    const layout = calcLayout({ width: elProps.width, height: elProps.height, children });
    // 更新自身数据
    canvasContext.updateElement(id, { width: layout.width, height: layout.height });

    // 触发父元素重排版
    if (baseRef?.current?.node) {
      const parent = findParentElement(baseRef.current.node);
      if (parent) {
        parent.resizeElement();
      }
    }
  };

  useEffect(() => {
    if (id) {
      canvasContext.setRef(id, {
        resizeElement
      });
    }
  }, [id, resizeElement]);

  return (
    <BaseElement
      ref={baseRef}
      onDragOver={(e) => {
        console.log('1drag over');
      }}
    >
      {
        children?.map((child) => {
          if (!child) {
            return null;
          }
          if (!child.id) {
            child.id = generateId();
          }

          const Element = getElementDefinition(child.type);

          if (!child.displayName) {
            child.displayName = `${`${Element}?.displayName}：` || ''}${child.id}`;
          }

          if (!child.icon) {
            child.icon = Element?.icon || '';
          }

          return <Element {...child} ref={ref} useContextMenu={false} />;
        })
      }
    </BaseElement>
  );
});

GroupElement.icon = <IconGroup />;
GroupElement.displayName = $t("global-1688-ai-app.studio-canvas.elements.group.fz", "分组");

export default GroupElement;

/**
 * 虚拟分组图层，把多个子元素按照分组内部的相对位置组合，但是不生成外部容器
 * 
 */
import { IconGroup } from "../icons";
import React, { forwardRef } from "react";
import BaseElement from "./element";
import { TypeLayer } from "../types.d";
import { $t } from '@/i18n';

const GroupElement = forwardRef((props: TypeLayer, ref: any) => {
  const { children } = props || {};
  
  return (
    children?.map((child) => {
      return <BaseElement {...child} ref={ref} useContextMenu={false} />;
    })
  );
});

GroupElement.icon = <IconGroup />;
GroupElement.displayName = $t("global-1688-ai-app.studio-canvas.elements.virtualGroup.fz", "分组");

export default GroupElement;

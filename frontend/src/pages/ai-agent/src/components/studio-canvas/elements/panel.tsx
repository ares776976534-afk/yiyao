/**
 * 面板图层
 * 不用先选中面板，然后才能选中内部元素
 * 
 */
import { IconGroup } from "../icons";
import { forwardRef } from "react";
import BaseElement from "./element";
import { TypeLayer } from "../types.d";
import { $t } from '@/i18n';

const GroupElement = forwardRef((props: TypeLayer, ref: any) => {
  return <BaseElement {...props} ref={ref} useContextMenu={false} />;
});

GroupElement.icon = <IconGroup />;
GroupElement.displayName = $t("global-1688-ai-app.studio-canvas.elements.panel.mb", "面板");

export default GroupElement;

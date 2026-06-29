import React, { forwardRef } from 'react';
import { Rect } from 'react-konva';
import BaseElement, { getProps } from './element';
import { TypeLayer } from '../types.d';
import { $t } from '@/i18n';

const Element = forwardRef((props: TypeLayer, ref: any) => {
  const { baseProps, childrenProps } = getProps(props);
  
  return (
    <BaseElement ref={ref} {...baseProps}>
      <Rect
        {...childrenProps}
      />
    </BaseElement>
  );
});

Element.icon = '■';
Element.displayName = $t("global-1688-ai-app.studio-canvas.elements.rect.jx", "矩形");

export default Element;

import { useRef, useContext, forwardRef } from 'react';
import Konva from 'konva';
import { CanvasContext } from '../context/canvas';
import { getElementDefinition } from './define';
import BaseElement from './element';
import { generateId } from '../utils/node';
import { TypeLayer } from '../types.d';
import { $t } from '@/i18n';

const LayerElement = forwardRef((props: TypeLayer, ref: any) => {
  const { children, ...elProps } = props || {};
  const { id } = elProps || {};
  const baseRef = useRef<Konva.Group>(null);
  const canvasContext = useContext(CanvasContext);

  const Element = getElementDefinition(elProps.type);

  if (Element && elProps.type !== 'group') {
    return <Element {...elProps} />
  }

  // 默认使用分组图层嵌套，然后尝试遍历子元素
  return (
    <BaseElement
      ref={baseRef}
      {...elProps}
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

          return <LayerElement key={child.id} {...child} />;
        })
      }
    </BaseElement>
  )
});

(LayerElement as any).icon = '🖽';
(LayerElement as any).displayName = $t("global-1688-ai-app.studio-canvas.elements.layer.rq", "容器");

export default LayerElement;

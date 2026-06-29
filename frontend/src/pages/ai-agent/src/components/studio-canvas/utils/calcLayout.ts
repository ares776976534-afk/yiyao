import Yoga from 'yoga-layout';
const { Node, DIRECTION_LTR } = Yoga;

interface TypeLayoutNode {
  width?: number;
  height?: number;
  children: TypeLayoutNode[];
}

interface TypeLayoutResult {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}


export function calcLayout(style: TypeLayoutNode): TypeLayoutResult {
  const { width, height, children } = style;
  const root = Node.create();
  root.setWidth(width || 'auto');
  root.setHeight(height || 'auto');
  root.setJustifyContent(Yoga.JUSTIFY_FLEX_START);
  root.setAlignItems(Yoga.ALIGN_FLEX_START);
  // root.set

  children.forEach((child, i) => {
    const node = Node.create();
    node.setWidth(child.width);
    node.setHeight(child.height);
    root.insertChild(node, i);
  });

  // 计算布局
  root.calculateLayout(width || 'auto', height || 'auto', Yoga.DIRECTION_LTR);

  return root.getComputedLayout();
}


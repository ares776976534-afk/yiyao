import Konva from "konva";
import { v4 as uuidv4 } from 'uuid';

// 生成不重复的id
export const generateId = () => {
  return uuidv4() as string;
};

// 检查数据是否为Layer类型
export const isLayerData = (data: any) => {
  return !!data?.type;
}

// 判断konva的元素是否抵达边界
export const isElementReachesBound = (type: string) => {
  return !type || ['Stage', 'Layer'].includes(type);
};

export const isElement = (node: Konva.Node) => {
  return node?.attrs.customType === 'BaseElement';
};

// 判断是否在某中元素内部
export const isInNode = (node: Konva.Node, _type: string) => {
  const type = node?.getType();
  const className = node?.className;
  const customType = node?.attrs?.customType;

  if (isElementReachesBound(type)) {
    // 到达根元素，停止查找
    return false;
  }

  if (customType === _type || type === _type || className === _type) {
    return true;
  }

  return isInNode(node.parent as Konva.Node, _type);
}

// 判断是否是Transformer及其子元素
export const isTransformer = (node: Konva.Node) => {
  return isInNode(node.parent as Konva.Node, 'Transformer');
}

// 判断是否是画布最顶层的图层
export const isTopLayer = (canvasContext, targetId) => {
  const { elements } = canvasContext;

  return elements.some((el) => el.id === targetId);
};

// 深度遍历找到element对象，使用id
export const findInElements = (elements, targetId) => {
  if (elements?.length && targetId) {
    for (const el of elements) {
      if (el.id === targetId) {
        return el;
      }
      const child = findInElements(el.children, targetId);
      if (child) {
        return child;
      }
    }
  }
};

// 获取父元素，只有BaseElement类型属于父元素
export const findParentElement = (node: Konva.Node, depth = 0) => {
  const nodeType = node?.getType();
  const customType = node?.attrs?.customType;

  // 到达虚拟DOM边界，返回
  if (isElementReachesBound(nodeType)) {
    return null;
  }

  if (customType === 'BaseElementRect') {
    return node.parent?.children?.find((el) => el.attrs.customType === 'BaseElement')
  }

  if (depth > 0 && isElement(node)) {
    return node;
  }

  return findParentElement(node.parent as Konva.Node, depth + 1);
};

// 返回第一个子元素的实体对象
export const findChildElement = (node: Konva.Group) => {
  if (isElement(node)) {
    return node;
  }

  if (!node?.children?.length) {
    return null;
  }

  for (const child of node.children) {
    const childElement = findChildElement(child as Konva.Group);
    if (childElement) {
      return childElement;
    }
  }
};

// 返回所有子元素的实体对象
export const findChildrenElements = (node: Konva.Group, maxDepth = 0, all: any = [], depth = 0) => {
  if ((maxDepth && depth > maxDepth) || !node || isElementReachesBound(node?.getType())) {
    return all;
  }

  if (depth > 0 && isElement(node)) {
    all.push(node);
  }

  node.children?.forEach((child) => {
    findChildrenElements(child as Konva.Group, maxDepth, all, isElement(node) ? depth + 1 : depth);
  });

  return all;
};

// 获取元素的矩形区域
export const findElementRect = (node: Konva.Group) => {
  const customType = node?.attrs?.customType;

  if (customType === 'BaseElementRect') {
    return node;
  } else if (customType === 'BaseElement') {
    return node.parent?.children?.find((el) => el.attrs.customType === 'BaseElementRect');
  } else if (Array.isArray(node?.children)) {
    for (const child of node.children) {
      const rect = findElementRect(child as Konva.Group);
      if (rect) {
        return rect;
      }
    }
  }
};

// 在原本的getClientRect基础上，增加maxWidth和maxHeight限制
export const getBoundingClientRect = (node?: Konva.Node) => {
  const rect = findElementRect(node as Konva.Group);

  if (rect) {
    return rect.getClientRect();
  }

  return node?.getClientRect?.();
}

/**获取所有父元素的选中状态
 * @return
 * {
 *    selectedNode: Konva.Node, // 选中的父元素（不一定是直接父元素）
 *    parentNode: Konva.Node, // 直接父元素
 *    selectedState: number, // 父元素的选中状态
 *      -1: 没有任何父元素
 *      0: 有父元素，都没有被选中
 *      1: 有父元素，直接父元素被选中
 *      2: 有父元素，非直接父元素被选中
 *      3: 自身被选中
 *      4: 同级兄弟节点被选中
 * }
 */
export const getSelectedState = (node: Konva.Group, selectedIds: string[] = [], depth: number = 0, value = {
  selectedNode: null as Konva.Group | null,
  parentNodes: [] as Konva.Group[],
  selectedState: -1,
}) => {
  const nodeType = node?.getType();
  let i = 0;

  // 到达虚拟DOM边界，返回
  if (isElementReachesBound(nodeType)) {
    return value;
  }

  // 只识别BaseElement类型的元素
  if (isElement(node)) {
    const id = node?.attrs.id;
    i = 1;

    if (depth > 0) {
      value.parentNodes.push(node);

      // 最接近子元素的父元素
      const closestNode = value.selectedNode || node;

      // 到达直接父元素
      if (depth === 1) {
        value.selectedState = 0;

        // 直接父元素被选中，返回结果
        if (selectedIds?.includes(id)) {
          value.selectedNode = closestNode;
          value.selectedState = 1;
        } else {
          // 检查直接兄弟节点是否被选中
          const siblingSelected = findChildrenElements(closestNode, 1)?.some(el => {
            const sId = el?.attrs?.id;

            if (selectedIds?.includes(sId)) {
              value.selectedNode = el;
              value.selectedState = 4;
              return true;
            }

            return false;
          });

          if (siblingSelected) {
            return value;
          }
        }

      } else {
        if (selectedIds?.includes(id)) {
          // 保留最接近子元素的选中状态的父元素
          value.selectedNode = closestNode;
          value.selectedState = 2;

          // 任一父元素被选中，直接返回
          return value;
        }
      }
    } else if (selectedIds?.includes(id)) {
      value.selectedNode = node;
      value.selectedState = 3;
      return value;
    }
  }
  return getSelectedState(node.parent as Konva.Group, selectedIds, depth + i, value);
};

// 通过stage上的节点找到关联的element数据源
export const getElementFromStageNode = (node: Konva.Node, selectedIds: string[]) => {
  const type = node?.getType();
  let id = node?.attrs.id;

  if (isElementReachesBound(type)) {
    // 到达根元素，停止查找
    return false;
  }

  if (isElement(node)) {
    id = node.parent?.attrs.id;
  }

  if (selectedIds.includes(id)) {
    return id;
  }

  return getElementFromStageNode(node.parent as Konva.Node, selectedIds);
}

/**构建子元素，序列化添加到elements数据源中
 * 
 */
export const buildChildrenElements = (node: Konva.Group, all: any = [], depth = 0) => {
  if (!node || isElementReachesBound(node?.getType())) {
    return all;
  }

  if (depth > 0 && isElement(node)) {
    if (!node.attrs.id) {
      node.attrs.id = generateId();
    }
    node.attrs.draggable = false;
    all.push({ ...node.attrs });
  }

  node.children?.forEach((child) => {
    buildChildrenElements(child as Konva.Group, all, depth + 1);
  });

  return all;
};

// 根据id查找图层元素节点
export const findElementNode = (id: string | string[], node?: Konva.Container) => {
  const ids = Array.isArray(id) ? id : [id];
  return node?.find?.(ids?.filter(_ => !!_).map(_ => `#${_}`).join(",")).map(findChildElement) || [];
};

// 根据指定id获取元素对象（不是node节点）
export const findElementsById = (elements: any[], _id: string | string[]) => {
  const ids = Array.isArray(_id) ? [..._id] : [_id];
  const els: any[] = [];

  const flatten = (elements: any[]) => {
    for (const element of elements) {
      const i = ids.indexOf(element.id);

      if (i > -1) {
        els.push(element);
        ids.splice(i, 1);
      }

      if (!ids.length) {
        return;
      }

      if (element.children) {
        flatten(element.children);
      }
    }
  };

  flatten(elements);
  return els;
};

// 对所有元素进行分组打平
export const flattenElementsByType = (elements: any[], includeTypes: string[] = [
  'image',
  'video',
  'offer'
]) => {
  const groups = {};

  const flatten = (elements: any[]) => {
    elements.forEach((element) => {
      if (includeTypes.includes(element.type)) {
        let group = groups[element.type];

        if (!group) {
          group = [];
          groups[element.type] = group;
        }

        group.push(element);
      }

      if (element.children) {
        flatten(element.children);
      }
    });
  };
  flatten(elements);
  return groups;
};

export const cloneElement = (source: any, deep = true, onClone?: (node: any, depth?: number) => any) => {
  const isArray = Array.isArray(source);

  if (isArray) {
    return source.map((element: any) => {
      return cloneElement(element, deep, onClone);
    });
  }
  
  const cloneNode = (sourceArr: any[], targetArr: any[] = [], depth = 0): any => {
    sourceArr?.forEach?.(({ ...element }: any) => {
      const newElement = {
        ...element,
        children: deep ? cloneNode(element?.children, [], depth + 1) : element?.children,
      };

      if (onClone) {
        onClone(newElement, depth);
      }

      targetArr.push(newElement);
    });

    return targetArr;
  };

  const result = cloneNode(isArray ? source : [source]);

  return isArray ? result : result[0];
};

import rect from "./rect";
import image from "./image";
import text from "./text";
import video from "./video";
import group from "./group";
import { TypeLayer } from "../types.d";

const customElements = {
  rect,
  image,
  text,
  video,
};

const allElements = {
  ...customElements,
  group,
};

/**声明自定义图层
 * 自定组件整合一堆react-konva元素实现复杂图层
 * @param {string} type 图层类型
 * @param {TypeLayer} layer 图层组件
 * @returns {void}
 */
export const defineElement = (type: string, layer: any) => {
  customElements[type] = layer;
};

export const getElementDefinition = (type?: string) => {
  return type && customElements[type];
};

export const deserializeElement = (elementData: any) => {
  const ElementDefinition = getElementDefinition(elementData.type);

  if (ElementDefinition && typeof ElementDefinition.fromJSON === "function") {
    console.log('elementData', elementData);
    return ElementDefinition.fromJSON(elementData);
  }

  return elementData;
};

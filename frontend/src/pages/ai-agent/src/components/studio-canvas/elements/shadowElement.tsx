import React, {
  useRef,
  forwardRef,
  useState,
} from "react";
import { Group } from "react-konva";
import {  generateId } from "../utils/node";

/**图层容器，具备移动、选中、拖拽、序列化、反序列化等能力
 * 图层的坐标、事件都挂在这个容器上
 * */
const ShadowElement = forwardRef(({children, ...props}: any = {}, layerRef: any = null) => {
  const ref = useRef<any>();
  const [id] = useState(generateId());

  // useEffect(() => {
  //   if (ref.current) {
  //     const parent = findParentElement(ref.current.parent);
  //     const parentId = parent?.attrs.id;
  //     const d = buildChildrenElements(ref.current);
  //   }
  // }, [ref.current]);

  return (
    <Group
      ref={ref}
      id={id}
      customType="ShadowElement"
      {...props}
    >
      {children}
    </Group>
  );
});

export default ShadowElement;

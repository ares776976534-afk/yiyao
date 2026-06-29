import React, {
  useRef,
  useCallback,
  useContext,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { Group, Rect, Transformer } from "react-konva";
import Konva from "konva";
import {
  CopyIcon,
  DeleteIcon,
  VerticalAlignTopIcon,
  VerticalAlignBottomIcon,
  DownLoadIcon,
} from "@/components/Icons/CanvasSelectMenu";
import { CanvasContext, type TypeCanvasContext } from "../context/canvas";
import PortalContainer from "./portalContainer";
import {
  isElement,
  isTopLayer,
  getSelectedState,
  findParentElement,
  findChildElement,
  buildChildrenElements,
  isInNode,
  generateId,
} from "../utils/node";
import { TypeLayer, TRANSFORMER_ANCHORS } from "../types.d";
import themeUtil from "../theme";
import styles from "./element.module.scss";
import { $t } from "@/i18n";
import { adeptKeyMap } from "../utils/shortcuts";

const defaultMenus = [
  {
    key: "copy",
    label: (
      <div className="studio-menu-item-label-with-extra">
        <span className="studio-menu-item-label">
          {$t("global-1688-ai-app.studio-canvas.elements.element.copy", "复制")}
        </span>
        <div className="studio-element-menu-extra">
          <span>{adeptKeyMap.control.symbol}</span>
          <span>C</span>
        </div>
      </div>
    ),
    icon: <CopyIcon />,
    logmap: {
      logKey: '/alphashop.32265064.copy',
    },
  },
  {
    key: "delete",
    label: $t(
      "global-1688-ai-app.studio-canvas.elements.element.delete",
      "删除"
    ),
    extra: (
      <div className="studio-element-menu-extra">
        <span>⌫</span>
      </div>
    ),
    icon: <DeleteIcon />,
    logmap: {
      logKey: '/alphashop.32265064.delete',
    },
  },

  {
    key: "levelUpAll",
    label: $t("global-1688-ai-app.studio-canvas.elements.element.zd", "置顶"),
    icon: <VerticalAlignTopIcon />,
    logmap: {
      logKey: '/alphashop.32265064.levelUpAll',
    },
  },

  {
    key: "levelDownAll",
    label: $t(
      "global-1688-ai-app.studio-canvas.elements.element.zd.2",
      "置底"
    ),
    icon: <VerticalAlignBottomIcon />,
    logmap: {
      logKey: '/alphashop.32265064.levelDownAll',
    },
  },

  {
    key: "download",
    label: $t(
      "global-1688-ai-app.studio-canvas.elements.element.download",
      "下载"
    ),
    extra: (
      <div className="studio-element-menu-extra">
        <span>{adeptKeyMap.control.symbol}</span>
        <span>E</span>
      </div>
    ),
    icon: <DownLoadIcon />,
    logmap: {
      logKey: '/alphashop.32265064.download',
    },
  },
];
interface BaseMenuProps {
  id: string;
  useDefaultMenus?: boolean;
  menuItems?: any[];
  onMenuClick?: (args: { key: string }) => void;
  onContextMenuClick?: (args: { key: string }) => void;
  onContextIdChange?: (selectedId?: string) => void;
  canvasContext?: TypeCanvasContext;
  onClose?: () => void;
}

interface ElementProps extends TypeLayer, BaseMenuProps {
  useContextMenu?: boolean;
}

/**图层容器，具备移动、选中、拖拽、序列化、反序列化等能力
 * 图层的坐标、事件都挂在这个容器上
 * */
const BaseElement = observer(
  forwardRef((props: ElementProps, outerRef: any) => {
    const {
      children,
      id: propsId,
      customType,
      draggable = false,
      useContextMenu = true,
      onContextMenuClick,
      onContextIdChange,
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
      maxHeight,
      maxWidth,
      ...extProps
    } = props || {};

    const [id] = useState(propsId || generateId());
    const [vars] = useState({ previousShape: null as Konva.Node | null });

    const ref = useRef<any>();
    const rootRef = useRef<any>();
    const transformerRef = useRef<any>(null);
    const rectRef = useRef<any>(null);
    const childrenRef = useRef<any>(null);
    const sizeRef = useRef<any>(null);
    const borderRef = useRef<any>(null);

    const canvasContext = useContext(CanvasContext);
    const { selectedIds, contextMenuElementId, elementState } = canvasContext;
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({
      left: -10000,
      top: -10000,
    });
    const [isHovered, setIsHovered] = useState(false);

    const isTop = isTopLayer(canvasContext, id);
    const selected = selectedIds?.includes(id);
    const isOnlySelected = selected && selectedIds?.length === 1;
    const isOnlyContextselected =
      selectedIds?.length === 1 &&
      contextMenuElementId &&
      id &&
      contextMenuElementId === id;

    const rectStrokeColor = selected
      ? themeUtil.var("--color-canvas-element-selected")
      : isHovered
        ? themeUtil.var("--color-canvas-element-hovered")
        : "transparent";
    const rectStrokeWidth = selected || isHovered ? 6 : 0;

    const _width = extProps.width || 0;
    const _height = extProps.height || 0;
    const rectWidth = maxWidth ? Math.min(_width, maxWidth) : _width;
    const rectHeight = maxHeight ? Math.min(_height, maxHeight) : _height;

    const scaleWidth = Math.round(rectWidth * (extProps.scaleX || 1));
    const scaleHeight = Math.round(rectHeight * (extProps.scaleY || 1));

    const toJSON = useCallback(() => {
      return ref?.current?.toJSON();
    }, [ref?.current]);

    const handleContextMenu = ({ currentTarget, evt }: any) => {
      if (
        !id ||
        !elementState.canContextMenu ||
        canvasContext.activeTool === "hand"
      ) {
        return;
      }

      evt.preventDefault();
      // 计算全局鼠标位置在元素身上的相对位置，在元素上发生的点击行为说明全局鼠标一定在元素上
      const clientRect = currentTarget.getClientRect();
      const mousePoint = {
        x: evt.clientX - clientRect.x,
        y: evt.clientY - clientRect.y,
      };

      setContextMenuPos({
        left: evt.clientX,
        top: evt.clientY,
      });
      setShowContextMenu(true);

      canvasContext.setContextMenuPoint(mousePoint);
    };

    const handleDragStart = (e) => {
      // const { dragLayer } = canvasContext;
      // if (dragLayer && rootRef.current) {
      //   // 把元素移动到拖拽层，并记录下元素以前父元素的id，用于拖拽结束时恢复元素的父元素
      //   const parentId = rootRef.current.parent?.attrs?.id;
      //   rootRef.current.moveTo(dragLayer);
      //   rootRef.current.attrs.parentId = parentId;
      // }
    };

    const handleDragMove = (e) => {
      const { x, y, width } = e.currentTarget.getClientRect();

      if (sizeRef.current) {
        sizeRef.current.style.left = x + width / 2 + "px";
        sizeRef.current.style.top = y + "px";
      }

      if (borderRef.current) {
        borderRef.current.style.left = x + "px";
        borderRef.current.style.top = y + "px";
      }

      const { layer } = canvasContext;
      const stage = e.currentTarget.getStage();
      const pos = stage?.getPointerPosition();
      const shape = layer?.getIntersection(pos);
      const { previousShape } = vars;

      if (previousShape && shape) {
        if (previousShape !== shape) {
          previousShape.fire("dragleave", { evt: e.evt }, true);
          shape.fire("dragenter", { evt: e.evt }, true);
          vars.previousShape = shape;
        } else {
          previousShape.fire("dragover", { evt: e.evt }, true);
        }
      } else if (!previousShape && shape) {
        vars.previousShape = shape;
        shape.fire("dragenter", { evt: e.evt }, true);
      } else if (previousShape && !shape) {
        previousShape.fire("dragleave", { evt: e.evt }, true);
        vars.previousShape = null;
      }
      layer.draw();
    };

    const handleDragEnd = (e) => {
      // const { layer } = canvasContext;
      // const stage = e.target.getStage();
      // const pos = stage.getPointerPosition();

      // if (layer && rootRef.current) {
      //   const dropShape = layer.getIntersection(pos);

      //   if (dropShape) {
      //     vars.previousShape?.fire("drop", { evt: e.evt }, true);
      //   }

      //   const parentNode = layer.findOne(`#${rootRef.current.attrs.parentId}`);
      //   if (parentNode) {
      //     rootRef.current.moveTo(
      //       parentNode.findOne('[name="BaseElementChildren"]')
      //     );
      //   } else {
      //     rootRef.current.moveTo(layer);
      //   }
      //   vars.previousShape = null;
      // }
    };

    const handleDragEnter = (e) => {
      onDragEnter?.(e);
    };

    const handleDragOver = (e) => {
      onDragOver?.(e);
    };

    const handleDragLeave = (e) => {
      onDragLeave?.(e);
    };

    const handleDrop = (e) => {
      onDrop?.(e);
    };

    const handlePoinerEnter = (e) => {
      if (!elementState.canHover) {
        return;
      }

      /**
       * 从当前元素向上追溯所有父元素BaseElement，如果父元素都没有被选中，当前元素可以展示hover
       * 1. 没有父元素，当前元素可以展示hover，状态值是-1
       * 2. 有父元素，且直接父元素被选中了，当前元素可以展示hover，状态值是2
       * 3. 其它情况都不展示hover状态
       *
       * 自身展示hover，父元素就不用再展示hover
       */
      const target = e.currentTarget;
      const selectedState = getSelectedState(target, selectedIds);

      if ([-1, 2].includes(selectedState.selectedState)) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handlePointerLeave = () => {
      setIsHovered(false);
    };

    // 在内存中管理重排版的元素，不能在虚拟dom的attrs上直接叠加属性值，会造成数据和dom冲突容器面板边界值无法重绘
    const updateFlowElement = function (
      updateEls: any[],
      elAttrs: any = {},
      newAttrs: any = {}
    ) {
      let el = updateEls.find((el) => el.id === elAttrs.id);

      if (!el) {
        el = elAttrs;
        updateEls.push(elAttrs);
      }

      Object.entries(newAttrs).forEach(([key, value]) => {
        if (typeof value === "function") {
          el[key] = value(el[key]);
        } else {
          el[key] = value;
        }
      });
    };

    // 自身根据子元素的坐标和尺寸，重新调整自己的坐标和尺寸
    const resizeElement = useCallback(
      (updateEls: any[] = [], depth) => {
        // 计算占位元素和容器的坐标差值，确保占位元素能覆盖整个容器
        const scale = ref.current?.getAbsoluteScale?.() || {
          x: 1,
          y: 1,
        };

        // 获取子元素的整体边界
        const containerBound = childrenRef.current?.getClientRect?.() || {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        };

        const rectBound = rectRef.current?.getClientRect?.() || {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        };

        /**
         * 父元素重新获取子元素的边界，和父元素自身的边界值进行比较
         * 如果存在差值，说明子元素的位置移动过不在父元素边界内，需要把父元素修正到子元素的左上顶点处，所有子元素的相对坐标值都要同步调整
         */
        const diffX = (containerBound.x - rectBound.x) / scale.x;
        const diffY = (containerBound.y - rectBound.y) / scale.y;
        const newRect = {
          x: diffX + ref.current?.x(),
          y: diffY + ref.current?.y(),
          width: containerBound.width / scale.x,
          height: containerBound.height / scale.y,
        };

        // 修正自身坐标，加上差值
        updateFlowElement(updateEls, ref.current.attrs, {
          x: (prev = 0) => prev + diffX,
          y: (prev = 0) => prev + diffY,

          // 更新自身的尺寸
          width: Math.ceil(newRect.width),
          height: Math.ceil(newRect.height),
        });

        // 子元素修正坐标，减去差值
        childrenRef.current.children?.forEach((_child: Konva.Node) => {
          const child = findChildElement(_child as Konva.Group);

          if (child) {
            updateFlowElement(updateEls, child.attrs, {
              x: (prev = 0) => prev - diffX,
              y: (prev = 0) => prev - diffY,
            });
          }
        });

        return updateEls;
      },
      [ref.current, rectRef.current]
    );

    const reflowElement = (
      node: Konva.Node,
      updateEls: any[] = [],
      depth = 0
    ) => {
      const parentElement =
        depth === 0 && isElement(node) ? node : findParentElement(node);
      if (parentElement) {
        canvasContext
          .getRef(parentElement.attrs.id)
          ?.resizeElement(updateEls, depth);

        reflowElement(parentElement, updateEls, depth + 1);
      }

      return updateEls;
    };

    useImperativeHandle(
      outerRef,
      () => {
        return {
          get ref() {
            return ref;
          },
          get rectRef() {
            return rectRef;
          },
          get node() {
            return ref.current;
          },
        };
      },
      [ref.current]
    );

    useEffect(() => {
      onContextIdChange?.(contextMenuElementId);
    }, [contextMenuElementId]);

    useEffect(() => {
      if (id) {
        canvasContext.setRef(id, {
          resizeElement,
        });
      }
    }, [id, resizeElement]);

    // useEffect(() => {
    //   // 对子元素进行向下数据序列化，确保dom和数据受控保持同步
    //   if (ref.current) {
    //     const d = buildChildrenElements(ref.current, canvasContext.elements);
    //     // setDataSource(d);
    //   }
    // }, [ref.current]);

    // 元素内部的形变框，待定
    // useEffect(() => {
    //   const nodes = transformerRef.current?.nodes();

    //   if (nodes) {
    //     const i = nodes?.findIndex((node) => node === ref.current);

    //     if (selectedIds?.includes(id)) {
    //       if (i === -1) {
    //         transformerRef.current?.nodes([...nodes, ref.current]);
    //       }
    //     } else if (i > -1) {
    //       nodes.splice(i, 1);
    //       transformerRef.current?.nodes(nodes);
    //     }
    //   }
    // }, [selectedIds, id, ref.current]);

    // 如果元素不可见，不渲染
    if (props.visible === false) {
      return null;
    }

    const canDrag = elementState.canDrag && draggable !== false;

    return (
      <Group ref={rootRef}>
        {/* 占位，撑开Group的宽和高 */}
        <Rect
          ref={rectRef}
          className={styles.layerContainer}
          customType="BaseElementRect"
          {...extProps}
          width={rectWidth}
          height={rectHeight}
          onContextMenu={handleContextMenu}
          draggable={canDrag}
          onDragStart={handleDragStart}
          onDragMove={(e) => {
            const x = e.currentTarget.x();
            const y = e.currentTarget.y();

            if (canDrag && ref.current) {
              ref.current.x(x);
              ref.current.y(y);
            }

            handleDragMove(e);
          }}
          onDragEnd={handleDragEnd}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        // fill="red"
        // stroke={rectStrokeColor}
        // strokeWidth={rectStrokeWidth}
        />
        <Group
          ref={ref}
          className={styles.layerContainer}
          {...extProps}
          id={id}
          clipX={0}
          clipY={0}
          clipWidth={rectWidth}
          clipHeight={rectHeight}
          customType="BaseElement"
          // 在抓取状态、只读模式下禁用元素拖拽
          draggable={canDrag}
          onContextMenu={handleContextMenu}
          onPointerEnter={handlePoinerEnter}
          onPointerLeave={handlePointerLeave}
          onDragStart={handleDragStart}
          onDragMove={(e) => {
            if (canDrag && rectRef.current) {
              rectRef.current.x(e.currentTarget.x());
              rectRef.current.y(e.currentTarget.y());
            }

            handleDragMove(e);
          }}
          onDragEnd={(e) => {
            if (!canDrag) {
              return;
            }

            handleDragEnd(e);

            const { target, currentTarget } = e;

            if (id && target === currentTarget) {
              /**
               * 拖拽结束时，更新关联的虚拟DOM的尺寸信息
               * 子元素移动到父元素的反向位置（左边界和上边界以外是负数），父元素的坐标还在原处，不会自动跟随把坐标0,0重置到子元素的左上顶点处，子元素的坐标则是负数
               *
               */
              const updateEls = reflowElement(ref.current);
              
              canvasContext.updateElement(updateEls);
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Group
            ref={childrenRef}
            name="BaseElementChildren"
            customType="BaseElementChildren"
          >
            {children}
          </Group>
        </Group>

        {/* 显示尺寸 */}
        <PortalContainer
          ref={sizeRef}
          parentRef={rectRef}
          open={isOnlySelected && isTop}
          style={{ pointerEvents: "none" }}
          transformFunc={(points) => {
            return {
              left: points.lb.x + (points.rt.x - points.lt.x) / 2 + "px",
              top: points.lt.y + "px",
              transform: `translate(-50%, calc(-100% - 12px))`,
              transformOrigin: "center center",
            };
          }}
        >
          <div className={styles.layerSizeLabel}>
            {scaleWidth} × {scaleHeight}
          </div>
        </PortalContainer>

        {/* 选中边框 */}
        {
          <PortalContainer
            ref={borderRef}
            parentRef={rectRef}
            open={selected && selectedIds?.length > 1}
            style={{ pointerEvents: "none" }}
            transformFunc={(points) => {
              return {
                left: points.lt.x + "px",
                top: points.lt.y + "px",
                width: points.rt.x - points.lt.x + "px",
                height: points.lb.y - points.lt.y + "px",
                border: "2px solid var(--color-brand-1)",
              };
            }}
          />
        }

        {/* 多选状态下自身独立展示一个选框，不可做形变操作 - 性能非常差 */}
        {/* <Transformer
        ref={transformerRef}
        flipEnabled={false}
        scaleEnabled={false}
        rotateEnabled={false}
        enabledAnchors={[]}
        borderStrokeWidth={2}
        borderStroke={rectStrokeColor}
        // borderStroke={'red'}
        // nodes={selected && ref.current ? [ref.current] : []}
      // onTransformEnd={(e) => {
      //   // 缩放、旋转、反转等形变操作后更新组件数据，并记录历史
      //   const attrs = ['height', 'width', 'x', 'y', 'rotation', 'scaleX', 'scaleY', 'skewX', 'skewY'];

      //   // 把形变数据传递给父组件
      //   canvasContext.updateElement(id, Object.fromEntries(attrs.map(attr => [attr, e.target.attrs[attr]])));
      // }}
      /> */}
      </Group>
    );
  })
);

(BaseElement as any).getMenu = (): any[] => {
  return defaultMenus;
};

export default BaseElement;

// 分离基础参数和子组件参数，避免属性和事件重复引起冲突
export const getProps = (props: TypeLayer) => {
  const {
    type,
    id,
    customType,
    visible,
    width,
    height,
    maxWidth,
    maxHeight,
    x,
    y,
    offsetX,
    offsetY,
    scaleX,
    scaleY,
    rotation,
    clipX,
    clipY,
    clipWidth,
    clipHeight,
    clipStroke,
    draggable,
    canDrop,
    opacity,
    selected,
    hovered,
    loading,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    onMouseDown,
    onMouseUp,
    onPointerEnter,
    onPointerLeave,
    onPointerMove,
    onPointerDown,
    onPointerUp,
    onClick,
    onTap,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    ...childrenProps
  } = props || {};

  const baseProps = {
    type,
    id,
    visible,
    x,
    y,
    width,
    height,
    maxWidth,
    maxHeight,
    offsetX,
    offsetY,
    scaleX,
    scaleY,
    rotation,
    clipX,
    clipY,
    clipWidth,
    clipHeight,
    clipStroke,
    draggable,
    canDrop,
    opacity,
    selected,
    hovered,
    loading,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    onMouseDown,
    onMouseUp,
    onPointerEnter,
    onPointerLeave,
    onPointerMove,
    onPointerDown,
    onPointerUp,
    onClick,
    onTap,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  };

  return {
    baseProps,
    childrenProps: {
      width,
      height,
      ...childrenProps,
    },
  };
};

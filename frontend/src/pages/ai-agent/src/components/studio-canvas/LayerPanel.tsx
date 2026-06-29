import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { ConfigProvider, Tree, Button, Input } from "antd";
import type { TreeDataNode, TreeProps } from "antd";
import { reaction, autorun } from "mobx";
import { observer } from "mobx-react-lite";
import ProgressiveImage from "@/components/ProgressiveImage";
import { IconClose, IconEyeVisible, IconEyeHidden } from "./icons";
import { CanvasContext } from "./context/canvas";
import { TypeLayer } from "./types.d";
import debounce from "lodash.debounce";
import styles from "./index.module.scss";
import { $t } from '@/i18n';

export interface LayerPanelProps {
  onElementSelect: (elementId?: string[]) => void;
  onToggle: () => void;
}

const { DirectoryTree } = Tree;

const TitleRender = (props) => {
  const { className, element, onChangeElement, onChangeDraggable } = props;
  const { displayName } = element;
  const [isDbClick, setIsDbClick] = useState(false);
  const [value, setValue] = useState(displayName);

  const changeElement = (value: string) => {
    setIsDbClick(false);
    onChangeDraggable?.(true);
    onChangeElement?.(value);
  };
  return isDbClick ? (
    <Input
      autoFocus
      value={value}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onBlur={() => {
        changeElement(value);
      }}
      onPressEnter={() => {
        changeElement(value);
      }}
    />
  ) : (
    <div
      className={styles.customTreeTitleContent}
      onDoubleClick={() => {
        setIsDbClick(true);
        onChangeDraggable?.(false);
      }}
    >
      {displayName}
    </div>
  );
};

const LayerPanel: React.FC<LayerPanelProps> = observer(
  ({ onElementSelect, onToggle }) => {
    const canvasContext = useContext(CanvasContext);
    const { elements, selectedIds, setSelectedIds } = canvasContext;
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

    const [draggable, setDraggable] = useState<boolean>(true);

    const generateVisibilityButton = (element, id) => {
      const { visible = true } = element;
      return (
        <Button
          className={`${styles.visibilityButton} ${!visible ? styles.visibilityHidden : ""
            }`}
          type="text"
          size="small"
          icon={visible === false ? <IconEyeHidden /> : <IconEyeVisible />}
          onClick={(e) => {
            e.stopPropagation();

            const v = !visible;

            canvasContext?.updateElement(id, { visible: v });

            // 如果隐藏的图层是当前选中的图层，清除选中状态
            if (!v && selectedIds.includes(id)) {
              setSelectedIds(selectedIds?.filter((id) => id !== id));
            }
          }}
        />
      );
    };

    // 生成带按钮的标题组件
    const generateTitle = (element: any, shouldShowButton) => {
      const { type, id, attributes = {}, visible, icon } = element;

      let Icon: any;
      switch (type) {
        case "image":
          Icon = (
            <img src={attributes.src} />
          );
          break;
        default:
          Icon = icon;
          break;
      }

      return (
        <div className={`${styles.titleContainer}${visible === false ? ` ${styles.invisible}` : ''}`}>
          <div className={styles.customTreeTitle}>
            <div className={styles.previewImage}>
              {Icon}
            </div>
            <TitleRender
              element={element}
              onChangeDraggable={(value: boolean) => {
                setDraggable(value);
              }}
              onChangeElement={(value) => {
                // 重置画布
                if (value) {
                  element.displayName = value;
                  canvasContext?.canvas?.resetElements([...elements]);
                }
              }}
            />
          </div>

          {shouldShowButton && generateVisibilityButton(element, id)}
        </div>
      );
    };

    /**
     * 将 elements 数组转换为 Ant Design Tree 组件需要的数据结构
     * @param {Array} elements - 原始元素数组
     * @returns {Array} 转换后的树结构数据
     */
    function generateData(elements) {
      if (!Array.isArray(elements)) {
        return [];
      }

      const convertElement = (element, index, isChild = false) => {
        const { type, id, children } = element;
        const hasChildren =
          children && Array.isArray(children) && children.length > 0;
        // 决定是否显示 VisibilityButton
        // 规则：
        // 1. 没有子节点的单一节点 -> 显示按钮
        // 2. 有子节点的分组节点 -> 显示按钮
        // 3. 分组内的子节点 -> 不显示按钮
        const shouldShowButton = !isChild || hasChildren;

        // 构建基础节点数据
        const nodeData: any = {
          title: generateTitle(element, shouldShowButton),
          key: id || `${type}-${index}`,
          // 存储原始数据，便于后续操作
          element,
          hasParent: isChild,
        };

        // 如果有子元素，递归处理
        if (hasChildren) {
          nodeData.children = children.map((child, childIndex) =>
            convertElement(child, childIndex, true)
          );
        }

        return nodeData;
      };

      return elements.map((element, index) => convertElement(element, index));
    }

    const onDrop: TreeProps["onDrop"] = (info) => {
      const dropKey = info.node.key;
      const dragKey = info.dragNode.key;
      const dropPos = info.node.pos.split("-");
      const dropPosition =
        info.dropPosition - Number(dropPos[dropPos.length - 1]); // the drop position relative to the drop node, inside 0, top -1, bottom 1

      const loop = (
        data: TreeDataNode[],
        key: React.Key,
        callback: (node: TreeDataNode, i: number, data: TreeDataNode[]) => void
      ) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].key === key) {
            return callback(data[i], i, data);
          }
          if (data[i].children) {
            loop(data[i].children!, key, callback);
          }
        }
      };
      const data = [...treeData];

      // Find dragObject
      let dragObj: TreeDataNode;
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });

      if (!info.dropToGap) {
        // Drop on the content
        // TODO 拖入子节点，要转为在这个Group内的相对坐标
        loop(data, dropKey, (item) => {
          item.children = item.children || [];
          // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
          item.children.unshift(dragObj);
        });
      } else {
        let ar: TreeDataNode[] = [];
        let i: number;
        loop(data, dropKey, (_item, index, arr) => {
          ar = arr;
          i = index;
        });
        // TODO 拖入同级节点，要转为画布的绝对坐标
        if (dropPosition === -1) {
          // Drop on the top of the drop node
          ar.splice(i!, 0, dragObj!);
        } else {
          // Drop on the bottom of the drop node
          ar.splice(i! + 1, 0, dragObj!);
        }
      }

      // 递归提取所有elements的函数，保持树形结构
      const extractElements = (treeNodes: any[]): TypeLayer[] => {
        const result: TypeLayer[] = [];

        for (const node of treeNodes) {
          if (node.element) {
            const { children, ...args } = node.element;
            const element = args as any;
            const hasChildren =
              Array.isArray(node.children) && node.children.length > 0;
            const hadChildrenProp = Object.prototype.hasOwnProperty.call(
              node.element,
              "children"
            );

            // 如果有children，递归处理并保持结构；
            // 如果原始元素存在children属性但当前无子节点，保留为空数组
            if (hasChildren) {
              element.children = extractElements(node.children);
            } else if (hadChildrenProp) {
              element.children = [];
            }

            result.push(element);
          }
        }

        return result;
      };
      // 更新canvasStore中的elements
      if (canvasContext?.canvas?.resetElements) {
        const extractedElements = extractElements(data);
        canvasContext.canvas.resetElements(extractedElements);
      }
    };

    const onSelect: TreeProps["onSelect"] = debounce(
      (selectedKeysValue, info: any) => {
        // Group下的子节点不可以被选中
        // if (info.node.hasParent) {
        //   return;
        // }
        setSelectedKeys(selectedKeysValue);
        // setSelectedElements(info.selectedNodes.map((item) => item.element));
        onElementSelect(selectedKeysValue[0]);
      },
      250
    );

    const [treeData, setTreeData] = useState<TreeDataNode[]>(generateData(elements));

    useEffect(() => {
      const dispose = reaction(
        // 追踪函数，返回要观察的值
        () => {
          return elements.slice();
        },
        // 副作用函数，当观察的值变化时执行
        (newElements) => {
          // 当 elements 变化时，更新 treeData
          setTreeData(generateData(newElements));
        },
        {
          fireImmediately: false, // 不立即执行，因为上面已经执行了一次
          equals: (a, b) => {
            // 自定义比较函数，比较数组长度和内容
            if (a.length !== b.length) return false;
            return a.every((item, index) => item === b[index]);
          }
        }
      );

      // 清理函数：组件卸载时销毁 reaction
      return () => {
        dispose();
      };
    }, []);

    return (
      <div className={styles.layerPanel}>
        <div className={styles.layerHeader}>
          <span className={styles.layerTitle}>{$t("global-1688-ai-app.studio-canvas.LayerPanel.tc", "图层")}</span>
          <Button
            type="text"
            size="small"
            onClick={onToggle}
            icon={<IconClose />}
            className={styles.closeButton}
          />
        </div>
        {/* <Button onClick={() => {
          canvasContext.groupElements(selectedElements);
        }}>合并分组</Button>
        <Button onClick={() => {
          canvasContext.ungroupElements(selectedElements);
        }}>解散分组</Button> */}
        <div className={styles.layerList}>
          {elements.length === 0 ? (
            <div className={styles.emptyLayerHint}>{$t("global-1688-ai-app.studio-canvas.LayerPanel.zwtc", "暂无图层")}</div>
          ) : (
            <DirectoryTree
              className={styles.layerTree}
              draggable={
                draggable
                  ? {
                    icon: false,
                  }
                  : false
              }
              blockNode
              treeData={treeData}
              selectedKeys={selectedKeys}
              onSelect={onSelect}
              onDrop={onDrop}
              multiple
              allowDrop={({ dropNode, dropPosition }) => {
                // 仅当原始元素存在 children 属性才允许作为容器放入
                const acceptsChildren =
                  !!dropNode?.element &&
                  dropNode.element.children !== undefined;
                if (!acceptsChildren) {
                  // 不允许作为容器放入，但允许 gap 放置（上下插入）
                  return dropPosition !== 0; // 0 表示放入内容
                }
                return true;
              }}
            />
          )}
        </div>
      </div>
    );
  }
);

export default LayerPanel;

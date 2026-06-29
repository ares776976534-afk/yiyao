import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  forwardRef,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { Select, Button, ColorPicker, InputNumber, Divider } from "antd";
import {
  FontSizeOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  ColumnWidthOutlined,
  LineHeightOutlined,
} from "@ant-design/icons";
import Konva from "konva";
import { Text } from "react-konva";
import { Html } from "react-konva-utils";
import BaseElement, { getProps } from "./element";
import { CanvasContext } from "../context/canvas";
import { TypeLayer } from "../types.d";
import styles from "./element.module.scss";
import { $t } from '@/i18n';

interface EditRect {
  lt: { x: number; y: number };
  rt: { x: number; y: number };
  lb: { x: number; y: number };
  rb: { x: number; y: number };
}

interface TextEditMenuProps {
  textAttributes: any;
  onAttributeChange: (key: string, value: any) => void;
  editRect?: EditRect;
}

const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;

  return {
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isChrome: /Chrome/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent),
    isEdge: /Edge/.test(userAgent),
    isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
  };
};

const TextEditor = ({ textNode, onClose, onChange, onBlur }) => {
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editableRef.current) return;

    const editableDiv = editableRef.current;

    const textPosition = textNode.position();
    const size = textNode.size();

    const areaPosition = {
      x: textPosition.x,
      y: textPosition.y,
    };

    const { isChrome } = getBrowserInfo();

    // Match styles with the text node
    editableDiv.innerText = textNode.text();
    editableDiv.style.position = "absolute";
    editableDiv.style.top = `${areaPosition.y - (isChrome ? 1 : 0)}px`;
    editableDiv.style.left = `${areaPosition.x}px`;
    editableDiv.style.width = `${size.width}px`;
    editableDiv.style.height = `${size.height}px`;
    editableDiv.style.fontSize = `${textNode.fontSize()}px`;
    editableDiv.style.border = "none";
    editableDiv.style.padding = "0px";
    editableDiv.style.margin = "0px";
    editableDiv.style.overflow = "hidden";
    editableDiv.style.background = "none";
    editableDiv.style.outline = "none";
    editableDiv.style.lineHeight = textNode.lineHeight();
    editableDiv.style.fontFamily = textNode.fontFamily();
    editableDiv.style.transformOrigin = "left top";
    editableDiv.style.textAlign = textNode.align();
    editableDiv.style.color = textNode.fill();
    editableDiv.style.letterSpacing = `${textNode.letterSpacing() || 0}px`;

    // Safari 兼容性样式
    editableDiv.style.webkitUserSelect = "text";

    const rotation = textNode.rotation();
    let transform = "";
    if (rotation) {
      transform += `rotateZ(${rotation}deg)`;
    }
    editableDiv.style.transform = transform;

    // 设置高度自适应
    editableDiv.style.height = "auto";
    editableDiv.style.height = `${editableDiv.scrollHeight}px`;

    editableDiv.focus();

    // 默认选中全部文字
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(editableDiv);
    selection?.removeAllRanges();
    selection?.addRange(range);

    const handleGetText = () => {
      let newValue = "";
      let isOnFreshLine = true;

      // 递归函数，遍历子节点并构建带换行符的文本
      const parseChildNodesForValueAndLines = (childNodes) => {
        for (let i = 0; i < childNodes.length; i++) {
          const childNode = childNodes[i];

          if (childNode.nodeName === "BR") {
            // BR标签总是换行符，这意味着下一次循环是在新行上
            newValue += "\n";
            isOnFreshLine = true;
            continue;
          }

          // 我们可能需要也可能不需要创建新行
          if (childNode.nodeName === "DIV" && isOnFreshLine === false) {
            // 如果DIV不在新行上，则为自己创建新行
            newValue += "\n";
          }

          // 无论我们是否创建了新行，我们都会将其用于此内容，所以下一次循环将不在新行上：
          isOnFreshLine = false;

          // 如果这是文本节点，添加文本内容：
          if (childNode.nodeType === 3 && childNode.textContent) {
            newValue += childNode.textContent;
          }

          // 如果此节点有子节点，也要进入它们：
          parseChildNodesForValueAndLines(childNode.childNodes);
        }
      };
      // 解析子节点的HTML和换行符：
      parseChildNodesForValueAndLines(editableDiv.childNodes);

      return newValue;
    };

    const handleChangeText = () => {
      const newValue = handleGetText();
      onChange(newValue);
      onClose();
    };

    const handleOutsideClick = (e) => {
      e.stopPropagation();
      if (e.target !== editableDiv && !editableDiv.contains(e.target as Node)) {
        handleChangeText();
      }
    };

    const handleKeyDown = (e) => {
      e.stopPropagation();
      if (e.key === "Escape") {
        handleChangeText();
      }
    };

    const handleInput = (e) => {
      e.stopPropagation();
      // 重置为 auto 再按内容高度自适应，避免删除到一行时出现裁剪
      editableDiv.style.height = "auto";
      editableDiv.style.height = `${editableDiv.scrollHeight}px`;
    };

    const handleBlur = () => {
      const newValue = handleGetText();
      onBlur(newValue);
    };

    editableDiv.addEventListener("keydown", handleKeyDown);
    editableDiv.addEventListener("input", handleInput);
    editableDiv.addEventListener("blur", handleBlur);
    window.addEventListener("pointerdown", handleOutsideClick, true);

    return () => {
      editableDiv.removeEventListener("keydown", handleKeyDown);
      editableDiv.removeEventListener("input", handleInput);
      editableDiv.removeEventListener("blur", handleBlur);
      window.removeEventListener("pointerdown", handleOutsideClick, true);
    };
  }, [textNode, onChange, onClose]);

  return (
    <Html>
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        style={{
          minHeight: "1em",
          position: "absolute",
        }}
      />
    </Html>
  );
};

const calcEditRect = (rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  const lt = { x: rect.x, y: rect.y };
  const rt = { x: rect.x + rect.width, y: rect.y };
  const lb = { x: rect.x, y: rect.y + rect.height };
  const rb = { x: rect.x + rect.width, y: rect.y + rect.height };

  return { lt, rt, lb, rb };
};

const aliginOptions = [
  { label: <AlignLeftOutlined />, value: "left" },
  { label: <AlignCenterOutlined />, value: "center" },
  { label: <AlignRightOutlined />, value: "right" },
];

const TextEditMenu: React.FC<TextEditMenuProps> = ({
  textAttributes,
  onAttributeChange,
  editRect,
}) => {
  const {
    fontFamily,
    fontSize,
    fill,
    fontStyle,
    textDecoration,
    align,
    letterSpacing,
    lineHeight,
  } = textAttributes || {};

  const fontOptions = [
    { label: "Arial", value: "Arial" },
    { label: "Helvetica", value: "Helvetica" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Georgia", value: "Georgia" },
    { label: "Verdana", value: "Verdana" },
    { label: $t("global-1688-ai-app.studio-canvas.elements.text.wryh", "微软雅黑"), value: "Microsoft YaHei" },
    { label: $t("global-1688-ai-app.studio-canvas.elements.text.st", "宋体"), value: "SimSun" },
    { label: $t("global-1688-ai-app.studio-canvas.elements.text.ht", "黑体"), value: "SimHei" },
  ];

  const menuRef = useRef(null);
  const isBold = fontStyle?.includes("bold") || false;
  const isItalic = fontStyle?.includes("italic") || false;
  const hasUnderline = textDecoration?.includes("underline") || false;

  const handleFontStyleChange = (styleType: "bold" | "italic") => {
    let newFontStyle = fontStyle || "normal";

    if (styleType === "bold") {
      if (isBold) {
        newFontStyle = newFontStyle.replace("bold", "").trim() || "normal";
      } else {
        newFontStyle =
          newFontStyle === "normal" ? "bold" : `${newFontStyle} bold`;
      }
    }

    if (styleType === "italic") {
      if (isItalic) {
        newFontStyle = newFontStyle.replace("italic", "").trim() || "normal";
      } else {
        newFontStyle =
          newFontStyle === "normal" ? "italic" : `${newFontStyle} italic`;
      }
    }

    onAttributeChange("fontStyle", newFontStyle.trim());
  };

  const handleUnderlineChange = () => {
    const newDecoration = hasUnderline ? "" : "underline";
    onAttributeChange("textDecoration", newDecoration);
  };

  // 计算菜单位置：在文本上方居中
  const menuStyle = useMemo(() => {
    if (!editRect) return {};

    const centerX = (editRect.lt.x + editRect.rt.x) / 2;
    const topY = editRect.lt.y;

    return {
      left: centerX,
      top: topY - 50,
      transform: "translateX(-50%)", // 水平居中
    };
  }, [editRect]);

  return (
    <div className={styles["text-edit-menu"]} style={menuStyle} ref={menuRef}>
      <div className={styles["menu-content"]}>
        {/* 字体选择 */}
        {/* <Select
          value={fontFamily}
          style={{ width: 120 }}
          size="small"
          options={fontOptions}
          onChange={(value) => onAttributeChange("fontFamily", value)}
        />

        <Divider type="vertical" /> */}

        {/* 字体大小 */}
        <InputNumber
          value={fontSize}
          style={{ width: 80 }}
          min={8}
          max={200}
          size="small"
          prefix={<FontSizeOutlined />}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(value) => onAttributeChange("fontSize", value)}
        />

        {/* 字体样式按钮 */}
        <Button
          type={isBold ? "primary" : "text"}
          size="small"
          icon={<BoldOutlined />}
          onClick={() => handleFontStyleChange("bold")}
        />

        <Button
          type={isItalic ? "primary" : "text"}
          size="small"
          icon={<ItalicOutlined />}
          onClick={() => handleFontStyleChange("italic")}
        />

        <Button
          type={hasUnderline ? "primary" : "text"}
          size="small"
          icon={<UnderlineOutlined />}
          onClick={handleUnderlineChange}
        />

        {/* 颜色选择 */}
        <div onKeyDown={(e) => e.stopPropagation()}>
          <ColorPicker
            value={fill}
            size="small"
            onChange={(color) => onAttributeChange("fill", color.toHexString())}
            getPopupContainer={() => {
              return menuRef?.current || document.body;
            }}
          />
        </div>

        {/* 对齐方式 */}
        <Select
          value={align}
          size="small"
          options={aliginOptions}
          onChange={(value) => onAttributeChange("align", value)}
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
        />

        <Divider type="vertical" />

        {/* 行间距 */}
        <InputNumber
          value={letterSpacing}
          style={{ width: 80 }}
          controls={false}
          size="small"
          prefix={<ColumnWidthOutlined />}
          suffix="%"
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(value) => onAttributeChange("letterSpacing", value)}
        />

        {/* 行高 */}
        <InputNumber
          value={lineHeight}
          style={{ width: 60 }}
          controls={false}
          size="small"
          prefix={<LineHeightOutlined />}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(value) => onAttributeChange("lineHeight", value)}
        />
      </div>
    </div>
  );
};

type TextElementComponent = React.ForwardRefExoticComponent<
  TypeLayer & React.RefAttributes<any>
> & {
  icon?: string;
  displayName?: string;
};

const Element = forwardRef((props: TypeLayer, ref: any) => {
  const { baseProps, childrenProps } = getProps(props);
  const { id } = baseProps;
  const { attributes, ...rest } = childrenProps;
  const { text } = attributes || {};
  const [isEditing, setIsEditing] = useState(false);
  const [textWidth, setTextWidth] = useState<null | number>(null);
  const [editRect, setEditRect] = useState<EditRect>();
  const textRef = useRef<Konva.Text>(null);
  const isMultiline = typeof text === "string" && /\n|\r|\r\n/.test(text);
  const baseRef = useRef<Konva.Node>();
  const canvasContext = useContext(CanvasContext);
  const selectedIds = canvasContext?.selectedIds || [];

  // 唯一选中的元素才显示选中菜单
  const isOnlySelected =
    selectedIds?.length === 1 && selectedIds.includes(props.id);

  const handleBlur = (newText) => {
    props.onBlur?.(newText || "");
    handleClose();
  };

  const handleTextDblClick = () => {
    setIsEditing(true);
    canvasContext.setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
    canvasContext.setIsEditing(false);
  };

  const handleTextChange = (newText) => {
    canvasContext.updateElement(id, { text: newText });
  };

  const handleAttributeChange = useCallback(
    (key: string, value: any) => {
      canvasContext.updateElement(id, { [key]: value });
    },
    [canvasContext, id]
  );

  const handleTransform = useCallback(
    (attrs: any) => {
      const rect = textRef?.current?.getClientRect?.() || {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
      const newEditRect = calcEditRect(rect);
      setEditRect(newEditRect);
      return attrs;
    },
    [textRef]
  );

  const handleTransformEnd = (e) => {
    const node = textRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const currentFontSize = node.fontSize();
    const currentWidth = node.width();
    const newFontSize = Math.max(1, currentFontSize * scaleY);
    const newWidth = Math.max(30, currentWidth * scaleX);
    // 更新节点属性，确保导出的数据为放大后的值
    node.setAttrs({
      width: newWidth,
      fontSize: newFontSize,
      scaleX: 1,
      scaleY: 1,
    });
    // 同步本地状态，避免视觉与导出不一致
    setTextWidth(newWidth);
  };

  useEffect(() => {
    if (isEditing) return; // 编辑状态下不更新

    const newElements = canvasContext.elements.map((it) => {
      const item = { ...it } as any;
      if (item.id === id) {
        if (!isMultiline && textWidth !== null) {
          item.width = Math.ceil(textWidth);
        } else if (isMultiline) {
          delete item.width;
        }
      }
      return item;
    });
    canvasContext.setElements(newElements);
  }, [isMultiline, textWidth, isEditing]);

  return (
    <BaseElement
      ref={baseRef}
      {...baseProps}
      type="text"
    >
      <Text
        // wrap={'none'}
        {...rest}
        {...attributes}
        ref={textRef}
        visible={!isEditing}
        onDblClick={handleTextDblClick}
        onDblTap={handleTextDblClick}
        onTransformEnd={handleTransformEnd}
      />
      {isEditing && (
        <TextEditor
          textNode={textRef.current}
          onChange={handleTextChange}
          onClose={handleClose}
          onBlur={handleBlur}
        />
      )}
      {/* 文本编辑菜单 */}
      {/* {isOnlySelected && (
        <Html transformFunc={handleTransform}>
          {createPortal(
            <div data-root="studio">
              <TextEditMenu
                textAttributes={rest}
                onAttributeChange={handleAttributeChange}
                editRect={editRect}
              />
            </div>,
            document.body
          )}
        </Html>
      )} */}
    </BaseElement>
  );
}) as TextElementComponent;

Element.icon = "T";
Element.displayName = $t("global-1688-ai-app.studio-canvas.elements.text.wb", "文本");

export default Element;

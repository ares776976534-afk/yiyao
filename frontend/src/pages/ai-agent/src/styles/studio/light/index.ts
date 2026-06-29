import zhCN from "antd/locale/zh_CN";
import { COLORS } from "@/styles/css-variables";
import common from "../common";

export const cssVariables = {
  ...common,
  ...COLORS,

  // 页面背景色
  "page-bg-color": "#fff",
  // 首页背景色
  "home-page-bg-color": "#F7F7FA",
  // 滚动条颜色
  "scrollbar-color": "var(--color-black-40)",
  // antd的虚拟列表滚动条内部颜色，使用变量控制滚动条背景色
  "rc-virtual-list-scrollbar-bg": "var(--color-black-40)",

  "history-more-icon-color": "#1B1C1D",
  "history-list-bg": "#FCFCFF",
  "history-list-border": "1px solid #F3F3F6",

  "primary-color": "#fff",
  "primary-bg": "var(--color-brand-1)",
  "primary-hover-bg": "var(--color-brand-1)",
  "primary-disabled-bg": "#5363f580",
  "block-color": "#1B1C1D",
  "block-color-2": "#010101",
  "block-color-3": "#7C7F9A",
  "block-help-color": "var(--color-black-40)",
  "block-bg": "#fff",
  "block-hover-bg": "#F7F7FA",
  "block-hover-bg-2": "#F1F1F7",
  "block-placeholder-color": "#BBBDCA",
  "block-border-color": "#E7E8EE",
  "block-border-color2": "#F7F7FA",
  "block-border": "1px solid var(--block-border-color)",
  "block-border-radius": "12px",
  "divider-color": "#F3F3F6",
  "select-dropdown-border": "1px solid var(--block-border-color)",

  "block-btn-bg": "#fff",
  "block-btn-hover-bg": "#F7F7FA",
  "block-btn-border": "1px solid var(--block-border-color)",
  "file-box-background": "var(--color-black-6, rgba(0, 0, 0, 0.06))",
  // 遮罩背景色
  "block-mask-bg": "rgba(0, 0, 0, .8)",
  // 商品上传
  "offer-link-analysis-bg": "var(--block-bg)",
  "offer-link-analysis-border-color": "var(--block-border-color)",

  // 上传删除图标背景色
  "upload-delete-icon-bg-color": "rgba(0, 0, 0, 0.3)",

  // 控件边框
  "control-border": "1px solid var(--block-border-color)",
  // 案例模态框
  "case-modal-bg": "#fff",
  "case-mask-bg":
    "linear-gradient(180deg,rgba(255, 255, 255, 0.7) 0%,rgba(255, 255, 255, 0) 97%)",
  "case-share-controller-bg": "#FBFBFD",
  "case-share-controller-border-color": "#E7E8EE",

  // 案例工具
  "case-tools-color-text": "var(--block-color)",
  "case-tools-area-border-color": "#E7E8EE",
  "case-tools-area-border-color-hover": "#c8cad6",
  "case-tools-area-bg": "#fff",
  "case-tools-divider-line-color":
    "linear-gradient(90deg, #E9E9EE 5%, rgba(233, 233, 238, 0) 100%)",
  "case-tools-item-bg": "#F7F7FA",

  // 文本颜色
  "studio-color-text": "var(--color-black-60)",
  // 文本颜色 - 次要
  "studio-text-color-secondary": "#7c7f9a",
  // 标题颜色
  "studio-color-text-heading": "var(--block-color)",
  // 文本颜色 - 字数限制
  "studio-color-text-description": "#BBBDCA",
  // toast 背景色
  "toast-info-bg": "#fff",
  "toast-success-bg": "#E7FCED",
  "toast-error-bg": "#FFF3F3",
  "toast-warning-bg": "#FFF3F3",
  // toast 文本色
  "toast-info-text": "#010101",
  "toast-success-text": "#010101",
  "toast-error-text": "#010101",
  "toast-warning-text": "#010101",
  // toast icon色
  "toast-info-icon": "var(--color-brand-1)",
  "toast-success-icon": "#21A84A",
  "toast-error-icon": "#F55353",
  "toast-warning-icon": "#F55353",
  // 插入光标颜色
  "chat-caret-color": "var(--color-brand-1)",
  // 输入框颜色
  "chat-input-color": "var(--block-color, #1B1C1D)",

  /* 时光机 - 背景色 */
  "color-chat-bg": "var(--block-bg)",
  /* 时光机 - placeholder色 */
  "color-chat-placeholder-color": "var(--block-placeholder-color)",
  /* 时光机 - 用户文本颜色 */
  "chat-user-text-color": "var(--block-color-2)",
  /* 时光机 - 用户文本背景色 */
  "chat-user-text-bg": "var(--block-hover-bg)",
  /* 时光机 - AI文本颜色 */
  "chat-ai-text-color": "var(--block-color-2)",
  /* 时光机 - AI文本背景色 */
  "chat-ai-text-bg": "var(--block-hover-bg)",
  /* 时光机 - AI标题色 */
  "chat-ai-title-color": "var(--color-brand-1)",
  /* 时光机 - 折叠遮罩色 */
  "chat-collapsed-mask-color":
    "linear-gradient(180deg, rgba(255, 255, 255, 0) 3%, #FBFBFD 100%)",
  /* 时光机 知识库卡片 - 背景色 */
  "chat-knowledge-bg": "#F7F7FA",
  /* 时光机 知识库卡片 - 文本知识项背景色 */
  "chat-knowledge-item-bg": "#fff",
  /* 时光机 知识库卡片 - 边框色 */
  "chat-knowledge-border-color": "#F3F3F6",

  /* 画布背景色 */
  "canvas-bg": "#F7F7FA",
  // 商品卡片文字色
  "canvas-offer-color": "#000",
  // 商品卡片背景色
  "canvas-offer-bg": "var(--color-black-4)",
  // 商品卡片边框色
  "canvas-offer-border-color": "#CDD0E2",
  // 商品卡片-标签背景色
  "canvas-offer-section-label-bg": "var(--color-white-60)",
  // 商品卡片-标签背景色
  "canvas-offer-sku-item-border-color": "#D6D6D6",
  // 商品卡片-折叠按钮渐变背景
  "canvas-offer-sku-collapse-linear-gradient": "0, #EDEDF000, 0.62, #EDEDF0",

  "menu-bg": "var(--color-white-80)",
  "menu-hover-bg": "var(--block-hover-bg)",
  "menu-box-shadow": "0px -1px 0px 0px #F0F0F4",
  "menu-backdrop-filter": "blur(30px)",
  "menu-item-color": "var(--block-color)",
  "menu-item-hover-color": "var(--block-color)",
  "menu-item-active-color": "var(--block-color)",
  "menu-item-extra-color": "#7C7F9A",
  "menu-border-radius": "12px",
  "menu-divider-color": "var(--color-black-8)",
  "menu-untransparent-bg": "#fff",

  /* 画布工具 */
  "canvas-tool-bg": "var(--color-black-4)",

  // 弹框背景色
  "modal-content-bg": "var(--block-bg)",
  "modal-color": "var(--block-color)",
  "modal-title-color": "var(--block-color)",
  "modal-close-color": "var(--block-color)",
  "modal-close-hover-color": "var(--block-color)",
  "modal-close-hover-bg": "var(--block-hover-bg)",

  // 树菜单
  "tree-node-hover-bg": "var(--color-black-4)",
  "tree-node-hover-color": "var(--block-color)",
  "tree-node-selected-bg": "var(--color-black-4)",
  "tree-node-selected-color": "var(--block-color)",
  "tree-directory-node-selected-bg": "var(--color-black-4)",
  "tree-directory-node-selected-color": "var(--block-color)",
  "tree-control-item-bg-hover": "var(--color-black-4)",

};

// studio Design v5 配置
export const antdTokenConfig = {
  locale: zhCN,
  button: { autoInsertSpace: false },
  Modal: {
    marginXS: "12px",
    headerMarginBottom: "20px",
    titleColor: cssVariables["modal-title-color"],
    colorTextHeading: cssVariables["modal-title-color"],
    headerBg: cssVariables["modal-content-bg"],
    contentBg: cssVariables["modal-content-bg"],
    contentPadding: "20px",
    colorText: cssVariables["modal-color"],
    colorIcon: cssVariables["modal-color"],
    colorIconHover: "red", // cssVariables["modal-color"],
    colorIconActive: cssVariables["modal-color"],
    colorBgTextHover: cssVariables["modal-color"],
    colorBgTextActive: cssVariables["modal-color"],
    buttonContentFontSize: "12px",
    contentFontSize: "12px",
  },
  theme: {
    cssVar: true,
    hashed: true,
    token: {
      colorPrimary: cssVariables["color-brand-1"],
      colorText: cssVariables["block-color"],
      colorTextHeading: cssVariables["studio-color-text-heading"],
      colorTextDescription: cssVariables["studio-color-text-description"],
      colorBorder: "var(--block-border-color)",
      colorBgMask: cssVariables["block-mask-bg"],
      lineWidthFocus: 0,
      borderRadius: parseInt(cssVariables["border-radius"]),
      borderRadiusLG: parseInt(cssVariables["border-radius-lg"]),
    },
    components: {
      Button: {
        colorText: cssVariables["color-white"],
        colorTextDisabled: cssVariables["color-white-50"],
        colorBgContainerDisabled: cssVariables["color-brand-1-disabled"],
        borderColorDisabled: cssVariables["color-brand-1-disabled"],

        defaultColor: cssVariables["block-color"],
        defaultBg: cssVariables["block-bg"],
        defaultBorderColor: cssVariables["block-border-color"],
        defaultBorderColorDisabled: cssVariables["block-border-color"],

        defaultHoverColor: cssVariables["block-color"],
        defaultHoverBg: cssVariables["block-hover-bg"],
        defaultHoverBorderColor: cssVariables["block-border-color"],
        defaultShadow: "none",

        defaultActiveColor: cssVariables["block-color"],
        defaultActiveBg: cssVariables["block-hover-bg"],
        defaultActiveBorderColor: cssVariables["block-border-color"],

        primaryColor: cssVariables["color-white"],
        primaryHover: cssVariables["color-brand-1"],
        primaryShadow: "none",

        ghostBg: "transparent",
        defaultGhostColor: "var(--color-brand-1)",
        defaultGhostBorderColor: "var(--color-brand-1)",

        dangerShadow: "none",

        paddingInline: 10,
        paddingBlock: 7,
        controlHeight: 36, // 字号14px下控件高度36
        contentFontSize: 14, // 默认字号14px
      },
      Checkbox: {
        colorText: cssVariables["color-text"],
        colorTextDisabled: cssVariables["color-white-50"],
        colorBgContainerDisabled: cssVariables["color-brand-1-disabled"],
        borderColorDisabled: cssVariables["color-brand-1-disabled"],
      },
      Popover: {
        colorText: cssVariables["block-color"],
        colorBgElevated: "var(--menu-untransparent-bg)",
        borderRadiusLG: 12,
        innerPadding: 16,
      },
      Modal: {
        marginXS: "12px",
        headerMarginBottom: "20px",
        titleColor: cssVariables["color-white"],
        colorTextHeading: cssVariables["color-white"],
        headerBg: cssVariables["modal-content-bg"],
        contentBg: cssVariables["modal-content-bg"],
        contentPadding: "20px",
        colorText: cssVariables["modal-color"],
        colorIcon: cssVariables["modal-color"],
        colorIconHover: cssVariables["modal-close-hover-color"],
        colorIconActive: cssVariables["modal-close-hover-color"],
        colorBgTextHover: cssVariables["modal-close-hover-bg"],
        colorBgTextActive: cssVariables["modal-close-hover-bg"],
        buttonContentFontSize: "12px",
        contentFontSize: "12px",
      },
      Dropdown: {
        colorText: cssVariables["modal-color"],
        colorBgElevated: cssVariables["modal-content-bg"],
        controlItemBgHover: "var(--color-black-4)",
        controlItemBgActive: "var(--color-black-4)",
        controlItemBgActiveHover: "var(--color-black-4)",
      },
      Input: {
        colorText: "var(--block-color)", // 文本色
        colorTextPlaceholder: "var(--block-placeholder-color)", // placeholder色
        colorBorder: "var(--block-border-color)", // 默认使用的边框颜色
        hoverBorderColor: "#C8CAD6", // 悬浮态边框色
        activeBorderColor: "#C8CAD6", // 激活态边框色
        hoverBg: "#fff", // 输入框hover状态时背景颜色
        activeBg: "#fff", // 输入框激活状态时背景颜色
        colorBgContainer: "#fff", // 组件的容器背景色
        colorBgContainerDisabled: "#FBFBFD", // 控制容器在禁用状态下的背景色
        colorTextDisabled: "#7C7F9A", // 控制禁用状态下的字体颜色
        activeShadow: "none", // 激活态阴影
      },
      Select: {
        // selector
        colorText: "var(--block-color)", // 文本色
        selectorBg: "#fff", // 选框背景色
        colorBgContainer: "var(--page-bg-color)", // 组件的容器背景色
        colorTextPlaceholder: "var(--block-placeholder-color)", // placeholder颜色
        colorBorder: "var(--block-border-color)", // 默认使用的边框颜色
        hoverBorderColor: "var(--block-border-color)", // 悬浮态边框色
        activeBorderColor: "var(--block-border-color)", // 激活态边框色
        controlOutlineWidth: 0, // hide boxshadow
        colorTextDisabled: "#7C7F9A",
        colorBgContainerDisabled: "#FBFBFD", // 控制容器在禁用状态下的背景色

        // option
        colorBgElevated: "#fff", // 浮层容器背景色
        optionSelectedBg: "var(--color-black-4)", // 选项选中时背景色
        optionActiveBg: "var(--color-black-4)", // 选项激活态时背景色
        optionSelectedColor: "var(--block-color)", // 选项选中时文本颜色
        optionLineHeight: "18px", // 选项行高
        optionFontSize: 13, // 选项字体大小
        optionPadding: "7px 10px", // 选项内间距
        borderRadiusLG: 8, // 选项圆角大小
      },
      Switch: {
        trackMinWidth: 34, // 开关最小宽度
        trackHeight: 20, // 开关高度
        handleSize: 16, // 开关把手大小
      },
      Tree: {
        nodeHoverBg: "var(--tree-node-hover-bg)",
        nodeHoverColor: "var(--block-color)",
        nodeSelectedBg: "var(--tree-node-hover-bg)",
        nodeSelectedColor: "var(--block-color)",
        directoryNodeSelectedBg: "var(--tree-node-hover-bg)",
        directoryNodeSelectedColor: "var(--block-color)",
        controlItemBgHover: "var(-tree-node-hover-bg)",
      },
      Slider: {
        trackBgDisabled: 'rgba(0, 0, 0, .08)'
      },
    },
  },
};

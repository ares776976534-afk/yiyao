import zhCN from "antd/locale/zh_CN";
import { COLORS } from "@/styles/css-variables";
import common from "../common";

export const cssVariables = {
  ...common,
  ...COLORS,

  // 页面背景色
  "page-bg-color": "#212121",
  // 首页背景色
  "home-page-bg-color": "#000",
  // 滚动条颜色
  "scrollbar-color": "var(--color-white-40)",
  // antd的虚拟列表滚动条内部颜色，使用变量控制滚动条背景色
  "rc-virtual-list-scrollbar-bg": "var(--color-white-40)",

  "history-more-icon-color": "#1B1C1D",
  "history-list-bg": "#161616",
  "history-list-border": "1px solid var(--color-white-8)",

  "primary-color": "#fff",
  "primary-bg": "var(--color-brand-1)",
  "primary-hover-bg": "var(--color-brand-1)",
  "primary-disabled-bg": "#5363f580",
  "block-color": "#fff",
  "block-color-2": "#fff",
  "block-color-3": "var(--color-white-60)",
  "block-help-color": "var(--color-white-40)",
  "block-bg": "#020202",
  "block-hover-bg": "var(--color-white-20)",
  "block-hover-bg-2": "var(--color-white-20)",
  "block-placeholder-color": "var(--color-white-40)",
  "block-border-color": "#fff",
  "block-border-color2": "var(--color-white-8)",
  "block-border": "1px solid var(--color-white-12)",
  "block-border-radius": "12px",
  "divider-color": "var(--color-white-8)",
  "select-dropdown-border": "1px solid var(--color-white-8)",

  "block-btn-bg": "var(--color-white-12)",
  "block-btn-hover-bg": "var(--color-white-20)",
  "block-btn-border": "1px solid transparent",
  "file-box-background": "var(--color-white-12, rgba(255, 255, 255, 0.12))",
  // 遮罩背景色
  "block-mask-bg": "rgba(0, 0, 0, .9)",
  // 商品上传
  "offer-link-analysis-bg": "#2C2C2C",
  "offer-link-analysis-border-color": "var(--color-white-8)",

  // 上传删除图标背景色
  "upload-delete-icon-bg-color": "var(--color-black-30, rgba(0, 0, 0, 0.3))",

  // 控件边框
  "control-border": "1px solid var(--color-white-12)",
  // 案例模态框
  "case-modal-bg": "#1B1B1B;",
  "case-mask-bg":
    "linear-gradient(180deg, rgba(27, 27, 27, 0.8) 4%, rgba(27, 27, 27, 0) 100%)",
  "case-share-controller-bg": "rgba(61, 61, 61, 0.6)",
  "case-share-controller-border-color": "transparent",

  // 案例工具
  "case-tools-color-text": "var(--block-color)",
  "case-tools-area-border-color": "var(--color-white-40)",
  "case-tools-area-border-color-hover": "var(--color-white-60)",
  "case-tools-area-bg": "#383838",
  "case-tools-divider-line-color":
    "linear-gradient(90deg,rgba(233, 233, 238, 0.33) 5%,rgba(233, 233, 238, 0) 100%)",
  "case-tools-item-bg": "var(--color-white-20, rgba(255, 255, 255, 0.2))",

  // 文本颜色
  "studio-color-text": "var(--color-white-40)",
  // 文本颜色 - 次要
  "studio-text-color-secondary": "#fff",
  // 标题颜色
  "studio-color-text-heading": "var(--block-color)",
  // 文本颜色 - 字数限制
  "studio-color-text-description": "rgba(255, 255, 255, 0.4)",
  // toast 背景色
  "toast-info-bg": "#55b8ff",
  "toast-success-bg": "#7effb9",
  "toast-error-bg": "var(--color-danger)",
  "toast-warning-bg": "#B4B7FD",
  // toast 文本色
  "toast-info-text": "#010101",
  "toast-success-text": "#010101",
  "toast-error-text": "#010101",
  "toast-warning-text": "#010101",
  // toast icon色
  "toast-info-icon": "#010101",
  "toast-success-icon": "#010101",
  "toast-error-icon": "#010101",
  "toast-warning-icon": "#010101",
  // 插入光标颜色
  "chat-caret-color": "#39C0FF",
  // 输入框颜色
  "chat-input-color": "var(--content-primary, #fff)",

  /* 时光机 - 背景色 */
  "color-chat-bg": "#202020",
  /* 时光机 - placeholder色 */
  "color-chat-placeholder-color": "var(--color-white-60)",
  /* 时光机 - 用户文本颜色 */
  "chat-user-text-color": "var(--block-color-2)",
  /* 时光机 - 用户文本背景色 */
  "chat-user-text-bg": "var(--block-hover-bg)",
  /* 时光机 - AI文本颜色 */
  "chat-ai-text-color": "var(--block-color-2)",
  /* 时光机 - AI文本背景色 */
  "chat-ai-text-bg": "rgba(255, 255, 255, 0.08)",
  /* 时光机 - AI标题色 */
  "chat-ai-title-color": "#A78DFF",
  /* 时光机 - 折叠遮罩色 */
  "chat-collapsed-mask-color":
    "linear-gradient(180deg, rgba(33, 33, 33, 0) 0%, #212121 100%)",
  /* 时光机 知识库卡片 - 背景色 */
  "chat-knowledge-bg": "var(--color-white-8)",
  /* 时光机 知识库卡片 - 文本知识项背景色 */
  "chat-knowledge-item-bg": "var(--color-white-8)",
  /* 时光机 知识库卡片 - 边框色 */
  "chat-knowledge-border-color": "var(--color-white-2)",

  /* 画布背景色 */
  "canvas-bg": "#010101",
  // 商品卡片文字色
  "canvas-offer-color": "#fff",
  // 商品卡片背景色
  "canvas-offer-bg": "#1B1B1B",
  // 商品卡片边框色
  "canvas-offer-border-color": "#737373",
  // 商品卡片-标签背景色
  "canvas-offer-section-label-bg": "#2D2D2D",
  // 商品卡片-标签背景色
  "canvas-offer-sku-item-border-color": "var(--color-white-20)",
  // 商品卡片-折叠按钮渐变背景
  "canvas-offer-sku-collapse-linear-gradient": "0, #1B1B1B00, 0.59, #1B1B1B",

  "menu-bg": "rgba(56, 56, 56, 0.6)",
  "menu-hover-bg": "var(--color-white-12)",
  "menu-box-shadow": "0px -1px 0px 0px rgba(225, 225, 225, 0.21)",
  "menu-backdrop-filter": "blur(30px)",
  "menu-item-color": "var(--block-color)",
  "menu-item-hover-color": "var(--block-color)",
  "menu-item-active-color": "var(--block-color)",
  "menu-item-extra-color": "#BBBDCA",
  "menu-border-radius": "12px",
  "menu-divider-color": "var(--color-white-12)",
  "menu-untransparent-bg": "#161616",

  /* 画布工具 */
  "canvas-tool-bg": "var(--color-white-12)",

  // 弹框背景色
  "modal-content-bg": "#202020",
  "modal-color": "var(--block-color)",
  "modal-title-color": "var(--block-color)",
  "modal-close-color": "var(--block-color)",
  "modal-close-hover-color": "var(--block-color)",
  "modal-close-hover-bg": "var(--block-hover-bg)",

  // 树菜单
  "tree-node-hover-bg": "var(--color-white-12)",
  "tree-node-hover-color": "var(--block-color)",
  "tree-node-selected-bg": "var(--color-white-12)",
  "tree-node-selected-color": "var(--block-color)",
  "tree-directory-node-selected-bg": "var(--color-white-12)",
  "tree-directory-node-selected-color": "var(--block-color)",
  "tree-control-item-bg-hover": "var(--color-white-12)",
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
    colorIconHover: cssVariables["modal-close-hover-color"],
    colorIconActive: cssVariables["modal-close-hover-color"],
    colorBgTextHover: cssVariables["modal-close-hover-bg"],
    colorBgTextActive: cssVariables["modal-close-hover-bg"],
    buttonContentFontSize: "12px",
    contentFontSize: "12px",
  },
  theme: {
    cssVar: true,
    hashed: true,
    token: {
      colorPrimary: cssVariables["color-brand-1"],
      colorText: cssVariables["studio-color-text"],
      colorTextHeading: cssVariables["studio-color-text-heading"],
      colorTextDescription: cssVariables["studio-color-text-description"],
      colorBorder: "var(--color-white-12)",
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

        defaultColor: cssVariables["color-white"],
        defaultBg: cssVariables["color-white-12"],
        defaultBorderColor: cssVariables["color-white-12"],
        defaultBorderColorDisabled: cssVariables["color-white-12"],

        defaultHoverColor: cssVariables["color-white"],
        defaultHoverBg: cssVariables["color-white-20"],
        defaultHoverBorderColor: cssVariables["color-white-20"],
        defaultShadow: "none",

        defaultActiveColor: cssVariables["color-white"],
        defaultActiveBg: cssVariables["color-white-6"],
        defaultActiveBorderColor: cssVariables["color-white-6"],

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
        contentFontSize: 14,
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
        titleColor: cssVariables["modal-title-color"],
        colorTextHeading: cssVariables["modal-title-color"],
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
        colorBgElevated: cssVariables["menu-untransparent-bg"],
        controlItemBgHover: "var(--color-white-30)",
        controlItemBgActive: "var(--color-white-30)",
        controlItemBgActiveHover: "var(--color-white-30)",
      },
      Input: {
        colorText: "var(--block-color)", // 文本色
        colorTextPlaceholder: "var(--block-placeholder-color)", // placeholder色
        colorBorder: "var(--color-white-12)", // 默认使用的边框颜色
        hoverBorderColor: "var(--color-white-30)", // 悬浮态边框色
        activeBorderColor: "var(--color-white-30)", // 激活态边框色
        hoverBg: "var(--color-black-40)", // 输入框hover状态时背景颜色
        activeBg: "var(--color-black-40)", // 输入框激活状态时背景颜色
        colorBgContainer: "var(--color-black-40)", // 组件的容器背景色
        colorBgContainerDisabled: "var(--color-white-12)", // 控制容器在禁用状态下的背景色
        colorTextDisabled: "var(--color-white-60)", // 控制禁用状态下的字体颜色
        activeShadow: "none", // 激活态阴影
      },
      Select: {
        // selector
        colorText: "#fff", // 文本色
        selectorBg: "var(--color-black-40)", // 选框背景色
        colorBgContainer: "var(--page-bg-color)", // 组件的容器背景色
        colorTextPlaceholder: "var(--block-placeholder-color)", // placeholder颜色
        colorBorder: "var(--color-white-12)", // 默认使用的边框颜色
        hoverBorderColor: "var(--color-white-30)", // 悬浮态边框色
        activeBorderColor: "var(--color-white-40)", // 激活态边框色
        controlOutlineWidth: 0, // hide boxshadow
        colorTextDisabled: "var(--color-white-60)",
        colorBgContainerDisabled: "var(--color-white-12)", // 控制容器在禁用状态下的背景色

        // option
        colorBgElevated: "var(--menu-untransparent-bg)", // 浮层容器背景色
        optionSelectedBg: "var(--color-white-12)", // 选项选中时背景色
        optionActiveBg: "var(--color-white-12)", // 选项激活态时背景色
        optionSelectedColor: "#fff", // 选项选中时文本颜色
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

import React, {
  useState,
  useCallback,
  useEffect,
  useContext,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Tooltip, Input, Dropdown } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import LayerOfferElement from "@/components/LayerOfferElement";
import { IconLays, IconCompress } from "./icons";
import Canvas, { type CanvasRef, type ViewportRect, type CanvasProps } from "./core";
import CanvasToolbar, { ToolType } from "./toolbar";
import LayerPanel from "./LayerPanel";
import { CanvasContext } from "./context/canvas";
import { defineElement } from "./elements/define";
import DebugTool from "./debug-tool";
import { isMac } from "./utils";
import { TypeLayer } from "./types.d";
import styles from "./index.module.scss";
import { $t } from '@/i18n';

// 声明自定义图层
defineElement("offer", LayerOfferElement);

export interface EnhancedCanvasProps extends CanvasProps {
  showToolbar?: boolean;
  showScaleControls?: boolean;
  showLayerPanel?: boolean;
  showDebugTool?: boolean;
  disableToolbar?: boolean;
  state?: any;
}

export interface EnhancedCanvasRef extends CanvasRef { }

const EnhancedCanvas = observer(
  forwardRef<EnhancedCanvasRef, EnhancedCanvasProps>(
    (
      {
        width,
        height,
        elements = [],
        locateConfig,
        showToolbar = true,
        showScaleControls = true,
        showLayerPanel = true,
        showDebugTool = false,
        viewport = { left: 0, top: 0, right: 0, bottom: 0 },
        disableToolbar = false,
        state = {},
        memoryId,
        diffMemory = false,
        onAutoSave,
        onLoadMemoryData,
        onElementsChange,
        onElementSelect,
      },
      ref
    ) => {
      const canvasContext = useContext(CanvasContext);
      const {
        selectedIds,
        scale, setScale,
        activeTool, setActiveTool,
        elementState,
      } = canvasContext;

      window.canvasContext = canvasContext;

      // 缩放输入框相关状态
      const [zoomInputValue, setZoomInputValue] = useState(
        Math.round(scale * 100).toString()
      );
      const [lastValidZoom, setLastValidZoom] = useState(scale);

      const canvasRef = useRef<CanvasRef | null>(null);

      const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);

      const [showLayers, setShowLayers] = useState(false);

      const [lastActiveTool, setLastActiveTool] = useState<ToolType>(activeTool || "select");
      // 用来暂存从 handleAddText 传来的文本模板；当模板是 text，不立刻插入，而是切到 text 工具，等待画布点击
      const [pendingElementTemplate, setPendingElementTemplate] =
        useState<TypeLayer | null>(null);

      // 同步 scale 变化到输入框显示值
      useEffect(() => {
        setZoomInputValue(Math.round(scale * 100).toString());
        setLastValidZoom(scale);
      }, [scale]);

      // 缩放控制函数

      // 复制粘贴图层的数据，不能放在剪贴板里，不需要受控
      const [copyPasteData] = useState({ data: {} });

      // 缩小：每次减少 10%，最小不低于 10%
      const zoomTo = useCallback((newScale: number) => {
        canvasRef.current?.zoomTo(newScale);
      }, [scale, elements]);

      // 放大：每次增加 10%，最大不超过 500%
      const zoomIn = useCallback(() => {
        canvasRef.current?.zoomIn();
      }, [scale, elements]);

      // 缩小：每次减少 10%，最小不低于 10%
      const zoomOut = useCallback(() => {
        canvasRef.current?.zoomOut();
      }, [scale, elements]);

      // 适应画布：调用Canvas的zoomToFit方法
      const zoomToFit = useCallback(() => {
        canvasRef.current?.zoomToFit();
      }, [elements]);

      // 处理缩放输入框变化
      const handleZoomInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          setZoomInputValue(e.target.value);
        },
        []
      );

      // 处理缩放输入框失焦
      const handleZoomInputBlur = useCallback(() => {
        const inputValue = zoomInputValue.trim();

        // 检查是否为有效数字
        const numericValue = parseFloat(inputValue);

        if (isNaN(numericValue) || inputValue === "") {
          // 输入非数字，回退到上次的值
          setZoomInputValue(Math.round(lastValidZoom * 100).toString());
          return;
        }

        // 将百分比转换为缩放比例
        const newScale = numericValue / 100;

        // 限制在允许的缩放范围内 (10% - 500%)
        const clampedScale = Math.max(0.1, Math.min(5, newScale));

        // 更新缩放比例
        setScale(clampedScale);

        // 如果值被限制了，更新输入框显示
        if (clampedScale !== newScale) {
          setZoomInputValue(Math.round(clampedScale * 100).toString());
        }
      }, [zoomInputValue, lastValidZoom, elements]);

      // 处理缩放输入框按键事件
      const handleZoomInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.currentTarget.blur(); // 触发失焦事件
          }
        },
        []
      );

      // 元素操作 - 统一处理元素变化
      const handleElementsChange = (newElements: TypeLayer[]) => {
        // 通知父组件元素已变化
        onElementsChange?.(newElements);
      };

      // 选中并定位图层
      const handleElementLayerClick = useCallback(
        (elementIds?: string[]) => {
          if (!elementState.canSelect) {
            return;
          }

          setSelectedElementIds(elementIds || []);
          onElementSelect?.(elementIds || []);
          if (elementIds) {
            canvasRef.current?.locate(elementIds, {
              smooth: false,
            });
          }
        },
        [onElementSelect]
      );

      const handleToggleLayers = () => {
        setShowLayers(!showLayers);
      };

      // 工具切换
      const handleToolChange = useCallback(
        (tool: ToolType) => {
          if (!elementState.showToolbar) {
            return;
          }

          // 文本工具点击一次后，等待用户在画布点击插入，再自动切回选择工具
          setActiveTool(tool);
          setLastActiveTool(tool);
        },
        [activeTool]
      );

      // 键盘事件处理
      const handleKeyDown = (event: KeyboardEvent) => {
          // 检查是否在输入框中，如果是则不处理快捷键
          const target = event.target as HTMLElement;

          if (
            ['input', 'textarea'].includes(target?.tagName.toLowerCase()) ||
            ['', 'true'].includes(target?.getAttribute('contenteditable')!)
          ) {
            return;
          }

          const isCtrl = event.ctrlKey;
          const isCmd = event.metaKey;
          const isCtrlOrCmd = isMac ? isCmd && !isCtrl : isCtrl && !isCmd;

          // 空格键按下时临时切换到抓手工具
          if (event.code === "Space" && !isCtrlOrCmd) {
            event.preventDefault(); // 阻止页面滚动
            setActiveTool("hand");
            return;
          }

          // V键 - 切换到选择工具
          if (event.code === "KeyV" && !isCtrlOrCmd) {
            event.preventDefault();
            setActiveTool("select");
            return;
          }
        };

      const handleKeyUp = useCallback(
        () => {
          // 临时按下变化的快捷键松手后要还原到按下之前的键上
          if (activeTool === 'hand' && activeTool !== lastActiveTool) {
            setActiveTool(lastActiveTool || 'select');
          }
        },
        [activeTool, lastActiveTool]
      );

      // 同步 CanvasRef 到全局画布 store（供基础元素使用）
      useEffect(() => {
        canvasContext.setCanvasRef(canvasRef);

        if (state) {
          canvasContext.setState(state);
        }
      }, []);

      // 暴露方法给父组件
      useImperativeHandle(
        ref,
        () => {
          return {
            get selectedIds() {
              return canvasContext.selectedIds || [];
            },
            // 透传 CanvasRef 能力
            locate: (...args) =>
              canvasRef.current?.locate(
                ...(args as Parameters<NonNullable<CanvasRef["locate"]>>)
              ) as any,
            zoomToFit: () => canvasRef.current?.zoomToFit(),
            zoomIn: () => canvasRef.current?.zoomIn(),
            zoomOut: () => canvasRef.current?.zoomOut(),
            stage: () => canvasRef.current?.stage,
            toJSON: () => canvasRef.current?.toJSON(),
            fromJSON: (json: any) => canvasRef.current?.fromJSON(json),
            exportCanvas: () => canvasRef.current?.exportCanvas(),
            importCanvas: (file?: any) => canvasRef.current?.importCanvas(file) as any,
            elements: () => canvasContext.elements,
            addElement: (...args) => {
              canvasRef.current?.addElement(
                ...(args as Parameters<NonNullable<CanvasRef["addElement"]>>)
              );
            },
            removeElement: (...args) =>
              canvasRef.current?.removeElement(
                ...(args as Parameters<NonNullable<CanvasRef["removeElement"]>>)
              ),
            undo: () => canvasRef.current?.undo() as any,
            redo: () => canvasRef.current?.redo() as any,
            canUndo: () => canvasRef.current?.canUndo() as any,
            canRedo: () => canvasRef.current?.canRedo() as any,
            addToHistory: (els?: TypeLayer[]) =>
              canvasRef.current?.addToHistory(els),
            clearHistory: () => canvasRef.current?.clearHistory(),
            getViewport: () => canvasRef.current?.viewport,
            setViewport: (vp: ViewportRect) => canvasRef.current?.setViewport(vp),
          } as any;
        },
        [
          viewport,
          canvasContext.selectedIds,
          canvasContext.elements,
          canvasRef.current,
        ]
      );

      return (
        <CanvasContext.Provider value={canvasContext}>
          <div className={styles.canvasContainer}>
            {/* 主画布 */}
            <Canvas
              ref={canvasRef}
              width={width}
              height={height}
              viewport={viewport}
              locateConfig={locateConfig}
              memoryId={memoryId}
              diffMemory={diffMemory}
              onAutoSave={onAutoSave}
              onLoadMemoryData={onLoadMemoryData}
              onElementsChange={handleElementsChange} // 不处理状态
              onElementSelect={(ids) => { onElementSelect?.(ids || []) }} // 不处理状态
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              // 插入完成后清空模板
              onConsumePendingElement={() => setPendingElementTemplate(null)}
              pendingElementTemplate={pendingElementTemplate || undefined}
              // 请求将工具切回 select。
              onRequestToolChange={(tool) => {
                if (tool === "select") {
                  setActiveTool("select");
                  setLastActiveTool("select");
                  setPendingElementTemplate(null);
                } else {
                  setActiveTool(tool);
                  setLastActiveTool(tool);
                }
              }}
            />

            {/* 工具栏 */}
            {
              !!showToolbar && (
                <CanvasToolbar
                  disabled={disableToolbar}
                  activeTool={activeTool}
                  onAddElement={(element, insertMethod: "block" | "inline" = 'block') => {
                    if (element?.type === "text") {
                      setPendingElementTemplate(element);
                      setActiveTool("text");
                      setLastActiveTool("text");
                    } else {
                      canvasRef.current?.addElement(element, { insertMethod });
                    }
                  }}
                  onToolChange={handleToolChange}
                />
              )
            }

            {/* 右侧缩缩放工具和图层面板 */}
            {
              !!showScaleControls && (
                <div className={styles.zoomControls}>
                  <Tooltip title={$t("global-1688-ai-app.studio-canvas.ssmall", `缩小`)}>
                    <div onClick={zoomOut} className={styles.zoomButton}>
                      <ZoomOutOutlined />
                    </div>
                  </Tooltip>
                  <Dropdown
                    trigger={['click']}
                    placement="top"
                    menu={{
                      style: {
                        marginBottom: 8,
                      },
                      items: [
                        {
                          key: "zoomTo_25",
                          label: $t("global-1688-ai-app.studio-canvas.scaleToN", "缩放到25%", ['25%']),
                          onClick: () => zoomTo(0.25),
                        },
                        {
                          key: "zoomTo_50",
                          label: $t("global-1688-ai-app.studio-canvas.scaleToN", "缩放到50%", ['50%']),
                          onClick: () => zoomTo(0.5),
                        },
                        {
                          key: "zoomTo_100",
                          label: $t("global-1688-ai-app.studio-canvas.scaleToN", "缩放到100%", ['100%']),
                          onClick: () => zoomTo(1),
                        },
                        {
                          key: "zoomTo_200",
                          label: $t("global-1688-ai-app.studio-canvas.scaleToN", "缩放到200%", ['200%']),
                          onClick: () => zoomTo(2),
                        },
                        {
                          key: "zoomTo_300",
                          label: $t("global-1688-ai-app.studio-canvas.scaleToN", "缩放到300%", ['300%']),
                          onClick: () => zoomTo(3),
                        },
                        {
                          key: "zoomTo_400",
                          label: $t("global-1688-ai-app.studio-canvas.scaleToN", "缩放到400%", ['400%']),
                          onClick: () => zoomTo(4),
                        },
                        {
                          key: "zoomToFit",
                          label: $t("global-1688-ai-app.studio-canvas.sfdqb", "缩放到全部"),
                          onClick: () => zoomToFit(),
                        },
                      ]
                    }}
                  >
                    <div className={styles.zoomInputContainer}>
                      <Input
                        value={zoomInputValue}
                        onChange={handleZoomInputChange}
                        onBlur={handleZoomInputBlur}
                        onKeyDown={handleZoomInputKeyDown}
                        className={styles.zoomInput}
                        size="small"
                      />
                      <span className={styles.zoomUnit}>%</span>
                    </div>
                  </Dropdown>
                  <Tooltip title={$t("global-1688-ai-app.studio-canvas.flarge", "放大")}>
                    <div onClick={zoomIn} className={styles.zoomButton}>
                      <ZoomInOutlined />
                    </div>
                  </Tooltip>

                  <div className={styles.smallDivider} />

                  <Tooltip title={$t("global-1688-ai-app.studio-canvas.syhb", "适应画布")}>
                    <div onClick={zoomToFit} className={[styles.zoomButton, styles.compressButton].join(" ")}>
                      <IconCompress />
                    </div>
                  </Tooltip>

                  {
                    !!showLayerPanel && (
                      <Tooltip title={$t("global-1688-ai-app.studio-canvas.tc", "图层")}>
                        <div
                          onClick={handleToggleLayers}
                          className={`${styles.zoomButton} ${showLayers ? styles.active : ""}`}
                        >
                          <IconLays />
                        </div>
                      </Tooltip>
                    )
                  }
                </div>
              )
            }

            {/* 图层面板 */}
            {!!showLayerPanel && showLayers && (
              <LayerPanel
                onElementSelect={handleElementLayerClick}
                onToggle={() => {
                  setShowLayers(false);
                }}
              />
            )}
          </div>

          {/* 调试工具 */}
          {
            !!showDebugTool && <DebugTool />
          }
        </CanvasContext.Provider>
      );
    }
  )
);

EnhancedCanvas.displayName = "EnhancedCanvas";

export default EnhancedCanvas;
export { CanvasRef, isMac, CanvasContext, defineElement };

import { useState, useRef, useEffect, useContext } from "react";
import { definePageConfig } from "ice";
import { observer } from "mobx-react-lite";
import Canvas, { CanvasRef } from "@/components/studio-canvas";
import { CanvasContext } from "@/components/studio-canvas/context/canvas";
import ChatContent, { ProcessStatus } from "@/components/ChatContent";
import ExportPanel from "@/components/ExportPanel";
import UserInfo from "@/components/LoginButton";
import ShareController from "@/components/ShareController";
import { useStore } from "@/stores/context";
import saveCanvasData from "@/services/canvas/saveCanvasData";
import queryCanvasData from "@/services/canvas/queryCanvasData";
import batchExport from "@/services/studio/batchExport";
import { isPre } from "@/utils/env";
import StudioRoot from "@/components/studio/root";
import "antd/dist/reset.css";
import styles from "./index.module.scss";
import { $t } from "@/i18n";
interface StudioProps {
  canvasState?: any;
  showDebugTool?: boolean;
  showLayerPanel?: boolean;
  showToolbar?: boolean;
  onAutoSave?: (canvasData: string) => void;
  isShared?: boolean;
}

const Page = observer((props: StudioProps) => {
  const canvasRef = useRef<CanvasRef>(null);
  const store = useStore();
  const theme = store.userPrefer.theme;

  const [sessionId, setSessionId] = useState<string>();
  // 缓存画布的数据保存请求，防止保存数据时因为sessionId后创建而没保存数据
  const [canvasDataCache, setCanvasDataCache] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<ProcessStatus>(
    ProcessStatus.DEFAULT
  );

  const chatRef = useRef<any>(null);
  const canvasContext = useContext(CanvasContext);

  const handleAutoSave = (memoryId: string, canvasData: string) => {
    if (!memoryId) {
      setCanvasDataCache(canvasData);
      return;
    }

    saveCanvasData({
      data: {
        sessionId: memoryId,
        content: canvasData,
      },
    });
  };

  const handleSessionChange = (id: string) => {
    // 把之前因为没有sessionId而没保存的数据保存到服务器
    if (!sessionId && id && canvasDataCache) {
      saveCanvasData({
        data: {
          sessionId: id,
          content: canvasDataCache,
        },
      });
      setCanvasDataCache(null);
    }

    setSessionId(id);
  };

  const handleExport = (result) => {
    const { needWatermark, resource } = result;

    return batchExport({
      needWatermark,
      ...resource,
    });
  };

  const handleLoadMemoryData = async (memoryId: string) => {
    const result = {
      success: false,
      data: {
        elements: [],
      },
    };

    try {
      const res = await queryCanvasData({
        data: {
          sessionId: memoryId,
        },
      });

      result.success = true;
      // 之前没有存储过返回 {sessionId: null, content: null}
      if (res?.sessionId && res?.content) {
        try {
          result.data = JSON.parse(res.content) as any;
        } catch (e) {}
      }
    } catch (e) { }

    return result;
  };

  useEffect(() => {
    store.setCanvas(canvasRef.current);
  }, []);

  return (
    <div className={styles.studioContainer}>
      <div className={styles.chatWrapper}>
        <ChatContent
          logMaps={{
            send: "/alphashop.32265064.taskconfirm",
            enhanced: "/alphashop.32265064.enhanced",
            uploadimg: "/alphashop.32265064.uploadimg",
            uploaditemurl: "/alphashop.32265064.uploaditemurl",
            share: "/alphashop.32265064.share",
            history: "/alphashop.32265064.history",
            copyurl: "/alphashop.32265064.copyurl",
            newtask: "/alphashop.32265064.newtask",
            listingview: "/alphashop.32265064.listingview",
          }}
          className={styles.chatContent}
          speed={50}
          step={2}
          typing={true}
          historyTyping={props.isShared}
          ref={chatRef}
          onSessionChange={handleSessionChange}
          isShared={props.isShared}
          onShareStatusChange={(status) => setShareStatus(status)}
        />
        {/* 法律声明 */}
        <div className={styles.lawDeclaration}>
          {$t(
            "global-1688-ai-app.studio.qsse",
            "请使用有权素材，并合法使用生成结果"
          )}
        </div>
      </div>
      <Canvas
        ref={canvasRef}
        state={props.canvasState}
        showDebugTool={isPre}
        showLayerPanel={props.showLayerPanel}
        showToolbar={props.showToolbar}
        viewport={{ left: 424, top: 0, right: 0, bottom: 0 }}
        diffMemory={!props.isShared}
        memoryId={sessionId}
        onAutoSave={handleAutoSave}
        onLoadMemoryData={handleLoadMemoryData}
      />
      <div className={styles.userSetting}>
        {!props.isShared && !!store.userInfo && (
          <ExportPanel
            captureMode={store.distributeMode}
            onCaptureModeChange={(captureMode) => {
              store.setDistributeMode(captureMode);
              // 清空选中状态
              canvasContext.setSelectedIds([]);
              canvasContext.setContextMenuElementId(undefined);

              // 铺货模式下只允许offer类型选中
              if (captureMode) {
                canvasContext.setEnableElements(["offer"]);
              } else {
                canvasContext.setEnableElements([]);
              }
            }}
            onExport={handleExport}
          />
        )}
        <UserInfo
          align={{
            offset: [0, 20],
          }}
        />
      </div>

      {props.isShared && (
        <ShareController
          shareStatus={shareStatus}
          onPlay={() => {
            chatRef.current?.play();
          }}
          onRePlay={() => {
            chatRef.current?.rePlay();
          }}
          onPause={() => {
            chatRef.current?.pause();
          }}
          jumpToResult={() => {
            chatRef.current?.jumpToResult();
          }}
          onDOTheSame={() => {
            chatRef.current?.doTheSame();
          }}
          style={{
            transform: `translateX(calc(-50% + 424px / 2))`,
          }}
        />
      )}
    </div>
  );
});

export default observer((props: StudioProps) => {
  return (
    <StudioRoot root>
      <Page {...props} />
    </StudioRoot>
  );
});

export const pageConfig = definePageConfig(() => ({
  spm: {
    spmB: "32265064",
  },
}));

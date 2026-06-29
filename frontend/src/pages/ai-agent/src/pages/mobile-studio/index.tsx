import React, { useState, useRef, useEffect } from "react";
import { definePageConfig } from "ice";
import { observer } from "mobx-react-lite";
import { SafeArea } from "antd-mobile";
import { useStore } from "@/stores/context";
import StudioRoot from "@/components/studio/root";
import MobileNavigator from "./components/Navigator";
import ChatContent from "@/components/ChatContent";
import InputChat from "@/components/InputChat";
import MobileOfferLinkAnalysis from "@/components/studio/MobileOfferLinkAnalysis";
import { AddIcon } from "@/components/InputChat/components/Icons";
import {
  type TypeInputChatRef,
  type TypeUploadItem,
  Status,
} from "@/components/InputChat/types";
import { useMobileImagePreview } from "@/components/MobileImagePreview";
import { $t } from "@/i18n";
import "antd/dist/reset.css";
import "@/styles/design-tokens.mobile.css";
import styles from "./index.module.scss";

interface StudioProps {
  canvasState?: any;
  showDebugTool?: boolean;
  showLayerPanel?: boolean;
  showToolbar?: boolean;
  onAutoSave?: (canvasData: string) => void;
  isShared?: boolean;
}

// PC端尺寸转移动端
const calcForPaltform = (size, baseWidth = 375) => {
  return (size * window.innerWidth) / baseWidth;
};

const Page = observer((props: StudioProps) => {
  const inputChatRef = useRef<TypeInputChatRef>(null);
  const [status, setStatus] = useState<Status>(Status.DEFAULT);
  const [inputChatData, setInputChataData] = useState<TypeUploadItem[]>([]);
  const [offerLinkAnalysisShow, setOfferLinkAnalysisShow] = useState(false);
  const store = useStore();

  // 使用自定义图片预览 hooks
  const imagePreview = useMobileImagePreview();

  // 动态计算视口高度，仅在不支持 dvh 的设备上启用
  useEffect(() => {
    // 检测浏览器是否支持 dvh 单位
    const supportsDvh = CSS.supports?.("height", "100dvh") ?? false;
    if (supportsDvh) return;

    const setViewportHeight = () => {
      requestAnimationFrame(() => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--mobile-vh", `${vh}px`);
      });
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);

    return () => window.removeEventListener("resize", setViewportHeight);
  }, []);

  const handleOpenOfferLinkAnalysis = () => {
    setOfferLinkAnalysisShow(true);
  };

  const handleCloseOfferLinkAnalysis = () => {
    setOfferLinkAnalysisShow(false);
  };

  const handleNewConversation = () => {
    // 更新url后刷新页面
    const url = new URL(window.location.href);
    url.searchParams.delete("sessionId");
    window.location.href = url.toString();
  };

  return (
    <div className={styles.mobileStudioContainer}>
      <ChatContent
        className={styles.chatContentWrapper}
        contentContainerClassName={styles.contentContainer}
        speed={50}
        step={2}
        typing
        isMobile
        headerRender={(props) => <MobileNavigator {...props} />}
      />
      <div className={styles.inputChatBox}>
        <div className={styles.newConversation} onClick={handleNewConversation}>
          <AddIcon className={styles.newConversationIcon} />
          <div className={styles.newConversationText}>发起新对话</div>
        </div>
        <div className={styles.inputChatInnerBox}>
          <InputChat
            isMobile
            uploadCompact
            uploadCompactConfig={{
              placement: "bottomLeft",
              align: {
                offset: [0, 6],
              },
              menuClassName: styles.uploadMenu,
            }}
            chatInputMinHeight={calcForPaltform(52)}
            chatInputMaxHeight={calcForPaltform(164)}
            ref={inputChatRef}
            inputChatData={inputChatData}
            showUploadOffer={!store.isCustomUser}
            onInputChataDataChange={setInputChataData}
            status={status}
            onStatusChange={setStatus}
            imagePreview={imagePreview}
            onOfferLinkClick={handleOpenOfferLinkAnalysis}
          />
        </div>
        <div className={styles.lawDeclaration}>
          {$t(
            "global-1688-ai-app.studio.qsse",
            "请使用有权素材，并合法使用生成结果",
          )}
        </div>
      </div>
      <MobileOfferLinkAnalysis
        offerLinkAnalysisShow={offerLinkAnalysisShow}
        handleCloseOfferLinkAnalysis={handleCloseOfferLinkAnalysis}
        onImport={(result) => {
          inputChatRef.current?.addOffersToChat(result);
          handleCloseOfferLinkAnalysis();
        }}
      />
      <SafeArea position="bottom" />
    </div>
  );
});

export default observer((props: StudioProps) => {
  return (
    <StudioRoot root theme="light">
      <Page {...props} />
    </StudioRoot>
  );
});

export const pageConfig = definePageConfig(() => ({
  spm: {
    spmB: "mobile-studio",
  },
}));

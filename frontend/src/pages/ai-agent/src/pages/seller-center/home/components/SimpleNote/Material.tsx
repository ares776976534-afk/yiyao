import React, { useState, useEffect, useRef } from "react";
import { useSpm } from "ice";
import InputChat from "@/components/InputChat";
import {
  type TypeInputChatRef,
  type TypeUploadItem,
  Status,
} from "@/components/InputChat/types";
import createChatCache from "@/services/studio/createChatCache";
import { routeJump } from "@/utils/url";
import { useStore } from "@/stores/context";
import StudioRoot from "@/components/studio/root";
import OfferModal from "@/components/OfferModal";
import SendButton from '../SendButton';
import { $t } from "@/i18n";
import styles from "./index.module.scss";

interface TypeMaterialProps {
  showOnlyInput?: boolean;
  showPromptList?: boolean;
  [key: string]: any;
}

// 内层组件：在 StudioRoot 内部，可以安全使用 useStore
const MaterialContent = (props: {
  spmA?: string;
  spmB?: string;
  sendButton?: React.ReactNode;
}) => {
  const inputChatRef = useRef<TypeInputChatRef>(null);
  const [status, setStatus] = useState<Status>(Status.DEFAULT);
  const [inputChatData, setInputChataData] = useState<TypeUploadItem[]>([]);
  const [offerModalOpen, setOfferModalOpen] = useState<boolean>(false); // 商品链接分析弹窗是否打开
  const [spmA, spmB] = useSpm();
  const store = useStore();

  const handleOpenOfferLinkModal = () => {
    setOfferModalOpen(true);
  };

  const handleCloseOfferLinkModal = () => {
    setOfferModalOpen(false);
  };

  useEffect(() => {
    if (inputChatRef.current) {
      store.setInputChat(inputChatRef.current);
    }
  }, [inputChatRef.current]);

  return (
    <div
      onClick={() => {
        window.dispatchEvent(new CustomEvent('chatInputFocus'));
      }}
    >
      <div className={styles.inputChatBox}>
        <div className={styles.inputChatInnerBox}>
          <InputChat
            chatInputMinHeight={56}
            chatInputMaxHeight={164}
            ref={inputChatRef}
            inputChatData={inputChatData}
            // 隐藏上传商品链接按钮
            showUploadOffer={!store.isCustomUser}
            onInputChataDataChange={setInputChataData}
            status={status}
            onStatusChange={setStatus}
            onSendMessage={(data) => {
              createChatCache({
                query: data.content,
                attachments: data.files,
              })
                .then((res) => {
                  routeJump("studio", {
                    cacheId: res,
                    autoSend: "true",
                    theme: "light",
                    spm: `${spmA}.${spmB}.send-input`,
                  });
                })
                .catch(() => {});
            }}
            onOfferLinkClick={handleOpenOfferLinkModal}
            sendButton={<SendButton />}
          />
        </div>
      </div>
      <OfferModal
        open={offerModalOpen}
        onClose={handleCloseOfferLinkModal}
        onImport={(offers) => {
          inputChatRef.current?.addOffersToChat(offers);
        }}
      />
    </div>
  );
};

// 外层组件：在 StudioRoot 外部，获取 spm 值
export default (props: TypeMaterialProps) => {
  const [spmA, spmB] = useSpm();

  return (
    <StudioRoot theme="light">
      <MaterialContent spmA={spmA} spmB={spmB} sendButton={props.sendButton} />
    </StudioRoot>
  );
};

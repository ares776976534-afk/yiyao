import React, { useState, useEffect, useRef, useContext } from "react";
import { useSpm } from "ice";
import { Modal } from "antd";
import View from "@alife/channel-fe-materials-react-appear";
import aplus from "@/utils/log";
import Canvas, { CanvasRef, CanvasContext } from "@/components/studio-canvas";
import ProgressiveImage from "@/components/ProgressiveImage";
import ChatContent, { ProcessStatus } from "@/components/ChatContent";
import CaseShareController from "@/components/CaseShareController";
import { useStore } from "@/stores/context";
import { isPre } from "@/utils/env";
import styles from "./index.module.scss";

interface TypeCaseProps {
  shareCode: string;
  isModalOpen: boolean;
  jumpPageParams?: any;
  onClose: () => void;
}

export default function Case(props: TypeCaseProps) {
  const { shareCode, isModalOpen, jumpPageParams, onClose } = props;
  const [shareStatus, setShareStatus] = useState<ProcessStatus>(
    ProcessStatus.DEFAULT
  );
  const [listData, setListData] = useState({ list: [], listIndex: 0 });
  const chatRef = useRef<any>(null);
  const imageRefs = useRef<HTMLDivElement[]>([]);
  const canvasRef = useRef<CanvasRef>(null);

  const [, spmB] = useSpm();
  const store = useStore();
  const canvasContext = useContext(CanvasContext);

  const handleOk = () => {
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSelect = (item) => {
    canvasContext.resetCanvas();
    canvasContext.addElement(item, { autoLocate: false, locateAnimation: false });
  };

  useEffect(() => {
    if (
      listData.list?.length &&
      listData.listIndex !== null &&
      imageRefs.current?.[listData.listIndex]
    ) {
      imageRefs.current?.[listData.listIndex]?.scrollIntoView?.({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [listData.list, listData.listIndex]);

  useEffect(() => {
    if (isModalOpen) {
      store.setCanvas({
        ...canvasRef.current,
        addElement: (els: any[]) => {
          // 拦截对话流给画布的插入方法，提取数据并保存到metarialImageList
          if (els?.length) {
            let currentLength = listData.list.length - 1;

            listData.list.push(
              ...els
                ?.map((el) => {
                  if (el.type === "offer") {
                    el.media_cover_url = el?.attributes?.offerData?.images?.[0];
                  }

                  if (++currentLength === listData.listIndex) {
                    handleSelect(el);
                  }

                  return el;
                })
                .filter(Boolean)
            );
          }
        },
      });
    }

    return () => {
      listData.list = [];
      listData.listIndex = 0;
      canvasContext.resetElements([]);
    };
  }, [isModalOpen]);

  return (
    <Modal
      width="100%"
      height="100%"
      centered
      destroyOnHidden
      className={styles.caseModal}
      classNames={{
        wrapper: styles.caseModalWrapper,
        body: styles.caseModalBody,
        content: styles.caseModalContent,
      }}
      open={isModalOpen}
      title={null}
      footer={null}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className={styles.caseContent} data-root="studio">
        <ChatContent
          ref={chatRef}
          className={styles.caseChatContent}
          speed={50}
          step={2}
          shareCode={shareCode}
          isShared
          typing={false}
          historyTyping={false}
          streamTyping={false}
          planStreamTyping={false}
          onShareStatusChange={(status) => setShareStatus(status)}
        />
        <div className={styles.caseMiddleContent}>
          <div className={styles.caseCanvasContainer}>
            <Canvas
              ref={canvasRef}
              state={{
                canMove: false,
                canScale: false,
                canGrab: false,
                canHover: false,
                canClickMenu: false,
                canSelect: false,
                canContextMenu: false,
                canDrag: false,
                canShortcut: false,
              }}
              showDebugTool={isPre}
              showScaleControls={false}
              showLayerPanel={false}
              showToolbar={false}
            />
          </div>

          {/* 分享回放工具 */}
          <div className={styles.caseShareController}>
            <CaseShareController
              jumpPageParams={jumpPageParams}
              shareCode={shareCode}
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
                chatRef.current?.doTheSame(jumpPageParams);
              }}
            />
          </div>
        </div>

        <div className={styles.caseRightContent}>
          <div className={styles.caseList}>
            {listData?.list?.map((listItem, index) => {
              return (
                <View
                  className={[
                    styles.caseItem,
                    listData.listIndex === index ? styles.active : "",
                  ].join(" ")}
                  key={index}
                  ref={imageRefs}
                  onFirstAppear={() => {
                    aplus.record(`/alphashop.${spmB}.imgclick`, "EXP");
                  }}
                >
                  <ProgressiveImage
                    src={listItem?.media_cover_url}
                    className={styles.caseItemImage}
                    onClick={() => {
                      aplus.record(`/alphashop.${spmB}.imgclick`, "CLK");
                      setListData({ list: listData.list, listIndex: index });
                      handleSelect(listItem);
                    }}
                  />
                </View>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

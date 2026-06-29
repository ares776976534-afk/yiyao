import React, { useState, useCallback, useEffect, useRef } from "react";
import { Modal } from "antd";
import { ModalContext } from "./ModalContext";

export const ModalProvider = ({ children, dialogRender }) => {
  const [modalQueue, setModalQueue] = useState([]);
  const [currentModal, setCurrentModal] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const savedQueue = useRef([]);
  const showModal = useCallback(
    (config) => {
      // 显式设置为false才不加入队列
      if (config.joinQueue === false) {
        return;
      }
      const modalConfig = { ...config, timestamp: Date.now() };
      if (config.immediate) {
        // 如果是立即显示的弹窗，直接设置为当前弹窗
        if (currentModal) {
          // 保存当前弹窗到队列头部
          setModalQueue((prev) => [currentModal, ...prev]);
        }
        setCurrentModal(modalConfig);
      } else {
        setModalQueue((prev) => {
          // 加入modalConfig时，检查当前id是否已经存在
          const isExist = prev.some((item) => {
            const _item = item.id || item.title;
            const _modalConfig = modalConfig.id || modalConfig.title;
            return _item === _modalConfig
          });
          if (isExist) {
            return prev;
          }
          
          const newQueue = [...prev, modalConfig];
          // 根据优先级排序，优先级数字越小越优先
          return newQueue.sort((a, b) => {
            if (a.priority === b.priority) {
              // 相同优先级按时间戳排序
              return a.timestamp - b.timestamp;
            }
            return (a.priority || 0) - (b.priority || 0);
          });
        });
      }
    },
    [currentModal]
  );

  const hideModal = useCallback(() => {
    setCurrentModal(null);
  }, []);

  // 暂停弹窗队列
  const pauseQueue = useCallback(() => {
    setIsPaused(true);
    if (currentModal) {
      savedQueue.current = [currentModal, ...modalQueue];
      setCurrentModal(null);
      setModalQueue([]);
    } else {
      savedQueue.current = [...modalQueue];
      setModalQueue([]);
    }
  }, [currentModal, modalQueue]);

  // 恢复弹窗队列
  const resumeQueue = useCallback(() => {
    setIsPaused(false);
    setModalQueue((prev) => [...savedQueue.current, ...prev]);
    savedQueue.current = [];
  }, []);

  // 清空弹窗队列
  const clearQueue = useCallback(() => {
    setModalQueue([]);
    setCurrentModal(null);
    savedQueue.current = [];
  }, []);

  useEffect(() => {
    if (!isPaused && !currentModal && modalQueue.length > 0) {
      setTimeout(() => {
        const [nextModal, ...rest] = modalQueue;
        setCurrentModal(nextModal);
        setModalQueue(rest);
      }, 2000);
    }
  }, [currentModal, modalQueue, isPaused]);

  const handleOk = async () => {
    if (currentModal?.onOk) {
      try {
        await currentModal.onOk();
        hideModal();
      } catch (error) {
        console.error("Modal onOk error:", error);
      }
    } else {
      hideModal();
    }
  };

  const handleCancel = () => {
    const cancelFn = currentModal?.onCancel || currentModal?.onClose;
    if (cancelFn) {
      cancelFn();
    }
    hideModal();
  };

  return (
    <ModalContext.Provider
      value={{
        showModal,
        hideModal,
        pauseQueue,
        resumeQueue,
        clearQueue,
        isPaused,
      }}
    >
      {typeof children === "function" ? children() : children}
      {dialogRender ? (
        dialogRender({ currentModal, handleOk, handleCancel })
      ) : (
        <Modal
          {...currentModal}
          open={!!currentModal}
          onOk={handleOk}
          onCancel={handleCancel}
          destroyOnClose
        />
      )}
    </ModalContext.Provider>
  );
};

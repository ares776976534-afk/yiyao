import React, { useState, useRef } from "react";
import { Modal, Button, Checkbox, Switch, message, Progress, App } from "antd";
import {
  getWatermark,
  createLogo,
  addVideoWatermark,
  exportOffer,
  batchExport,
} from "@/services";
import { useStore } from "@/stores/context";
import useToast from "@/components/Toast";
import download from "@/utils/download";
// import userPrefer from "@/stores/userPrefer";
import styles from "./index.module.scss";
import { $t } from "@/i18n";

interface DownloadModalProps {
  open: boolean;
  downloadName: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onClose?: () => void;
}
interface DownloadModalRefProps {
  type?: string;
  downloadName: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
}

const MESSAGE_KEY = "createWatermark";
const useDownloadConfirm = (type: "image" | "video" = "image") => {
  const toast = useToast();
  const { modal } = App.useApp();
  const store = useStore();
  const userPreferStore = store.userPrefer;

  const state = useRef<DownloadModalRefProps>({
    downloadName: "",
    type,
    onDownloadStart: () => { },
    onDownloadComplete: () => { },
  });

  const initState = () => {
    state.current = {
      ...state.current,
      downloadName: "",
      type,
      onDownloadStart: () => { },
      onDownloadComplete: () => { },
    };
  };

  // 轮询获取暗水印图片地址
  const getImgUrl = async (taskId: string) => {
    try {
      const { downloadName } = state.current;
      const res = await getWatermark({ data: { taskId } });
      if (
        res &&
        typeof res === "object" &&
        "progress" in res &&
        "result" in res
      ) {
        const { progress, result } = res;
        createMessage(progress, {
          content: $t(
            "global-1688-ai-app.DownloadConfirm.sclinkz",
            "生成链接中..."
          ),
        });
        if (progress === 100 && result) {
          createMessage(100, {
            content: $t(
              "global-1688-ai-app.DownloadConfirm.ske",
              "生成链接成功"
            ),
            duration: 1,
          });
          const resultArr = Array.isArray(result) ? result : [result];

          resultArr.forEach((item) => {
            download(item, downloadName);
          });
          initState();
        } else {
          setTimeout(() => {
            getImgUrl(taskId);
          }, 1000);
        }
      } else {
        toast.destroy(MESSAGE_KEY);
        toast.error("生成链接失败");
        initState();
      }
    } catch (e) {
      toast.destroy(MESSAGE_KEY);
      toast.error("生成链接失败");
      initState();
    }
  };

  const createMessage = (percent: number, params: any = {}) => {
    const { content, ...rest } = params;
    toast.info(
      <div className={styles.messageContent}>
        <Progress type="circle" percent={percent} size={40} />
        <div>{content}</div>
      </div>,
      {
        duration: 0,
        key: MESSAGE_KEY,
        ...rest,
      }
    );
  };

  const confirm = ({
    downloadName,
    type,
    downloadContents,
    onDownloadStart,
    onDownloadComplete,
  }: {
    downloadName?: string;
    type?: "image" | "video";
    downloadContents?: {
      downloadList?: any[];
      aiImgageUrlList?: any[];
      userImageUrlList?: any[];
      videoUrlList?: any[];
      productModelList?: any[];
      watermarkConfirm?: boolean;
    };
    onDownloadStart?: () => void;
    onDownloadComplete?: () => void;
  }) => {
    return new Promise<void>(async (resolve) => {
      state.current = {
        downloadName: downloadName || "",
        type: type || "image",
        onDownloadStart: onDownloadStart,
        onDownloadComplete: onDownloadComplete,
      };

      const { downloadList, ...batchDownloadContents } = downloadContents || {};

      // 不再提示下载偏好
      const { preferences } = userPreferStore;
      const {
        image: noDownloadImageConfirmTip,
        video: noDownloadVideoConfirmTip,
      } = preferences.confirm;
      const { imageWatermark, vedioWatermark } = preferences.download;

      // 下载前置的水印提示框是否选了不再展示
      let noDownloadConfirmTip =
        type === "video" ? noDownloadVideoConfirmTip : noDownloadImageConfirmTip;

      // 已经设置的水印是否开启偏好
      let watermarkPreference =
        type === "video" ? vedioWatermark : imageWatermark;

      const executeDownload = async () => {
        const toastDownloadKey = `${Date.now()}_download`;

        toast.loading($t('global-1688-ai-app.studio-canvas.element.downloading', '下载中'), {
          duration: 0,
          key: toastDownloadKey,
        });

        const { onDownloadStart, onDownloadComplete } =
          state.current;
        let { imageWatermark, vedioWatermark } =
          userPreferStore.preferences.download;
          
        // 调用下载开始回调
        onDownloadStart?.();
        initState();

        const handleDownloadComplete = () => {
          // 调用下载结束回调
          onDownloadComplete?.();
        };

        const handleDownloadError = () => {
          // 下载失败时也要调用结束回调
          onDownloadComplete?.();
          toast.error($t("global-1688-ai-app.studio-canvas.element.downloadFailed", "下载失败"));
        };

        // 单个文件下载
        if (downloadList?.length === 1) {
          const downloadItem = downloadList[0];
          const { downloadName, downloadData, watermarkConfirm } = downloadItem;

          if (downloadItem.type === "image") {
            try {
              const res = await createLogo({
                data: {
                  imgUrls: [downloadData],
                  waterMarkType: watermarkConfirm && imageWatermark ? "logo" : "dark",
                },
              });
              if (res) {
                try {
                  await download(res, downloadName);
                  handleDownloadComplete();
                } catch (error) {
                  handleDownloadError();
                }
              } else {
                handleDownloadError();
              }
            } catch (e) {
              handleDownloadError();
            }
          } else if (downloadItem.type === "video") {
            if (vedioWatermark !== false) {
              try {
                const res = await addVideoWatermark({
                  videoUrl: downloadData,
                });

                if (res) {
                  try {
                    await download(res, downloadName);
                    handleDownloadComplete();
                  } catch (error) {
                    handleDownloadError();
                  }
                } else {
                  handleDownloadError();
                }
              } catch (e) {
                handleDownloadError();
              }
            } else {
              try {
                await download(downloadItem.downloadData, downloadName);
                handleDownloadComplete();
              } catch (error) {
                handleDownloadError();
              }
            }
          } else if (downloadItem.type === "offer") {
            await exportOffer([downloadItem.downloadData]);
          }
        } else {
          try {
            batchDownloadContents.watermarkConfirm = watermarkPreference;
            await batchExport(batchDownloadContents);
          } catch (e) {
            toast.error($t("global-1688-ai-app.studio-canvas.element.downloadFailed", "下载失败"));
          }

          onDownloadComplete?.();
        }

        toast.destroy(toastDownloadKey);
      };

      // 无下载水印确认环节，直接进行下载
      if (!batchDownloadContents.watermarkConfirm || noDownloadConfirmTip) {
        await executeDownload();
        resolve();
        return;
      }
      
      // 下载水印确认提示框
      const confirmed = modal.confirm({
        classNames: { content: styles.downloadModal },
        title: $t("global-1688-ai-app.DownloadConfirm.ssd", "显示标识偏好"),
        width: 400,
        centered: true,
        closable: { "aria-label": "Close Button" },
        onCancel: () => {
          confirmed.destroy();
          resolve();
        },
        icon: null,
        closeIcon: null,
        content: (
          <div className={styles.downloadModalContent}>
            <span>
              {$t(
                "global-1688-ai-app.DownloadConfirm.dlopoth",
                "对下载、复制、导出内容添加显示标识"
              )}
            </span>
            <Switch
              defaultChecked={watermarkPreference}
              onChange={(checked) => {
                watermarkPreference = checked;
              }}
            />
          </div>
        ),
        footer: (
          <div className="footer-between">
            <Checkbox onChange={(e) => (noDownloadConfirmTip = e.target.checked)}>
              {$t("global-1688-ai-app.DownloadConfirm.xcbztips", "下次不再提示")}
            </Checkbox>
            <Button
              type="primary"
              onClick={async () => {
                const newPrefs = {
                  ...preferences,
                  confirm: {
                    ...preferences.confirm,
                    ...(type === "video"
                      ? { video: noDownloadConfirmTip }
                      : { image: noDownloadConfirmTip }),
                  },
                  download: {
                    ...preferences.download,
                    ...(type === "video"
                      ? { vedioWatermark: watermarkPreference }
                      : { imageWatermark: watermarkPreference }),
                  },
                };

                userPreferStore.updatePreferences(newPrefs);
                try {
                  await executeDownload();
                } catch (error) {
                } finally {
                  confirmed.destroy();
                  resolve();
                }
              }}
            >
              {$t("global-1688-ai-app.DownloadConfirm.qd", "确定")}
            </Button>
          </div>
        ),
      });
    });
  };

  return {
    confirm,
  };
};

export default useDownloadConfirm;

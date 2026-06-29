import { useState, useEffect, useRef } from "react";
import { definePageConfig } from "ice";
import { observer } from "mobx-react-lite";
import { Drawer, Button } from "antd";
import classNames from "classnames";
import View from "@alife/channel-fe-materials-react-appear";
import aplus from "@/utils/log";
import StudioRoot from "@/components/studio/root";
import useToast from "@/components/Toast";
import { IconClose } from "./components/Icons";
import TagSelector from "./components/TagSelector";
import Loading from "./components/Loading";
import Canvas from "./components/Canvas";
import {
  PLATFORM_OPTIONS,
  LANGUAGE_OPTIONS,
  REGION_TO_LANGUAGE_MAP,
  EnumPageStatus,
  POST_MESSAGE_NAMESPACE,
  EnumPostMessageType,
  isAllowedMessage,
} from "./constants";
import { isPre } from "@/utils/env";
import {
  getSettings,
  getOfferData,
  exportOfferData,
} from "@/services/canvas/odStudio";
import type { TypePostMessage } from "./types";
import styles from "./index.module.scss";

interface StudioProps {
  canvasState?: any;
  showDebugTool?: boolean;
  showLayerPanel?: boolean;
  showToolbar?: boolean;
  onAutoSave?: (canvasData: string) => void;
  isShared?: boolean;
}

// 向父页面（iframe 宿主）发送消息
const postMessageToParent = (
  type: EnumPostMessageType,
  payload?: Record<string, unknown>,
) => {
  const message: TypePostMessage = {
    namespace: POST_MESSAGE_NAMESPACE,
    type,
    payload,
  };
  window.parent.postMessage(message, "*");
};

const Page = observer(() => {
  const offerIdRef = useRef<string>("");
  const [open, setOpen] = useState(true);
  const [platform, setPlatform] = useState("");
  const [language, setLanguage] = useState("");
  const [pageStatus, setPageStatus] = useState(EnumPageStatus.INIT);
  const [sessionId, setSessionId] = useState("");
  const [offerData, setOfferData] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const toast = useToast();

  const platformLabel =
    PLATFORM_OPTIONS.find((item) => item.key === platform)?.label ?? "";

  const setStateIfValid = (value, options, setState) => {
    if (options.some((opt) => opt.key === value)) {
      setState(value);
    }
  };

  const handleGetSettings = async () => {
    try {
      const data = await getSettings();
      const { displayMode, customMarkets } = data;
      if (displayMode === "custom") {
        const { platform: platformKey, region: regionKey } = customMarkets?.[0];
        const languageKey = REGION_TO_LANGUAGE_MAP[regionKey] || regionKey;

        setStateIfValid(platformKey, PLATFORM_OPTIONS, setPlatform);
        setStateIfValid(languageKey, LANGUAGE_OPTIONS, setLanguage);
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const handleGetOfferData = async () => {
    setPageStatus(EnumPageStatus.LOADING);
    try {
      const data = await getOfferData({
        platform,
        detailUrl: offerIdRef.current,
        targetLanguage: language,
      });
      const resessionId = data?.chatSession?.sessionId;
      const resOfferData = data?.productModel;

      if (resessionId) {
        setSessionId(resessionId);
      }

      if (resOfferData) {
        setOfferData(resOfferData);
      }

      setPageStatus(EnumPageStatus.RESULT);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
      setPageStatus(EnumPageStatus.INIT);
    }
  };

  const handleProcess = () => {
    handleGetOfferData();
  };

  const downloadFile = (url) => {
    const filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    const { _offerModuleSize, ...exportData } = offerData;
    setExportLoading(true);
    try {
      const exportResult = await exportOfferData({
        downloadMaterialParam: {
          productModelList: [exportData],
        },
      });

      downloadFile(exportResult);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleReset = () => {
    setPageStatus(EnumPageStatus.INIT);
    setSessionId("");
    setOfferData(null);
  };

  const handleOpenDrawer = () => {
    setOpen(true);
  };

  const handleRequestCloseDrawer = () => {
    setOpen(false);
  };

  const titleRender = () => {
    return (
      <div className={styles.title}>
        <div className={styles.titleLeft}>AI素材优化</div>
        <div className={styles.titleRight}>
          <img
            src="https://img.alicdn.com/imgextra/i3/O1CN01ZZuK9r1OKEtbb78Jc_!!6000000001686-55-tps-66-18.svg"
            alt="logo"
          />
          <IconClose
            className={styles.closeIcon}
            onClick={handleRequestCloseDrawer}
          />
        </div>
      </div>
    );
  };

  const footerRender = () => {
    if (pageStatus === EnumPageStatus.INIT) {
      return (
        <div className={styles.initFooter}>
          <Button
            type="primary"
            className={styles.footerActionButton}
            onClick={() => {
              aplus.record("/alphashop.odDesign.convertOffer", "CLK", {
                platform: platform,
                language: language,
                item_id: offerIdRef.current,
              });
              handleProcess();
            }}
            disabled={!platform || !language}
          >
            一键处理
          </Button>
        </div>
      );
    }

    if (pageStatus === EnumPageStatus.RESULT) {
      return (
        <div className={styles.resultFooter}>
          <Button
            type="primary"
            className={styles.footerActionButton}
            href={`${
              isPre
                ? "https://pre-www.alphashop.cn"
                : "https://www.alphashop.cn"
            }/studio?sessionId=${sessionId}`}
            target="_blank"
            onClick={() => {
              aplus.record("/alphashop.odDesign.go", "CLK", {
                platform: platform,
                language: language,
                item_id: offerIdRef.current,
              });
            }}
          >
            去遨虾查看完整内容
          </Button>
          <Button
            className={classNames(
              styles.footerActionButton,
              styles.exportButton,
            )}
            loading={exportLoading}
            onClick={() => {
              aplus.record("/alphashop.odDesign.export", "CLK", {
                platform: platform,
                language: language,
                item_id: offerIdRef.current,
              });
              handleExport();
            }}
          >
            导出优化结果
          </Button>
          <Button
            className={styles.footerActionButton}
            onClick={() => {
              aplus.record("/alphashop.odDesign.reset", "CLK", {
                item_id: offerIdRef.current,
              });
              handleReset();
            }}
          >
            重置
          </Button>
        </div>
      );
    }

    return null;
  };

  // 监听父页面 postMessage
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const offerId = query.get("offerId") || "";
    if (offerId) {
      offerIdRef.current = offerId;
    }

    const handleMessage = (event: MessageEvent) => {
      if (!isAllowedMessage(event.origin, event.data)) return;
      const { type } = event.data as TypePostMessage;

      switch (type) {
        case EnumPostMessageType.OPEN_DRAWER: {
          handleOpenDrawer();
          break;
        }
        case EnumPostMessageType.CLOSE_DRAWER:
          handleRequestCloseDrawer();
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      handleGetSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className={styles.studioIframeContent}>
      <Drawer
        title={titleRender()}
        footer={footerRender()}
        onClose={handleRequestCloseDrawer}
        afterOpenChange={(drawerOpen) => {
          postMessageToParent(EnumPostMessageType.DRAWER_STATE_CHANGE, {
            open: drawerOpen,
          });
          if (!drawerOpen) {
            handleReset();
          }
        }}
        width={pageStatus === EnumPageStatus.INIT ? 520 : 996}
        open={open}
        getContainer={false}
        closable={false}
      >
        <View
          className={styles.appear}
          onFirstAppear={() => {
            aplus.record("/alphashop.odDesign.choosePage", "EXP");
          }}
        >
          {pageStatus === EnumPageStatus.INIT && (
            <div className={styles.initPanel}>
              <p className={styles.description}>
                已提取当前商品素材，可选择目标经营平台「一键处理」
              </p>
              <div className={styles.selectorArea}>
                <TagSelector
                  label="平台选择"
                  options={PLATFORM_OPTIONS}
                  value={platform}
                  onChange={(platformValue) => {
                    aplus.record("/alphashop.odDesign.choosePlatform", "CLK", {
                      value: platformValue,
                    });
                    setPlatform(platformValue);
                    const selectedPlatform = PLATFORM_OPTIONS.find(
                      (item) => item.key === platformValue,
                    );
                    if (
                      language &&
                      selectedPlatform?.supportedLanguages?.includes(
                        language,
                      ) === false
                    ) {
                      setLanguage(selectedPlatform.supportedLanguages[0]);
                    }
                  }}
                />
                <TagSelector
                  label="语言选择"
                  options={LANGUAGE_OPTIONS.map((opt) => {
                    const selectedPlatform = PLATFORM_OPTIONS.find(
                      (item) => item.key === platform,
                    );
                    return {
                      ...opt,
                      disabled:
                        selectedPlatform?.supportedLanguages?.includes(
                          opt.key,
                        ) === false,
                    };
                  })}
                  value={language}
                  optionClassName={styles.languageOption}
                  onChange={(languageValue) => {
                    aplus.record("/alphashop.odDesign.chooseLanguage", "CLK", {
                      value: languageValue,
                    });
                    setLanguage(languageValue);
                  }}
                />
              </div>
            </div>
          )}
          {pageStatus === EnumPageStatus.LOADING && (
            <View
              className={styles.appear}
              onFirstAppear={() => {
                aplus.record("/alphashop.odDesign.convertingPage", "EXP");
              }}
            >
              <Loading platformLabel={platformLabel} />
            </View>
          )}
          {pageStatus === EnumPageStatus.RESULT && (
            <View
              className={styles.appear}
              onFirstAppear={() => {
                aplus.record("/alphashop.odDesign.canvasPage", "EXP");
              }}
            >
              <Canvas memoryId={sessionId} offerData={offerData} />
            </View>
          )}
        </View>
      </Drawer>
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
    spmB: "45779795",
  },
}));

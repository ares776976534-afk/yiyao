import React, { useState, useEffect, useRef } from "react";
import { useSpm } from "ice";
import { observer } from "mobx-react-lite";
import StudioRoot from "@/components/studio/root";
import InputChat from "@/components/InputChat";
import Prompt from "../prompt";
import CaseTools from "@/components/CaseTools";
import OfferLinkAnalysis from "@/components/OfferLinkAnalysis";
import ExcellentCases from "@/components/studio/ExcellentCases";
import {
  type TypeInputChatRef,
  type TypeUploadItem,
  Status,
} from "@/components/InputChat/types";
import { useStore } from "@/stores/context";
import createChatCache from "@/services/studio/createChatCache";
import { routeJump } from "@/utils/url";
import { $t } from "@/i18n";
import { checkAuthAndLogin } from "@/utils/login";
import useToast from "@/components/Toast";
import { googleRecord } from "@/utils/log";
import styles from "./index.module.scss";

interface TypeMaterialProps {
  showOnlyInput?: boolean;
  showPromptList?: boolean;
  [key: string]: any;
}

const Page = observer((props: TypeMaterialProps) => {
  const { logMaps } = props;
  const inputChatRef = useRef<TypeInputChatRef>(null);
  const offerLinkAnalysisRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>(Status.DEFAULT);
  const [inputChatData, setInputChataData] = useState<TypeUploadItem[]>([]);
  const [offerLinkAnalysisShow, setOfferLinkAnalysisShow] = useState(false);
  const [spmA, spmB] = useSpm();
  const store = useStore();
  const toast = useToast();

  const handleOpenOfferLinkAnalysis = () => {
    setOfferLinkAnalysisShow(true);
  };

  const handleCloseOfferLinkAnalysis = () => {
    setOfferLinkAnalysisShow(false);
  };

  useEffect(() => {
    if (inputChatRef.current) {
      store.setInputChat(inputChatRef.current);
    }
  }, [inputChatRef.current]);

  useEffect(() => {
    let timeoutId;

    const handleOfferUploadBlur = (e) => {
      if (!offerLinkAnalysisRef.current?.contains(e.target)) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleCloseOfferLinkAnalysis();
        }, 100);
      }
    };

    if (offerLinkAnalysisShow && offerLinkAnalysisRef.current) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleOfferUploadBlur);
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleOfferUploadBlur);
    };
  }, [offerLinkAnalysisShow, offerLinkAnalysisRef.current]);

  const handleSendMessage = (data: any) => {
    createChatCache({
      query: data.content,
      attachments: data.files,
    })
      .then((res) => {
        googleRecord("design_submit", {}, "/");
        routeJump("studio", {
          cacheId: res,
          autoSend: "true",
          theme: "light",
          spm: `${spmA}.${spmB}.send-input`,
        });
      })
      .catch((e) => {
        toast.error(
          e.message ||
            $t(
              "global-1688-ai-app.LayerOfferElement.wlqqerror",
              "网络请求错误",
            ),
        );
      });
  };

  return (
    <div className={styles.material}>
      <div className={styles.extraBox}>
        <div className={styles.inputChatBox}>
          <div className={styles.inputChatInnerBox}>
            <InputChat
              logMaps={logMaps}
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
                checkAuthAndLogin({
                  onSuccess: () => {
                    handleSendMessage(data);
                  },
                  onFail: (error) => {
                    if (error._networkError) {
                      toast.error(
                        $t(
                          "global-1688-ai-app.services.httpRequest.nwm",
                          "网络请求错误",
                        ),
                      );
                    }
                  },
                }).then((loginSuccess) => {
                  if (loginSuccess) {
                    handleSendMessage(data);
                  }
                });
              }}
              onOfferLinkClick={handleOpenOfferLinkAnalysis}
            />
          </div>
        </div>

        {/* 商品链接输入框，出现时浮在下面可以遮挡住提示词列表 */}
        {offerLinkAnalysisShow && (
          <div
            className={styles.offerLinkAnalysisBox}
            ref={offerLinkAnalysisRef}
          >
            <OfferLinkAnalysis
              logKey={logMaps?.uploaditemurl}
              onImport={(...args) => {
                inputChatRef.current?.addOffersToChat(...args);
                handleCloseOfferLinkAnalysis();
              }}
              onClose={handleCloseOfferLinkAnalysis}
            />
          </div>
        )}
      </div>

      {/* 提示词列表 */}
      {props?.showPromptList !== false && (
        <Prompt
          className={styles.promptList}
          onClick={(item) => {
            if (item.query) {
              inputChatRef.current?.addTextToChat(item.query, false);
            }

            if (item.imageList?.length > 0) {
              inputChatRef.current?.addImagesToChat(item.imageList, false);
            }
          }}
        />
      )}
      <div className={styles.fitContainer}>
        {/* 快捷工具栏 */}
        <CaseTools
          className={styles.caseToolsContainer}
          jumpPageParams={{
            theme: "light",
          }}
        />
        {/* 精彩案例展示 */}
        <div className={styles.excellentCaseContainer}>
          <div className={styles.excellentCasesTitle}>
            {$t(
              "global-1688-ai-app.agent-home.Agents.Material.tsjxal",
              "探索精选案例",
            )}
          </div>
          <ExcellentCases
            className={styles.excellentCaseContent}
            showTitle={false}
            max={18}
            jumpPageParams={{
              theme: "light",
            }}
          />
        </div>
      </div>

      {/* <div className={styles.footer}>
        {$t("global-1688-ai-app.agent-home.DemoList.ddl", "- 到底了 -")}
      </div> */}
    </div>
  );
});

export default (props: TypeMaterialProps) => {
  return (
    <StudioRoot theme="light">
      <Page {...props} />
    </StudioRoot>
  );
};

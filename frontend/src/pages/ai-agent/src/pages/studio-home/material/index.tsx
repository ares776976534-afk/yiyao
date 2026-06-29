import React, { useState, useEffect, useRef } from "react";
import { useSpm } from "ice";
import View from "@alife/channel-fe-materials-react-appear";
import { observer } from "mobx-react-lite";
import StudioRoot from "@/components/studio/root";
import { type TypeInputChatRef } from "@/components/InputChat/types";
import Layout from "@/pages/select-product/components/Layout";
import { AgentHomeContent } from "@/pages/agent-home";
import aplus from "@/utils/log";
import MaterialContent from "../components/material-content";
import CustomTitle from "@/pages/select-product/home/components/CustomTitle";
import { MaterialHistoryIcon } from "./icons";
import { queryHistoryList } from "@/services";
import HistoryList from "@/components/ChatContent/components/historyList";
import { isAuthenticatedSync } from "@/utils/login";
import { routeJump } from "@/utils/url";
import { $t } from "@/i18n";
import { useStore } from "@/stores/context";
import { enableMultipleLanguages } from "@/utils/env";
import styles from "./index.module.scss";

const Page = observer(() => {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const inputChatRef = useRef<TypeInputChatRef>(null);
  const offerLinkAnalysisRef = useRef<HTMLDivElement>(null);
  const [offerLinkAnalysisShow, setOfferLinkAnalysisShow] = useState(false);
  const store = useStore();
  const [spmA, spmB] = useSpm();

  const handleCloseOfferLinkAnalysis = () => {
    setOfferLinkAnalysisShow(false);
  };

  const handleQueryHistoryList = () => {
    queryHistoryList({}, { silent: true })
      .then((res) => {
        setHistoryList(res || []);
      })
      .catch(() => { });
  };

  useEffect(() => {
    handleQueryHistoryList();
  }, []);

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

  return (
    <div className={styles.homePage}>
      {isAuthenticatedSync() && (
        <View
          onFirstAppear={() => {
            aplus.record(`/alphashop.${spmB}.history.button`, "EXP");
          }}
        >
          <HistoryList
            placement="bottomLeft"
            triggerNode={
              <div className={styles.materialHistory}>
                <MaterialHistoryIcon />
                <span>
                  {$t("global-1688-ai-app.home.material.history", "素材历史")}
                </span>
              </div>
            }
            historyList={historyList}
            canDelete={false}
            onSelect={(sessionId) => {
              aplus.record(`/alphashop.${spmB}.history.button`, "CLK");

              routeJump("studio", {
                sessionId,
                spm: `${spmA}.${spmB}.send-input`,
              });
            }}
          />
        </View>
      )}
      <CustomTitle
        title={
          enableMultipleLanguages
            ? $t(
                "global-1688-ai-app.home.yzhbqgdGlobal",
                "做图 · 改图 · 铺货 一张画布全搞定",
              )
            : $t("global-1688-ai-app.home.yzhbqgd", "一张画布全搞定")
        }
        colorTitle={
          enableMultipleLanguages ? "" : $t("global-1688-ai-app.home.ztgtph", "做图·改图·铺货")
        }
        breakLogo={enableMultipleLanguages}
      />
      <MaterialContent
        logMaps={{
          send: "/alphashop.32265051.chatbox.designclick",
          enhanced: "/alphashop.32265051.chatbox.designenhanced",
          uploadimg: "/alphashop.32265051.chatbox.designimg",
          uploaditemurl: "/alphashop.32265051.chatbox.designurl",
        }}
      />
    </div>
  );
});

export default () => {
  return (
    <Layout showBanner>
      <AgentHomeContent>
        <StudioRoot theme="light">
          <Page />
        </StudioRoot>
      </AgentHomeContent>
    </Layout>
  );
};

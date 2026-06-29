import React from "react";
import { useSpm } from "ice";
import * as clipboard from "clipboard-polyfill";
import View from "@alife/channel-fe-materials-react-appear";
import { App, Button } from "antd";
import useToast from "@/components/Toast";
import LinkIcon from "@/components/Icons/Link";
import { createShare } from "@/services";
import { $t } from "@/i18n";
import aplus from "@/utils/log";
import { routeJump } from "@/utils/url";
import styles from "./index.module.scss";

function useShare(props: any = {}) {
  const { jumpPageParams, logShareKey, logCopyUrlKey } = props || {};
  const { modal } = App.useApp();
  const toast = useToast();
  const [spmA, spmB] = useSpm();
  const spmString = `${spmA}.${spmB}.share`;

  const mergePageParams = (link: string) => {
    const linkUrl = new URL(link);
    linkUrl.searchParams.set("spm", spmString);
    Object.entries(jumpPageParams || {}).forEach(([key, value]) => {
      linkUrl.searchParams.set(key, String(value));
    });
    return linkUrl.toString();
  };

  async function getShareUrl(sessionId: string) {
    const linkString = await createShare({
      sessionId,
      shareMode: "LAST_TASK",
    });
    return mergePageParams(linkString);
  }

  const createShareModal = async (sessionId?: string, shareCode?: string) => {
    const openDialog = (_lingString: string) => {
      const lingString = mergePageParams(_lingString);
      const linkShareCode = new URL(lingString).searchParams.get("shareCode");

      if (linkShareCode && logShareKey) {
        aplus.record(logShareKey, "CLK", { share_code: linkShareCode });
      }

      const _modal = modal.confirm({
        className: styles.modalConfirm,
        title: $t("global-1688-ai-app.Share.sharedh", "分享对话"),
        icon: null,
        closable: true,
        centered: true,
        content: <div className={styles.shareContent}>{lingString}</div>,
        footer: (
          <View
            onFirstAppear={() => {
              if (logCopyUrlKey) {
                aplus.record(logCopyUrlKey, "EXP");
              }
            }}
            className={styles.shareFooter}
            onClick={() => {
              clipboard.writeText(lingString).then(() => {
                if (logCopyUrlKey) {
                  aplus.record(logCopyUrlKey, "CLK", {
                    copyurl: encodeURIComponent(lingString),
                  });
                }
                _modal.destroy();
                toast.success(
                  $t("global-1688-ai-app.Share.copySuccess", "复制成功"),
                );
              });
            }}
          >
            <Button type="primary">
              <LinkIcon className={styles.linkIcon} />
              {$t("global-1688-ai-app.Share.copyLink", "复制链接")}
            </Button>
          </View>
        ),
      });
    };

    if (shareCode) {
      const url = routeJump(
        "share",
        {
          shareCode,
        },
        {
          urlOnly: true,
        },
      ) as string;
      openDialog(url);
    } else if (sessionId) {
      const res = await getShareUrl(sessionId);
      if (res) {
        openDialog(res);
      }
    }
  };

  return {
    getShareUrl,
    createShareModal,
  };
}

export default useShare;

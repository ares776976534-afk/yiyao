import React, { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input, Button } from "antd";
import classNames from "classnames";
import useToast from "@/components/Toast";
import { useStore } from "@/stores/context";
import { TypeOfferMaterialResult } from "@/services/studio/queryOfferBy";
import { calcOfferInfoSize } from "@/components/LayerOfferElement/calcOffer";
import { $t } from "@/i18n";
import aplus from "@/utils/log";
import styles from "./index.module.scss";

interface TypeClassNames {
  root?: string;
  content?: string;
  title?: string;
  input?: string;
  textArea?: string;
  footer?: string;
}

interface Props {
  onImport?: (result: TypeOfferMaterialResult[]) => void;
  onClose?: () => void;
  classNames?: TypeClassNames;
  logKey?: string;
}

const OfferLinkAnalysis = (props: Props) => {
  const { onImport, onClose, classNames: customClassNames, logKey } = props;
  const OFFER_UPLOAD_LITMIT = 2;

  const [importLoading, setImportLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const store = useStore();
  const toast = useToast();

  // 解析有效内容列表，用于校验和禁用按钮
  const validList = useMemo(
    () => inputText?.split("\n").filter((line) => !!line?.trim()) || [],
    [inputText],
  );

  const pathRegex =
    /(^\d{5,}$)|(?:^(?:https?:\/\/)?(?:m|detail)\.1688\.com\/offer\/(\d+?)\.html(\?.*)?)/;

  const extractOfferId = (url = "") => {
    let match = url.match(pathRegex);
    let _id = match && (match[1] || match[2]);
    if (_id) {
      return _id;
    }
    return null;
  };

  const handleReset = () => {
    setInputText("");
  };

  const handleImport = async () => {
    const { validationPassed, successList = [] } = handleValidate();
    if (!validationPassed) return;

    if (logKey) {
      aplus.record(logKey, "CLK", {
        imgurl: encodeURIComponent(inputText),
      });
    }

    setImportLoading(true);

    try {
      const offerIds = successList;
      const _offerList = await store.queryOfferBy(offerIds);

      // 提前获取卡片宽高后再执行后续操作
      if (Array.isArray(_offerList) && _offerList.length > 0) {
        const offerList = _offerList
          .filter((offer) => offer?.success === true)
          .map((offer) => ({
            ...offer?.productModel,
            id: uuidv4(),
          }));

        // 使用单个隐藏节点批量计算所有商品的真实尺寸
        try {
          const offerListWithDimensions = offerList.map((offer, index) => {
            const offerModuleSize = calcOfferInfoSize(offer);

            return {
              ...offer,
              width: offerModuleSize?.width || 0, // 默认宽度
              height: offerModuleSize?.height || 0, // 默认高度
              _offerModuleSize: offerModuleSize,
            };
          });

          toast.success(
            $t(
              "global-1688-ai-app.OfferLinkAnalysis.importSuccess",
              "导入成功",
            ),
          );
          onImport?.(offerListWithDimensions);
          handleReset();
        } catch (error) {
          console.error("Failed to calculate batch dimensions:", error);

          // 如果批量计算失败，使用默认尺寸
          const offerListWithDimensions = offerList.map((offer) => ({
            ...offer,
            width: 0, // 默认宽度
            height: 0, // 默认高度
          }));

          toast.success(
            $t(
              "global-1688-ai-app.OfferLinkAnalysis.importSuccess",
              "导入成功",
            ),
          );
          onImport?.(offerListWithDimensions);
          handleReset();
        }
      } else {
        throw new Error("empty result");
      }
    } catch (e) {
      if (e._networkError) {
        toast.error(e.message);
      } else {
        toast.error(
          e.message ||
            $t(
              "global-1688-ai-app.OfferLinkAnalysis.importFailed",
              "导入失败，请重试",
            ),
        );
      }
    } finally {
      setImportLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleValidate = () => {
    // 前端不校验，直接使用输入内容
    let successList: string[] = validList;
    const errorList: string[] = [];

    // list.forEach((_s) => {
    //   const s = _s?.trim();
    //   const offerId = extractOfferId(s);

    //   if (offerId) {
    //     if (!successList.includes(offerId)) {
    //       successList.push(offerId);
    //     }
    //   } else {
    //     if (!errorList.includes(s)) {
    //       errorList.push(s);
    //     }
    //   }
    // });

    if (!successList.length) {
      toast.warning(
        $t("global-1688-ai-app.OfferLinkAnalysis.pcw", "商品全部有误，请检查"),
      );
    }

    if (successList.length > OFFER_UPLOAD_LITMIT) {
      successList = successList.slice(0, OFFER_UPLOAD_LITMIT);
      toast.warning(
        $t("global-1688-ai-app.OfferLinkAnalysis.limit", "最多支持上传2个商品"),
      );
    }

    return {
      validationPassed: successList.length > 0,
      successList,
      errorList,
    };
  };

  return (
    <div
      className={classNames(styles.offerLinkAnalysis, customClassNames?.root)}
    >
      <div
        className={classNames(
          styles.offerLinkAnalysisContent,
          customClassNames?.content,
        )}
      >
        <div
          className={classNames(
            styles.offerLinkAnalysisTitle,
            customClassNames?.title,
          )}
        >
          {$t(
            "global-1688-ai-app.OfferLinkAnalysis.addProductLink",
            "添加商品链接",
          )}
        </div>
        <div
          className={classNames(
            styles.offerLinkAnalysisInput,
            customClassNames?.input,
          )}
        >
          <Input.TextArea
            className={classNames(
              styles.offerLinkAnalysisTextArea,
              customClassNames?.textArea,
            )}
            value={inputText}
            placeholder={$t(
              "global-1688-ai-app.OfferLinkAnalysis.qu1rthuMy",
              "请在此处批量粘贴【1688商品链接或商品ID】，多条用换行隔开",
            )}
            autoSize={{
              minRows: 5,
              maxRows: 5,
            }}
            onChange={handleInputChange}
          />
        </div>
        <div
          className={classNames(
            styles.offerLinkAnalysisFooter,
            customClassNames?.footer,
          )}
        >
          <Button onClick={onClose}>
            {$t("global-1688-ai-app.OfferLinkAnalysis.off", "关闭")}
          </Button>
          <Button
            disabled={validList.length === 0}
            type="primary"
            loading={importLoading}
            onClick={handleImport}
          >
            {$t("global-1688-ai-app.OfferLinkAnalysis.jxlink", "解析链接")}
          </Button>
        </div>
      </div>
    </div>
  );
};

OfferLinkAnalysis.displayName = "OfferLinkAnalysis";

export default OfferLinkAnalysis;

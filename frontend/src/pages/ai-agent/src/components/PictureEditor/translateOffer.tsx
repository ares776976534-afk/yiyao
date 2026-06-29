import { useState, useEffect, forwardRef } from "react";
import { Button, Modal } from "antd";
import { TypeTranslateOfferProps } from "./index.d";
import { IconClose } from "../studio-canvas/icons";
import styles from "./index.module.scss";
import { $t } from "@/i18n";

const PLATFORM_LIST = [
  {
    key: "amazon",
    name: $t("global-1688-ai-app.PictureEditor.translateOffer.ymx", "亚马逊"),
  },
  {
    key: "temu",
    name: "Temu",
  },
  {
    key: "shopee",
    name: "Shopee",
  },
  {
    key: "ozon",
    name: "Ozon",
  },
];

const LANGUAGE_LIST = [
  {
    key: "en",
    name: $t("global-1688-ai-app.PictureEditor.translateOffer.yw", "英文"),
  },

  {
    key: "ko",
    name: $t("global-1688-ai-app.PictureEditor.translateOffer.hy", "韩语"),
  },
  {
    key: "ja",
    name: $t("global-1688-ai-app.PictureEditor.translateOffer.dayy", "日语"),
  },
  {
    key: "ru",
    name: $t(
      "global-1688-ai-app.case.tool.IMAGE_TRANSLATION.selectOption.label2",
      "俄语",
    ),
  },
];

export default forwardRef(function TranslateOffer(
  props: TypeTranslateOfferProps,
  ref,
) {
  const { onClose, onOk, type } = props;

  const [platform, setPlatform] = useState<string>("");
  const [language, setLanguage] = useState<string>("");

  const [unLockOk, setUnLockOk] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === "translate") {
      setUnLockOk(!!language);
    } else {
      setUnLockOk(!!platform && !!language);
    }
  }, [platform, language]);

  return (
    <Modal
      open
      title={
        type === "translate"
          ? $t(
              "global-1688-ai-app.PictureEditor.translateOffer.yjfy",
              "一键翻译",
            )
          : $t(
              "global-1688-ai-app.PictureEditor.translateOffer.yjyh",
              "一键优化",
            )
      }
      footer={null}
      maskClosable={false}
      centered
      className={styles.modal}
      classNames={{
        content: styles.modalContent,
      }}
      width={600}
      onCancel={() => {
        onClose?.();
      }}
    >
      <div className={styles.translateOfferContainer}>
        {type !== "translate" && (
          <div className={styles.platformContainer}>
            <div className={styles.desc}>
              {$t(
                "global-1688-ai-app.PictureEditor.translateOffer.qct",
                "请选择下游平台",
              )}
            </div>
            <div className={styles.list}>
              {PLATFORM_LIST.map((item) => (
                <div
                  className={`${styles.item} ${
                    platform === item.key ? styles.active : ""
                  }`}
                  key={item.key}
                  onClick={() => {
                    setPlatform(item.key);
                    if (item.key === "ozon" && language && language !== "ru") {
                      setLanguage("ru");
                    }
                  }}
                >
                  <div className={styles.platformName}>{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.languageContainer}>
          <div className={styles.desc}>
            {$t(
              "global-1688-ai-app.PictureEditor.translateOffer.qselectyy",
              "请选择语言",
            )}
          </div>
          <div className={styles.list}>
            {LANGUAGE_LIST.map((item) => {
              const disabled = platform === "ozon" && item.key !== "ru";
              return (
                <div
                  className={`${styles.item} ${
                    language === item.key ? styles.active : ""
                  } ${disabled ? styles.disabled : ""}`}
                  key={item.key}
                  onClick={() => {
                    if (disabled) return;
                    setLanguage(item.key);
                  }}
                >
                  <div className={styles.languageName}>{item.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.footer}>
          <Button onClick={onClose}>
            {$t(
              "global-1688-ai-app.PictureEditor.translateOffer.cancel",
              "取消",
            )}
          </Button>
          <Button
            type="primary"
            disabled={!unLockOk || loading}
            onClick={() => {
              if (unLockOk && !loading) {
                onOk(
                  type === "translate" ? { language } : { platform, language },
                );
              }
            }}
          >
            {$t(
              "global-1688-ai-app.PictureEditor.translateOffer.qdyh",
              "确定优化",
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

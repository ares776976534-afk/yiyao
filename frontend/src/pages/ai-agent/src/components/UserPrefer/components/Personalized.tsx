import React, { useState } from "react";
import { Input } from "antd";
import { $t } from "@/i18n";
import styles from "../index.module.scss";

export default function Personalized(props) {
  const { userPreferStore } = props;
  const [nicknameError, setNicknameError] = useState<string>("");
  const { preferences } = userPreferStore;
  // 昵称只能包含中文、字母、数字、下划线
  const regex = /^[\w\u4e00-\u9fff\u3400-\u4dbf]{2,20}$/;

  const handleCommunicationStyleChange = (
    communicationStyle: "simple" | "detailed" | "other"
  ) => {
    userPreferStore.updateCommunicationStyle(communicationStyle);
  };

  // 昵称校验函数
  const validateNickname = (nickname: string): string => {
    if (!nickname) {
      return "";
    }

    if (!regex.test(nickname)) {
      if (nickname.length < 2) {
        return $t("global-1688-ai-app.UserPrefer.naixf", "昵称至少需要2个字符");
      }
      if (nickname.length > 20) {
        return $t("global-1688-ai-app.UserPrefer.nacz", "昵称不能超过20个字符");
      }
      return $t(
        "global-1688-ai-app.UserPrefer.nabz",
        "昵称只能包含字母、数字和下划线"
      );
    }

    return "";
  };

  const handleNicknameChange = (nickName: string) => {
    const error = validateNickname(nickName);
    const { setNicknameDisplay, updateNickname } = userPreferStore;
    setNicknameError(error);

    // 立即更新显示
    setNicknameDisplay(nickName);

    // 只有在没有错误时才保存
    if (!error) {
      updateNickname(nickName);
    }
  };

  return (
    <div className={styles.personalizedSettings}>
      <div>
        <div className={styles.personalizedSettingsItemTitle}>
          {$t("global-1688-ai-app.UserPrefer.nAg", "您希望您的Agent沟通程度")}
        </div>
        <div className={styles.personalizedSettingsItemContent}>
          <div
            className={[
              styles.personalizedSettingsItemContentItem,
              preferences.user.communicationStyle === "simple"
                ? styles.active
                : "",
            ].join(" ")}
            onClick={() => handleCommunicationStyleChange("simple")}
          >
            {$t("global-1688-ai-app.UserPrefer.sex", "简单高效")}
          </div>
          <div
            className={[
              styles.personalizedSettingsItemContentItem,
              preferences.user.communicationStyle === "detailed"
                ? styles.active
                : "",
            ].join(" ")}
            onClick={() => handleCommunicationStyleChange("detailed")}
          >
            {$t("global-1688-ai-app.UserPrefer.xxqm", "详细全面")}
          </div>
          <div
            className={[
              styles.personalizedSettingsItemContentItem,
              preferences.user.communicationStyle === "other"
                ? styles.active
                : "",
            ].join(" ")}
            onClick={() => handleCommunicationStyleChange("other")}
          >
            {$t("global-1688-ai-app.UserPrefer.qt", "其他")}
          </div>
        </div>
      </div>
      <div>
        <div className={styles.personalizedSettingsItemTitle}>
          {$t(
            "global-1688-ai-app.UserPrefer.nxwaxrhchn",
            "您希望遨虾如何称呼您？"
          )}
        </div>
        <Input
          maxLength={20}
          status={nicknameError ? "error" : ""}
          className={styles.nicknameInput}
          placeholder={$t(
            "global-1688-ai-app.UserPrefer.qtcg",
            "请输入您希望的称呼（2-20个字符）"
          )}
          value={preferences.user.nickName || ""}
          onChange={(e) => handleNicknameChange(e.target.value)}
        />
        {nicknameError && (
          <div className={styles.errorMessage}>{nicknameError}</div>
        )}
      </div>
    </div>
  );
}

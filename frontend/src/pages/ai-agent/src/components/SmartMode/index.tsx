import React, { useEffect, useRef, useState } from "react";
import View from "@alife/channel-fe-materials-react-appear";
import { Switch, Popover } from "antd";
import { observer } from "mobx-react-lite";
import { SmartModeIcon } from "@/components/Icons";
import { useStore } from "@/stores/context";
import { $t } from "@/i18n";
import aplus from "@/utils/log";
import styles from "./index.module.scss";

interface Props {
  isMobile?: boolean;
  text?: string;
  desc?: string;
  disabled?: boolean;
  logKey?: string;
}

export default observer(function SmartMode(props: Props) {
  const { isMobile, text, desc, disabled, logKey } = props;
  // 移动端手动控制 Popover 显示：仅在开启时短暂提示
  const [mobilePopoverOpen, setMobilePopoverOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const store = useStore();
  const patternKey = "profession";
  const userPreferStore = store.userPrefer;
  const { preferences } = userPreferStore;
  const smartMode = preferences.agent?.pattern === patternKey;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const toggleSmartMode = (event) => {
    if (disabled) return;
    event.stopPropagation();
    const newMode = !smartMode;
    const pattern: "profession" | "" = newMode ? patternKey : "";
    userPreferStore.updateAgent(pattern);

    // 移动端：仅开启时短暂显示 Popover 提示
    if (isMobile) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (newMode) {
        setMobilePopoverOpen(true);
        timerRef.current = setTimeout(() => {
          setMobilePopoverOpen(false);
        }, 2000);
      } else {
        setMobilePopoverOpen(false);
      }
    }

    if (logKey) {
      aplus.record(logKey, "CLK", {
        action: newMode ? "open" : "false",
      });
    }
  };

  // 移动端：手动控制 open
  const mobilePopoverProps = isMobile
    ? {
        open: mobilePopoverOpen,
        trigger: [] as [],
      }
    : {};

  return (
    <Popover
      placement="topLeft"
      classNames={{
        root: styles.smartModePopoverRoot,
        body: styles.smartModePopoverBody,
      }}
      content={
        desc ||
        $t(
          "global-1688-ai-app.InputChat.smartMode.desc",
          "开启增强模式采用更强的模型，图片编辑、抠图、高清效果更好",
        )
      }
      {...mobilePopoverProps}
    >
      <View
        className={[
          styles.smartModeContainer,
          smartMode ? styles.checked : "",
        ].join(" ")}
        onClick={toggleSmartMode}
        onFirstAppear={() => {
          if (logKey) {
            aplus.record(logKey, "EXP");
          }
        }}
      >
        <>
          <SmartModeIcon className={styles.smartModeIcon} />
          <span>
            {text || $t("global-1688-ai-app.InputChat.smartMode", "增强模式")}
          </span>
        </>
        <Switch
          className={styles.smartModeSwitch}
          checked={smartMode}
          disabled={disabled}
        />
      </View>
    </Popover>
  );
});

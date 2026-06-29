import style from "./index.module.css";
import { FastForwardDownIcon } from "@/components/Icon";
import { $t } from "@/i18n";

export const AdvancedOptions = ({
  isOpenOption = false,
  onOpen,
}: {
  isOpenOption?: boolean;
  onOpen: (isOpen: boolean) => void;
}) => {
  return (
    <div
      className={style.advancedOptions}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(!isOpenOption);
      }}
    >
      <div
        className={style.footerOptions}
        style={{ marginTop: isOpenOption ? 20 : 0 }}
      >
        <span>
          {isOpenOption
            ? $t(
                "global-1688-ai-app.ChatFlow.AdvancedOptions.shi",
                "收起高级选项"
              )
            : $t(
                "global-1688-ai-app.ChatFlow.AdvancedOptions.zhi",
                "展开高级选项"
              )}
        </span>
        <FastForwardDownIcon
          style={{
            transform: isOpenOption ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease-in-out",
          }}
        />
      </div>
    </div>
  );
};

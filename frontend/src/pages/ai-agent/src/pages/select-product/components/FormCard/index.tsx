import { StatusEnum } from "@/pages/select-product/config";
import TitleCard from "@/components/ChatFlow/TitleCard";
import IconLogo from "../LeftComponents/IconLogo";
import { $t } from "@/i18n";

const TYPE_MAP = {
  product: $t("global-1688-ai-app.select-product.FormCard.xp", "选品"),
  imageSearch: $t("global-1688-ai-app.select-product.FormCard.xp", "选品"),
  improve: $t("global-1688-ai-app.select-product.FormCard.gj", "改进"),
  country: $t("global-1688-ai-app.select-product.FormCard.gjqy", "国家迁移"),
  platform: $t("global-1688-ai-app.select-product.FormCard.ptqy", "平台迁移"),
};

export default function FormCard({
  status,
  isOpen,
  handleClick,
  children,
  titleCardChildren,
  type,
}) {
  return (
    <div>
      <div
        className="flex flex-row  gap-[2px] mb-[12px]"
        style={{
          alignItems: "center",
        }}
      >
        <IconLogo />
      </div>
      <div className="text-[16px] text-[#1D2129] mb-[12px]">{$t("global-1688-ai-app.select-product.FormCard.nqyjx", `您好，请补充您对于${TYPE_MAP[type]}的要求，我将为您精确选品。`, [TYPE_MAP[type]])}</div>
      {status === StatusEnum.INIT && (
        <div className="flex flex-col">
          <div className="rounded-[16px] border-[1px] border-[#F3F3F6] p-[16px] bg-[#FFFFFF]">
            {children}
          </div>
        </div>
      )}
      {status === StatusEnum.RUNNING && (
        <TitleCard
          isOpen={isOpen}
          handleClick={handleClick}
          title={$t(
            "global-1688-ai-app.select-product.FormCard.nybcyq",
            `您已补充${TYPE_MAP[type]}要求`,
            [TYPE_MAP[type]],
          )}
          children={titleCardChildren}
        />
      )}
    </div>
  );
}

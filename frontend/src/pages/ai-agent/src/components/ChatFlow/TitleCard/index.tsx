import { PanelIcon } from "@/components/Icons";
import { FastForwardDownIcon } from "@/components/Icon";
import { $t } from "@/i18n";

export default function TitleCard({
  isOpen,
  handleClick,
  title,
  children,
}: {
  isOpen: boolean;
  handleClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`text-[16px] text-[#1B1C1D] p-[16px] border-[1px] border-[#F3F3F6] rounded-[16px] bg-[#FFF] cursor-pointer 
        }`}
      onClick={handleClick}
    >
      <div className={`flex flex-row items-center justify-between leading-[20px]  ${isOpen ? "mb-[20px]" : ''}`}>
        <div className="text-[14px] text-[#1B1C1D] font-[500] flex flex-row items-center gap-[6px]">
          <PanelIcon size={16} />
          <div className="flex-1 leading-[20px]">{title}</div>
        </div>
        <div className="flex flex-row items-center">
          <span className="ml-auto text-[#7C7F9A] text-[14px] mr-2">
            {isOpen
              ? $t("global-1688-ai-app.ChatFlow.TitleCard.sq", "收起")
              : $t("global-1688-ai-app.ChatFlow.TitleCard.zkview", "展开查看")}
          </span>
          <FastForwardDownIcon
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease-in-out",
            }}
          />
        </div>
      </div>
      {isOpen && children}
    </div>
  );
}

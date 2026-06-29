import style from "./index.module.css";
import { $t } from "@/i18n";
import { MainBtn } from "../Btn";
import { InstructionsIcon } from "@/components/Icon";
interface TypeColorfulCardProps {
  type?: "br" | "bm";
  onClick?: () => void;
  title?: string;
  itemBtn?: {
    key: string;
    value: string;
  }[];
  isViewing?: boolean;
  cardId?: string;
  cardSubType?: string;
  cardType?: string;
}

export default function ColorfulCard({
  type,
  onClick,
  title,
  itemBtn,
  isViewing,
  cardId,
  cardSubType,
  cardType,
}: TypeColorfulCardProps) {
  return (
    <div
      data-card-id={cardId}
      data-card-type={cardType}
      data-card-sub-type={cardSubType}
      className={style.colorfulCard}
    >
      <div className={style.colorfulCard__bg} />
      <div className={style.colorfulCard__content}>
        <div>
          <div className={style.colorfulCard__title}>{title}</div>
          {itemBtn && itemBtn?.length > 0 && (
            <div className={style.colorfulCard__item}>
              {itemBtn?.map((ele, index) => (
                <div className={style.item_btn} key={`${ele?.value}-${index}`}>
                  {ele?.value}
                </div>
              ))}
            </div>
          )}
          {type === "bm" && (<div className={style.colorfulCard__bottom}>
            <div className={style.bmBtn}>
              <MainBtn
                text={isViewing ? $t(
                  "global-1688-ai-app.ChatFlow.ColorfulCard.zzview",
                  "正在查看",
                ) : $t(
                  "global-1688-ai-app.ChatFlow.ColorfulCard.viewDetails",
                  "查看详情",
                )}
                handleBtn={onClick}
                style={{ height: '36px' }}
                other={{
                  disabled: isViewing,
                }}
              />
            </div>
            <div className={style.colorfulCard__icon}>
              <InstructionsIcon />
              <div className={style.colorfulCard__iconText}>{$t("global-1688-ai-app.ChatFlow.ColorfulCard.bexCn", "本内容由遨虾AI生成，内容供参考")}</div>
            </div>
          </div>
          )}
        </div>
        {type === "br" && (
          <div className={style.colorfulCard__icon}>
            <InstructionsIcon />
            <div className={style.colorfulCard__iconText}>{$t("global-1688-ai-app.ChatFlow.ColorfulCard.bexCn", "本内容由遨虾AI生成，内容供参考")}</div>
          </div>
        )}
      </div>

      {type === "br" && (
        <MainBtn
          text={$t(
            "global-1688-ai-app.ChatFlow.ColorfulCard.viewDetails",
            "查看详情",
          )}
          handleBtn={onClick}
          style={{ height: '36px' }}
        />
      )}
    </div>
  );
}

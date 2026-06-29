import { LightBulbOrangeIcon } from "@/components/Icon";
import { useState } from "react";
import { appBaseUrl } from "@/utils/env";
import { transformRawData } from "@/pages/select-product/components/LeftComponents/UserInputText";
import useChatQuery from "@/pages/select-product/hooks/useChatQuery";
import styles from "./index.module.scss";
import { $t } from '@/i18n';
import { appVersionType, AppVersionType } from '@/utils/env';

const isGlobal = appVersionType === AppVersionType.GLOBAL;
interface TypeCardProps {
  title: string;
  description: string;
  image: string;
  sameURL: string;
  moreURL: string;
  tag?: string;
  makeSimilar?: boolean;
  url: string;
  shareCode: string;
  cacheId?: string;
  userRequest: string;
  oppScene: string;
}

export default ({
  title,
  description,
  image,
  sameURL,
  moreURL,
  makeSimilar,
  url,
  shareCode,
  cacheId,
  userRequest,
  oppScene,
}: TypeCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { navigateByCache } = useChatQuery();
  const isDesignAgent = oppScene === "DESIGN_AGENT";
  const style = isGlobal ? { fontFamily: 'Poppins' } : {};
  const handleSameClick = (event) => {
    event.stopPropagation();
    if (isDesignAgent) {
      const query = !!cacheId ? `?cacheId=${cacheId}` : '';
      window.open(`${appBaseUrl}/studio${query}`, "_blank");
      return;
    }
    const _userRequest = transformRawData(userRequest);
    const chatInput = transformRawData(_userRequest?.rawData) || _userRequest;
    navigateByCache({
      chatInput: chatInput,
      url: url,
      isMakeSimilar: true,
      target: "blank",
    });
  };

  const handleMoreClick = (event) => {
    event.stopPropagation();
    if (isDesignAgent) {
      window.open(`${appBaseUrl}/share?shareCode=${shareCode}`, "_blank");
      return;
    }
    window.open(`${appBaseUrl}${url}?__share_code__=${shareCode}`, "_blank");
  };

  return (
    <div
      className={`${styles.card} w-[285px] h-[362px] rounded-xl box-border border
      border-white backdrop-blur-sm relative`}
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 57%, rgba(255, 255, 255, 0) 100%)",
        cursor: "pointer",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (makeSimilar) {
          handleSameClick(e);
        } else {
          handleMoreClick(e);
        }
      }}
    >
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-[285px] h-[214px] rounded-xl"
        />

        <div />
      </div>

      <div className={styles.card_content}>
        <p className={styles.card_title} style={style} >
          {title}
        </p>
        <div className="relative">
          <p style={{ ...style, opacity: isHovered ? 0 : 1 }} className={styles.card_description}>
            {description}
          </p>

          {/* 浮层 */}
          <div
            className={`${styles.cardOverlay} absolute top-[16px] left-0 right-0 bottom-0
            flex  gap-[9px] items-center justify-center
            backdrop-blur-sm rounded-lg
            transition-all duration-300 ease-out z-10
            ${isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
              }`}
          >
            {makeSimilar && (
              <button
                onClick={handleSameClick}
                style={style}
                className="w-[126px] h-[48px] flex flex-col justify-center
              items-center rounded bg-black text-sm font-[500] text-white"
              >{$t("global-1688-ai-app.seller-center.home.DemoList.Card.tytk", "体验同款")}</button>
            )}
            <button
              onClick={handleMoreClick}
              style={style}
              className="w-[126px] h-[48px] flex flex-col justify-center
              items-center rounded box-border border border-[#6E50FF]
              bg-white text-sm font-[500]
              text-[#6E50FF]"
            >{$t("global-1688-ai-app.seller-center.home.DemoList.Card.viewhf", "查看回放")}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

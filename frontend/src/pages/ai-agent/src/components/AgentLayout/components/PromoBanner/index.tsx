import React from "react";
import { routeJump } from "@/utils/url";
import { $t } from "@/i18n";
import styles from "./index.module.css";

export const PROMO_BANNER_HEIGHT = 48;

const BANNER_ICON_URL =
  "https://img.alicdn.com/imgextra/i4/O1CN01AoWsNF1v8Dp7vSaFk_!!6000000006127-55-tps-162-149.svg";
const BANNER_CLOSE_ICON_URL =
  "https://img.alicdn.com/imgextra/i4/O1CN01OT1ZRP240jtWK2wxP_!!6000000007329-55-tps-24-24.svg";
const BANNER_ARROW_ICON_URL =
  "https://img.alicdn.com/imgextra/i1/O1CN01rClqPy1ssX1ViRbEr_!!6000000005822-55-tps-18-18.svg";

interface TypePromoBannerProps {
  onClose: () => void;
}

const PromoBanner: React.FC<TypePromoBannerProps> = ({ onClose }) => {
  const handleClose = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClose();
  };

  return (
    <div
      className={styles.banner}
      style={{ height: PROMO_BANNER_HEIGHT }}
      onClick={() => routeJump("claw")}
    >
      <div className={styles.bannerInner}>
        <img src={BANNER_ICON_URL} alt="" className={styles.bannerIcon} />
        <span className={styles.bannerText}>
          {$t(
            "global-1688-ai-app.AgentLayout.PromoBanner.text",
            "电商版龙虾来了！遨虾AlphaClaw正式上线，免安装部署，免费试用！！",
          )}
        </span>
        <div className={styles.bannerBtn}>
          <span>
            {$t("global-1688-ai-app.AgentLayout.PromoBanner.apply", "立即申请")}
          </span>
          <img
            src={BANNER_ARROW_ICON_URL}
            alt=""
            className={styles.bannerArrow}
          />
        </div>
      </div>
      <img
        src={BANNER_CLOSE_ICON_URL}
        className={styles.bannerClose}
        onClick={handleClose}
      />
    </div>
  );
};

export default PromoBanner;

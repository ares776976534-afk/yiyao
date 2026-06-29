import React from "react";
import styles from "./index.module.css";

interface RegionUnavailableProps {
  id?: string;
}

const RegionUnavailable: React.FC<RegionUnavailableProps> = ({ }) => {
  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <img
          className={styles.logoIcon}
          src="https://img.alicdn.com/imgextra/i2/6000000007491/O1CN010EHc5b25Cw36ZbO6G_!!6000000007491-2-gg_dtc.png"
          alt="Logo Icon"
        />
        <img
          className={styles.logoText}
          src="https://img.alicdn.com/imgextra/i4/6000000004719/O1CN01yE8iVj1kjM9fIqiAi_!!6000000004719-2-gg_dtc.png"
          alt="Logo Text"
        />
      </div>
      <div className={styles.contentContainer}>
        <img
          className={styles.contentIcon}
          src="https://img.alicdn.com/imgextra/i3/6000000001202/O1CN01BZ7mjO1KkZBwheKHE_!!6000000001202-2-gg_dtc.png"
          alt="Content Icon"
        />
        <span className={styles.contentText}>
          遨虾在你所在的地区不可用。
        </span>
      </div>
    </div>
  );
};

export default RegionUnavailable;

import styles from "./index.module.css";

const logoMap = {
  zh_CN: {
    src: "https://img.alicdn.com/imgextra/i3/O1CN01NYXfJr1tp9h54PiRp_!!6000000005950-55-tps-66-26.svg",
    // src: "https://img.alicdn.com/imgextra/i3/O1CN01XYSQAB1nxxc6bjqWe_!!6000000005157-55-tps-66-26.svg", // 黑色版本
    width: 66,
    height: 26,
  },
  en_US: {
    src: "https://img.alicdn.com/imgextra/i1/O1CN01tUAj8S1sSsokEkQG3_!!6000000005766-55-tps-135-27.svg",
    // src: "https://img.alicdn.com/imgextra/i3/O1CN01xTkN6o1JPD5WRWziu_!!6000000001020-55-tps-135-27.svg", // 黑色版本
    width: 135,
    height: 27,
  },
};
logoMap.default = logoMap.zh_CN;

export default ({ language }: { language?: any }) => {
  const logoData = logoMap[language] || logoMap.default;

  return (
    <div
      className={styles.alphashopLogo}
      style={{
        width: logoData.width,
        height: logoData.height,
        maskImage: `url(${logoData.src})`,
      }}
    />
  );
};

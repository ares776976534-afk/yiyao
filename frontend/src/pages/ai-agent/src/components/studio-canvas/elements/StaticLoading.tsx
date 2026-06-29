import React, { forwardRef } from "react";
import { Image } from "react-konva";
import { useImage } from "react-konva-utils";

const svg = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="240" height="240" viewBox="0 0 240 240"><defs><clipPath id="master_svg0_57_9285"><rect x="0" y="0" width="240" height="240" rx="0"/></clipPath><filter id="master_svg1_57_9285/55_9285" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB" x="-0.4342790670017106" y="-0.6572718629569566" width="1.8685581340034212" height="2.314543725913913"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="40.731266021728516" result="effect1_foregroundBlur"/></filter><filter id="master_svg2_57_9285/55_9286" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB" x="-0.6763667309867364" y="-0.8520131566973049" width="2.352733461973473" height="2.70402631339461"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="61" result="effect1_foregroundBlur"/></filter><filter id="master_svg3_57_9285/55_9287" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB" x="-0.6183388983481447" y="-0.9756461802052183" width="2.2366777966962896" height="2.9512923604104366"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="51" result="effect1_foregroundBlur"/></filter></defs><g clipPath="url(#master_svg0_57_9285)"><rect x="0" y="0" width="240" height="240" rx="0" fill="#FFFFFF" fill-opacity="1"/><g transform="matrix(0.9193180799484253,-0.3935151994228363,0.3939433991909027,0.9191346764564514,-10.507582008838654,-55.25385856628418)" filter="url(#master_svg1_57_9285/55_9285)"><ellipse cx="47.58106994628906" cy="121.94039154052734" rx="187.58106994628906" ry="123.94039154052734" fill="#6E50FF" fill-opacity="1"/></g><g transform="matrix(0.9885955452919006,0.15045234560966492,-0.1507374495267868,0.9885955452919006,4.649558961391449,18.66091200709343)" filter="url(#master_svg2_57_9285/55_9286)"><ellipse cx="59.375518798828125" cy="183.19027709960938" rx="180.37551879882812" ry="143.19027709960938" fill="#A78DFF" fill-opacity="1"/></g><g transform="matrix(0.9119571447372437,-0.4102856516838074,0.4107288718223572,0.9117575287818909,-52.95205891132355,49.57530874013901)" filter="url(#master_svg3_57_9285/55_9287)"><ellipse cx="253.9580841064453" cy="252.5460968017578" rx="164.9580841064453" ry="104.54609680175781" fill="#D2D6FF" fill-opacity="1"/></g></g></svg>`)}`;

/** 画布图片静态Loading组件
 * 用于在图片加载过程中显示的占位图
 */
const StaticLoading = forwardRef((props: any, ref: any) => {
  const [image] = useImage(svg);

  return (
    <Image
      ref={ref}
      image={image}
      {...props}
    />
  );
});

export default StaticLoading;


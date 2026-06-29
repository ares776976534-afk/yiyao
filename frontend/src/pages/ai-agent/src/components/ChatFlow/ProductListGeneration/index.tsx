import React, { useRef, useEffect, useState } from "react";
import OrdinaryCommodityCard from "@/components/ChatFlow/OrdinaryCommodityCard";
import AdditionalDetailsCard from "../AdditionalDetailsCard";
import style from "./index.module.css";
import { CommodityIcon, StraightLineIcon } from "@/components/Icon";

interface ProductListGenerationProps {
  title: React.ReactNode | string;
  data: any[];
  otherContent?: (e: any) => React.ReactNode;
  content?: string;
  onSizeChange?: (size: { width: number; height: number }) => void;
  moreText?: string;
  onMoreClick?: () => void;
  rightSideType?: string;
  isShowSite?: boolean;
  cardId?: string;
  cardType?: string;
  cardSubType?: string;
  logKey?: string;
}

const ProductListGeneration: React.FC<ProductListGenerationProps> = ({
  cardId,
  cardType,
  cardSubType,
  title,
  data,
  otherContent,
  content,
  onSizeChange,
  moreText,
  onMoreClick,
  rightSideType,
  isShowSite = false,
  logKey,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [elementSize, setElementSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  // 获取元素尺寸的函数
  const measureElement = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const size = {
        width: rect.width,
        height: rect.height,
      };
      setElementSize(size);

      // 如果提供了回调函数，调用它
      if (onSizeChange) {
        onSizeChange(size);
      }
    }
  };

  // 监听元素尺寸变化
  useEffect(() => {
    // 初始测量
    const timer = setTimeout(measureElement, 100); // 延迟一点时间确保元素已渲染

    // 监听窗口大小变化
    const handleResize = () => {
      measureElement();
    };

    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [data]); // 当data变化时重新测量
  return (
    <>
      <div
        data-card-id={cardId}
        data-card-type={cardType}
        data-card-sub-type={cardSubType}
        className={style.productListGeneration}
      >
        <div className={style.productListGenerationTitle}>
          <div className={style.productListGenerationTitleContent}>
            <CommodityIcon fill="var(--icon-primary" width={16} height={16} />
            <span className="text-[13px] text-[#1D2129]">{title}</span>
          </div>
          <span className="text-[13px] text-[#7C7F9A] flex-1">{content}</span>
        </div>
        <div className={style.productListGenerationContent}>
          {data?.map((item, cardIndex) => {
            const {
              mainImgUrl,
              title: cardTitle,
              content,
              bottomContent,
              list,
              riskStatus,
              productUrl,
              regionIcon,
              platformIcon,
            } = item;
            return (
              <div
                ref={cardIndex === 0 ? elementRef : null}
                key={cardIndex}
                className={style.productListGenerationItem}
                style={{
                  minWidth: 193,
                  maxWidth: rightSideType ? undefined : 228,
                  width: rightSideType ? elementSize?.width : 228,
                  height: elementSize?.height || "100%",
                }}
              >
                <OrdinaryCommodityCard
                  imageUrl={mainImgUrl}
                  title={cardTitle}
                  regionIcon={regionIcon}
                  platformIcon={platformIcon}
                  riskStatus={riskStatus}
                  productUrl={productUrl}
                  logKey={logKey}
                  logParams={{
                    productId: item?.productId || '',
                    title: cardTitle || '',
                    cardIndex,
                  }}
                  content={
                    <div className={style.productListGenerationContentItem}>
                      {content?.map((ele, index) => {
                        const [beforeValue, afterValue] =
                          ele.text.split("{value}");
                        return (
                          <div
                            key={index}
                            className={style.productListGenerationContentItem}
                          >
                            <div
                              className={
                                style.productListGenerationContentItemText
                              }
                            >
                              {beforeValue}
                              {ele?.value}
                              {afterValue}
                            </div>
                            {content.length - 1 !== index && (
                              <StraightLineIcon
                                style={{ marginLeft: 6, marginRight: 6 }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  }
                  bottomContent={bottomContent}
                  otherContent={
                    typeof otherContent === "function"
                      ? otherContent(item)
                      : undefined
                  }
                  isShowSite={isShowSite}
                />
              </div>
            );
          })}

          <AdditionalDetailsCard
            moreText={moreText}
            size={
              elementSize
                ? { width: rightSideType ? elementSize.width : 228, height: elementSize.height }
                : undefined
            }
            onMoreClick={onMoreClick}
          />
        </div>
      </div>
    </>
  );
};

export default ProductListGeneration;

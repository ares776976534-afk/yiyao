import React, { useRef, useEffect } from "react";
import { handleScroll } from "../../hooks/useChatStream";

export const transformRawData = (rawData: any) => {
  // 判断是否为普通字符串，则返回原始数据，例如没有包含{}等json字符串的标志
  if (
    typeof rawData === "string" &&
    !rawData.includes("{") &&
    !rawData.includes("}")
  ) {
    return rawData;
  }
  try {
    return JSON.parse(rawData);
  } catch (error) {
    return rawData;
  }
};

export const UserInputText = ({ rawData }) => {
  const textContentRef = useRef<HTMLDivElement>(null);

  const _rawData = transformRawData(rawData);

  useEffect(() => {
    if (textContentRef.current) {
      const scrollTo =
        textContentRef.current.offsetTop -
        textContentRef.current.scrollTop +
        textContentRef.current.clientTop;
      setTimeout(() => {
        handleScroll(scrollTo);
      }, 100);
    }
  }, []);

  const renderContent = () => {
    if (_rawData?.inputValue || _rawData?.inputValue === "") {
      return <div>{_rawData?.inputValue}</div>;
    }

    if (_rawData?.query || _rawData?.query === "") {
      return <div>{_rawData?.query}</div>;
    }
    return "";
  };

  return (
    <div className="flex justify-end mb-[36px]" ref={textContentRef}>
      {typeof _rawData === "string" ? (
        <div className="max-w-[520px] text-[16px] text-[#1B1C1D] p-[12px_16px] rounded-[16px_4px_16px_16px] bg-[#E9E7FF] break-words">
          {_rawData}
        </div>
      ) : (
        <div className="gap-[8px] max-w-[520px] flex flex-col">
          <div className="flex justify-end gap-[8px]">
            {_rawData?.searchImageUrl && (
              <img
                style={{
                  width: "96px",
                  height: "96px",
                  objectFit: "contain",
                }}
                className="rounded-[12px] "
                src={_rawData?.searchImageUrl}
                alt=""
              />
            )}
          </div>
          {(_rawData?.inputValue || _rawData?.query) && (
            <div className="max-w-[520px] text-[16px] text-[#1B1C1D] p-[12px_16px] rounded-[16px_4px_16px_16px] bg-[#E9E7FF] break-words">
              {renderContent()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Balloon, Icon } from "@alifd/next";
import "./index.scss";

function SelectCards({ onChange, opt, value = [], resetTrigger }) {
  const [selectedItems, setSelectedItems] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (
      !isInitialized &&
      Array.isArray(opt?.defaultValue) &&
      opt?.defaultValue.length > 0
    ) {
      const initialSelectedItems = {};
      opt?.defaultValue.forEach((itemValue) => {
        initialSelectedItems[itemValue] = true;
      });
      setSelectedItems(initialSelectedItems);
      setIsInitialized(true);
    }
  }, [opt?.defaultValue, isInitialized]);

  const handleToggleSelect = (item) => {
    if (opt?.disabled) return;
    if (item.authentication === false || item?.disabled) return;

    if (opt?.mode === "single") {
      // 单选模式下，设置为新的选项并清除其他选项
      setSelectedItems((prevState) => ({
        [item.value]: !prevState[item.value],
      }));
    } else {
      // 多选模式下，切换选项的选中状态
      setSelectedItems((prevState) => ({
        ...prevState,
        [item.value]: !prevState[item.value],
      }));
    }
  };

  useEffect(() => {
    const selectedKeys = Object.keys(selectedItems).filter(
      (key) => selectedItems[key]
    );
    onChange(selectedKeys);
    if (typeof opt?.onChange === "function") {
      opt.onChange(selectedKeys);
    }
  }, [selectedItems]);

  useEffect(() => {
    if (opt?.resetTrigger !== "false") {
      setSelectedItems({});
    }
  }, [resetTrigger]);

  return (
    <div
      className="item-post flex items-center flex-wrap"
      style={{ gap: "16px" }}
    >
      {(value || []).map((item) => (
        <div
          key={item.value}
          className={`rounded-[6px] py-[8px] text-[14px] text-[#333] leading-[14px] px-[16px] flex items-center relative ${
            selectedItems[item?.value]
              ? "service-contents border-[#0077FF] border-[1px] bg-[#fff]"
              : "bg-[#F8F8F8]"
          } ${
            opt?.disabled
              ? "bg-[#F2F2F2] text-[#999999] cursor-not-allowed border-[#ccc] border-[1px]"
              : "cursor-pointer"
          } ${
            item?.disabled
              ? "bg-[#F2F2F2] text-[#999999] cursor-not-allowed border-[#ccc] border-[1px] border-[#ccc] service-disabled"
              : ""
          }`}
          onClick={() => handleToggleSelect(item)}
          style={item?.style || {}}
        >
          {item?.icon && (
            <img
              className="w-[16px] h-[16px] mr-[4px]"
              style={{
                filter:
                  opt?.disabled ||
                  item.authentication === false ||
                  item?.disabled
                    ? "grayscale(100%)"
                    : "none",
                opacity:
                  opt?.disabled ||
                  item.authentication === false ||
                  item?.disabled
                    ? 0.5
                    : 1,
              }}
              src={item?.icon}
            />
          )}
          <div
            className={
              item.authentication !== undefined ? "text-[16px] font-bold" : ""
            }
          >
            {item?.label}
          </div>
          {item?.flag && (
            <img
              src={item?.flag}
              alt="hot icon"
              style={{
                width: "30px",
                height: "14px",
                position: "absolute",
                right: "-18px",
                top: "-8px",
              }}
            />
          )}
          {item?.des && (
            <Balloon
              v2
              align="t"
              trigger={
                <Icon type="prompt" size="small" className="text-[#BBB]" />
              }
              closable={false}
              popupClassName="p-[12px] bg-[#333] text-[#333]"
              triggerType="hover"
              className="bg-[#fff] text-[#333] text-[14px] p-[12px]"
            >
              {item.des}
            </Balloon>
          )}
          {item.authentication
            ? opt?.authenticatedContent
            : opt?.unauthenticatedContent}
          {item?.num !== undefined && <span>({item?.num})</span>}
          {selectedItems[item?.value] && (
            <Icon type="select" className="service-icon" size="xs" />
          )}
          {item?.children && { children }}
        </div>
      ))}
    </div>
  );
}

export default SelectCards;

import React, { useState, useEffect } from 'react';
import { Balloon, Icon } from '@alifd/next';

const SelectCards = ({ onChange, opt, value }) => {
  const [selectedItems, setSelectedItems] = useState({});
  useEffect(() => {
    const selectedKeys = Object.keys(selectedItems).filter(
      (key) => selectedItems[key],
    );
    onChange(selectedKeys);
  }, [selectedItems]);

  const handleToggleSelect = (item) => {
    if (opt?.disabled) return;

    setSelectedItems((prevState) => ({
      ...prevState,
      [item.value]: !prevState[item.value],
    }));
  };

  return (
    <div className="flex items-center">
      {(value || []).map((item) => (
        <div
          key={item.value}
          className={`h-[32px] rounded-[6px] pt-[8px] text-[14px] text-[#333] leading-[14px] mr-[12px] ${
            selectedItems[item.value]
              ? 'service-box border-[#0077FF] border-[1px] bg-[#fff] px-[16px]'
              : 'bg-[#F8F8F8] px-[12px]'
          } ${
            opt?.disabled
              ? 'bg-[#F2F2F2] text-[#999999] cursor-not-allowed'
              : 'cursor-pointer'
          }`}
          onClick={() => handleToggleSelect(item)}
        >
          <span>
            {item.label}
            {item.des && (
              <Balloon
                align="b"
                trigger={
                  <Icon type="prompt" size="small" className="text-[#BBB]" />
                }
                closable={false}
                popupClassName="p-[12px] bg-[#333] text-[#fff]"
                triggerType="hover"
                style={{ '--balloon-normal-color-bg': 'rgb(51 51 51)' }}
              >
                {item.des}
              </Balloon>
            )}
          </span>
          {selectedItems[item.value] && (
            <Icon type="select" className="service-icon" size="xs" />
          )}
        </div>
      ))}
    </div>
  );
};

export default SelectCards;
